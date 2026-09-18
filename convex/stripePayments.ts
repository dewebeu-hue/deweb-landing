import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { requireBridgeSecret, transitionOrder } from "./model";

const attemptStatusValidator = v.union(
  v.literal("creating"), v.literal("open"), v.literal("completed"),
  v.literal("expired"), v.literal("cancelled"), v.literal("failed"),
  v.literal("review_required"),
);

export const prepareCheckoutAttempt = mutation({
  args: { bridgeSecret: v.string(), orderId: v.id("orders") },
  returns: v.object({
    attemptId: v.id("paymentAttempts"), attemptNumber: v.number(), idempotencyKey: v.string(),
    status: attemptStatusValidator, providerSessionId: v.optional(v.string()),
    checkoutUrl: v.optional(v.string()), expiresAt: v.optional(v.number()), reused: v.boolean(),
  }),
  handler: async (ctx, args) => {
    requireBridgeSecret(args.bridgeSecret);
    const order = await ctx.db.get(args.orderId);
    if (!order || order.paymentProvider !== "stripe" || !order.providerSafeId) {
      throw new ConvexError({ code: "STRIPE_ORDER_NOT_FOUND" });
    }
    if (order.status !== "awaiting_payment") {
      throw new ConvexError({ code: "ORDER_NOT_CHECKOUT_ELIGIBLE", status: order.status });
    }
    const now = Date.now();
    if (order.quoteExpiresAt <= now) throw new ConvexError({ code: "ORDER_PAYMENT_WINDOW_EXPIRED" });
    const attempts = await ctx.db.query("paymentAttempts")
      .withIndex("by_order", (q) => q.eq("orderId", order._id)).order("desc").take(20);
    const latest = attempts[0];
    if (latest && (latest.status === "creating" || latest.status === "open")) {
      if (!latest.expiresAt || latest.expiresAt > now) {
        return {
          attemptId: latest._id, attemptNumber: latest.attemptNumber,
          idempotencyKey: latest.idempotencyKey, status: latest.status,
          ...(latest.providerSessionId ? { providerSessionId: latest.providerSessionId } : {}),
          ...(latest.checkoutUrl ? { checkoutUrl: latest.checkoutUrl } : {}),
          ...(latest.expiresAt ? { expiresAt: latest.expiresAt } : {}), reused: true,
        };
      }
      await ctx.db.patch(latest._id, { status: "expired", updatedAt: now });
    }
    const attemptNumber = (latest?.attemptNumber ?? 0) + 1;
    if (attemptNumber > 10) throw new ConvexError({ code: "CHECKOUT_ATTEMPT_LIMIT" });
    const idempotencyKey = `checkout:${order.providerSafeId}:${attemptNumber}`;
    const attemptId = await ctx.db.insert("paymentAttempts", {
      orderId: order._id, provider: "stripe", attemptNumber, idempotencyKey,
      status: "creating", createdAt: now, updatedAt: now,
    });
    return { attemptId, attemptNumber, idempotencyKey, status: "creating" as const, reused: false };
  },
});

export const recordCheckoutSession = mutation({
  args: {
    bridgeSecret: v.string(), attemptId: v.id("paymentAttempts"),
    providerSessionId: v.string(), checkoutUrl: v.string(), expiresAt: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    requireBridgeSecret(args.bridgeSecret);
    if (!/^cs_test_/.test(args.providerSessionId) || !/^https:\/\/checkout\.stripe\.com\//.test(args.checkoutUrl)) {
      throw new ConvexError({ code: "INVALID_TEST_CHECKOUT_SESSION" });
    }
    const attempt = await ctx.db.get(args.attemptId);
    if (!attempt || attempt.provider !== "stripe") throw new ConvexError({ code: "CHECKOUT_ATTEMPT_NOT_FOUND" });
    if (attempt.providerSessionId && attempt.providerSessionId !== args.providerSessionId) {
      throw new ConvexError({ code: "CHECKOUT_SESSION_CONFLICT" });
    }
    const duplicate = await ctx.db.query("paymentAttempts")
      .withIndex("by_provider_session", (q) => q.eq("provider", "stripe").eq("providerSessionId", args.providerSessionId))
      .unique();
    if (duplicate && duplicate._id !== attempt._id) throw new ConvexError({ code: "CHECKOUT_SESSION_CONFLICT" });
    await ctx.db.patch(attempt._id, {
      providerSessionId: args.providerSessionId, checkoutUrl: args.checkoutUrl,
      expiresAt: args.expiresAt, status: "open", updatedAt: Date.now(),
    });
    return null;
  },
});

