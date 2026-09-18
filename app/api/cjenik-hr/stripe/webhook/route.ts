import { createHash } from "node:crypto";
import { ConvexHttpClient } from "convex/browser";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { api } from "../../../../../convex/_generated/api";
import { getCjenikHrOrderEngineConfig } from "../../../../../lib/cjenik-hr-order-bridge";
import { stripeObjectId, verifyStripeWebhookSignature } from "../../../../../lib/cjenik-hr-stripe";

export const runtime = "nodejs";

function eventObjectId(object: Stripe.Event.Data.Object) {
  return "id" in object && typeof object.id === "string" ? object.id : "unknown";
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  const rawBody = await request.text();
  let event: Stripe.Event;
  try {
    event = verifyStripeWebhookSignature(rawBody, signature);
  } catch {
    return NextResponse.json({ error: "Invalid Stripe signature." }, { status: 400 });
  }

  try {
    const config = getCjenikHrOrderEngineConfig();
    const client = new ConvexHttpClient(config.convexUrl);
    const object = event.data.object;
    const canonical = {
      bridgeSecret: config.bridgeSecret,
      providerEventId: event.id,
      eventType: event.type,
      livemode: event.livemode,
      objectId: eventObjectId(object),
      createdAt: event.created * 1000,
      payloadDigest: createHash("sha256").update(rawBody).digest("hex"),
    };
    if (event.type === "checkout.session.completed") {
      const session = object as Stripe.Checkout.Session;
      await client.mutation(api.stripePayments.ingestStripeWebhookEvent, {
        ...canonical,
        providerSessionId: session.id,
        providerPaymentId: stripeObjectId(session.payment_intent),
        amountCents: session.amount_total ?? undefined,
        currency: session.currency ?? undefined,
        paymentStatus: session.payment_status,
        clientReferenceId: session.client_reference_id ?? undefined,
        metadataOrderRef: session.metadata?.orderRef,
        metadataOrderNumber: session.metadata?.orderNumber,
        metadataPackage: session.metadata?.package,
        paymentMethodType: session.payment_method_types?.[0],
      });
    } else if (event.type === "charge.refunded" || event.type === "charge.dispute.created") {
      const providerPaymentId = event.type === "charge.refunded"
        ? stripeObjectId((object as Stripe.Charge).payment_intent)
        : undefined;
      await client.mutation(api.stripePayments.ingestStripeWebhookEvent, {
        ...canonical,
        ...(providerPaymentId ? { providerPaymentId } : {}),
      });
    } else {
      await client.mutation(api.stripePayments.ingestStripeWebhookEvent, canonical);
    }
    return NextResponse.json({ received: true });
  } catch {
    console.error(JSON.stringify({ event: "cjenik_hr_stripe_webhook_handoff_failed" }));
    return NextResponse.json({ error: "Webhook handoff failed." }, { status: 503 });
  }
}
