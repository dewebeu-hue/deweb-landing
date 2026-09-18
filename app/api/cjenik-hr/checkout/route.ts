import { ConvexHttpClient } from "convex/browser";
import { NextResponse } from "next/server";
import { api } from "../../../../convex/_generated/api";
import {
  cjenikHrRequestFingerprint,
  createPublicOrderIdentity,
  getCjenikHrOrderEngineConfig,
  sha256,
} from "../../../../lib/cjenik-hr-order-bridge";
import {
  normalizeCjenikHrOrderInput,
  priceCentsForCjenikHrPackage,
  validateCjenikHrOrder,
  type CjenikHrOrderInput,
} from "../../../../lib/cjenik-hr-order";
import { isCjenikHrHoneypotSubmission } from "../../../../lib/cjenik-hr-request";
import { createStripePaymentProvider } from "../../../../lib/cjenik-hr-stripe";

export const runtime = "nodejs";
const MAX_BODY_BYTES = 32_000;

async function readBody(request: Request) {
  const declaredSize = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declaredSize) && declaredSize > MAX_BODY_BYTES) throw new Error("BODY_TOO_LARGE");
  const text = await request.text();
  if (Buffer.byteLength(text, "utf8") > MAX_BODY_BYTES) throw new Error("BODY_TOO_LARGE");
  const parsed: unknown = JSON.parse(text);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("INVALID_BODY");
  return parsed as Record<string, unknown>;
}

export async function POST(request: Request) {
  let data: Record<string, unknown>;
  try {
    data = await readBody(request);
  } catch (error) {
    const tooLarge = error instanceof Error && error.message === "BODY_TOO_LARGE";
    return NextResponse.json({ ok: false, error: tooLarge ? "Zahtjev je prevelik." : "Neispravan zahtjev." }, { status: tooLarge ? 413 : 400 });
  }
  if (isCjenikHrHoneypotSubmission(data)) return NextResponse.json({ ok: true, accepted: false });

  try {
    const config = getCjenikHrOrderEngineConfig();
    const client = new ConvexHttpClient(config.convexUrl);
    let publicOrderToken = typeof data.publicOrderToken === "string" ? data.publicOrderToken : "";
    let orderNumber: string | undefined;

    if (publicOrderToken) {
      if (!/^[A-Za-z0-9_-]{40,96}$/.test(publicOrderToken)) {
        return NextResponse.json({ ok: false, error: "Neispravan identifikator narudžbe." }, { status: 400 });
      }
    } else {
      const validation = validateCjenikHrOrder(data as Partial<CjenikHrOrderInput>);
      if (!validation.valid) {
        return NextResponse.json({ ok: false, error: "Provjerite označena polja i pokušajte ponovno.", fields: validation.errors }, { status: 400 });
      }
      if (request.headers.get("idempotency-key") !== validation.value.requestId) {
        return NextResponse.json({ ok: false, error: "Nedostaje valjan identifikator zahtjeva.", fields: ["requestId"] }, { status: 400 });
      }
      const value = normalizeCjenikHrOrderInput(validation.value);
      const identity = createPublicOrderIdentity(value.requestId, config.publicTokenSecret);
      publicOrderToken = identity.publicOrderToken;
      const submitted = await client.mutation(api.orders.submitOrder, {
        bridgeSecret: config.bridgeSecret,
        requestId: value.requestId,
        publicTokenHash: sha256(publicOrderToken),
        fingerprintHash: cjenikHrRequestFingerprint(request, config.fingerprintSecret),
        requestType: value.requestType,
        customerType: value.customerType,
        fullName: value.fullName,
        companyName: value.companyName || undefined,
        companyOib: value.companyOib || undefined,
        billingAddress: value.billingAddress,
        postalCode: value.postalCode,
        city: value.city,
        country: value.country,
        email: value.email,
        domain: value.domain || undefined,
        wordpressStatus: value.wordpressStatus,
        woocommerceStatus: value.woocommerceStatus,
        currentSystem: value.currentSystem,
        note: value.note || undefined,
        quotedPriceCents: priceCentsForCjenikHrPackage(value.requestType),
        paymentProvider: "stripe",
        providerSafeId: identity.providerSafeId,
      });
      orderNumber = submitted.orderNumber;
    }

    const order = await client.query(api.orders.getCheckoutOrderForBridge, {
      bridgeSecret: config.bridgeSecret,
      ...(orderNumber ? { orderNumber } : { publicTokenHash: sha256(publicOrderToken) }),
    });
    if (!order) return NextResponse.json({ ok: false, error: "Narudžba nije dostupna za kartično plaćanje." }, { status: 404 });
    if (order.status !== "awaiting_payment") {
      return NextResponse.json({ ok: false, error: "Ova narudžba više nije dostupna za plaćanje." }, { status: 409 });
    }
    const attempt = await client.mutation(api.stripePayments.prepareCheckoutAttempt, {
      bridgeSecret: config.bridgeSecret, orderId: order.orderId,
    });
    if (attempt.checkoutUrl && (!attempt.expiresAt || attempt.expiresAt > Date.now())) {
      return NextResponse.json({ ok: true, checkoutUrl: attempt.checkoutUrl, publicOrderToken, reused: true });
    }
    const provider = createStripePaymentProvider();
    const session = await provider.createCheckoutSession({
      orderNumber: order.orderNumber, providerSafeId: order.providerSafeId, publicOrderToken,
      packageType: order.packageType, amountCents: order.amountCents, currency: order.currency,
      customerEmail: order.customerEmail,
    }, { idempotencyKey: attempt.idempotencyKey });
    await client.mutation(api.stripePayments.recordCheckoutSession, {
      bridgeSecret: config.bridgeSecret, attemptId: attempt.attemptId,
      providerSessionId: session.providerSessionId, checkoutUrl: session.checkoutUrl,
      expiresAt: session.expiresAt,
    });
    console.info(JSON.stringify({ event: "cjenik_hr_stripe_checkout_created", orderNumber: order.orderNumber, attempt: attempt.attemptNumber }));
    return NextResponse.json({ ok: true, checkoutUrl: session.checkoutUrl, publicOrderToken, reused: false });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    const rateLimited = message.includes("RATE_LIMITED");
    const unavailable = message.includes("MISSING") || message.includes("NOT_CONFIGURED") || message.includes("STRIPE_TEST_MODE_REQUIRED");
    console.error(JSON.stringify({ event: "cjenik_hr_stripe_checkout_failed", reason: rateLimited ? "rate_limited" : unavailable ? "provider_not_configured" : "provider_error" }));
    return NextResponse.json({
      ok: false,
      error: rateLimited ? "Previše pokušaja. Pričekajte i pokušajte ponovno." : "Testno kartično plaćanje trenutačno nije dostupno. Pokušajte ponovno kasnije.",
    }, { status: rateLimited ? 429 : 503 });
  }
}
