import test from "node:test";
import assert from "node:assert/strict";

import { prepareProblemSubmission, successMessage, validateProblemForm } from "./problem-email.ts";

test("validateProblemForm reports missing required fields", () => {
  const result = validateProblemForm({
    fullName: "Ana Horvat",
    companyName: "",
    email: "ana@example.com",
    businessType: "Mali servis",
    problem: "",
    currentSolution: "Excel i WhatsApp",
    urgency: "Treba mi uskoro",
    solutionType: "Brzi MVP",
  });

  assert.equal(result.valid, false);
  assert.deepEqual(result.missingFields, ["companyName", "problem"]);
});

test("prepareProblemSubmission keeps submitted answers only for future backend handoff", () => {
  const payload = prepareProblemSubmission({
    fullName: "Ana Horvat",
    companyName: "Servis Horvat",
    email: "ana@example.com",
    phone: "+385 91 123 4567",
    businessType: "Servis kućanskih aparata",
    problem: "Gubimo upite i zaboravljamo follow-up.",
    currentSolution: "WhatsApp, papir i Excel.",
    urgency: "Hitno je",
    solutionType: "Brzi MVP",
  });

  assert.equal(payload.fullName, "Ana Horvat");
  assert.equal(payload.companyName, "Servis Horvat");
  assert.equal(payload.problem, "Gubimo upite i zaboravljamo follow-up.");
  assert.equal(payload.solutionType, "Brzi MVP");
  assert.equal(payload.submittedAt.length > 0, true);
  assert.equal(
    successMessage,
    "Hvala. Vaš opis problema je pripremljen. Zaprimanje upita bit će spojeno u sljedećem koraku.",
  );
});
