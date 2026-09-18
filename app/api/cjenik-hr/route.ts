import { createHash, createHmac } from "node:crypto";
import { ConvexHttpClient } from "convex/browser";
import { NextResponse } from "next/server";
import { api } from "../../../convex/_generated/api";
import { normalizeCjenikHrOrderInput, priceCentsForCjenikHrPackage, validateCjenikHrOrder, type CjenikHrOrderInput } from "../../../lib/cjenik-hr-order";
import { isCjenikHrHoneypotSubmission, prepareCjenikHrRequest, sendCjenikHrEmail, validateCjenikHrRequest, type CjenikHrEmailConfig, type CjenikHrRequestData } from "../../../lib/cjenik-hr-request";

export const runtime = "nodejs";
const MAX_BODY_BYTES = 32_000;

function getEmailConfig(): CjenikHrEmailConfig {
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL;
  const fromEmail = process.env.CONTACT_FROM_EMAIL;
  if (!apiKey || !toEmail || !fromEmail) throw new Error("Missing contact email environment variables.");
  return { apiKey, toEmail, fromEmail };
}

function getOrderEngineConfig() {
  const convexUrl = process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL;
  const bridgeSecret = process.env.CJENIK_HR_ORDER_ENGINE_BRIDGE_SECRET;
  const fingerprintSecret = process.env.CJENIK_HR_FINGERPRINT_SECRET;
  const publicTokenSecret = process.env.CJENIK_HR_PUBLIC_TOKEN_SECRET;
  if (!convexUrl || !bridgeSecret || !fingerprintSecret || !publicTokenSecret) throw new Error("Order engine is not configured.");
  return { convexUrl, bridgeSecret, fingerprintSecret, publicTokenSecret };
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function requestFingerprint(request: Request, secret: string) {
  const forwarded = request.headers.get("x-vercel-forwarded-for") ?? request.headers.get("x-forwarded-for") ?? "unknown";
  const ip = forwarded.split(",")[0]?.trim() || "unknown";
  const userAgent = request.headers.get("user-agent") ?? "unknown";
  return sha256(`${secret}\n${ip}\n${userAgent}`);
}

async function readJsonBody(request: Request) {
  const declaredSize = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declaredSize) && declaredSize > MAX_BODY_BYTES) throw new Error("BODY_TOO_LARGE");
  const text = await request.text();
  if (Buffer.byteLength(text, "utf8") > MAX_BODY_BYTES) throw new Error("BODY_TOO_LARGE");
  const data: unknown = JSON.parse(text);
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("INVALID_BODY");
  return data as Record<string, unknown>;
}

export async function POST(request: Request) {
  let data: Record<string, unknown>;
  try {
    data = await readJsonBody(request);
  } catch (error) {
    const tooLarge = error instanceof Error && error.message === "BODY_TOO_LARGE";
    return NextResponse.json({ ok: false, error: tooLarge ? "Zahtjev je prevelik." : "Neispravan zahtjev." }, { status: tooLarge ? 413 : 400 });
  }

  if (isCjenikHrHoneypotSubmission(data as Partial<CjenikHrRequestData>)) return NextResponse.json({ ok: true, accepted: false });

  if (data.requestType === "other_system") {
    const lead = data as Partial<CjenikHrRequestData>;
    const validation = validateCjenikHrRequest(lead);
    if (!validation.valid) return NextResponse.json({ ok: false, error: "Provjerite označena polja i pokušajte ponovno.", fields: validation.errors }, { status: 400 });
    const requestId = typeof data.requestId === "string" ? data.requestId : "";
    if (!/^[A-Za-z0-9_-]{20,100}$/.test(requestId) || request.headers.get("idempotency-key") !== requestId) {
      return NextResponse.json({ ok: false, error: "Nedostaje valjan identifikator zahtjeva.", fields: ["requestId"] }, { status: 400 });
    }
    try {
      await sendCjenikHrEmail(prepareCjenikHrRequest(lead), getEmailConfig(), fetch, `cjenik-hr-lead:${requestId}`);
      return NextResponse.json({ ok: true, accepted: false });
    } catch {
      console.error(JSON.stringify({ event: "cjenik_hr_manual_lead_failed", reason: "provider_error" }));
      return NextResponse.json({ ok: false, error: "Upit trenutačno nije moguće poslati. Pokušajte ponovno za nekoliko trenutaka." }, { status: 502 });
    }
  }

  const validation = validateCjenikHrOrder(data as Partial<CjenikHrOrderInput>);
  if (!validation.valid) {
    return NextResponse.json({ ok: false, error: "Provjerite označena polja i pokušajte ponovno.", fields: validation.errors }, { status: 400 });
  }
  const idempotencyHeader = request.headers.get("idempotency-key");
  if (!idempotencyHeader || idempotencyHeader !== validation.value.requestId) {
    return NextResponse.json({ ok: false, error: "Nedostaje valjan identifikator zahtjeva.", fields: ["requestId"] }, { status: 400 });
  }

  try {
    const config = getOrderEngineConfig();
    const value = normalizeCjenikHrOrderInput(validation.value);
    const publicToken = createHmac("sha256", config.publicTokenSecret).update(value.requestId).digest("base64url");
    const client = new ConvexHttpClient(config.convexUrl);
    const result = await client.mutation(api.orders.submitOrder, {
      bridgeSecret: config.bridgeSecret,
      requestId: value.requestId,
      publicTokenHash: sha256(publicToken),
      fingerprintHash: requestFingerprint(request, config.fingerprintSecret),
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
    });
    console.info(JSON.stringify({ event: "cjenik_hr_order_accepted", orderNumber: result.orderNumber, deduplicated: result.deduplicated }));
    return NextResponse.json({ ok: true, accepted: true, status: result.status, publicOrderToken: publicToken });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    const rateLimited = message.includes("RATE_LIMITED");
    console.error(JSON.stringify({ event: "cjenik_hr_order_failed", reason: rateLimited ? "rate_limited" : "order_engine_unavailable" }));
    return NextResponse.json(
      { ok: false, error: rateLimited ? "Previše pokušaja. Pričekajte i pokušajte ponovno." : "Ponudu trenutačno nije moguće pripremiti. Pokušajte ponovno za nekoliko trenutaka." },
      { status: rateLimited ? 429 : 503 },
    );
  }
}
