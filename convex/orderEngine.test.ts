import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { convexTest } from "convex-test";
import { test } from "vitest";
import schema from "./schema";
import { api, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

const modules = import.meta.glob("./**/*.ts");

const secret = "test-order-engine-bridge-secret-123456";
process.env.CJENIK_HR_ORDER_ENGINE_BRIDGE_SECRET = secret;

function hex(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function orderInput(index: number, overrides: Record<string, unknown> = {}) {
  return {
    bridgeSecret: secret,
    requestId: `request_${String(index).padStart(16, "0")}`,
    publicTokenHash: hex(`token-${index}`),
    fingerprintHash: hex(`fingerprint-${index}`),
    requestType: "plugin",
    customerType: "consumer",
    fullName: "Test Kupac",
    billingAddress: "Testna 1",
    postalCode: "10000",
    city: "Zagreb",
    country: "HR",
    email: `kupac-${index}@example.test`,
    wordpressStatus: "yes",
    woocommerceStatus: "yes",
    currentSystem: "woocommerce",
    quotedPriceCents: 3900,
    ...overrides,
  };
}

function enableQuoteSandbox() {
  process.env.CJENIK_HR_BILLING_MODE = "sandbox";
  process.env.CJENIK_HR_PAYMENT_IBAN_IS_TEST = "true";
  process.env.CJENIK_HR_SELLER_NAME = "Deweb test";
  process.env.CJENIK_HR_SELLER_OIB = "50930104221";
  process.env.CJENIK_HR_SELLER_ADDRESS = "Testna 1";
  process.env.CJENIK_HR_SELLER_CITY = "10000 Zagreb";
  process.env.CJENIK_HR_SELLER_TAX_TEXT = "TESTNI POREZNI TEKST";
  process.env.CJENIK_HR_PAYMENT_IBAN = "HR0000000000000000000";
  process.env.CJENIK_HR_PAYMENT_MODEL = "HR00";
  process.env.CJENIK_HR_PAYMENT_PURPOSE_CODE = "COST";
  process.env.CJENIK_HR_PAYMENT_CODE_PROVIDER = "mock";
  process.env.CJENIK_HR_PAYMENT_CODE_SANDBOX_ENABLED = "true";
  process.env.CJENIK_HR_QUOTE_EMAIL_MODE = "mock";
  process.env.CJENIK_HR_QUOTE_EMAIL_SANDBOX_ENABLED = "true";
}

test("submission is idempotent and sequence numbers stay unique", async () => {
  const t = convexTest(schema, modules);
  const first = await t.mutation(api.orders.submitOrder, orderInput(1));
  const repeated = await t.mutation(api.orders.submitOrder, orderInput(1));
  const second = await t.mutation(api.orders.submitOrder, orderInput(2));
  assert.equal(repeated.orderNumber, first.orderNumber);
  assert.equal(repeated.deduplicated, true);
  assert.notEqual(second.orderNumber, first.orderNumber);
  assert.match(first.orderNumber, /^CHR-\d{4}-000001$/);
  assert.match(second.orderNumber, /^CHR-\d{4}-000002$/);
});

test("server rejects a client price mismatch and enforces the fingerprint window", async () => {
  const priceTest = convexTest(schema, modules);
  await assert.rejects(
    priceTest.mutation(api.orders.submitOrder, orderInput(10, { quotedPriceCents: 1 })),
    /PRICE_MISMATCH/,
  );

  const rateTest = convexTest(schema, modules);
  const fingerprintHash = hex("one-browser");
  for (let index = 20; index < 25; index += 1) {
    await rateTest.mutation(api.orders.submitOrder, orderInput(index, { fingerprintHash }));
  }
  await assert.rejects(
    rateTest.mutation(api.orders.submitOrder, orderInput(25, { fingerprintHash })),
    /RATE_LIMITED/,
  );
});

test("AIS exact match verifies once; duplicate and amount mismatch remain safe", async () => {
  const t = convexTest(schema, modules);
  const created = await t.mutation(api.orders.submitOrder, orderInput(30));
  const orderId = await t.query(api.orders.getOrderIdByNumberForBridge, {
    bridgeSecret: secret, orderNumber: created.orderNumber,
  });
  assert.ok(orderId);
  await t.run(async (ctx) => ctx.db.patch(orderId, { status: "awaiting_payment" }));
  const baseEvent = {
    bridgeSecret: secret, provider: "mock_ais", providerEventId: "evt-1",
    providerTransactionId: "txn-1", bookedAt: Date.now(), direction: "incoming",
    amountCents: 3900, currency: "EUR", reference: created.orderNumber,
    payloadDigest: hex("evt-1"),
  };
  const matched = await t.mutation(api.payments.ingestAisProviderEvent, baseEvent);
  assert.equal(matched.matchStatus, "matched");
  const duplicate = await t.mutation(api.payments.ingestAisProviderEvent, baseEvent);
  assert.equal(duplicate.duplicate, true);
  const duplicateTransaction = await t.mutation(api.payments.ingestAisProviderEvent, {
    ...baseEvent, providerEventId: "evt-1-replayed", payloadDigest: hex("evt-1-replayed"),
  });
  assert.equal(duplicateTransaction.duplicate, true);
  assert.equal(duplicateTransaction.eventId, matched.eventId);
  const order = await t.run(async (ctx) => ctx.db.get(orderId as Id<"orders">));
  assert.equal(order?.status, "invoice_review_required");

  const second = await t.mutation(api.orders.submitOrder, orderInput(31));
  const secondId = await t.query(api.orders.getOrderIdByNumberForBridge, {
    bridgeSecret: secret, orderNumber: second.orderNumber,
  });
  assert.ok(secondId);
  await t.run(async (ctx) => ctx.db.patch(secondId, { status: "awaiting_payment" }));
  const review = await t.mutation(api.payments.ingestAisProviderEvent, {
    ...baseEvent, providerEventId: "evt-2", providerTransactionId: "txn-2",
    amountCents: 3800, reference: second.orderNumber, payloadDigest: hex("evt-2"),
  });
  assert.equal(review.matchStatus, "review_required");
});

test("manual verification is internal and invoice policy remains fail-closed", async () => {
  const t = convexTest(schema, modules);
  const created = await t.mutation(api.orders.submitOrder, orderInput(40));
  const orderId = await t.query(api.orders.getOrderIdByNumberForBridge, {
    bridgeSecret: secret, orderNumber: created.orderNumber,
  });
  assert.ok(orderId);
  await t.run(async (ctx) => ctx.db.patch(orderId, { status: "payment_review_required" }));
  await t.mutation(internal.payments.manualVerifyPayment, {
    orderId, amountCents: 3900, reference: created.orderNumber,
    actor: "operator:test", reason: "bank_statement_reviewed",
  });
  const order = await t.run(async (ctx) => ctx.db.get(orderId as Id<"orders">));
  assert.equal(order?.status, "invoice_review_required");
  const events = await t.run(async (ctx) => ctx.db.query("orderEvents")
    .withIndex("by_order_created", (q) => q.eq("orderId", orderId)).collect());
  assert.ok(events.some((event) => event.actor === "operator:test" && event.reason.includes("manual_verified")));
  const invoice = await t.mutation(api.invoices.requestInvoice, {
    bridgeSecret: secret, orderId, requestId: "invoice_request_00000040",
  });
  assert.equal(invoice.status, "review_required");
  const repeated = await t.mutation(api.invoices.requestInvoice, {
    bridgeSecret: secret, orderId, requestId: "invoice_request_00000040",
  });
  assert.equal(repeated.idempotent, true);
});

test("39 EUR sandbox flow creates a Unicode PDF quote and stops at invoice review", async () => {
  enableQuoteSandbox();
  const t = convexTest(schema, modules);
  const created = await t.mutation(api.orders.submitOrder, orderInput(60));
  const orderId = await t.query(api.orders.getOrderIdByNumberForBridge, {
    bridgeSecret: secret, orderNumber: created.orderNumber,
  });
  assert.ok(orderId);
  await t.finishAllScheduledFunctions(() => {});
  const quote = await t.query(api.quoteRecords.getQuoteForBridge, { bridgeSecret: secret, orderId });
  assert.equal(quote?.testDocument, true);
  assert.equal(quote?.status, "sent");
  const afterQuote = await t.run(async (ctx) => ctx.db.get(orderId as Id<"orders">));
  assert.equal(afterQuote?.status, "awaiting_payment");
  const matched = await t.mutation(api.payments.ingestAisProviderEvent, {
    bridgeSecret: secret, provider: "mock_ais", providerEventId: "evt-60",
    providerTransactionId: "txn-60", bookedAt: Date.now(), direction: "incoming",
    amountCents: 3900, currency: "EUR", reference: created.orderNumber, payloadDigest: hex("evt-60"),
  });
  assert.equal(matched.matchStatus, "matched");
  const finalOrder = await t.run(async (ctx) => ctx.db.get(orderId as Id<"orders">));
  assert.equal(finalOrder?.status, "invoice_review_required");
}, 20_000);

test("79 EUR test provider flow delivers the plugin and remains setup pending", async () => {
  enableQuoteSandbox();
  process.env.CJENIK_HR_INVOICE_PROVIDER_MODE = "mock";
  process.env.CJENIK_HR_INVOICE_SANDBOX_ENABLED = "true";
  process.env.CJENIK_HR_BILLING_POLICY_TEST_CONFIRMED = "true";
  process.env.CJENIK_HR_DELIVERY_MODE = "sandbox";
  process.env.CJENIK_HR_DELIVERY_SANDBOX_ENABLED = "true";
  const t = convexTest(schema, modules);
  const created = await t.mutation(api.orders.submitOrder, orderInput(70, {
    requestType: "setup", quotedPriceCents: 7900, domain: "https://example.test",
  }));
  const orderId = await t.query(api.orders.getOrderIdByNumberForBridge, {
    bridgeSecret: secret, orderNumber: created.orderNumber,
  });
  assert.ok(orderId);
  await t.finishAllScheduledFunctions(() => {});
  await t.mutation(api.payments.ingestAisProviderEvent, {
    bridgeSecret: secret, provider: "mock_ais", providerEventId: "evt-70",
    providerTransactionId: "txn-70", bookedAt: Date.now(), direction: "incoming",
    amountCents: 7900, currency: "EUR", reference: created.orderNumber, payloadDigest: hex("evt-70"),
  });
  await t.mutation(api.invoices.requestInvoice, {
    bridgeSecret: secret, orderId, requestId: "invoice_request_00000070",
  });
  await t.action(api.invoices.runInvoiceProvider, { bridgeSecret: secret, orderId });
  await t.run(async (ctx) => {
    const storageId = await ctx.storage.store(new Blob(["synthetic test zip"]));
    await ctx.db.insert("deliveryArtifacts", {
      packageType: "setup", pluginVersion: "1.0.0", schemaVersion: 7,
      checkpoint: "194783813ee3ae647939ddf5d093b9baffdcec15",
      sha256: "8ae3b6ad3834a5bb2bb5c7defb3c63477f5788936e66bdfd1d735a9a267a0898",
      sizeBytes: 18, storageId, active: true, createdAt: Date.now(),
    });
  });
  const tokenHash = hex("setup-delivery-token");
  await t.mutation(internal.deliveries.issueDeliveryInternal, {
    orderId, tokenHash, expiresAt: Date.now() + 60_000, maxDownloads: 1,
  });
  await t.mutation(api.deliveries.consumeDelivery, {
    bridgeSecret: secret, tokenHash, orderNumber: created.orderNumber,
  });
  const finalOrder = await t.run(async (ctx) => ctx.db.get(orderId as Id<"orders">));
  assert.equal(finalOrder?.amountCents, 7900);
  assert.equal(finalOrder?.status, "setup_pending");
}, 20_000);

test("delivery token is order-bound and download limits are enforced", async () => {
  process.env.CJENIK_HR_DELIVERY_MODE = "sandbox";
  process.env.CJENIK_HR_DELIVERY_SANDBOX_ENABLED = "true";
  const t = convexTest(schema, modules);
  const created = await t.mutation(api.orders.submitOrder, orderInput(50));
  const orderId = await t.query(api.orders.getOrderIdByNumberForBridge, {
    bridgeSecret: secret, orderNumber: created.orderNumber,
  });
  assert.ok(orderId);
  const artifactId = await t.run(async (ctx) => {
    await ctx.db.patch(orderId, { status: "invoice_sent" });
    const storageId = await ctx.storage.store(new Blob(["test zip"]));
    return await ctx.db.insert("deliveryArtifacts", {
      packageType: "plugin", pluginVersion: "1.0.0", schemaVersion: 7,
      checkpoint: "194783813ee3ae647939ddf5d093b9baffdcec15",
      sha256: "8ae3b6ad3834a5bb2bb5c7defb3c63477f5788936e66bdfd1d735a9a267a0898",
      sizeBytes: 8, storageId, active: true, createdAt: Date.now(),
    });
  });
  assert.ok(artifactId);
  const token = "test-delivery-token-only-visible-once";
  const tokenHash = hex(token);
  await assert.rejects(
    t.mutation(internal.deliveries.issueDeliveryInternal, {
      orderId, tokenHash: hex("expired-token"), expiresAt: Date.now() - 1, maxDownloads: 1,
    }),
    /INVALID_DELIVERY_POLICY/,
  );
  await t.mutation(internal.deliveries.issueDeliveryInternal, {
    orderId, tokenHash, expiresAt: Date.now() + 60_000, maxDownloads: 1,
  });
  const revokedTokenHash = hex("revoked-token");
  const revokedDeliveryId = await t.mutation(internal.deliveries.issueDeliveryInternal, {
    orderId, tokenHash: revokedTokenHash, expiresAt: Date.now() + 60_000, maxDownloads: 1,
  });
  await t.mutation(api.deliveries.revokeDelivery, {
    bridgeSecret: secret, deliveryId: revokedDeliveryId, actor: "operator:test", reason: "qa_revoke",
  });
  await assert.rejects(
    t.mutation(api.deliveries.consumeDelivery, {
      bridgeSecret: secret, tokenHash: revokedTokenHash, orderNumber: created.orderNumber,
    }),
    /DELIVERY_TOKEN_UNAVAILABLE/,
  );
  const consumed = await t.mutation(api.deliveries.consumeDelivery, {
    bridgeSecret: secret, tokenHash, orderNumber: created.orderNumber,
  });
  assert.equal(consumed.remainingDownloads, 0);
  await assert.rejects(
    t.mutation(api.deliveries.consumeDelivery, {
      bridgeSecret: secret, tokenHash, orderNumber: created.orderNumber,
    }),
    /DELIVERY_TOKEN_UNAVAILABLE/,
  );
});