const stripeEventArgs = {
  bridgeSecret: v.string(),
  providerEventId: v.string(),
  eventType: v.string(),
  livemode: v.boolean(),
  objectId: v.string(),
  createdAt: v.number(),
  payloadDigest: v.string(),
  providerSessionId: v.optional(v.string()),
  providerPaymentId: v.optional(v.string()),
  amountCents: v.optional(v.number()),
  currency: v.optional(v.string()),
  paymentStatus: v.optional(v.string()),
  clientReferenceId: v.optional(v.string()),
  metadataOrderRef: v.optional(v.string()),
  metadataOrderNumber: v.optional(v.string()),
  metadataPackage: v.optional(v.string()),
  paymentMethodType: v.optional(v.string()),
};

async function flagStripeReview(
  ctx: MutationCtx,
  eventId: Id<"paymentProviderEvents">,
  reason: string,
  attemptId?: Id<"paymentAttempts">,
  orderId?: Id<"orders">,
) {
  const now = Date.now();
  if (attemptId) await ctx.db.patch(attemptId, { status: "review_required", updatedAt: now });
  let paymentId: Id<"payments"> | undefined;
  if (orderId) {
    const payments = await ctx.db.query("payments").withIndex("by_order", (q) => q.eq("orderId", orderId)).order("desc").take(20);
    const expected = payments.find((payment) => payment.provider === "stripe" && payment.status === "expected");
    if (expected) {
      paymentId = expected._id;
      await ctx.db.patch(expected._id, { status: "review_required", reviewReason: reason, updatedAt: now });
    }
    const order = await ctx.db.get(orderId);
    if (order?.status === "awaiting_payment") {
      await transitionOrder(ctx, orderId, "payment_review_required", "stripe_webhook", reason);
    }
  }
  await ctx.db.patch(eventId, {
    matchStatus: "review_required", matchReason: reason,
    ...(orderId ? { orderId } : {}), ...(paymentId ? { paymentId } : {}), processedAt: now,
  });
  return { eventId, outcome: "review_required" as const, duplicate: false };
}

