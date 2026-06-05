import test from "node:test";
import assert from "node:assert/strict";

import {
  buildContactEmailPayload,
  isHoneypotSubmission,
  prepareProblemSubmission,
  sendContactEmail,
  successMessage,
  validateContactPayload,
  validateProblemForm,
  type ContactEmailConfig,
  type ProblemFormData,
} from "./problem-email.ts";

const validPayload: ProblemFormData = {
  fullName: "Ana Horvat",
  companyName: "Servis Horvat",
  email: "ana@example.com",
  phone: "+385 91 123 4567",
  businessType: "Servis kućanskih aparata",
  problem: "Gubimo upite kroz više kanala i zaboravljamo follow-up prema klijentima.",
  currentSolution: "WhatsApp, papir i Excel.",
  urgency: "Hitno je",
  solutionType: "Brzi MVP",
  website: "",
};

const config: ContactEmailConfig = {
  apiKey: "re_test",
  toEmail: "owner@example.com",
  fromEmail: "deweb <kontakt@example.com>",
};

test("validateProblemForm reports missing required client fields", () => {
  const result = validateProblemForm({
    fullName: "Ana Horvat",
    companyName: "",
    email: "ana@example.com",
    businessType: "Mali servis",
    problem: "",
  });

  assert.equal(result.valid, false);
  assert.deepEqual(result.missingFields, ["companyName", "problem"]);
});

test("validateContactPayload enforces server-side required fields and email shape", () => {
  const result = validateContactPayload({
    ...validPayload,
    email: "ana.example.com",
    problem: "Prekratko",
  });

  assert.equal(result.valid, false);
  assert.deepEqual(result.errors, ["email", "problem"]);
});

test("validateContactPayload allows optional secondary context fields", () => {
  const result = validateContactPayload({
    ...validPayload,
    phone: "",
    currentSolution: "",
    urgency: "",
    solutionType: "",
  });

  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
});

test("honeypot submissions are treated as successful without sending email", () => {
  assert.equal(isHoneypotSubmission({ ...validPayload, website: "https://spam.example" }), true);
  assert.equal(isHoneypotSubmission(validPayload), false);
});

test("buildContactEmailPayload creates readable Resend email content", () => {
  const emailPayload = buildContactEmailPayload(validPayload, config);

  assert.equal(emailPayload.from, config.fromEmail);
  assert.deepEqual(emailPayload.to, [config.toEmail]);
  assert.equal(emailPayload.reply_to, validPayload.email);
  assert.equal(emailPayload.subject, "Novi upit s deweb.hr — Servis Horvat");
  assert.match(emailPayload.text, /Ime i prezime: Ana Horvat/);
  assert.match(emailPayload.text, /Naziv firme: Servis Horvat/);
  assert.match(emailPayload.text, /Email: ana@example\.com/);
  assert.match(emailPayload.text, /Telefon: \+385 91 123 4567/);
  assert.match(emailPayload.text, /Čime se firma bavi: Servis kućanskih aparata/);
  assert.match(emailPayload.text, /Koji problem žele riješiti: Gubimo upite/);
  assert.match(emailPayload.text, /Kako to danas rješavaju: WhatsApp, papir i Excel\./);
  assert.match(emailPayload.text, /Koliko je hitno: Hitno je/);
  assert.match(emailPayload.text, /Kakvo rješenje traže: Brzi MVP/);
});

test("sendContactEmail posts to Resend without exposing keys to the client", async () => {
  const calls: Array<{ url: string; init: RequestInit }> = [];

  await sendContactEmail(validPayload, config, async (url, init) => {
    calls.push({ url: String(url), init: init ?? {} });
    return new Response(JSON.stringify({ id: "email_123" }), { status: 200 });
  });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://api.resend.com/emails");
  assert.equal(calls[0].init.method, "POST");
  assert.deepEqual(calls[0].init.headers, {
    Authorization: "Bearer re_test",
    "Content-Type": "application/json",
  });
});

test("sendContactEmail throws when Resend rejects the request", async () => {
  await assert.rejects(
    () =>
      sendContactEmail(validPayload, config, async () => {
        return new Response(JSON.stringify({ message: "No API key found" }), { status: 401 });
      }),
    /Email provider failed/,
  );
});

test("prepareProblemSubmission keeps submitted answers for the backend handoff", () => {
  const payload = prepareProblemSubmission(validPayload);

  assert.equal(payload.fullName, "Ana Horvat");
  assert.equal(payload.companyName, "Servis Horvat");
  assert.equal(payload.problem, validPayload.problem);
  assert.equal(payload.solutionType, "Brzi MVP");
  assert.equal(payload.submittedAt.length > 0, true);
  assert.equal(successMessage, "Hvala. Zaprimili smo vaš opis problema i javit ćemo vam se uskoro.");
});
