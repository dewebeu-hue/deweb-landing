import Stripe from "stripe";
import {
  buildStripeCheckoutParams,
  type CheckoutAttempt,
  type CheckoutOrder,
  type PaymentProvider,
} from "./cjenik-hr-payment-provider.ts";

export type StripeRuntimeEnvironment = Record<string, string | undefined>;

export function getStripeTestConfig(env: StripeRuntimeEnvironment = process.env) {
  const mode = env.STRIPE_MODE;
  const secretKey = env.STRIPE_SECRET_KEY;
  const webhookSecret = env.STRIPE_WEBHOOK_SECRET;
  if (mode !== "test") throw new Error("STRIPE_TEST_MODE_REQUIRED");
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY_MISSING");
  if (secretKey.startsWith("sk_live_") || secretKey.startsWith("rk_live_")) {
    const productionGatesOpen = env.VERCEL_ENV === "production" &&
      env.STRIPE_PRODUCTION_ENABLED === "true" &&
      env.COMMERCIAL_TERMS_CONFIRMED === "true" &&
      env.BILLING_POLICY_CONFIRMED === "true" &&
      env.EPOSLOVANJE_PRODUCTION_ENABLED === "true";
    throw new Error(productionGatesOpen ? "STRIPE_LIVE_MODE_NOT_IMPLEMENTED" : "STRIPE_LIVE_KEY_REJECTED");
  }
  if (!secretKey.startsWith("sk_test_")) throw new Error("STRIPE_TEST_KEY_REQUIRED");
  return { secretKey, webhookSecret };
}

export function getStripeWebhookConfig(env: StripeRuntimeEnvironment = process.env) {
  const config = getStripeTestConfig(env);
  if (!config.webhookSecret || !config.webhookSecret.startsWith("whsec_")) {
    throw new Error("STRIPE_WEBHOOK_SECRET_MISSING");
  }
  return { ...config, webhookSecret: config.webhookSecret };
}

export function getCheckoutOrigin(env: StripeRuntimeEnvironment = process.env) {
  const explicit = env.CJENIK_HR_CHECKOUT_ORIGIN;
  if (explicit) {
    const url = new URL(explicit);
    if (url.protocol !== "https:" && url.hostname !== "localhost" && url.hostname !== "127.0.0.1") {
      throw new Error("CHECKOUT_ORIGIN_MUST_BE_HTTPS");
    }
    return url.origin;
  }
  if (env.VERCEL_URL) return `https://${env.VERCEL_URL}`;
  if (env.NODE_ENV === "development") return "http://localhost:3000";
  throw new Error("CHECKOUT_ORIGIN_MISSING");
}

export function createStripeClient(env: StripeRuntimeEnvironment = process.env) {
  const { secretKey } = getStripeTestConfig(env);
  return new Stripe(secretKey, {
    appInfo: { name: "deweb-cjenik-hr", version: "1.0.0" },
    maxNetworkRetries: 2,
  });
}

export function createStripePaymentProvider(
  env: StripeRuntimeEnvironment = process.env,
  client: Stripe = createStripeClient(env),
): PaymentProvider {
  const origin = getCheckoutOrigin(env);
  return {
    type: "stripe",
    async createCheckoutSession(order: CheckoutOrder, attempt: CheckoutAttempt) {
      const session = await client.checkout.sessions.create(
        buildStripeCheckoutParams(order, origin),
        { idempotencyKey: attempt.idempotencyKey },
      );
      if (session.livemode || !session.id.startsWith("cs_test_") || !session.url) {
        throw new Error("STRIPE_TEST_SESSION_REQUIRED");
      }
      return {
        providerSessionId: session.id,
        checkoutUrl: session.url,
        expiresAt: session.expires_at * 1000,
      };
    },
  };
}

export function stripeObjectId(value: string | { id: string } | null) {
  return typeof value === "string" ? value : value?.id;
}

export function verifyStripeWebhookSignature(
  rawBody: string,
  signature: string,
  env: StripeRuntimeEnvironment = process.env,
  client: Stripe = createStripeClient(env),
) {
  const { webhookSecret } = getStripeWebhookConfig(env);
  return client.webhooks.constructEvent(rawBody, signature, webhookSecret);
}
