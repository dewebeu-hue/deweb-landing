"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  requiredProblemFields,
  successMessage,
  validateProblemForm,
  type ProblemFormData,
} from "../lib/problem-email";
import { webPackages } from "../lib/web-packages";
import { readProjectSelection, type ProjectSelection } from "../lib/project-selection";
import { projectSelectionEvent, type ProjectType } from "./project-link";

const fieldWrapperClass = "grid content-start gap-2";
const labelClass = "flex min-h-5 items-center gap-1 text-sm font-extrabold leading-5 text-ink";
const controlClass = "min-h-12 w-full rounded-lg border border-[#9db9c2] bg-white px-3 py-2 text-base text-ink outline-none focus-visible:border-teal focus-visible:ring-4 focus-visible:ring-teal/15 aria-[invalid=true]:border-orange-dark aria-[invalid=true]:ring-4 aria-[invalid=true]:ring-orange/15";

function value(form: FormData, key: string) { return String(form.get(key) ?? ""); }
function collectProblemFormData(form: HTMLFormElement): ProblemFormData {
  const data = new FormData(form);
  return {
    projectType: value(data, "projectType") as ProblemFormData["projectType"],
    selectedPackage: value(data, "selectedPackage"),
    fullName: value(data, "fullName"),
    companyName: value(data, "companyName"),
    email: value(data, "email"),
    phone: value(data, "phone"),
    currentWebsite: value(data, "currentWebsite"),
    problem: value(data, "problem"),
    manualProcess: value(data, "manualProcess"),
    solutionUsers: value(data, "solutionUsers"),
    website: value(data, "website"),
  };
}

function selectionFromLocation() {
  const params = new URLSearchParams(window.location.search);
  return readProjectSelection({ vrsta: params.get("vrsta") ?? undefined, paket: params.get("paket") ?? undefined });
}

function replaceSelectionInUrl(type: ProjectType | "", packageId: string) {
  const url = new URL(window.location.href);
  if (type) url.searchParams.set("vrsta", type);
  else url.searchParams.delete("vrsta");
  if (type === "web" && packageId) url.searchParams.set("paket", packageId);
  else url.searchParams.delete("paket");
  window.history.replaceState(null, "", url);
}

