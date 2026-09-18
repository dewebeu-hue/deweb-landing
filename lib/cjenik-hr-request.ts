import { cjenikHrProduct, formatCjenikHrPrice } from "./cjenik-hr-product.ts";

export const cjenikHrRequestTypes = ["plugin", "setup", "other_system"] as const;
export const cjenikHrWordpressStatuses = ["yes", "no", "unsure"] as const;
export const cjenikHrWooStatuses = ["yes", "no", "unsure"] as const;
export const cjenikHrCurrentSystems = [
  "wordpress",
  "woocommerce",
  "synesis",
  "pantheon",
  "minimax",
  "shopify",
  "prestashop",
  "custom",
  "other",
  "none",
  "unsure",
] as const;

export type CjenikHrRequestType = (typeof cjenikHrRequestTypes)[number];
export type CjenikHrWordpressStatus = (typeof cjenikHrWordpressStatuses)[number];
export type CjenikHrWooStatus = (typeof cjenikHrWooStatuses)[number];
export type CjenikHrCurrentSystem = (typeof cjenikHrCurrentSystems)[number];

export type CjenikHrRequestData = {
  requestType: CjenikHrRequestType | "";
  fullName: string;
  companyName?: string;
  email: string;
  domain?: string;
  wordpressStatus: CjenikHrWordpressStatus | "";
  woocommerceStatus: CjenikHrWooStatus | "";
  currentSystem: CjenikHrCurrentSystem | "";
  note?: string;
  website?: string;
};

