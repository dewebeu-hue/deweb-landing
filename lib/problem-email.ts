export type ProblemFormData = {
  fullName: string;
  companyName: string;
  email: string;
  phone?: string;
  businessType: string;
  problem: string;
  currentSolution: string;
  urgency: string;
  solutionType: string;
};

export type ProblemSubmission = ProblemFormData & {
  submittedAt: string;
};

export const successMessage =
  "Hvala. Vaš opis problema je pripremljen. Zaprimanje upita bit će spojeno u sljedećem koraku.";

export const requiredProblemFields = [
  "fullName",
  "companyName",
  "email",
  "businessType",
  "problem",
  "currentSolution",
  "urgency",
  "solutionType",
] as const satisfies readonly (keyof ProblemFormData)[];

export type RequiredProblemField = (typeof requiredProblemFields)[number];

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

export function prepareProblemSubmission(data: ProblemFormData): ProblemSubmission {
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
    submittedAt: new Date().toISOString(),
  };
}
