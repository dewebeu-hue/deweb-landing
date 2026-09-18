import { ConvexHttpClient } from "convex/browser";
import { NextResponse } from "next/server";
import { api } from "../../../../../convex/_generated/api";
import { getCjenikHrOrderEngineConfig, sha256 } from "../../../../../lib/cjenik-hr-order-bridge";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  if (!/^[A-Za-z0-9_-]{40,96}$/.test(token)) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }
  try {
    const config = getCjenikHrOrderEngineConfig();
    const client = new ConvexHttpClient(config.convexUrl);
    const order = await client.query(api.orders.getPublicStatus, {
      bridgeSecret: config.bridgeSecret, publicTokenHash: sha256(token),
    });
    if (!order) return NextResponse.json({ ok: false }, { status: 404 });
    return NextResponse.json({ ok: true, order }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
