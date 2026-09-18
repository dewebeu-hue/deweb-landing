import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { cjenikHrProduct, readCjenikHrPackage } from "./cjenik-hr-product.ts";
import { cjenikHrCommercialGates, getCjenikHrCommercialReadiness } from "./cjenik-hr-commercial.ts";
import { canTransitionCjenikHrOrder, isValidCroatianOib, matchCjenikHrPayment, priceCentsForCjenikHrPackage, validateCjenikHrOrder } from "./cjenik-hr-order.ts";
import {
  buildCjenikHrEmailPayload,
  cjenikHrRequestSubject,
  cjenikHrThankYouPackage,
  isCjenikHrHoneypotSubmission,
  prepareCjenikHrRequest,
  validateCjenikHrRequest,
  type CjenikHrRequestData,
} from "./cjenik-hr-request.ts";

const validRequest: CjenikHrRequestData = {
  requestType: "plugin",
  fullName: "Ana Horvat",
  companyName: "Primjer d.o.o.",
  email: "ana@example.hr",
  domain: "https://example.hr",
  wordpressStatus: "yes",
  woocommerceStatus: "no",
  currentSystem: "wordpress",
  note: "Želimo provjeru.",
  website: "",
};

test("product config keeps approved release candidate state, artifact and prices", () => {
  assert.equal(cjenikHrProduct.status, "release_candidate_ready");
  assert.equal(cjenikHrProduct.salesMode, "quote");
  assert.equal(cjenikHrProduct.billingMode, "sandbox");
  assert.equal(cjenikHrProduct.pluginPrice, 39);
  assert.equal(cjenikHrProduct.setupPrice, 79);
  assert.equal(cjenikHrProduct.pluginVersion, "1.0.0");
  assert.equal(cjenikHrProduct.schemaVersion, 7);
  assert.equal(cjenikHrProduct.checkpoint, "194783813ee3ae647939ddf5d093b9baffdcec15");
  assert.equal(cjenikHrProduct.artifactSha256, "8ae3b6ad3834a5bb2bb5c7defb3c63477f5788936e66bdfd1d735a9a267a0898");
});

test("production billing stays fail-closed even if credentials exist", () => {
  assert.deepEqual(cjenikHrCommercialGates, {
    commercialTermsConfirmed: false,
    billingPolicyConfirmed: false,
    stripeProductionEnabled: false,
    eposlovanjeProductionEnabled: false,
    aisProductionEnabled: false,
    deliveryEnabled: false,
  });
  const readiness = getCjenikHrCommercialReadiness({
    CJENIK_HR_SELLER_NAME: "Test", CJENIK_HR_SELLER_OIB: "50930104221", CJENIK_HR_SELLER_ADDRESS: "Test",
    CJENIK_HR_PAYMENT_IBAN: "TEST", EPOSLOVANJE_API_KEY: "test", EPOSLOVANJE_COMPANY_OIB: "50930104221",
    EPOSLOVANJE_AIS_IBAN: "TEST", CJENIK_HR_ARTIFACT_STORAGE_ID: "test",
  });
  assert.equal(readiness.productionBillingReady, false);
  assert.equal(readiness.productionAisReady, false);
  assert.equal(readiness.deliveryReady, false);
});

test("standard orders validate Croatian buyer data and keep prices server-authoritative", () => {
  assert.equal(isValidCroatianOib("50930104221"), true);
  assert.equal(isValidCroatianOib("50930104220"), false);
  const order = validateCjenikHrOrder({
    requestId: "12345678901234567890", requestType: "plugin", customerType: "business", fullName: "Ana Horvat",
    companyName: "Primjer d.o.o.", companyOib: "50930104221", billingAddress: "Ulica 1", postalCode: "10000",
    city: "Zagreb", country: "HR", email: "ana@example.hr", wordpressStatus: "yes", woocommerceStatus: "no",
    currentSystem: "wordpress",
  });
  assert.equal(order.valid, true);
  assert.equal(priceCentsForCjenikHrPackage("plugin"), 3900);
  assert.equal(priceCentsForCjenikHrPackage("setup"), 7900);
  assert.equal(validateCjenikHrOrder({ ...order.value, country: "SI" }).valid, false);
});

test("state machine blocks skipped billing states", () => {
  assert.equal(canTransitionCjenikHrOrder("quote_pending", "quote_created"), true);
  assert.equal(canTransitionCjenikHrOrder("awaiting_payment", "invoice_fiscalized"), false);
  assert.equal(canTransitionCjenikHrOrder("payment_verified", "invoice_review_required"), true);
  assert.equal(canTransitionCjenikHrOrder("invoice_sent", "setup_pending"), true);
});

