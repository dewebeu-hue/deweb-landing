import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import {
  PACKAGE_PRICES_CENTS,
  customerInputValidator,
  formatSequence,
  nextSequence,
  orderStatusValidator,
  paymentProviderValidator,
  requireBridgeSecret,
  transitionOrder,
  validateCustomer,
  validateHash,
} from "./model";
import type { OrderStatus } from "./model";

export const submitOrder = mutation({
  args: {
    bridgeSecret: v.string(),
    requestId: v.string(),
    publicTokenHash: v.string(),
    fingerprintHash: v.string(),
    requestType: v.string(),
    customerType: v.union(v.literal("business"), v.literal("consumer")),
    fullName: v.string(),
    companyName: v.optional(v.string()),
    companyOib: v.optional(v.string()),
    billingAddress: v.string(),
    postalCode: v.string(),
    city: v.string(),
    country: v.string(),
    email: v.string(),
    domain: v.optional(v.string()),
    wordpressStatus: v.string(),
    woocommerceStatus: v.string(),
    currentSystem: v.string(),
    note: v.optional(v.string()),
    quotedPriceCents: v.number(),
    paymentProvider: v.optional(paymentProviderValidator),
    providerSafeId: v.optional(v.string()),
  },
  returns: v.object({
    orderNumber: v.string(), status: orderStatusValidator, deduplicated: v.boolean(),
    providerSafeId: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    requireBridgeSecret(args.bridgeSecret);
    if (args.requestType !== "plugin" && args.requestType !== "setup") {
      throw new ConvexError({ code: "REQUEST_TYPE_NOT_SUPPORTED" });
    }
    const yesNoUnsure = new Set(["yes", "no", "unsure"]);
    const supportedSystems = new Set([
      "wordpress", "woocommerce", "synesis", "pantheon", "minimax", "shopify",
      "prestashop", "custom", "other", "none", "unsure",
    ]);
    if (!yesNoUnsure.has(args.wordpressStatus) || !yesNoUnsure.has(args.woocommerceStatus) ||
        !supportedSystems.has(args.currentSystem)) {
      throw new ConvexError({ code: "INVALID_INTAKE_ENUM" });
    }
    if (args.wordpressStatus === "no") throw new ConvexError({ code: "REQUEST_TYPE_NOT_SUPPORTED" });
    if (args.wordpressStatus.length > 40 || args.woocommerceStatus.length > 40 || args.currentSystem.length > 40 ||
        (args.domain?.length ?? 0) > 240 || (args.note?.length ?? 0) > 2000) {
      throw new ConvexError({ code: "INTAKE_FIELD_TOO_LONG" });
    }
    const domainPattern = /^(?:https?:\/\/)?(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}(?:\/[^\s]*)?$/i;
    if (args.requestType === "setup" && !args.domain?.trim()) {
      throw new ConvexError({ code: "DOMAIN_REQUIRED" });
    }
    if (args.domain?.trim() && !domainPattern.test(args.domain.trim())) {
      throw new ConvexError({ code: "INVALID_DOMAIN" });
    }
    if ((args.companyName?.length ?? 0) > 160) throw new ConvexError({ code: "INTAKE_FIELD_TOO_LONG" });
    const packageType = args.requestType;
    const paymentProvider = args.paymentProvider ?? "bank_transfer_ais";
    if (paymentProvider === "stripe" && !/^[A-Za-z0-9_-]{24,96}$/.test(args.providerSafeId ?? "")) {
      throw new ConvexError({ code: "INVALID_PROVIDER_SAFE_ID" });
    }
    const customer = {
      type: args.customerType,
      fullName: args.fullName,
      ...(args.companyName ? { companyName: args.companyName } : {}),
      ...(args.companyOib ? { companyOib: args.companyOib } : {}),
      ...(args.customerType === "business" ? { contactPerson: args.fullName } : {}),
      email: args.email,
      billingAddress: args.billingAddress,
      postalCode: args.postalCode,
      city: args.city,
      country: args.country,
    };
    if (!/^[A-Za-z0-9_-]{16,96}$/.test(args.requestId)) {
      throw new ConvexError({ code: "INVALID_REQUEST_ID" });
    }
    validateHash(args.publicTokenHash, "publicTokenHash");
    validateHash(args.fingerprintHash, "fingerprintHash");
    validateCustomer(customer);
    const tokenCollision = await ctx.db.query("orders")
      .withIndex("by_public_token_hash", (q) => q.eq("publicTokenHash", args.publicTokenHash.toLowerCase())).unique();
    if (tokenCollision && tokenCollision.requestId !== args.requestId) {
      throw new ConvexError({ code: "PUBLIC_TOKEN_COLLISION" });
    }
    const authoritativePrice = PACKAGE_PRICES_CENTS[packageType];
    if (!Number.isInteger(args.quotedPriceCents) || args.quotedPriceCents !== authoritativePrice) {
      throw new ConvexError({ code: "PRICE_MISMATCH" });
    }

    const scopeKey = `order:${args.requestId}`;
    const priorKey = await ctx.db.query("idempotencyKeys")
      .withIndex("by_scope_key", (q) => q.eq("scopeKey", scopeKey)).unique();
    if (priorKey) {
      const prior = await ctx.db.get(priorKey.orderId);
      if (!prior) throw new ConvexError({ code: "IDEMPOTENCY_TARGET_MISSING" });
      return {
        orderNumber: prior.orderNumber, status: prior.status, deduplicated: true,
        ...(prior.providerSafeId ? { providerSafeId: prior.providerSafeId } : {}),
      };
    }

    const now = Date.now();
    const windowStart = Math.floor(now / (15 * 60_000)) * 15 * 60_000;
    const rate = await ctx.db.query("rateLimits")
      .withIndex("by_fingerprint_window", (q) =>
        q.eq("fingerprintHash", args.fingerprintHash).eq("windowStart", windowStart))
      .unique();
    if (rate && rate.count >= 5) throw new ConvexError({ code: "RATE_LIMITED" });
    if (rate) await ctx.db.patch(rate._id, { count: rate.count + 1, updatedAt: now });
    else await ctx.db.insert("rateLimits", { fingerprintHash: args.fingerprintHash, windowStart, count: 1, updatedAt: now });

    const year = new Date(now).getUTCFullYear();
    const sequence = await nextSequence(ctx, `orders:${year}`);
    const orderNumber = formatSequence("CHR", year, sequence);
    const paymentReference = orderNumber;
    const customerSnapshot = {
      type: customer.type,
      fullName: customer.fullName.trim(),
      ...(customer.companyName ? { companyName: customer.companyName.trim() } : {}),
      ...(customer.companyOib ? { companyOib: customer.companyOib } : {}),
      ...(customer.contactPerson ? { contactPerson: customer.contactPerson.trim() } : {}),
      email: customer.email.trim().toLowerCase(),
      billingAddress: customer.billingAddress.trim(),
      postalCode: customer.postalCode.trim(),
      city: customer.city.trim(),
      country: "HR" as const,
    };
    const customerId = await ctx.db.insert("customers", { ...customerSnapshot, createdAt: now, updatedAt: now });
    const amountCents = authoritativePrice;
    const quoteValidityDays = Number(process.env.CJENIK_HR_QUOTE_VALID_DAYS ?? "7");
    if (!Number.isInteger(quoteValidityDays) || quoteValidityDays < 1 || quoteValidityDays > 30) {
      throw new ConvexError({ code: "INVALID_QUOTE_VALIDITY_CONFIG" });
    }
    const quoteExpiresAt = now + quoteValidityDays * 24 * 60 * 60_000;
    const orderId = await ctx.db.insert("orders", {
      orderNumber, publicTokenHash: args.publicTokenHash.toLowerCase(), requestId: args.requestId,
      customerId, customerSnapshot, packageType, paymentProvider,
      ...(args.providerSafeId ? { providerSafeId: args.providerSafeId } : {}), intakeSnapshot: {
        ...(args.domain ? { domain: args.domain.trim() } : {}),
        wordpressStatus: args.wordpressStatus,
        woocommerceStatus: args.woocommerceStatus,
        currentSystem: args.currentSystem,
        ...(args.note ? { note: args.note.trim() } : {}),
      }, amountCents, currency: "EUR",
      paymentReference, status: paymentProvider === "stripe" ? "awaiting_payment" : "quote_pending",
      quoteExpiresAt, createdAt: now, updatedAt: now,
    });
    await ctx.db.insert("orderEvents", {
      orderId, nextStatus: paymentProvider === "stripe" ? "awaiting_payment" : "quote_pending",
      actor: "order_bridge", reason: paymentProvider === "stripe" ? "stripe_order_created" : "standard_order_submitted", createdAt: now,
    });
    await ctx.db.insert("idempotencyKeys", { scopeKey, orderId, createdAt: now });
    await ctx.db.insert("payments", {
      orderId, provider: paymentProvider === "bank_transfer_ais" ? "eposlovanje_ais" : paymentProvider,
      amountCents, currency: "EUR", reference: paymentReference,
      status: "expected", createdAt: now, updatedAt: now,
    });
    if (paymentProvider === "bank_transfer_ais") {
      await ctx.scheduler.runAfter(0, internal.quotes.generateQuotePdfInternal, { orderId });
    }
    return {
      orderNumber, status: paymentProvider === "stripe" ? "awaiting_payment" : "quote_pending",
      deduplicated: false, ...(args.providerSafeId ? { providerSafeId: args.providerSafeId } : {}),
    };
  },
});

export const getCheckoutOrderForBridge = query({
  args: {
    bridgeSecret: v.string(),
    orderNumber: v.optional(v.string()),
    publicTokenHash: v.optional(v.string()),
  },
  returns: v.union(v.null(), v.object({
    orderId: v.id("orders"), orderNumber: v.string(), providerSafeId: v.string(),
    status: orderStatusValidator, packageType: v.union(v.literal("plugin"), v.literal("setup")),
    amountCents: v.number(), currency: v.literal("EUR"), customerEmail: v.string(),
    quoteExpiresAt: v.number(),
  })),
  handler: async (ctx, args) => {
    requireBridgeSecret(args.bridgeSecret);
    let order = null;
    if (args.orderNumber) {
      order = await ctx.db.query("orders").withIndex("by_order_number", (q) => q.eq("orderNumber", args.orderNumber!)).unique();
    } else if (args.publicTokenHash) {
      validateHash(args.publicTokenHash, "publicTokenHash");
      order = await ctx.db.query("orders").withIndex("by_public_token_hash", (q) => q.eq("publicTokenHash", args.publicTokenHash!.toLowerCase())).unique();
    }
    if (!order || order.paymentProvider !== "stripe" || !order.providerSafeId) return null;
    return {
      orderId: order._id, orderNumber: order.orderNumber, providerSafeId: order.providerSafeId,
      status: order.status, packageType: order.packageType, amountCents: order.amountCents,
      currency: order.currency, customerEmail: order.customerSnapshot.email, quoteExpiresAt: order.quoteExpiresAt,
    };
  },
});

export const getOrderForBridge = query({
  args: { bridgeSecret: v.string(), orderId: v.id("orders") },
  returns: v.union(v.null(), v.object({
    orderId: v.id("orders"), orderNumber: v.string(), status: orderStatusValidator,
    packageType: v.union(v.literal("plugin"), v.literal("setup")), amountCents: v.number(),
    currency: v.literal("EUR"), paymentReference: v.string(), quoteExpiresAt: v.number(),
    customer: customerInputValidator,
  })),
  handler: async (ctx, args) => {
    requireBridgeSecret(args.bridgeSecret);
    const order = await ctx.db.get(args.orderId);
    if (!order) return null;
    return {
      orderId: order._id, orderNumber: order.orderNumber, status: order.status,
      packageType: order.packageType, amountCents: order.amountCents, currency: order.currency,
      paymentReference: order.paymentReference, quoteExpiresAt: order.quoteExpiresAt,
      customer: order.customerSnapshot,
    };
  },
});

export const getOrderIdByNumberForBridge = query({
  args: { bridgeSecret: v.string(), orderNumber: v.string() },
  returns: v.union(v.null(), v.id("orders")),
  handler: async (ctx, args) => {
    requireBridgeSecret(args.bridgeSecret);
    const order = await ctx.db.query("orders")
      .withIndex("by_order_number", (q) => q.eq("orderNumber", args.orderNumber)).unique();
    return order?._id ?? null;
  },
});

export const getPublicStatus = query({
  args: { bridgeSecret: v.string(), publicTokenHash: v.string() },
  returns: v.union(v.null(), v.object({
    orderNumber: v.string(), status: orderStatusValidator,
    packageType: v.union(v.literal("plugin"), v.literal("setup")), updatedAt: v.number(),
    paymentProvider: v.optional(paymentProviderValidator),
  })),
  handler: async (ctx, args) => {
    requireBridgeSecret(args.bridgeSecret);
    validateHash(args.publicTokenHash, "publicTokenHash");
    const order = await ctx.db.query("orders")
      .withIndex("by_public_token_hash", (q) => q.eq("publicTokenHash", args.publicTokenHash.toLowerCase())).unique();
    return order ? {
      orderNumber: order.orderNumber, status: order.status,
      packageType: order.packageType, updatedAt: order.updatedAt,
      ...(order.paymentProvider ? { paymentProvider: order.paymentProvider } : {}),
    } : null;
  },
});

export const transitionForBridge = mutation({
  args: {
    bridgeSecret: v.string(), orderId: v.id("orders"), nextStatus: orderStatusValidator,
    actor: v.string(), reason: v.string(), providerReference: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    requireBridgeSecret(args.bridgeSecret);
    if (!args.actor.trim() || !args.reason.trim()) throw new ConvexError({ code: "AUDIT_FIELDS_REQUIRED" });
    await transitionOrder(ctx, args.orderId, args.nextStatus as OrderStatus, args.actor, args.reason, args.providerReference);
    return null;
  },
});
