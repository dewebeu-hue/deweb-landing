import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import Stripe from "stripe";
import { buildStripeCheckoutParams, type CheckoutOrder } from "./cjenik-hr-payment-provider.ts";
import { getStripeTestConfig, verifyStripeWebhookSignature } from "./cjenik-hr-stripe.ts";

const baseOrder: CheckoutOrder = {
  orderNumber: "CHR-2026-000001",
  providerSafeId: "provider_safe_identifier_123456",
  publicOrderToken: "public_order_token_12345678901234567890",
  packageType: "plugin",
  amountCents: 3900,
  currency: "EUR",
  customerEmail: "kupac@example.test",
};

test("Stripe Checkout price_data is server-authoritative for both packages", () => {
  const plugin = buildStripeCheckoutParams(baseOrder, "https://preview.example.test");
  const setup = buildStripeCheckoutParams({ ...baseOrder, packageType: "setup", amountCents: 7900 }, "https://preview.example.test");
  assert.equal(plugin.line_items?.[0]?.price_data?.unit_amount, 3900);
  assert.equal(setup.line_items?.[0]?.price_data?.unit_amount, 7900);
  assert.equal(plugin.line_items?.[0]?.price_data?.currency, "eur");
  assert.deepEqual(plugin.payment_method_types, ["card"]);
});

test("browser amount tampering and invalid package cannot create a Checkout price", () => {
  assert.throws(() => buildStripeCheckoutParams({ ...baseOrder, amountCents: 1 }, "https://preview.example.test"), /ORDER_PRICE_INVARIANT_FAILED/);
  assert.throws(() => buildStripeCheckoutParams({ ...baseOrder, packageType: "invalid" as "plugin" }, "https://preview.example.test"), /ORDER_PRICE_INVARIANT_FAILED/);
});

test("Checkout metadata and client reference contain only provider-safe order fields", () => {
  const params = buildStripeCheckoutParams(baseOrder, "https://preview.example.test");
  assert.equal(params.client_reference_id, baseOrder.providerSafeId);
  assert.deepEqual(params.metadata, {
    orderRef: baseOrder.providerSafeId,
    orderNumber: baseOrder.orderNumber,
    package: "plugin",
  });
  const serialized = JSON.stringify(params.metadata);
  assert.doesNotMatch(serialized, /example\.test|OIB|address|token/i);
});

test("test mode hard-fails live and malformed Stripe keys", () => {
  const liveKey = ["sk", "live", "example"].join("_");
  const testKey = ["sk", "test", "example"].join("_");
  assert.throws(() => getStripeTestConfig({ STRIPE_MODE: "test", STRIPE_SECRET_KEY: liveKey, VERCEL_ENV: "preview" }), /STRIPE_LIVE_KEY_REJECTED/);
  assert.throws(() => getStripeTestConfig({ STRIPE_MODE: "live", STRIPE_SECRET_KEY: testKey }), /STRIPE_TEST_MODE_REQUIRED/);
  assert.throws(() => getStripeTestConfig({ STRIPE_MODE: "test", STRIPE_SECRET_KEY: "secret" }), /STRIPE_TEST_KEY_REQUIRED/);
});

test("Stripe signature verifies the exact raw body and rejects tampering or the wrong secret", () => {
  const signingSecret = `wh${"sec"}_unit_test_secret`;
  const env = { STRIPE_MODE: "test", STRIPE_SECRET_KEY: ["sk", "test", "unit"].join("_"), STRIPE_WEBHOOK_SECRET: signingSecret };
  const stripe = new Stripe(env.STRIPE_SECRET_KEY);
  const rawBody = JSON.stringify({ id: "evt_unit", object: "event", type: "checkout.session.completed" });
  const signature = stripe.webhooks.generateTestHeaderString({ payload: rawBody, secret: signingSecret });
  assert.equal(verifyStripeWebhookSignature(rawBody, signature, env, stripe).id, "evt_unit");
  assert.throws(() => verifyStripeWebhookSignature(`${rawBody} `, signature, env, stripe), /signature/i);
  const wrongEnv = { ...env, STRIPE_WEBHOOK_SECRET: `wh${"sec"}_wrong` };
  assert.throws(() => verifyStripeWebhookSignature(rawBody, signature, wrongEnv, stripe), /signature/i);
});

test("webhook route rejects missing signatures, reads raw text, and uses the protected Convex bridge", async () => {
  const source = await readFile(new URL("../app/api/cjenik-hr/stripe/webhook/route.ts", import.meta.url), "utf8");
  assert.match(source, /headers\.get\("stripe-signature"\)/);
  assert.match(source, /if \(!signature\).*status: 400/);
  assert.match(source, /await request\.text\(\)/);
  assert.match(source, /verifyStripeWebhookSignature\(rawBody, signature\)/);
  assert.match(source, /bridgeSecret: config\.bridgeSecret/);
  assert.doesNotMatch(source, /await request\.json\(\)/);
});

test("standard Checkout and manual other-system lead use separate endpoints", async () => {
  const source = await readFile(new URL("../app/cjenik-hr/cjenik-hr-request-form.tsx", import.meta.url), "utf8");
  assert.match(source, /isStandardOrder \? "\/api\/cjenik-hr\/checkout" : "\/api\/cjenik-hr"/);
  assert.match(source, /Drugi sustav ostaje ručni upit bez automatske ponude, naplate ili isporuke/);
});
