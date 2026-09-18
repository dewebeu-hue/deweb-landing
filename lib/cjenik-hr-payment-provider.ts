import type Stripe from "stripe";
import type { CjenikHrOrderPackage } from "./cjenik-hr-order.ts";
import { priceCentsForCjenikHrPackage } from "./cjenik-hr-order.ts";

export const cjenikHrPaymentProviders = ["stripe", "bank_transfer_ais", "mock"] as const;
export type CjenikHrPaymentProviderType = (typeof cjenikHrPaymentProviders)[number];

export type CheckoutOrder = {
  orderNumber: string;
  providerSafeId: string;
  publicOrderToken: string;
  packageType: CjenikHrOrderPackage;
  amountCents: number;
  currency: "EUR";
  customerEmail: string;
};

export type CheckoutAttempt = {
  idempotencyKey: string;
};

export type CheckoutSessionResult = {
  providerSessionId: string;
  checkoutUrl: string;
  expiresAt: number;
};

export interface PaymentProvider {
  readonly type: CjenikHrPaymentProviderType;
  createCheckoutSession(order: CheckoutOrder, attempt: CheckoutAttempt): Promise<CheckoutSessionResult>;
}

export function buildStripeCheckoutParams(order: CheckoutOrder, origin: string): Stripe.Checkout.SessionCreateParams {
  if (order.packageType !== "plugin" && order.packageType !== "setup") {
    throw new Error("ORDER_PRICE_INVARIANT_FAILED");
  }
  const authoritativeAmount = priceCentsForCjenikHrPackage(order.packageType);
  if (order.amountCents !== authoritativeAmount || order.currency !== "EUR") {
    throw new Error("ORDER_PRICE_INVARIANT_FAILED");
  }
  const statusUrl = `${origin}/cjenik-hr/narudzba/${encodeURIComponent(order.publicOrderToken)}`;
  return {
    mode: "payment",
    payment_method_types: ["card"],
    client_reference_id: order.providerSafeId,
    customer_email: order.customerEmail,
    line_items: [{
      quantity: 1,
      price_data: {
        currency: "eur",
        unit_amount: authoritativeAmount,
        product_data: {
          name: order.packageType === "setup" ? "Cjenik HR + postavljanje" : "Cjenik HR",
        },
      },
    }],
    metadata: {
      orderRef: order.providerSafeId,
      orderNumber: order.orderNumber,
      package: order.packageType,
    },
    success_url: `${statusUrl}?stripe=success`,
    cancel_url: `${statusUrl}?stripe=cancelled`,
    locale: "hr",
    submit_type: "pay",
  };
}
