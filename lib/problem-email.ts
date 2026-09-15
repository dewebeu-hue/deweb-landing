import { webPackages } from "./web-packages.ts";

export const projectTypes = ["web", "tool", "saas", "unsure"] as const;
export type ProjectType = (typeof projectTypes)[number];

export type ProblemFormData = {
  projectType: ProjectType | "";
  selectedPackage?: string;
  fullName: string;
  companyName?: string;
  email: string;
  phone?: string;
  currentWebsite?: string;
  problem: string;
  manualProcess?: string;
  solutionUsers?: string;
  website?: string;
};

export type ProblemSubmission = Required<ProblemFormData> & { submittedAt: string };
export type ContactEmailConfig = { apiKey: string; toEmail: string; fromEmail: string };
export type ContactEmailPayload = { from: string; to: string[]; reply_to: string; subject: string; text: string };

export const successMessage = "Hvala. Upit je predan za slanje. Javit ćemo vam se kad ga primimo.";
export const requiredProblemFields = ["projectType", "fullName", "email", "problem"] as const satisfies readonly (keyof ProblemFormData)[];
export type RequiredProblemField = (typeof requiredProblemFields)[number];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const minProblemLength = 20;

function validReplyTo(email: string) {
  return email.length <= 254 && emailPattern.test(email) && !/[\u0000-\u001f\u007f<>(),;:"\\]/.test(email);
}

export function normalizeFormValue(value: FormDataEntryValue | string | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

export function validateProblemForm(data: Partial<ProblemFormData>) {
  const missingFields = requiredProblemFields.filter(field => !normalizeFormValue(data[field]));
  const errors: Array<keyof ProblemFormData> = [...missingFields];
  const type = normalizeFormValue(data.projectType);
  if (type && !projectTypes.includes(type as ProjectType)) errors.push("projectType");
  const email = normalizeFormValue(data.email);
  if (email && !validReplyTo(email)) errors.push("email");
  const problem = normalizeFormValue(data.problem);
  if (problem && problem.length < minProblemLength) errors.push("problem");
  const selectedPackage = normalizeFormValue(data.selectedPackage);
  if (selectedPackage && (type !== "web" || !webPackages.some(item => item.id === selectedPackage))) errors.push("selectedPackage");
  return { valid: errors.length === 0, missingFields, errors: [...new Set(errors)] };
}

export function validateContactPayload(data: Partial<ProblemFormData>) {
  const result = validateProblemForm(data);
  return { valid: result.valid, errors: result.errors };
}

export function isHoneypotSubmission(data: Partial<ProblemFormData>) {
  return normalizeFormValue(data.website).length > 0;
}

export function prepareProblemSubmission(data: Partial<ProblemFormData>): ProblemSubmission {
  return {
    projectType: normalizeFormValue(data.projectType) as ProblemFormData["projectType"],
    selectedPackage: normalizeFormValue(data.selectedPackage),
    fullName: normalizeFormValue(data.fullName),
    companyName: normalizeFormValue(data.companyName),
    email: normalizeFormValue(data.email),
    phone: normalizeFormValue(data.phone),
    currentWebsite: normalizeFormValue(data.currentWebsite),
    problem: normalizeFormValue(data.problem),
    manualProcess: normalizeFormValue(data.manualProcess),
    solutionUsers: normalizeFormValue(data.solutionUsers),
    website: normalizeFormValue(data.website),
    submittedAt: new Date().toISOString(),
  };
}

function projectTypeLabel(type: ProjectType | "") {
  if (!type) return "Nije navedeno";
  return { web: "Web-stranica", tool: "Interni alat ili poslovna aplikacija", saas: "SaaS rješenje", unsure: "Nisam još siguran" }[type];
}

function subjectDetail(submission: ProblemSubmission) {
  if (submission.projectType === "web") {
    const selected = webPackages.find(item => item.id === submission.selectedPackage);
    return selected ? `${selected.name} ${selected.price.toLocaleString("hr-HR")} €` : "Web-stranica";
  }
  if (submission.projectType === "tool") return "Poslovni alat";
  return projectTypeLabel(submission.projectType);
}

export function buildContactEmailPayload(data: ProblemFormData, config: ContactEmailConfig, options: { test?: boolean } = {}): ContactEmailPayload {
  const submission = prepareProblemSubmission(data);
  const selected = submission.projectType === "web"
    ? webPackages.find(item => item.id === submission.selectedPackage)
    : undefined;
  return {
    from: config.fromEmail,
    to: [config.toEmail],
    reply_to: submission.email,
    subject: `${options.test ? "[TEST] " : ""}Novi Deweb upit — ${subjectDetail(submission)}`,
    text: [
      options.test ? "TEST — provjera kontaktnog obrasca" : "Novi kontaktni upit", "",
      `Ime: ${submission.fullName}`,
      submission.companyName && `Tvrtka ili obrt: ${submission.companyName}`,
      `Email: ${submission.email}`,
      submission.phone && `Telefon: ${submission.phone}`,
      `Vrsta projekta: ${projectTypeLabel(submission.projectType)}`,
      selected && `Odabrani paket: ${selected.name} — ${selected.price.toLocaleString("hr-HR")} €`,
      submission.currentWebsite && `Postojeći web: ${submission.currentWebsite}`,
      (submission.projectType === "tool" || submission.projectType === "saas") && submission.manualProcess && `Trenutni ručni postupak: ${submission.manualProcess}`,
      (submission.projectType === "tool" || submission.projectType === "saas") && submission.solutionUsers && `Korisnici rješenja: ${submission.solutionUsers}`,
      "", `Poruka / opis potrebe: ${submission.problem}`,
    ].filter((line): line is string => typeof line === "string").join("\n"),
  };
}

export async function sendContactEmail(data: ProblemFormData, config: ContactEmailConfig, fetcher: typeof fetch = fetch, options: { test?: boolean } = {}): Promise<string | null> {
  const response = await fetcher("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(buildContactEmailPayload(data, config, options)),
  });
  if (!response.ok) {
    const details = await response.text().catch(() => "");
    throw new Error(`Email provider failed (${response.status}): ${details}`);
  }
  const result: unknown = await response.json().catch(() => null);
  return result && typeof result === "object" && "id" in result && typeof result.id === "string" ? result.id : null;
}
