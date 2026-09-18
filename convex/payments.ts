import { ConvexError, v } from "convex/values";
import { internalAction, internalMutation, mutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import { BACKEND_RELEASE_GATES, requireBridgeSecret, transitionOrder } from "./model";

const eventArgs = {
  provider: v.string(),
  providerEventId: v.string(),
  providerTransactionId: v.string(),
  bookedAt: v.number(),
  direction: v.union(v.literal("incoming"), v.literal("outgoing"), v.literal("unknown")),
  amountCents: v.number(),
  currency: v.string(),
  reference: v.optional(v.string()),
  debtorName: v.optional(v.string()),
  payloadDigest: v.string(),
};

async function ingest(
  ctx: MutationCtx,
  args: {
    provider: string; providerEventId: string; providerTransactionId: string; bookedAt: number;
    direction: "incoming" | "outgoing" | "unknown"; amountCents: number; currency: string;
    reference?: string; debtorName?: string; payloadDigest: string;
  },
) {
  if (!args.provider.trim() || !args.providerEventId.trim() || !args.providerTransactionId.trim()) {
    throw new ConvexError({ code: "INVALID_PROVIDER_EVENT" });
  }
  if (!Number.isInteger(args.amountCents) || args.amountCents < 0 || !/^[a-f0-9]{64}$/i.test(args.payloadDigest)) {
    throw new ConvexError({ code: "INVALID_PROVIDER_EVENT" });
  }
  const duplicate = await ctx.db.query("paymentProviderEvents")
    .withIndex("by_provider_event", (q) => q.eq("provider", args.provider).eq("providerEventId", args.providerEventId))
    .unique();
  if (duplicate) return { eventId: duplicate._id, matchStatus: duplicate.matchStatus, duplicate: true };
  const duplicateTransaction = await ctx.db.query("paymentProviderEvents")
    .withIndex("by_provider_transaction", (q) =>
      q.eq("provider", args.provider).eq("providerTransactionId", args.providerTransactionId))
    .unique();
  if (duplicateTransaction) {
    return { eventId: duplicateTransaction._id, matchStatus: duplicateTransaction.matchStatus, duplicate: true };
  }

  const now = Date.now();
  const eventId = await ctx.db.insert("paymentProviderEvents", {
    ...args, payloadDigest: args.payloadDigest.toLowerCase(), matchStatus: "unprocessed", receivedAt: now,
  });
  const review = async (reason: string, orderId?: Id<"orders">) => {
    await ctx.db.patch(eventId, {
      matchStatus: "review_required", matchReason: reason, processedAt: Date.now(),
      ...(orderId ? { orderId } : {}),
    });
    return { eventId, matchStatus: "review_required" as const, duplicate: false };
  };
  if (args.direction !== "incoming") {
    await ctx.db.patch(eventId, { matchStatus: "ignored", matchReason: "not_incoming", processedAt: now });
    return { eventId, matchStatus: "ignored" as const, duplicate: false };
  }
  if (args.currency !== "EUR") return await review("currency_not_eur");
  const reference = args.reference?.trim();
  if (!reference) return await review("reference_missing");
  const orders = await ctx.db.query("orders")
    .withIndex("by_payment_reference", (q) => q.eq("paymentReference", reference)).take(2);
  if (orders.length === 0) return await review("reference_not_found");
  if (orders.length > 1) return await review("reference_ambiguous");
  const order = orders[0];
  if (order.quoteExpiresAt < args.bookedAt) return await markOrderForReview(ctx, eventId, order._id, "payment_after_quote_expiry");
  if (args.amountCents !== order.amountCents) {
    return await markOrderForReview(ctx, eventId, order._id,
      args.amountCents < order.amountCents ? "underpayment" : "overpayment");
  }
  if (order.status !== "awaiting_payment" && order.status !== "payment_detected") {
    return await markOrderForReview(ctx, eventId, order._id, "order_not_awaiting_payment");
  }
  const candidatePayments = await ctx.db.query("payments")
    .withIndex("by_order", (q) => q.eq("orderId", order._id)).order("desc").take(10);
  const payment = candidatePayments.find((item) => item.status === "expected") ?? candidatePayments[0];
  if (!payment) throw new ConvexError({ code: "EXPECTED_PAYMENT_MISSING" });
  await ctx.db.patch(payment._id, {
    provider: args.provider, providerTransactionId: args.providerTransactionId,
    amountCents: args.amountCents, reference, status: "detected", updatedAt: now,
  });
  if (order.status === "awaiting_payment") {
    await transitionOrder(ctx, order._id, "payment_detected", "ais_matcher", "exact_payment_match_detected", args.providerTransactionId);
  }
  await ctx.db.patch(payment._id, {
    status: "verified", verificationMethod: "ais", verifiedBy: "ais_exact_match",
    verifiedAt: now, updatedAt: now,
  });
  await transitionOrder(ctx, order._id, "payment_verified", "ais_matcher", "exact_payment_match_verified", args.providerTransactionId);
  await transitionOrder(ctx, order._id, "invoice_review_required", "billing_gate", "billing_policy_not_confirmed");
  await ctx.db.patch(eventId, {
    matchStatus: "matched", matchReason: "exact_match", orderId: order._id,
    paymentId: payment._id, processedAt: now,
  });
  return { eventId, matchStatus: "matched" as const, duplicate: false };
}

async function markOrderForReview(
  ctx: MutationCtx,
  eventId: Id<"paymentProviderEvents">,
  orderId: Id<"orders">,
  reason: string,
) {
  const now = Date.now();
  const payments = await ctx.db.query("payments").withIndex("by_order", (q) => q.eq("orderId", orderId)).order("desc").take(10);
  const payment = payments.find((item) => item.status === "expected") ?? payments[0];
  if (payment) await ctx.db.patch(payment._id, { status: "review_required", reviewReason: reason, updatedAt: now });
  const order = await ctx.db.get(orderId);
  if (order && (order.status === "awaiting_payment" || order.status === "payment_detected")) {
    await transitionOrder(ctx, orderId, "payment_review_required", "ais_matcher", reason);
  }
  await ctx.db.patch(eventId, {
    matchStatus: "review_required", matchReason: reason, orderId,
    ...(payment ? { paymentId: payment._id } : {}), processedAt: now,
  });
  return { eventId, matchStatus: "review_required" as const, duplicate: false };
}

export const ingestAisProviderEvent = mutation({
  args: { bridgeSecret: v.string(), ...eventArgs },
  returns: v.object({
    eventId: v.id("paymentProviderEvents"),
    matchStatus: v.union(v.literal("matched"), v.literal("duplicate"), v.literal("review_required"), v.literal("ignored"), v.literal("unprocessed")),
    duplicate: v.boolean(),
  }),
  handler: async (ctx, args) => {
    requireBridgeSecret(args.bridgeSecret);
    const { bridgeSecret: _, ...event } = args;
    return await ingest(ctx, event);
  },
});

export const manualVerifyPayment = internalMutation({
  args: {
    orderId: v.id("orders"), amountCents: v.number(),
    reference: v.string(), actor: v.string(), reason: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    if (!args.actor.trim() || !args.reason.trim()) throw new ConvexError({ code: "MANUAL_AUDIT_REQUIRED" });
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new ConvexError({ code: "ORDER_NOT_FOUND" });
    if (args.amountCents !== order.amountCents || args.reference !== order.paymentReference) {
      throw new ConvexError({ code: "MANUAL_PAYMENT_MISMATCH" });
    }
    if (order.status !== "awaiting_payment" && order.status !== "payment_detected" && order.status !== "payment_review_required") {
      throw new ConvexError({ code: "ORDER_NOT_PAYMENT_REVIEWABLE" });
    }
    const now = Date.now();
    const candidates = await ctx.db.query("payments")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId)).order("desc").take(10);
    const payment = candidates[0];
    if (!payment) throw new ConvexError({ code: "EXPECTED_PAYMENT_MISSING" });
    if (order.status === "awaiting_payment") {
      await transitionOrder(ctx, args.orderId, "payment_detected", args.actor, `manual_detected:${args.reason}`);
    }
    await ctx.db.patch(payment._id, {
      status: "verified", verificationMethod: "manual", verifiedBy: args.actor,
      verifiedAt: now, reviewReason: args.reason, updatedAt: now,
    });
    await transitionOrder(ctx, args.orderId, "payment_verified", args.actor, `manual_verified:${args.reason}`);
    await transitionOrder(ctx, args.orderId, "invoice_review_required", "billing_gate", "billing_policy_not_confirmed");
    return null;
  },
});

