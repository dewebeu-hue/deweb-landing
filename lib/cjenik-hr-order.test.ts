import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { cjenikHrOrderStatuses, matchCjenikHrPayment, validateCjenikHrOrder, type CanonicalBankTransaction, type PayableOrder } from "./cjenik-hr-order.ts";

const businessOrder = {
  requestId: "req_12345678901234567890",
  requestType: "plugin" as const,
  customerType: "business" as const,
  fullName: "Ana Horvat",
  companyName: "Test d.o.o.",
  companyOib: "50930104221",
  billingAddress: "Ulica 1",
  postalCode: "10000",
  city: "Zagreb",
  country: "HR",
  email: "ana@example.hr",
  wordpressStatus: "yes" as const,
  woocommerceStatus: "no" as const,
  currentSystem: "wordpress" as const,
};

test("business and consumer validation require only their own billing identity", () => {
  assert.equal(validateCjenikHrOrder(businessOrder).valid, true);
  const consumer = validateCjenikHrOrder({ ...businessOrder, customerType: "consumer", companyName: "", companyOib: "", fullName: "Iva Ivić" });
  assert.equal(consumer.valid, true);
  const businessWithoutIdentity = validateCjenikHrOrder({ ...businessOrder, companyName: "", companyOib: "" });
  assert.deepEqual(businessWithoutIdentity.errors.filter(field => field === "companyName" || field === "companyOib").sort(), ["companyName", "companyOib"]);
});

test("setup requires a domain and every standard order requires Croatia", () => {
  assert.ok(validateCjenikHrOrder({ ...businessOrder, requestType: "setup", domain: "" }).errors.includes("domain"));
  assert.ok(validateCjenikHrOrder({ ...businessOrder, country: "DE" }).errors.includes("country"));
  assert.ok(validateCjenikHrOrder({ ...businessOrder, postalCode: "1000" }).errors.includes("postalCode"));
});

test("state vocabulary includes review, failure, refund and setup outcomes", () => {
  for (const status of ["payment_review_required", "invoice_review_required", "invoice_failed", "refund_pending", "refunded", "setup_pending"] as const) {
    assert.ok(cjenikHrOrderStatuses.includes(status));
  }
});

const payable: PayableOrder = { orderId: "one", amountCents: 7900, currency: "EUR", paymentReference: "CHR-2026-000321", expiresAt: 10_000 };
const incoming: CanonicalBankTransaction = { providerTransactionId: "provider-1", type: 0, amountCents: 7900, currency: "EUR", structuredReference: "CHR-2026-000321" };

test("payment matching normalizes whitespace and case but never matches amount alone", () => {
  assert.deepEqual(matchCjenikHrPayment({ ...incoming, structuredReference: " chr-2026-000321 " }, [payable], 1), { kind: "match", orderId: "one" });
  assert.deepEqual(matchCjenikHrPayment({ ...incoming, structuredReference: undefined, unstructuredReference: undefined }, [payable], 1), { kind: "review", reason: "missing_reference" });
  assert.deepEqual(matchCjenikHrPayment({ ...incoming, structuredReference: "UNKNOWN" }, [payable], 1), { kind: "review", reason: "unknown_reference" });
});

test("payment matching isolates outgoing, currency, expiry and ambiguity", () => {
  assert.deepEqual(matchCjenikHrPayment({ ...incoming, type: 1 }, [payable], 1), { kind: "review", reason: "outgoing" });
  assert.deepEqual(matchCjenikHrPayment({ ...incoming, currency: "USD" }, [payable], 1), { kind: "review", reason: "wrong_currency" });
  assert.deepEqual(matchCjenikHrPayment(incoming, [payable], 20_000), { kind: "review", reason: "expired" });
  assert.deepEqual(matchCjenikHrPayment(incoming, [payable, { ...payable, orderId: "two" }], 1), { kind: "review", reason: "ambiguous" });
});

test("public form is two-step and does not put payment data in the thank-you URL", async () => {
  const source = await readFile(new URL("../app/cjenik-hr/cjenik-hr-request-form.tsx", import.meta.url), "utf8");
  assert.match(source, /Korak \$\{step\} od 2/);
  assert.match(source, /Idempotency-Key/);
  assert.match(source, /Zatražite ponudu/);
  assert.doesNotMatch(source, /hvala\?[^`]*(iban|reference|poziv|oib|email)=/i);
});

test("API limits payload size, hashes identifiers and keeps structured logs free of buyer fields", async () => {
  const source = await readFile(new URL("../app/api/cjenik-hr/route.ts", import.meta.url), "utf8");
  assert.match(source, /MAX_BODY_BYTES = 32_000/);
  assert.match(source, /createHmac\("sha256", config\.publicTokenSecret\)/);
  assert.match(source, /sha256\(publicToken\)/);
  assert.match(source, /fingerprintHash/);
  assert.doesNotMatch(source, /console\.(info|error)\([^\n]*(companyOib|billingAddress|email: value\.email)/);
});
