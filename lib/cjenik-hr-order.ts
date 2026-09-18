import { cjenikHrProduct } from "./cjenik-hr-product.ts";
import {
  cjenikHrCurrentSystems,
  cjenikHrWooStatuses,
  cjenikHrWordpressStatuses,
  normalizeCjenikHrValue,
  type CjenikHrCurrentSystem,
  type CjenikHrWooStatus,
  type CjenikHrWordpressStatus,
} from "./cjenik-hr-request.ts";
export {
  canTransitionCjenikHrOrder,
  cjenikHrOrderStatuses,
  type CjenikHrOrderStatus,
} from "./cjenik-hr-state-machine.ts";

export const cjenikHrCustomerTypes = ["business", "consumer"] as const;
export const cjenikHrOrderPackages = ["plugin", "setup"] as const;

export type CjenikHrCustomerType = (typeof cjenikHrCustomerTypes)[number];
export type CjenikHrOrderPackage = (typeof cjenikHrOrderPackages)[number];

export type CjenikHrOrderInput = {
  requestId: string;
  requestType: CjenikHrOrderPackage;
  customerType: CjenikHrCustomerType;
  fullName: string;
  companyName?: string;
  companyOib?: string;
  billingAddress: string;
  postalCode: string;
  city: string;
  country: string;
  email: string;
  domain?: string;
  wordpressStatus: CjenikHrWordpressStatus;
  woocommerceStatus: CjenikHrWooStatus;
  currentSystem: CjenikHrCurrentSystem;
  note?: string;
  website?: string;
};

export type CjenikHrOrderField = keyof CjenikHrOrderInput;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const requestIdPattern = /^[a-zA-Z0-9_-]{20,100}$/;
const postalCodePattern = /^\d{5}$/;
const domainPattern = /^(?:https?:\/\/)?(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}(?:\/[^\s]*)?$/i;

function normalizeSingleLine(value: unknown, maxLength: number) {
  return normalizeCjenikHrValue(value, maxLength).replace(/\s+/g, " ");
}

export function isValidCroatianOib(value: string) {
  if (!/^\d{11}$/.test(value)) return false;
  let remainder = 10;
  for (let index = 0; index < 10; index += 1) {
    remainder = (remainder + Number(value[index])) % 10;
    if (remainder === 0) remainder = 10;
    remainder = (remainder * 2) % 11;
  }
  const control = 11 - remainder;
  return Number(value[10]) === (control === 10 ? 0 : control);
}

export function priceCentsForCjenikHrPackage(packageType: CjenikHrOrderPackage) {
  return packageType === "setup" ? cjenikHrProduct.setupPriceCents : cjenikHrProduct.pluginPriceCents;
}

export function normalizeCjenikHrOrderInput(data: Partial<CjenikHrOrderInput>): CjenikHrOrderInput {
  return {
    requestId: normalizeCjenikHrValue(data.requestId, 100),
    requestType: normalizeCjenikHrValue(data.requestType, 20) as CjenikHrOrderPackage,
    customerType: normalizeCjenikHrValue(data.customerType, 20) as CjenikHrCustomerType,
    fullName: normalizeSingleLine(data.fullName, 160),
    companyName: normalizeSingleLine(data.companyName, 200),
    companyOib: normalizeCjenikHrValue(data.companyOib, 11),
    billingAddress: normalizeSingleLine(data.billingAddress, 240),
    postalCode: normalizeCjenikHrValue(data.postalCode, 5),
    city: normalizeSingleLine(data.city, 120),
    country: normalizeCjenikHrValue(data.country, 2).toUpperCase(),
    email: normalizeCjenikHrValue(data.email, 254).toLowerCase(),
    domain: normalizeCjenikHrValue(data.domain, 500),
    wordpressStatus: normalizeCjenikHrValue(data.wordpressStatus, 40) as CjenikHrWordpressStatus,
    woocommerceStatus: normalizeCjenikHrValue(data.woocommerceStatus, 40) as CjenikHrWooStatus,
    currentSystem: normalizeCjenikHrValue(data.currentSystem, 40) as CjenikHrCurrentSystem,
    note: normalizeCjenikHrValue(data.note, 4000),
    website: normalizeCjenikHrValue(data.website, 200),
  };
}

export function validateCjenikHrOrder(data: Partial<CjenikHrOrderInput>) {
  const value = normalizeCjenikHrOrderInput(data);
  const errors: CjenikHrOrderField[] = [];
  if (!requestIdPattern.test(value.requestId)) errors.push("requestId");
  if (!cjenikHrOrderPackages.includes(value.requestType)) errors.push("requestType");
  if (!cjenikHrCustomerTypes.includes(value.customerType)) errors.push("customerType");
  if (!value.fullName) errors.push("fullName");
  if (!value.email || !emailPattern.test(value.email)) errors.push("email");
  if (!value.billingAddress) errors.push("billingAddress");
  if (!postalCodePattern.test(value.postalCode)) errors.push("postalCode");
  if (!value.city) errors.push("city");
  if (value.country !== "HR") errors.push("country");
  if (value.customerType === "business") {
    if (!value.companyName) errors.push("companyName");
    if (!value.companyOib || !isValidCroatianOib(value.companyOib)) errors.push("companyOib");
  }
  if (value.domain && !domainPattern.test(value.domain)) errors.push("domain");
  if (!cjenikHrWordpressStatuses.includes(value.wordpressStatus)) errors.push("wordpressStatus");
  if (!cjenikHrWooStatuses.includes(value.woocommerceStatus)) errors.push("woocommerceStatus");
  if (!cjenikHrCurrentSystems.includes(value.currentSystem)) errors.push("currentSystem");
  if (value.wordpressStatus === "no") errors.push("requestType");
  if (value.requestType === "setup" && !value.domain) errors.push("domain");
  return { valid: errors.length === 0, errors: [...new Set(errors)], value };
}

export type CanonicalBankTransaction = {
  providerTransactionId: string;
  bankTransactionId?: string;
  type: number;
  amountCents: number;
  currency: string;
  structuredReference?: string;
  unstructuredReference?: string;
  bookedAt?: string;
};

export type PayableOrder = {
  orderId: string;
  amountCents: number;
  currency: "EUR";
  paymentReference: string;
  expiresAt: number;
};

export type PaymentMatchResult =
  | { kind: "match"; orderId: string }
  | { kind: "review"; reason: "wrong_currency" | "outgoing" | "missing_reference" | "unknown_reference" | "amount_mismatch" | "ambiguous" | "expired" };

export function matchCjenikHrPayment(transaction: CanonicalBankTransaction, orders: readonly PayableOrder[], now: number): PaymentMatchResult {
  if (transaction.currency !== "EUR") return { kind: "review", reason: "wrong_currency" };
  if (transaction.type !== 0 || transaction.amountCents <= 0) return { kind: "review", reason: "outgoing" };
  const reference = (transaction.structuredReference || transaction.unstructuredReference || "").replace(/\s+/g, "").toUpperCase();
  if (!reference) return { kind: "review", reason: "missing_reference" };
  const referenced = orders.filter(order => order.paymentReference.replace(/\s+/g, "").toUpperCase() === reference);
  if (referenced.length === 0) return { kind: "review", reason: "unknown_reference" };
  if (referenced.length > 1) return { kind: "review", reason: "ambiguous" };
  const order = referenced[0];
  if (order.amountCents !== transaction.amountCents) return { kind: "review", reason: "amount_mismatch" };
  if (order.expiresAt < now) return { kind: "review", reason: "expired" };
  return { kind: "match", orderId: order.orderId };
}
