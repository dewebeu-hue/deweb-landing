import { createHash, createHmac } from "node:crypto";

export function getCjenikHrOrderEngineConfig(env: Record<string, string | undefined> = process.env) {
  const convexUrl = env.CONVEX_URL ?? env.NEXT_PUBLIC_CONVEX_URL;
  const bridgeSecret = env.CJENIK_HR_ORDER_ENGINE_BRIDGE_SECRET;
  const fingerprintSecret = env.CJENIK_HR_FINGERPRINT_SECRET;
  const publicTokenSecret = env.CJENIK_HR_PUBLIC_TOKEN_SECRET;
  if (!convexUrl || !bridgeSecret || !fingerprintSecret || !publicTokenSecret) {
    throw new Error("ORDER_ENGINE_NOT_CONFIGURED");
  }
  return { convexUrl, bridgeSecret, fingerprintSecret, publicTokenSecret };
}

export function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function createPublicOrderIdentity(requestId: string, secret: string) {
  return {
    publicOrderToken: createHmac("sha256", secret).update(requestId).digest("base64url"),
    providerSafeId: createHmac("sha256", secret).update(`stripe:${requestId}`).digest("base64url"),
  };
}

export function cjenikHrRequestFingerprint(request: Request, secret: string) {
  const forwarded = request.headers.get("x-vercel-forwarded-for") ?? request.headers.get("x-forwarded-for") ?? "unknown";
  const ip = forwarded.split(",")[0]?.trim() || "unknown";
  const userAgent = request.headers.get("user-agent") ?? "unknown";
  return sha256(`${secret}\n${ip}\n${userAgent}`);
}
