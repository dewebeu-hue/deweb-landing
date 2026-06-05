export type ProblemFormData = {
  fullName: string;
  companyName: string;
  email: string;
  phone?: string;
  businessType: string;
  problem: string;
  currentSolution?: string;
  urgency?: string;
  solutionType?: string;
  website?: string;
};

export type ProblemSubmission = Required<ProblemFormData> & {
  submittedAt: string;
};

export type ContactEmailConfig = {
  apiKey: string;
  toEmail: string;
  fromEmail: string;
};

export type ContactEmailPayload = {
  from: string;
  to: string[];
  reply_to: string;
  subject: string;
  text: string;
};

export const successMessage = "Hvala. Zaprimili smo vaš opis problema i javit ćemo vam se uskoro.";

export const requiredProblemFields = [
  "fullName",
  "companyName",
  "email",
  "businessType",
  "problem",
] as const satisfies readonly (keyof ProblemFormData)[];

export type RequiredProblemField = (typeof requiredProblemFields)[number];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const minProblemLength = 20;

export function normalizeFormValue(value: FormDataEntryValue | string | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

export function validateProblemForm(data: Partial<ProblemFormData>) {
  const missingFields = requiredProblemFields.filter((field) => !normalizeFormValue(data[field]));

  return {
    valid: missingFields.length === 0,
    missingFields,
  };
}

export function validateContactPayload(data: Partial<ProblemFormData>) {
  const errors: Array<keyof ProblemFormData> = [];

  for (const field of requiredProblemFields) {
    if (!normalizeFormValue(data[field])) {
      errors.push(field);
    }
  }

  const email = normalizeFormValue(data.email);
  if (email && !emailPattern.test(email) && !errors.includes("email")) {
    errors.push("email");
  }

  const problem = normalizeFormValue(data.problem);
  if (problem && problem.length < minProblemLength && !errors.includes("problem")) {
    errors.push("problem");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function isHoneypotSubmission(data: Partial<ProblemFormData>) {
  return normalizeFormValue(data.website).length > 0;
}

export function prepareProblemSubmission(data: Partial<ProblemFormData>): ProblemSubmission {
  return {
    fullName: normalizeFormValue(data.fullName),
    companyName: normalizeFormValue(data.companyName),
    email: normalizeFormValue(data.email),
    phone: normalizeFormValue(data.phone),
    businessType: normalizeFormValue(data.businessType),
    problem: normalizeFormValue(data.problem),
    currentSolution: normalizeFormValue(data.currentSolution),
    urgency: normalizeFormValue(data.urgency),
    solutionType: normalizeFormValue(data.solutionType),
    website: normalizeFormValue(data.website),
    submittedAt: new Date().toISOString(),
  };
}

function optionalValue(value: string) {
  return value.length > 0 ? value : "Nije navedeno";
}

export function buildContactEmailPayload(data: ProblemFormData, config: ContactEmailConfig): ContactEmailPayload {
  const submission = prepareProblemSubmission(data);

  return {
    from: config.fromEmail,
    to: [config.toEmail],
    reply_to: submission.email,
    subject: `Novi upit s deweb.hr — ${submission.companyName}`,
    text: [
      "Novi upit s deweb.hr",
      "",
      `Ime i prezime: ${submission.fullName}`,
      `Naziv firme: ${submission.companyName}`,
      `Email: ${submission.email}`,
      `Telefon: ${optionalValue(submission.phone)}`,
      `Čime se firma bavi: ${submission.businessType}`,
      `Koji problem žele riješiti: ${submission.problem}`,
      `Kako to danas rješavaju: ${optionalValue(submission.currentSolution)}`,
      `Koliko je hitno: ${optionalValue(submission.urgency)}`,
      `Kakvo rješenje traže: ${optionalValue(submission.solutionType)}`,
      "",
      `Zaprimljeno: ${submission.submittedAt}`,
    ].join("\n"),
  };
}

export async function sendContactEmail(
  data: ProblemFormData,
  config: ContactEmailConfig,
  fetcher: typeof fetch = fetch,
) {
  const response = await fetcher("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(buildContactEmailPayload(data, config)),
  });

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    throw new Error(`Email provider failed (${response.status}): ${details}`);
  }
}
