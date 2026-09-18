import { ConvexError, v } from "convex/values";
import { action, internalMutation, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { BACKEND_RELEASE_GATES, requireBridgeSecret, transitionOrder } from "./model";

export const requestInvoice = mutation({
  args: { bridgeSecret: v.string(), orderId: v.id("orders"), requestId: v.string() },
  returns: v.object({ status: v.string(), idempotent: v.boolean() }),
  handler: async (ctx, args) => {
    requireBridgeSecret(args.bridgeSecret);
    if (!/^[A-Za-z0-9_-]{16,96}$/.test(args.requestId)) throw new ConvexError({ code: "INVALID_REQUEST_ID" });
    const provider = process.env.CJENIK_HR_INVOICE_PROVIDER_MODE === "live" ? "eposlovanje_v2" : "mock";
    const existing = await ctx.db.query("invoices")
      .withIndex("by_provider_request", (q) => q.eq("provider", provider).eq("providerRequestId", args.requestId)).unique();
    if (existing) return { status: existing.status, idempotent: true };
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new ConvexError({ code: "ORDER_NOT_FOUND" });
    if (order.status !== "payment_verified" && order.status !== "invoice_review_required" && order.status !== "invoice_failed") {
      throw new ConvexError({ code: "ORDER_NOT_INVOICE_READY" });
    }
    const billingReady = BACKEND_RELEASE_GATES.commercialTermsConfirmed &&
      BACKEND_RELEASE_GATES.billingPolicyConfirmed &&
      BACKEND_RELEASE_GATES.eposlovanjeProductionEnabled;
    const now = Date.now();
    await ctx.db.insert("invoices", {
      orderId: args.orderId, provider, providerRequestId: args.requestId,
      amountCents: order.amountCents, currency: "EUR", status: "review_required",
      testDocument: provider === "mock", failureCode: billingReady ? undefined : "PRODUCTION_BILLING_DISABLED",
      createdAt: now, updatedAt: now,
    });
    if (order.status === "payment_verified") {
      await transitionOrder(ctx, args.orderId, "invoice_review_required", "billing_gate", "production_billing_disabled");
    } else if (order.status === "invoice_failed") {
      await transitionOrder(ctx, args.orderId, "invoice_review_required", "billing_gate", "invoice_retry_requires_review");
    }
    return { status: "review_required", idempotent: false };
  },
});

export const runInvoiceProvider = action({
  args: { bridgeSecret: v.string(), orderId: v.id("orders") },
  returns: v.null(),
  handler: async (ctx, args) => {
    requireBridgeSecret(args.bridgeSecret);
    if (process.env.CJENIK_HR_INVOICE_PROVIDER_MODE === "live") {
      // Intentionally blocked. We do not invent the ePoslovanje API v2 invoice,
      // fiscalization, status-check, or retry contract. A timeout must eventually
      // be resolved by provider status before any retry is allowed.
      throw new ConvexError({ code: "INVOICE_LIVE_ADAPTER_CONTRACT_UNCONFIRMED" });
    }
    if (process.env.CJENIK_HR_INVOICE_PROVIDER_MODE === "mock" &&
        process.env.CJENIK_HR_INVOICE_SANDBOX_ENABLED === "true" &&
        process.env.CJENIK_HR_BILLING_POLICY_TEST_CONFIRMED === "true") {
      await ctx.runMutation(internal.invoices.completeMockInvoice, { orderId: args.orderId });
      return null;
    }
    throw new ConvexError({ code: "INVOICE_REQUIRES_MANUAL_REVIEW" });
  },
});

export const completeMockInvoice = internalMutation({
  args: { orderId: v.id("orders") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new ConvexError({ code: "ORDER_NOT_FOUND" });
    const invoices = await ctx.db.query("invoices").withIndex("by_order", (q) => q.eq("orderId", args.orderId)).collect();
    const invoice = invoices[0];
    if (!invoice) throw new ConvexError({ code: "INVOICE_RECORD_MISSING" });
    if (order.status === "invoice_sent") return null;
    if (order.status !== "invoice_review_required") {
      throw new ConvexError({ code: "ORDER_NOT_INVOICE_REVIEW" });
    }
    await transitionOrder(ctx, args.orderId, "invoice_processing", "mock_invoice_provider", "test_policy_confirmed");
    await ctx.db.patch(invoice._id, { status: "processing", updatedAt: Date.now() });
    const providerInvoiceId = `mock:${order.orderNumber}`;
    const invoiceNumber = `TEST-${order.orderNumber}`;
    await transitionOrder(ctx, args.orderId, "invoice_fiscalized", "mock_invoice_provider", "mock_provider_success", providerInvoiceId);
    await ctx.db.patch(invoice._id, {
      status: "test_created", providerInvoiceId, invoiceNumber, testDocument: true, updatedAt: Date.now(),
    });
    await transitionOrder(ctx, args.orderId, "invoice_sent", "mock_invoice_provider", "mock_invoice_delivery_recorded", providerInvoiceId);
    await ctx.db.patch(invoice._id, { status: "sent", updatedAt: Date.now() });
    return null;
  },
});
