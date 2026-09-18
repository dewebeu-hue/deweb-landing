import { ConvexError, v } from "convex/values";
import { internalMutation, mutation } from "./_generated/server";
import { requireBridgeSecret } from "./model";

const emailKind = v.union(
  v.literal("quote_customer"), v.literal("quote_internal"), v.literal("payment_customer"),
  v.literal("invoice_customer"), v.literal("delivery_customer"), v.literal("failure_internal"),
);

export const claimEmailSend = mutation({
  args: {
    bridgeSecret: v.string(), orderId: v.id("orders"), kind: emailKind,
    recipientClass: v.union(v.literal("customer"), v.literal("internal")),
    idempotencyKey: v.string(),
  },
  returns: v.object({ emailEventId: v.id("emailEvents"), shouldSend: v.boolean(), status: v.string() }),
  handler: async (ctx, args) => {
    requireBridgeSecret(args.bridgeSecret);
    if (!/^[A-Za-z0-9:_-]{8,160}$/.test(args.idempotencyKey)) {
      throw new ConvexError({ code: "INVALID_EMAIL_IDEMPOTENCY_KEY" });
    }
    const existing = await ctx.db.query("emailEvents")
      .withIndex("by_idempotency_key", (q) => q.eq("idempotencyKey", args.idempotencyKey)).unique();
    if (existing) {
      const stalePending = existing.status === "pending" && existing.updatedAt < Date.now() - 10 * 60_000;
      const retry = (existing.status === "failed" || stalePending) && existing.attemptCount < 3;
      if (retry) await ctx.db.patch(existing._id, {
        status: "pending", attemptCount: existing.attemptCount + 1,
        lastErrorCode: undefined, updatedAt: Date.now(),
      });
      return {
        emailEventId: existing._id, shouldSend: retry,
        status: retry ? "pending" : existing.status,
      };
    }
    const now = Date.now();
    const emailEventId = await ctx.db.insert("emailEvents", {
      orderId: args.orderId, kind: args.kind, recipientClass: args.recipientClass,
      idempotencyKey: args.idempotencyKey, status: "pending", attemptCount: 1,
      createdAt: now, updatedAt: now,
    });
    return { emailEventId, shouldSend: true, status: "pending" };
  },
});

export const completeEmailSend = mutation({
  args: {
    bridgeSecret: v.string(), emailEventId: v.id("emailEvents"), succeeded: v.boolean(),
    providerMessageId: v.optional(v.string()), errorCode: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    requireBridgeSecret(args.bridgeSecret);
    const event = await ctx.db.get(args.emailEventId);
    if (!event) throw new ConvexError({ code: "EMAIL_EVENT_NOT_FOUND" });
    if (event.status === "sent") return null;
    await ctx.db.patch(args.emailEventId, {
      status: args.succeeded ? "sent" : "failed",
      ...(args.providerMessageId ? { providerMessageId: args.providerMessageId } : {}),
      ...(args.errorCode ? { lastErrorCode: args.errorCode } : {}),
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const claimEmailSendInternal = internalMutation({
  args: {
    orderId: v.id("orders"), kind: emailKind,
    recipientClass: v.union(v.literal("customer"), v.literal("internal")),
    idempotencyKey: v.string(),
  },
  returns: v.object({ emailEventId: v.id("emailEvents"), shouldSend: v.boolean(), status: v.string() }),
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("emailEvents")
      .withIndex("by_idempotency_key", (q) => q.eq("idempotencyKey", args.idempotencyKey)).unique();
    if (existing) {
      const stalePending = existing.status === "pending" && existing.updatedAt < Date.now() - 10 * 60_000;
      const retry = (existing.status === "failed" || stalePending) && existing.attemptCount < 3;
      if (retry) await ctx.db.patch(existing._id, {
        status: "pending", attemptCount: existing.attemptCount + 1,
        lastErrorCode: undefined, updatedAt: Date.now(),
      });
      return { emailEventId: existing._id, shouldSend: retry, status: retry ? "pending" : existing.status };
    }
    const now = Date.now();
    const emailEventId = await ctx.db.insert("emailEvents", {
      ...args, status: "pending", attemptCount: 1, createdAt: now, updatedAt: now,
    });
    return { emailEventId, shouldSend: true, status: "pending" };
  },
});

export const completeEmailSendInternal = internalMutation({
  args: {
    emailEventId: v.id("emailEvents"), succeeded: v.boolean(),
    providerMessageId: v.optional(v.string()), errorCode: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.emailEventId);
    if (!event || event.status === "sent") return null;
    await ctx.db.patch(args.emailEventId, {
      status: args.succeeded ? "sent" : "failed",
      ...(args.providerMessageId ? { providerMessageId: args.providerMessageId } : {}),
      ...(args.errorCode ? { lastErrorCode: args.errorCode } : {}),
      updatedAt: Date.now(),
    });
    return null;
  },
});
