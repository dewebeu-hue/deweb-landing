import { ConvexError, v } from "convex/values";
import { internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { formatSequence, nextSequence, requireBridgeSecret, transitionOrder } from "./model";

const quoteRecordValidator = v.object({
  quoteId: v.id("quotes"), quoteNumber: v.string(), orderId: v.id("orders"),
  amountCents: v.number(), currency: v.literal("EUR"), expiresAt: v.number(),
  alreadyExisted: v.boolean(),
});

export const getOrderForQuote = internalQuery({
  args: { orderId: v.id("orders") },
  returns: v.union(v.null(), v.object({
    orderId: v.id("orders"), orderNumber: v.string(), status: v.string(),
    packageType: v.union(v.literal("plugin"), v.literal("setup")), amountCents: v.number(),
    paymentReference: v.string(), quoteExpiresAt: v.number(),
    customer: v.object({
      type: v.union(v.literal("business"), v.literal("consumer")), fullName: v.string(),
      companyName: v.optional(v.string()), companyOib: v.optional(v.string()),
      contactPerson: v.optional(v.string()), email: v.string(), billingAddress: v.string(),
      postalCode: v.string(), city: v.string(), country: v.literal("HR"),
    }),
  })),
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    return order ? {
      orderId: order._id, orderNumber: order.orderNumber, status: order.status,
      packageType: order.packageType, amountCents: order.amountCents,
      paymentReference: order.paymentReference, quoteExpiresAt: order.quoteExpiresAt,
      customer: order.customerSnapshot,
    } : null;
  },
});

export const reserveQuote = internalMutation({
  args: { orderId: v.id("orders"), testDocument: v.boolean() },
  returns: quoteRecordValidator,
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new ConvexError({ code: "ORDER_NOT_FOUND" });
    const existing = await ctx.db.query("quotes").withIndex("by_order", (q) => q.eq("orderId", args.orderId)).unique();
    if (existing) return {
      quoteId: existing._id, quoteNumber: existing.quoteNumber, orderId: args.orderId,
      amountCents: existing.amountCents, currency: existing.currency, expiresAt: existing.expiresAt,
      alreadyExisted: true,
    };
    if (order.status !== "quote_pending") throw new ConvexError({ code: "ORDER_NOT_QUOTE_PENDING" });
    const year = new Date().getUTCFullYear();
    const sequence = await nextSequence(ctx, `quotes:${year}`);
    const quoteNumber = formatSequence("PON", year, sequence);
    const now = Date.now();
    const quoteId = await ctx.db.insert("quotes", {
      orderId: args.orderId, quoteNumber, amountCents: order.amountCents, currency: "EUR",
      status: "pending_pdf", testDocument: args.testDocument, expiresAt: order.quoteExpiresAt,
      createdAt: now, updatedAt: now,
    });
    return {
      quoteId, quoteNumber, orderId: args.orderId, amountCents: order.amountCents,
      currency: "EUR" as const, expiresAt: order.quoteExpiresAt, alreadyExisted: false,
    };
  },
});

export const attachQuotePdf = internalMutation({
  args: { quoteId: v.id("quotes"), storageId: v.id("_storage"), documentSha256: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const quote = await ctx.db.get(args.quoteId);
    if (!quote) throw new ConvexError({ code: "QUOTE_NOT_FOUND" });
    if (quote.storageId && quote.storageId !== args.storageId) {
      await ctx.storage.delete(args.storageId);
      return null;
    }
    const now = Date.now();
    await ctx.db.patch(args.quoteId, {
      storageId: args.storageId, documentSha256: args.documentSha256,
      status: "created", updatedAt: now,
    });
    const order = await ctx.db.get(quote.orderId);
    if (order?.status === "quote_pending") {
      await transitionOrder(ctx, quote.orderId, "quote_created", "quote_workflow", "quote_pdf_created", quote.quoteNumber);
    }
    return null;
  },
});

export const markQuoteSent = mutation({
  args: { bridgeSecret: v.string(), orderId: v.id("orders"), providerMessageId: v.optional(v.string()) },
  returns: v.null(),
  handler: async (ctx, args) => {
    requireBridgeSecret(args.bridgeSecret);
    const quote = await ctx.db.query("quotes").withIndex("by_order", (q) => q.eq("orderId", args.orderId)).unique();
    if (!quote?.storageId) throw new ConvexError({ code: "QUOTE_PDF_NOT_READY" });
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new ConvexError({ code: "ORDER_NOT_FOUND" });
    if (order.status === "quote_created") {
      await transitionOrder(ctx, args.orderId, "quote_sent", "email_bridge", "quote_email_sent", args.providerMessageId);
      await transitionOrder(ctx, args.orderId, "awaiting_payment", "quote_workflow", "quote_delivery_completed");
    } else if (order.status !== "quote_sent" && order.status !== "awaiting_payment") {
      throw new ConvexError({ code: "ORDER_NOT_QUOTE_CREATED" });
    }
    await ctx.db.patch(quote._id, { status: "sent", updatedAt: Date.now() });
    return null;
  },
});

export const markQuoteSentInternal = internalMutation({
  args: { orderId: v.id("orders"), providerMessageId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const quote = await ctx.db.query("quotes").withIndex("by_order", (q) => q.eq("orderId", args.orderId)).unique();
    if (!quote?.storageId) throw new ConvexError({ code: "QUOTE_PDF_NOT_READY" });
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new ConvexError({ code: "ORDER_NOT_FOUND" });
    if (order.status === "quote_created") {
      await transitionOrder(ctx, args.orderId, "quote_sent", "quote_email", "customer_quote_email_sent", args.providerMessageId);
      await transitionOrder(ctx, args.orderId, "awaiting_payment", "quote_workflow", "quote_delivery_completed");
    }
    await ctx.db.patch(quote._id, { status: "sent", updatedAt: Date.now() });
    return null;
  },
});

export const getQuoteForBridge = query({
  args: { bridgeSecret: v.string(), orderId: v.id("orders") },
  returns: v.union(v.null(), v.object({
    quoteNumber: v.string(), storageUrl: v.union(v.null(), v.string()),
    status: v.string(), testDocument: v.boolean(), expiresAt: v.number(),
  })),
  handler: async (ctx, args) => {
    requireBridgeSecret(args.bridgeSecret);
    const quote = await ctx.db.query("quotes").withIndex("by_order", (q) => q.eq("orderId", args.orderId)).unique();
    if (!quote) return null;
    return {
      quoteNumber: quote.quoteNumber,
      storageUrl: quote.storageId ? await ctx.storage.getUrl(quote.storageId) : null,
      status: quote.status, testDocument: quote.testDocument, expiresAt: quote.expiresAt,
    };
  },
});

export const failQuote = internalMutation({
  args: { quoteId: v.id("quotes"), errorCode: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const quote = await ctx.db.get(args.quoteId);
    if (!quote) return null;
    await ctx.db.patch(args.quoteId, { status: "failed", updatedAt: Date.now() });
    const order = await ctx.db.get(quote.orderId);
    if (order?.status === "quote_pending") {
      await transitionOrder(ctx, quote.orderId, "failed", "quote_workflow", args.errorCode);
    }
    return null;
  },
});
