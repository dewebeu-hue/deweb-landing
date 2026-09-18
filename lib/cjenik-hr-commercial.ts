import { cjenikHrProduct } from "./cjenik-hr-product.ts";

export const cjenikHrCommercialGates = {
  commercialTermsConfirmed: false,
  billingPolicyConfirmed: false,
  stripeProductionEnabled: false,
  eposlovanjeProductionEnabled: false,
  aisProductionEnabled: false,
  deliveryEnabled: false,
} as const;

export const cjenikHrSellerTaxText =
  "Porezni tretman i sadržaj računa potvrđuju se prije produkcijskog izdavanja.";

export const cjenikHrSandboxDocumentLabel = "TEST / NIJE ZA PLAĆANJE";

export type CjenikHrRuntimeEnvironment = Record<string, string | undefined>;

export function getCjenikHrCommercialReadiness(env: CjenikHrRuntimeEnvironment = process.env) {
  const configured = {
    sellerIdentity: Boolean(env.CJENIK_HR_SELLER_NAME && env.CJENIK_HR_SELLER_OIB && env.CJENIK_HR_SELLER_ADDRESS),
    paymentAccount: Boolean(env.CJENIK_HR_PAYMENT_IBAN),
    eposlovanje: Boolean(env.EPOSLOVANJE_API_KEY && env.EPOSLOVANJE_COMPANY_OIB),
    aisAccount: Boolean(env.EPOSLOVANJE_AIS_IBAN),
    artifact: Boolean(env.CJENIK_HR_ARTIFACT_STORAGE_ID),
    stripeTest: env.STRIPE_MODE === "test" && Boolean(env.STRIPE_SECRET_KEY && env.STRIPE_WEBHOOK_SECRET),
  };

  const productionBillingReady =
    (cjenikHrProduct.billingMode as string) === "production" &&
    cjenikHrCommercialGates.commercialTermsConfirmed &&
    cjenikHrCommercialGates.billingPolicyConfirmed &&
    cjenikHrCommercialGates.eposlovanjeProductionEnabled &&
    configured.sellerIdentity &&
    configured.paymentAccount &&
    configured.eposlovanje;

  const productionAisReady =
    productionBillingReady && cjenikHrCommercialGates.aisProductionEnabled && configured.aisAccount;

  const deliveryReady =
    productionBillingReady && cjenikHrCommercialGates.deliveryEnabled && configured.artifact;

  const blockers = [
    !cjenikHrCommercialGates.commercialTermsConfirmed && "commercial_terms",
    !cjenikHrCommercialGates.billingPolicyConfirmed && "billing_policy",
    !cjenikHrCommercialGates.eposlovanjeProductionEnabled && "eposlovanje_production",
    !cjenikHrCommercialGates.aisProductionEnabled && "ais_production",
    !cjenikHrCommercialGates.deliveryEnabled && "delivery",
    !configured.sellerIdentity && "seller_identity",
    !configured.paymentAccount && "payment_account",
    !configured.eposlovanje && "eposlovanje_credentials",
    !configured.aisAccount && "ais_account",
    !configured.artifact && "private_artifact",
  ].filter((value): value is string => typeof value === "string");

  return { configured, productionBillingReady, productionAisReady, deliveryReady, blockers };
}
