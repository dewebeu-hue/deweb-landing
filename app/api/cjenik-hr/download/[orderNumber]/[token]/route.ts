import { createHash } from "node:crypto";
import { ConvexHttpClient } from "convex/browser";
import { NextResponse } from "next/server";
import { api } from "../../../../../../convex/_generated/api";

export const runtime = "nodejs";

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export async function GET(_request: Request, context: { params: Promise<{ orderNumber: string; token: string }> }) {
  const { orderNumber, token } = await context.params;
  if (!/^CHR-\d{4}-\d{6}$/.test(orderNumber) || !/^[A-Za-z0-9_-]{40,100}$/.test(token)) {
    return NextResponse.json({ ok: false, error: "Poveznica za preuzimanje nije valjana." }, { status: 404 });
  }
  const convexUrl = process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL;
  const bridgeSecret = process.env.CJENIK_HR_ORDER_ENGINE_BRIDGE_SECRET;
  if (!convexUrl || !bridgeSecret) {
    return NextResponse.json({ ok: false, error: "Preuzimanje trenutačno nije dostupno." }, { status: 503 });
  }

  try {
    const client = new ConvexHttpClient(convexUrl);
    const delivery = await client.mutation(api.deliveries.consumeDelivery, {
      bridgeSecret,
      tokenHash: sha256(token),
      orderNumber,
    });
    const stored = await fetch(delivery.storageUrl, { cache: "no-store" });
    if (!stored.ok || !stored.body) throw new Error("PRIVATE_STORAGE_FETCH_FAILED");
    return new Response(stored.body, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${delivery.filename.replace(/[^a-zA-Z0-9._-]/g, "-")}"`,
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; sandbox",
        "X-Cjenik-HR-SHA256": delivery.sha256,
        "X-Cjenik-HR-Downloads-Remaining": String(delivery.remainingDownloads),
      },
    });
  } catch {
    console.error(JSON.stringify({ event: "cjenik_hr_delivery_failed", orderNumber, reason: "token_or_storage_unavailable" }));
    return NextResponse.json({ ok: false, error: "Poveznica je istekla, opozvana ili više nije dostupna." }, { status: 410 });
  }
}
