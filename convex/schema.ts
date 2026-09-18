import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const orderStatus = v.union(
  v.literal("lead"),
  v.literal("quote_pending"),
  v.literal("quote_created"),
  v.literal("quote_sent"),
  v.literal("awaiting_payment"),
  v.literal("payment_detected"),
  v.literal("payment_review_required"),
  v.literal("payment_verified"),
  v.literal("invoice_pending"),
  v.literal("invoice_review_required"),
  v.literal("invoice_processing"),
  v.literal("invoice_fiscalized"),
  v.literal("invoice_failed"),
  v.literal("invoice_sent"),
  v.literal("delivery_ready"),
  v.literal("setup_pending"),
  v.literal("completed"),
  v.literal("refund_pending"),
  v.literal("refunded"),
  v.literal("expired"),
  v.literal("cancelled"),
  v.literal("failed"),
);

const customerType = v.union(v.literal("business"), v.literal("consumer"));
const packageType = v.union(v.literal("plugin"), v.literal("setup"));
const paymentProvider = v.union(
  v.literal("stripe"),
  v.literal("bank_transfer_ais"),
  v.literal("mock"),
);

export default defineSchema({
  customers: defineTable({
    type: customerType,
    fullName: v.string(),
    companyName: v.optional(v.string()),
    companyOib: v.optional(v.string()),
    contactPerson: v.optional(v.string()),
    email: v.string(),
    billingAddress: v.string(),
    postalCode: v.string(),
    city: v.string(),
    country: v.literal("HR"),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_email", ["email"]),

  orders: defineTable({
    orderNumber: v.string(),
    publicTokenHash: v.string(),
    requestId: v.string(),
    customerId: v.id("customers"),
    customerSnapshot: v.object({
      type: customerType,
      fullName: v.string(),
      companyName: v.optional(v.string()),
      companyOib: v.optional(v.string()),
      contactPerson: v.optional(v.string()),
      email: v.string(),
      billingAddress: v.string(),
      postalCode: v.string(),
      city: v.string(),
      country: v.literal("HR"),
    }),
    packageType,
    paymentProvider: v.optional(paymentProvider),
    providerSafeId: v.optional(v.string()),
    intakeSnapshot: v.optional(v.object({
      domain: v.optional(v.string()),
      wordpressStatus: v.string(),
      woocommerceStatus: v.string(),
      currentSystem: v.string(),
      note: v.optional(v.string()),
    })),
    amountCents: v.number(),
    currency: v.literal("EUR"),
    paymentReference: v.string(),
    status: orderStatus,
    quoteExpiresAt: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_order_number", ["orderNumber"])
    .index("by_provider_safe_id", ["providerSafeId"])
    .index("by_public_token_hash", ["publicTokenHash"])
    .index("by_request_id", ["requestId"])
    .index("by_payment_reference", ["paymentReference"])
    .index("by_status", ["status"]),

  orderEvents: defineTable({
    orderId: v.id("orders"),
    previousStatus: v.optional(orderStatus),
    nextStatus: orderStatus,
    actor: v.string(),
    reason: v.string(),
    providerReference: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_order_created", ["orderId", "createdAt"]),

  sequences: defineTable({
    name: v.string(),
    value: v.number(),
    updatedAt: v.number(),
  }).index("by_name", ["name"]),

  idempotencyKeys: defineTable({
    scopeKey: v.string(),
    orderId: v.id("orders"),
    createdAt: v.number(),
  }).index("by_scope_key", ["scopeKey"]),

  quotes: defineTable({
    orderId: v.id("orders"),
    quoteNumber: v.string(),
    amountCents: v.number(),
    currency: v.literal("EUR"),
    storageId: v.optional(v.id("_storage")),
    documentSha256: v.optional(v.string()),
    status: v.union(
      v.literal("pending_pdf"),
      v.literal("created"),
      v.literal("sent"),
      v.literal("expired"),
      v.literal("failed"),
    ),
    testDocument: v.boolean(),
    expiresAt: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_order", ["orderId"])
    .index("by_quote_number", ["quoteNumber"]),

  payments: defineTable({
    orderId: v.id("orders"),
    provider: v.string(),
    providerTransactionId: v.optional(v.string()),
    amountCents: v.number(),
    currency: v.literal("EUR"),
    reference: v.string(),
    status: v.union(
      v.literal("expected"),
      v.literal("detected"),
      v.literal("matched"),
      v.literal("review_required"),
      v.literal("verified"),
      v.literal("refunded"),
    ),
    providerSessionId: v.optional(v.string()),
    providerEventId: v.optional(v.string()),
    paidAt: v.optional(v.number()),
    livemode: v.optional(v.boolean()),
    paymentMethodType: v.optional(v.string()),
    verificationMethod: v.optional(v.union(v.literal("ais"), v.literal("manual"), v.literal("stripe"))),
    verifiedBy: v.optional(v.string()),
    verifiedAt: v.optional(v.number()),
    reviewReason: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_order", ["orderId"])
    .index("by_provider_transaction", ["provider", "providerTransactionId"])
    .index("by_provider_session", ["provider", "providerSessionId"]),

  paymentAttempts: defineTable({
    orderId: v.id("orders"),
    provider: paymentProvider,
    attemptNumber: v.number(),
    idempotencyKey: v.string(),
    providerSessionId: v.optional(v.string()),
    checkoutUrl: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
    status: v.union(
      v.literal("creating"),
      v.literal("open"),
      v.literal("completed"),
      v.literal("expired"),
      v.literal("cancelled"),
      v.literal("failed"),
      v.literal("review_required"),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_order", ["orderId"])
    .index("by_provider_session", ["provider", "providerSessionId"])
    .index("by_idempotency_key", ["idempotencyKey"]),

  paymentProviderEvents: defineTable({
    provider: v.string(),
    providerEventId: v.string(),
    eventType: v.optional(v.string()),
    livemode: v.optional(v.boolean()),
    providerTransactionId: v.string(),
    bookedAt: v.number(),
    direction: v.union(v.literal("incoming"), v.literal("outgoing"), v.literal("unknown")),
    amountCents: v.number(),
    currency: v.string(),
    reference: v.optional(v.string()),
    debtorName: v.optional(v.string()),
    payloadDigest: v.string(),
    matchStatus: v.union(
      v.literal("unprocessed"),
      v.literal("matched"),
      v.literal("duplicate"),
      v.literal("review_required"),
      v.literal("ignored"),
    ),
    matchReason: v.optional(v.string()),
    orderId: v.optional(v.id("orders")),
    paymentId: v.optional(v.id("payments")),
    receivedAt: v.number(),
    processedAt: v.optional(v.number()),
  })
    .index("by_provider_event", ["provider", "providerEventId"])
    .index("by_provider_transaction", ["provider", "providerTransactionId"])
    .index("by_match_status", ["matchStatus", "receivedAt"]),

  invoices: defineTable({
    orderId: v.id("orders"),
    provider: v.string(),
    providerRequestId: v.string(),
    providerInvoiceId: v.optional(v.string()),
    invoiceNumber: v.optional(v.string()),
    amountCents: v.number(),
    currency: v.literal("EUR"),
    storageId: v.optional(v.id("_storage")),
    documentSha256: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("review_required"),
      v.literal("processing"),
      v.literal("fiscalized"),
      v.literal("test_created"),
      v.literal("sent"),
      v.literal("failed"),
    ),
    testDocument: v.boolean(),
    failureCode: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_order", ["orderId"])
    .index("by_provider_request", ["provider", "providerRequestId"])
    .index("by_provider_invoice", ["provider", "providerInvoiceId"]),

  deliveryArtifacts: defineTable({
    packageType,
    pluginVersion: v.string(),
    schemaVersion: v.number(),
    checkpoint: v.string(),
    sha256: v.string(),
    sizeBytes: v.number(),
    testArtifact: v.optional(v.boolean()),
    storageId: v.id("_storage"),
    active: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_package_active", ["packageType", "active"])
    .index("by_sha256", ["sha256"]),

  deliveries: defineTable({
    orderId: v.id("orders"),
    artifactId: v.id("deliveryArtifacts"),
    tokenHash: v.string(),
    expiresAt: v.number(),
    maxDownloads: v.number(),
    downloadCount: v.number(),
    revokedAt: v.optional(v.number()),
    lastDownloadedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_token_hash", ["tokenHash"])
    .index("by_order", ["orderId"]),

  emailEvents: defineTable({
    orderId: v.id("orders"),
    kind: v.union(
      v.literal("quote_customer"),
      v.literal("quote_internal"),
      v.literal("payment_customer"),
      v.literal("invoice_customer"),
      v.literal("delivery_customer"),
      v.literal("failure_internal"),
    ),
    recipientClass: v.union(v.literal("customer"), v.literal("internal")),
    idempotencyKey: v.string(),
    status: v.union(v.literal("pending"), v.literal("sent"), v.literal("failed")),
    providerMessageId: v.optional(v.string()),
    attemptCount: v.number(),
    lastErrorCode: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_idempotency_key", ["idempotencyKey"])
    .index("by_order_kind", ["orderId", "kind"]),

  rateLimits: defineTable({
    fingerprintHash: v.string(),
    windowStart: v.number(),
    count: v.number(),
    updatedAt: v.number(),
  }).index("by_fingerprint_window", ["fingerprintHash", "windowStart"]),

  providerSyncState: defineTable({
    provider: v.string(),
    cursor: v.optional(v.string()),
    lockUntil: v.optional(v.number()),
    lastStartedAt: v.optional(v.number()),
    lastSucceededAt: v.optional(v.number()),
    consecutiveFailures: v.number(),
    lastErrorCode: v.optional(v.string()),
    updatedAt: v.number(),
  }).index("by_provider", ["provider"]),
});