export const ingestStripeWebhookEvent = mutation({
  args: stripeEventArgs,
  returns: v.object({
    eventId: v.id("paymentProviderEvents"),
    outcome: v.union(v.literal("verified"), v.literal("review_required"), v.literal("ignored")),
    duplicate: v.boolean(),
  }),
  handler: async (ctx, args) => {
    requireBridgeSecret(args.bridgeSecret);
    if (!/^evt_/.test(args.providerEventId) || !/^[a-f0-9]{64}$/i.test(args.payloadDigest)) {
      throw new ConvexError({ code: "INVALID_STRIPE_EVENT" });
    }
    const existing = await ctx.db.query("paymentProviderEvents")
      .withIndex("by_provider_event", (q) => q.eq("provider", "stripe").eq("providerEventId", args.providerEventId))
      .unique();
    if (existing) {
      const outcome: "verified" | "review_required" | "ignored" =
        existing.matchStatus === "matched" ? "verified" :
          existing.matchStatus === "review_required" ? "review_required" : "ignored";
      return {
        eventId: existing._id,
        outcome,
        duplicate: true,
      };
    }
    const now = Date.now();
    const eventId = await ctx.db.insert("paymentProviderEvents", {
      provider: "stripe", providerEventId: args.providerEventId, eventType: args.eventType,
      livemode: args.livemode, providerTransactionId: args.providerPaymentId ?? args.providerSessionId ?? args.objectId,
      bookedAt: args.createdAt, direction: args.eventType === "checkout.session.completed" ? "incoming" : "unknown",
      amountCents: args.amountCents ?? 0, currency: (args.currency ?? "").toUpperCase(),
      payloadDigest: args.payloadDigest.toLowerCase(), matchStatus: "unprocessed", receivedAt: now,
    });

    if (args.eventType === "charge.refunded" || args.eventType === "charge.dispute.created") {
      const payment = args.providerPaymentId ? await ctx.db.query("payments")
        .withIndex("by_provider_transaction", (q) => q.eq("provider", "stripe").eq("providerTransactionId", args.providerPaymentId))
        .unique() : null;
      if (!payment) return await flagStripeReview(ctx, eventId, `${args.eventType}:payment_not_found`);
      await ctx.db.patch(payment._id, { status: "review_required", reviewReason: args.eventType, updatedAt: now });
      await ctx.db.patch(eventId, {
        matchStatus: "review_required", matchReason: args.eventType,
        orderId: payment.orderId, paymentId: payment._id, processedAt: now,
      });
      return { eventId, outcome: "review_required" as const, duplicate: false };
    }

    if (args.eventType !== "checkout.session.completed") {
      await ctx.db.patch(eventId, { matchStatus: "ignored", matchReason: "event_not_handled", processedAt: now });
      return { eventId, outcome: "ignored" as const, duplicate: false };
    }

    const attempt = args.providerSessionId ? await ctx.db.query("paymentAttempts")
      .withIndex("by_provider_session", (q) => q.eq("provider", "stripe").eq("providerSessionId", args.providerSessionId))
      .unique() : null;
    if (!attempt) return await flagStripeReview(ctx, eventId, "checkout_session_not_found");
    const order = await ctx.db.get(attempt.orderId);
    if (!order) return await flagStripeReview(ctx, eventId, "order_not_found", attempt._id);
    const mismatches = [
      args.livemode && "livemode_not_allowed",
      order.paymentProvider !== "stripe" && "provider_mismatch",
      args.amountCents !== order.amountCents && "amount_mismatch",
      args.currency?.toUpperCase() !== order.currency && "currency_mismatch",
      args.paymentStatus !== "paid" && "payment_not_paid",
      args.clientReferenceId !== order.providerSafeId && "client_reference_mismatch",
      args.metadataOrderRef !== order.providerSafeId && "metadata_order_ref_mismatch",
      args.metadataOrderNumber !== order.orderNumber && "metadata_order_number_mismatch",
      args.metadataPackage !== order.packageType && "metadata_package_mismatch",
      args.providerSessionId !== attempt.providerSessionId && "session_mismatch",
    ].filter((value): value is string => typeof value === "string");
    if (mismatches.length > 0) {
      return await flagStripeReview(ctx, eventId, mismatches.join(","), attempt._id, order._id);
    }
    if (order.status !== "awaiting_payment") {
      return await flagStripeReview(ctx, eventId, "order_already_processed", attempt._id, order._id);
    }
    const payments = await ctx.db.query("payments")
      .withIndex("by_order", (q) => q.eq("orderId", order._id)).order("desc").take(20);
    const payment = payments.find((item) => item.provider === "stripe" && item.status === "expected");
    if (!payment) return await flagStripeReview(ctx, eventId, "expected_payment_missing", attempt._id, order._id);
    await ctx.db.patch(attempt._id, { status: "completed", updatedAt: now });
    await ctx.db.patch(payment._id, {
      providerTransactionId: args.providerPaymentId ?? args.providerSessionId,
      providerSessionId: args.providerSessionId, providerEventId: args.providerEventId,
      amountCents: args.amountCents!, currency: "EUR", status: "verified",
      verificationMethod: "stripe", verifiedBy: "stripe_checkout_webhook",
      verifiedAt: args.createdAt, paidAt: args.createdAt, livemode: false,
      ...(args.paymentMethodType ? { paymentMethodType: args.paymentMethodType } : {}), updatedAt: now,
    });
    await transitionOrder(ctx, order._id, "payment_detected", "stripe_webhook", "stripe_checkout_paid", args.providerPaymentId);
    await transitionOrder(ctx, order._id, "payment_verified", "stripe_webhook", "stripe_checkout_verified", args.providerPaymentId);
    await transitionOrder(ctx, order._id, "invoice_review_required", "billing_gate", "billing_policy_not_confirmed");
    await ctx.db.patch(eventId, {
      matchStatus: "matched", matchReason: "stripe_checkout_verified",
      orderId: order._id, paymentId: payment._id, processedAt: now,
    });
    return { eventId, outcome: "verified" as const, duplicate: false };
  },
});