export type CjenikHrPreparedRequest = Required<CjenikHrRequestData> & { submittedAt: string };
export type CjenikHrField = keyof CjenikHrRequestData;
export type CjenikHrEmailConfig = { apiKey: string; toEmail: string; fromEmail: string };
export type CjenikHrEmailPayload = { from: string; to: string[]; reply_to: string; subject: string; text: string };

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const domainPattern = /^(?:https?:\/\/)?(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}(?:\/[^\s]*)?$/i;
const unsafeEmailCharacters = /[\u0000-\u001f\u007f<>(),;:"\\]/;

export function normalizeCjenikHrValue(value: unknown, maxLength = 2000) {
  return typeof value === "string"
    ? value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim().slice(0, maxLength)
    : "";
}

export function isCjenikHrHoneypotSubmission(data: Partial<CjenikHrRequestData>) {
  return normalizeCjenikHrValue(data.website, 200).length > 0;
}

export function validateCjenikHrRequest(data: Partial<CjenikHrRequestData>) {
  const errors: CjenikHrField[] = [];
  const requestType = normalizeCjenikHrValue(data.requestType, 40);
  const fullName = normalizeCjenikHrValue(data.fullName, 160);
  const email = normalizeCjenikHrValue(data.email, 254);
  const domain = normalizeCjenikHrValue(data.domain, 500);
  const wordpressStatus = normalizeCjenikHrValue(data.wordpressStatus, 40);
  const woocommerceStatus = normalizeCjenikHrValue(data.woocommerceStatus, 40);
  const currentSystem = normalizeCjenikHrValue(data.currentSystem, 40);

  if (!cjenikHrRequestTypes.includes(requestType as CjenikHrRequestType)) errors.push("requestType");
  if (!fullName) errors.push("fullName");
  if (!email || email.length > 254 || !emailPattern.test(email) || unsafeEmailCharacters.test(email)) errors.push("email");
  if (!cjenikHrWordpressStatuses.includes(wordpressStatus as CjenikHrWordpressStatus)) errors.push("wordpressStatus");
  if (!cjenikHrWooStatuses.includes(woocommerceStatus as CjenikHrWooStatus)) errors.push("woocommerceStatus");
  if (!cjenikHrCurrentSystems.includes(currentSystem as CjenikHrCurrentSystem)) errors.push("currentSystem");
  if (domain && !domainPattern.test(domain)) errors.push("domain");
  if (requestType === "setup" && !domain) errors.push("domain");
  if (wordpressStatus === "no" && (requestType === "plugin" || requestType === "setup")) errors.push("requestType");

  return { valid: errors.length === 0, errors: [...new Set(errors)] };
}

export function prepareCjenikHrRequest(data: Partial<CjenikHrRequestData>): CjenikHrPreparedRequest {
  return {
    requestType: normalizeCjenikHrValue(data.requestType, 40) as CjenikHrRequestData["requestType"],
    fullName: normalizeCjenikHrValue(data.fullName, 160),
    companyName: normalizeCjenikHrValue(data.companyName, 200),
    email: normalizeCjenikHrValue(data.email, 254),
    domain: normalizeCjenikHrValue(data.domain, 500),
    wordpressStatus: normalizeCjenikHrValue(data.wordpressStatus, 40) as CjenikHrRequestData["wordpressStatus"],
    woocommerceStatus: normalizeCjenikHrValue(data.woocommerceStatus, 40) as CjenikHrRequestData["woocommerceStatus"],
    currentSystem: normalizeCjenikHrValue(data.currentSystem, 40) as CjenikHrRequestData["currentSystem"],
    note: normalizeCjenikHrValue(data.note, 4000),
    website: normalizeCjenikHrValue(data.website, 200),
    submittedAt: new Date().toISOString(),
  };
}

export function cjenikHrRequestSubject(type: CjenikHrRequestType | "") {
  if (type === "plugin") return `[Cjenik HR] Plugin ${formatCjenikHrPrice(cjenikHrProduct.pluginPrice)}`;
  if (type === "setup") return `[Cjenik HR] Postavljanje ${formatCjenikHrPrice(cjenikHrProduct.setupPrice)}`;
  return "[Cjenik HR] Drugi sustav";
}

const requestTypeLabels: Record<CjenikHrRequestType, string> = {
  plugin: `Plugin — ${formatCjenikHrPrice(cjenikHrProduct.pluginPrice)}`,
  setup: `Plugin i postavljanje — ${formatCjenikHrPrice(cjenikHrProduct.setupPrice)}`,
  other_system: "Rješenje za drugi sustav",
};

const yesNoUnsureLabels = { yes: "Da", no: "Ne", unsure: "Nisam siguran/na" } as const;

export function buildCjenikHrEmailPayload(data: CjenikHrRequestData, config: CjenikHrEmailConfig): CjenikHrEmailPayload {
  const submission = prepareCjenikHrRequest(data);
  return {
    from: config.fromEmail,
    to: [config.toEmail],
    reply_to: submission.email,
    subject: cjenikHrRequestSubject(submission.requestType),
    text: [
      "Novi upit za Cjenik HR",
      "",
      `Vrsta upita: ${requestTypeLabels[submission.requestType as CjenikHrRequestType] ?? "Drugi sustav"}`,
      `Ime i prezime: ${submission.fullName}`,
      submission.companyName && `Tvrtka ili obrt: ${submission.companyName}`,
      `Email: ${submission.email}`,
      submission.domain && `Domena: ${submission.domain}`,
      `WordPress: ${yesNoUnsureLabels[submission.wordpressStatus as CjenikHrWordpressStatus] ?? "Nije navedeno"}`,
      `WooCommerce: ${yesNoUnsureLabels[submission.woocommerceStatus as CjenikHrWooStatus] ?? "Nije navedeno"}`,
      `Trenutni sustav: ${submission.currentSystem}`,
      submission.note && `Napomena: ${submission.note}`,
      "",
      `Vrijeme slanja: ${submission.submittedAt}`,
    ].filter((line): line is string => typeof line === "string").join("\n"),
  };
}

export async function sendCjenikHrEmail(data: CjenikHrRequestData, config: CjenikHrEmailConfig, fetcher: typeof fetch = fetch, idempotencyKey?: string) {
  const response = await fetcher("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
    },
    body: JSON.stringify(buildCjenikHrEmailPayload(data, config)),
  });
  if (!response.ok) throw new Error(`Email provider failed (${response.status}).`);
  const result: unknown = await response.json().catch(() => null);
  return result && typeof result === "object" && "id" in result && typeof result.id === "string" ? result.id : null;
}

export function cjenikHrThankYouPackage(type: CjenikHrRequestType): "plugin" | "setup" | "other" {
  return type === "plugin" || type === "setup" ? type : "other";
}