export function ProblemForm({ initialSelection }: { initialSelection: ProjectSelection }) {
  const [projectType, setProjectType] = useState<ProjectType | "">(initialSelection.type);
  const [selectedPackage, setSelectedPackage] = useState<string>(initialSelection.packageId);
  const [errors, setErrors] = useState<Array<keyof ProblemFormData>>([]);
  const [status, setStatus] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    function selectProject(event: Event) {
      const detail = (event as CustomEvent<{ type: ProjectType; packageId: string }>).detail;
      setProjectType(detail.type);
      setSelectedPackage(detail.type === "web" ? detail.packageId : "");
      setErrors([]);
    }
    function restoreSelection() {
      const selection = selectionFromLocation();
      setProjectType(selection.type);
      setSelectedPackage(selection.packageId);
      setErrors([]);
    }
    window.addEventListener(projectSelectionEvent, selectProject);
    window.addEventListener("popstate", restoreSelection);
    return () => {
      window.removeEventListener(projectSelectionEvent, selectProject);
      window.removeEventListener("popstate", restoreSelection);
    };
  }, []);

  function hasError(name: keyof ProblemFormData) { return errors.includes(name); }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting || isSuccess) return;
    const form = event.currentTarget;
    const data = collectProblemFormData(form);
    const validation = validateProblemForm(data);
    if (!validation.valid) {
      setErrors(validation.errors);
      setStatus(validation.errors.includes("problem") && data.problem.trim().length > 0 && data.problem.trim().length < 20
        ? "Opis potrebe treba imati barem 20 znakova."
        : "Provjerite označena polja.");
      const first = form.elements.namedItem(validation.errors[0]);
      if (first instanceof HTMLElement) requestAnimationFrame(() => first.focus());
      return;
    }
    setErrors([]);
    setStatus("");
    setIsSubmitting(true);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        signal: controller.signal,
      });
      const result = (await response.json().catch(() => null)) as { error?: string; fields?: Array<keyof ProblemFormData> } | null;
      if (!response.ok) {
        setErrors(result?.fields ?? []);
        throw new Error(result?.error ?? "Slanje nije uspjelo. Pokušajte ponovno.");
      }
      form.reset();
      setIsSuccess(true);
      setStatus(successMessage);
    } catch (error) {
      setIsSuccess(false);
      setStatus(error instanceof Error && error.name === "AbortError" ? "Slanje je trajalo predugo. Ne možemo potvrditi je li upit zaprimljen. Vaš tekst ostaje u obrascu." : error instanceof Error ? error.message : "Trenutno ne možemo poslati upit. Pokušajte ponovno.");
    } finally {
      window.clearTimeout(timeout);
      setIsSubmitting(false);
    }
  }

  return <div className="grid gap-3">
    <form className="grid items-start gap-x-4 gap-y-2 rounded-2xl border border-line bg-white p-5 shadow-soft sm:grid-cols-2 sm:p-7" onSubmit={handleSubmit} noValidate>
      <div className="hidden" aria-hidden="true"><label htmlFor="website">Website</label><input id="website" name="website" tabIndex={-1} autoComplete="off" /></div>
      <div className={`${fieldWrapperClass} sm:col-span-2`}><label className={labelClass} htmlFor="projectType">Što vam treba? *</label><select id="projectType" name="projectType" className={controlClass} value={projectType} onChange={event => { const type = event.target.value as ProjectType | ""; setProjectType(type); setSelectedPackage(""); replaceSelectionInUrl(type, ""); }} aria-invalid={hasError("projectType") || undefined} aria-describedby={hasError("projectType") ? "projectType-error" : undefined}><option value="">Odaberite vrstu projekta</option><option value="web">Trebam web-stranicu</option><option value="tool">Trebam interni alat ili poslovnu aplikaciju</option><option value="saas">Trebam drugo poslovno rješenje</option><option value="unsure">Nisam još siguran</option></select><FieldError name="projectType" show={hasError("projectType")} /></div>
      {projectType === "web" && <div className={`${fieldWrapperClass} sm:col-span-2`}><label className={labelClass} htmlFor="selectedPackage">Web-paket <span className="font-normal text-muted">(neobavezno)</span></label><select id="selectedPackage" name="selectedPackage" className={controlClass} value={selectedPackage} onChange={event => { setSelectedPackage(event.target.value); replaceSelectionInUrl("web", event.target.value); }} aria-invalid={hasError("selectedPackage") || undefined}><option value="">Još nisam odabrao paket</option>{webPackages.map(item => <option key={item.id} value={item.id}>{item.name} — {item.price.toLocaleString("hr-HR")} €</option>)}</select><FieldError name="selectedPackage" show={hasError("selectedPackage")} /></div>}
      <Field name="fullName" label="Ime i prezime *" error={hasError("fullName")} />
      <Field name="companyName" label="Tvrtka ili obrt (neobavezno)" />
      <Field name="email" label="Email *" type="email" error={hasError("email")} />
      <Field name="phone" label="Telefon (neobavezno)" type="tel" />
      <Field name="currentWebsite" label="Postojeći web (neobavezno)" type="url" wide />
      {projectType === "tool" || projectType === "saas" ? <><TextField name="manualProcess" label="Što danas radite ručno ili u postojećem sustavu, a željeli biste pojednostaviti?" /><Field name="solutionUsers" label="Tko bi koristio rješenje? (neobavezno)" wide /></> : null}
      <TextField name="problem" label="Kratak opis potrebe *" error={hasError("problem")} help="Barem 20 znakova. Nemojte slati povjerljive poslovne podatke." />
      <div className="grid gap-3 sm:col-span-2 sm:flex sm:items-center"><button className="min-h-[52px] rounded-lg bg-teal px-6 py-3 text-base font-extrabold text-white transition hover:bg-teal-dark focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-3 focus-visible:outline-orange-dark disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={isSubmitting || isSuccess}>{isSubmitting ? "Šaljem..." : isSuccess ? "Poslano" : "Pošaljite upit"}</button><p role="status" aria-live="polite" className={`m-0 rounded-lg px-3 py-2 text-sm font-bold leading-6 ${isSuccess ? "bg-teal-soft text-teal-dark" : errors.length ? "bg-[#fff1e9] text-orange-dark" : "text-muted"}`}>{status}</p></div>
    </form>
    <p className="m-0 px-1 text-sm leading-6 text-muted">Slanjem upita potvrđujete da ste upoznati s načinom obrade podataka opisanim u <a className="font-bold text-teal-dark underline underline-offset-4 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-3 focus-visible:outline-orange-dark" href="/privatnost">Politici privatnosti</a>.</p>
  </div>;
}

function FieldError({ name, show }: { name: keyof ProblemFormData; show: boolean }) { return <p id={`${name}-error`} className="min-h-4 text-xs font-bold text-orange-dark" aria-hidden={!show}>{show ? "Provjerite ovo polje." : ""}</p>; }
function Field({ name, label, error = false, type = "text", wide = false }: { name: keyof ProblemFormData; label: string; error?: boolean; type?: string; wide?: boolean }) { const autoComplete: Partial<Record<keyof ProblemFormData, string>> = { fullName: "name", companyName: "organization", email: "email", phone: "tel", currentWebsite: "url" }; return <div className={`${fieldWrapperClass} ${wide ? "sm:col-span-2" : ""}`}><label className={labelClass} htmlFor={name}>{label}</label><input className={controlClass} id={name} name={name} type={type} autoComplete={autoComplete[name]} aria-invalid={error || undefined} aria-describedby={error ? `${name}-error` : undefined} /><FieldError name={name} show={error} /></div>; }
function TextField({ name, label, error = false, help }: { name: "problem" | "manualProcess"; label: string; error?: boolean; help?: string }) { return <div className={`${fieldWrapperClass} sm:col-span-2`}><label className={labelClass} htmlFor={name}>{label}</label><textarea className={`${controlClass} min-h-28 resize-y`} id={name} name={name} rows={4} aria-invalid={error || undefined} aria-describedby={[help ? `${name}-help` : "", error ? `${name}-error` : ""].filter(Boolean).join(" ") || undefined} />{help && <p id={`${name}-help`} className="text-xs leading-5 text-muted">{help}</p>}<FieldError name={name} show={error} /></div>; }

export { requiredProblemFields };