test("AIS matching requires incoming EUR, exact amount and exact unique reference", () => {
  const orders = [{ orderId: "order-1", amountCents: 3900, currency: "EUR" as const, paymentReference: "CHR-2026-000001", expiresAt: 2_000 }];
  const matched = matchCjenikHrPayment({ providerTransactionId: "tx-1", type: 0, amountCents: 3900, currency: "EUR", structuredReference: "CHR-2026-000001" }, orders, 1_000);
  assert.deepEqual(matched, { kind: "match", orderId: "order-1" });
  assert.deepEqual(matchCjenikHrPayment({ providerTransactionId: "tx-2", type: 0, amountCents: 3901, currency: "EUR", structuredReference: "CHR-2026-000001" }, orders, 1_000), { kind: "review", reason: "amount_mismatch" });
  assert.deepEqual(matchCjenikHrPayment({ providerTransactionId: "tx-3", type: 0, amountCents: 3900, currency: "EUR" }, orders, 1_000), { kind: "review", reason: "missing_reference" });
});

test("valid request passes and every select uses an allowlist", () => {
  assert.equal(validateCjenikHrRequest(validRequest).valid, true);
  const invalid = validateCjenikHrRequest({
    ...validRequest,
    requestType: "premium" as CjenikHrRequestData["requestType"],
    wordpressStatus: "maybe" as CjenikHrRequestData["wordpressStatus"],
    woocommerceStatus: "maybe" as CjenikHrRequestData["woocommerceStatus"],
    currentSystem: "unknown-crm" as CjenikHrRequestData["currentSystem"],
  });
  assert.deepEqual(invalid.errors.sort(), ["currentSystem", "requestType", "woocommerceStatus", "wordpressStatus"]);
});

test("setup requires a domain", () => {
  const result = validateCjenikHrRequest({ ...validRequest, requestType: "setup", domain: "" });
  assert.equal(result.valid, false);
  assert.ok(result.errors.includes("domain"));
});

test("plugin and setup are rejected when WordPress is absent", () => {
  for (const requestType of ["plugin", "setup"] as const) {
    const result = validateCjenikHrRequest({ ...validRequest, requestType, wordpressStatus: "no" });
    assert.equal(result.valid, false);
    assert.ok(result.errors.includes("requestType"));
  }
  assert.equal(validateCjenikHrRequest({ ...validRequest, requestType: "other_system", wordpressStatus: "no" }).valid, true);
});

test("honeypot accepts empty and detects filled submissions", () => {
  assert.equal(isCjenikHrHoneypotSubmission(validRequest), false);
  assert.equal(isCjenikHrHoneypotSubmission({ ...validRequest, website: "spam.example" }), true);
});

test("email payload is plain text, strips control characters and keeps approved subjects", () => {
  const payload = buildCjenikHrEmailPayload(
    { ...validRequest, fullName: "Ana\u0000 Horvat", note: "<script>alert(1)</script>" },
    { apiKey: "secret", fromEmail: "Deweb <noreply@deweb.hr>", toEmail: "deweb@example.hr" },
  );
  assert.equal(cjenikHrRequestSubject("plugin"), "[Cjenik HR] Plugin 39 €");
  assert.equal(cjenikHrRequestSubject("setup"), "[Cjenik HR] Postavljanje 79 €");
  assert.equal(cjenikHrRequestSubject("other_system"), "[Cjenik HR] Drugi sustav");
  assert.equal("html" in payload, false);
  assert.equal(payload.text.includes("\u0000"), false);
  assert.match(payload.text, /<script>alert\(1\)<\/script>/);
  assert.equal(prepareCjenikHrRequest(validRequest).website, "");
});

test("thank-you package values are allowlisted and never expose arbitrary input", () => {
  assert.equal(cjenikHrThankYouPackage("plugin"), "plugin");
  assert.equal(cjenikHrThankYouPackage("setup"), "setup");
  assert.equal(cjenikHrThankYouPackage("other_system"), "other");
  assert.equal(readCjenikHrPackage("javascript:alert(1)"), "other");
  assert.equal(readCjenikHrPackage(["plugin"]), "other");
});

test("landing SEO has exact title, canonical, one H1 and a 150–160 character description", async () => {
  const source = await readFile(new URL("../app/cjenik-hr/page.tsx", import.meta.url), "utf8");
  assert.match(source, /Cjenik HR za WordPress \| Sidrena cijena i CSV cjenik \| deweb/);
  assert.match(source, /alternates: \{ canonical: `\$\{SITE_ORIGIN\}\/cjenik-hr` \}/);
  assert.equal((source.match(/<h1\b/g) ?? []).length, 1);
  const description = source.match(/const description = "([^"]+)";/)?.[1] ?? "";
  assert.ok(description.length >= 150 && description.length <= 160, `description length was ${description.length}`);
  assert.doesNotMatch(source, /availability|aggregateRating|reviewCount/);
});

test("thank-you route is noindex and sitemap excludes it", async () => {
  const [thankYou, sitemap] = await Promise.all([
    readFile(new URL("../app/cjenik-hr/hvala/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/sitemap.ts", import.meta.url), "utf8"),
  ]);
  assert.match(thankYou, /robots: \{ index: false, follow: false \}/);
  assert.match(sitemap, /SITE_ORIGIN\}\/cjenik-hr/);
  assert.doesNotMatch(sitemap, /cjenik-hr\/hvala/);
});