export const beginAisSync = internalMutation({
  args: {},
  returns: v.object({ acquired: v.boolean(), cursor: v.optional(v.string()) }),
  handler: async (ctx) => {
    const now = Date.now();
    const state = await ctx.db.query("providerSyncState").withIndex("by_provider", (q) => q.eq("provider", "eposlovanje_ais")).unique();
    if (state?.lockUntil && state.lockUntil > now) return { acquired: false, ...(state.cursor ? { cursor: state.cursor } : {}) };
    const patch = { lockUntil: now + 10 * 60_000, lastStartedAt: now, updatedAt: now };
    if (state) await ctx.db.patch(state._id, patch);
    else await ctx.db.insert("providerSyncState", { provider: "eposlovanje_ais", ...patch, consecutiveFailures: 0 });
    return { acquired: true, ...(state?.cursor ? { cursor: state.cursor } : {}) };
  },
});

export const finishAisSync = internalMutation({
  args: { succeeded: v.boolean(), cursor: v.optional(v.string()), errorCode: v.optional(v.string()) },
  returns: v.null(),
  handler: async (ctx, args) => {
    const state = await ctx.db.query("providerSyncState").withIndex("by_provider", (q) => q.eq("provider", "eposlovanje_ais")).unique();
    if (!state) return null;
    const now = Date.now();
    await ctx.db.patch(state._id, {
      lockUntil: undefined, ...(args.cursor ? { cursor: args.cursor } : {}),
      ...(args.succeeded ? { lastSucceededAt: now, consecutiveFailures: 0, lastErrorCode: undefined } : {
        consecutiveFailures: state.consecutiveFailures + 1,
        lastErrorCode: args.errorCode ?? "AIS_SYNC_FAILED",
      }), updatedAt: now,
    });
    return null;
  },
});

export const pollAis = internalAction({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    if (process.env.CJENIK_HR_AIS_POLLING_ENABLED !== "true") return null;
    const mode = process.env.CJENIK_HR_AIS_MODE ?? "disabled";
    if (mode === "live") {
      // Intentionally fail-closed: do not guess the official ePoslovanje AIS v2
      // authorization, pagination or transaction response contract.
      if (!BACKEND_RELEASE_GATES.aisProductionEnabled) return null;
      throw new ConvexError({ code: "AIS_LIVE_ADAPTER_CONTRACT_UNCONFIRMED" });
    }
    if (mode !== "sandbox") return null;
    const claim = await ctx.runMutation(internal.payments.beginAisSync, {});
    if (!claim.acquired) return null;
    try {
      // Sandbox polling is a deliberate no-op unless canonical mock events are
      // submitted through the protected bridge mutation.
      await ctx.runMutation(internal.payments.finishAisSync, { succeeded: true, ...(claim.cursor ? { cursor: claim.cursor } : {}) });
    } catch (error) {
      await ctx.runMutation(internal.payments.finishAisSync, { succeeded: false, errorCode: "AIS_SANDBOX_SYNC_FAILED" });
      throw error;
    }
    return null;
  },
});
