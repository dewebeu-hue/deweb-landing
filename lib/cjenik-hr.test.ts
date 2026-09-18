import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { cjenikHrProduct, readCjenikHrPackage } from "./cjenik-hr-product.ts";
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

test("product config keeps approved prelaunch state, version and prices", () => {
  assert.equal(cjenikHrProduct.status, "prelaunch");
  assert.equal(cjenikHrProduct.pluginPrice, 39);
  assert.equal(cjenikHrProduct.setupPrice, 79);
  assert.equal(cjenikHrProduct.pluginVersion, "0.6.0");
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
