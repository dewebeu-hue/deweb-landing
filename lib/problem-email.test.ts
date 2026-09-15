import test from "node:test";
import assert from "node:assert/strict";
import {
  buildContactEmailPayload, isHoneypotSubmission, prepareProblemSubmission,
  sendContactEmail, successMessage, validateContactPayload, validateProblemForm,
  type ContactEmailConfig, type ProblemFormData,
} from "./problem-email.ts";

const valid: ProblemFormData = {
  projectType: "web", selectedPackage: "business", fullName: "Ana Horvat",
  companyName: "Servis Horvat", email: "ana@example.com", phone: "", currentWebsite: "",
  problem: "Trebamo jasno predstaviti usluge i omogućiti kupcima da nam se jave.", website: "",
};
const config: ContactEmailConfig = { apiKey: "re_test", toEmail: "owner@example.com", fromEmail: "deweb <kontakt@example.com>" };

test("client and server reject missing type, invalid email, short description, and inconsistent package", () => {
  const missing = validateProblemForm({ fullName: "Ana", email: "", problem: "" });
  assert.deepEqual(missing.missingFields, ["projectType", "email", "problem"]);
  assert.deepEqual(validateContactPayload({ ...valid, email: "bad", problem: "short" }).errors, ["email", "problem"]);
  assert.deepEqual(validateContactPayload({ ...valid, projectType: "tool", selectedPackage: "business" }).errors, ["selectedPackage"]);
  assert.deepEqual(validateContactPayload({ ...valid, selectedPackage: "made-up" }).errors, ["selectedPackage"]);
  for (const email of ["ana@example.com\r\nBcc: attacker@example.com", "Ana <ana@example.com>", "ana@example.com\u0000"]) {
    assert.deepEqual(validateContactPayload({ ...valid, email }).errors, ["email"]);
  }
});

test("optional fields and all project types are accepted", () => {
  for (const projectType of ["web", "tool", "saas", "unsure"] as const) {
    assert.equal(validateContactPayload({ ...valid, projectType, selectedPackage: "", companyName: "", phone: "" }).valid, true);
  }
});

test("honeypot suppresses email while existing website is legitimate", () => {
  assert.equal(isHoneypotSubmission({ ...valid, website: "https://spam.example" }), true);
  assert.equal(isHoneypotSubmission({ ...valid, currentWebsite: "https://example.com" }), false);
});

test("email handoff carries selected web package and business-tool answers", () => {
  const webEmail = buildContactEmailPayload(valid, config);
  assert.equal(webEmail.from, config.fromEmail);
  assert.deepEqual(webEmail.to, [config.toEmail]);
  assert.equal(webEmail.reply_to, valid.email);
  assert.equal(webEmail.subject, "Novi Deweb upit — Poslovni web 1.290 €");
  assert.equal(buildContactEmailPayload({ ...valid, selectedPackage: "simple" }, config).subject, "Novi Deweb upit — Jednostavni web 790 €");
  assert.match(webEmail.text, /Vrsta projekta: Web-stranica/);
  assert.match(webEmail.text, /Odabrani paket: Poslovni web — 1\.290 €/);
  assert.doesNotMatch(webEmail.text, /Trenutni ručni postupak|Korisnici rješenja|Nije navedeno|Zaprimljeno:/);
  const toolEmail = buildContactEmailPayload({ ...valid, projectType: "tool", selectedPackage: "", manualProcess: "Upite unosimo u tri tablice.", solutionUsers: "Prodaja" }, config);
  assert.equal(toolEmail.subject, "Novi Deweb upit — Poslovni alat");
  assert.match(toolEmail.text, /Vrsta projekta: Interni alat ili poslovna aplikacija/);
  assert.match(toolEmail.text, /Upite unosimo u tri tablice/);
  assert.match(toolEmail.text, /Korisnici rješenja: Prodaja/);
  assert.doesNotMatch(toolEmail.text, /Odabrani paket:|790|1\.290/);
  assert.equal(prepareProblemSubmission(valid).selectedPackage, "business");
});

test("TEST A/B/C email drafts keep the right package, Croatian text, and Reply-To", () => {
  const cases = [
    { tag: "TEST A", type: "web", packageId: "simple", subject: "[TEST] Novi Deweb upit — Jednostavni web 790 €", packageLine: "Odabrani paket: Jednostavni web — 790 €" },
    { tag: "TEST B", type: "web", packageId: "business", subject: "[TEST] Novi Deweb upit — Poslovni web 1.290 €", packageLine: "Odabrani paket: Poslovni web — 1.290 €" },
    { tag: "TEST C", type: "tool", packageId: "", subject: "[TEST] Novi Deweb upit — Poslovni alat", packageLine: "" },
  ] as const;
  for (const item of cases) {
    const data: ProblemFormData = {
      ...valid,
      projectType: item.type,
      selectedPackage: item.packageId,
      fullName: item.tag,
      companyName: "",
      email: "dinko@deweb.hr",
      problem: `${item.tag}: Č, ć, ž, š i đ ostaju čitljivi u opisu upita.`,
    };
    const draft = buildContactEmailPayload(data, { ...config, toEmail: "deweb.eu@gmail.com" }, { test: true });
    assert.equal(validateContactPayload(data).valid, true);
    assert.equal(draft.reply_to, data.email);
    assert.deepEqual(draft.to, ["deweb.eu@gmail.com"]);
    assert.equal(draft.subject, item.subject);
    if (item.packageLine) assert.ok(draft.text.includes(item.packageLine));
    else assert.doesNotMatch(draft.text, /Odabrani paket:|790|1\.290/);
    assert.match(draft.text, /Č, ć, ž, š i đ/);
    assert.doesNotMatch(draft.text, /Nije navedeno|Nije primjenjivo|Zaprimljeno:/);
  }
  assert.match(successMessage, /predan za slanje/);
  assert.doesNotMatch(successMessage, /zaprimili/i);
});

test("provider transport is called once with server-owned credentials", async () => {
  const calls: Array<{ url: string; init: RequestInit }> = [];
  const id = await sendContactEmail(valid, config, async (url, init) => {
    calls.push({ url: String(url), init: init ?? {} });
    return new Response(JSON.stringify({ id: "email_123" }), { status: 200 });
  });
  assert.equal(id, "email_123");
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://api.resend.com/emails");
  assert.match(String(calls[0].init.body), /Odabrani paket: Poslovni web/);
  assert.deepEqual(calls[0].init.headers, { Authorization: "Bearer re_test", "Content-Type": "application/json" });
});

test("accepted provider response without ID stays distinguishable from a recorded ID", async () => {
  const id = await sendContactEmail(valid, config, async () => new Response("{}", { status: 200 }));
  assert.equal(id, null);
});

test("provider rejection does not count as successful sending", async () => {
  await assert.rejects(() => sendContactEmail(valid, config, async () => new Response("rejected", { status: 401 })), /Email provider failed/);
});
