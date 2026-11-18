"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  companyTypes,
  requiredProblemFields,
  successMessage,
  validateProblemForm,
  type ProblemFormData,
  type ProjectType,
} from "../lib/problem-email";
import { webPackages } from "../lib/web-packages";
import { readProjectSelection, type ProjectSelection } from "../lib/project-selection";
import { projectSelectionEvent } from "./project-link";
import { InquiryConfirmation } from "./inquiry-confirmation";
import { priceHelpOptions } from "../lib/price-help";

const fieldWrapperClass = "grid content-start gap-2";
const labelClass = "flex min-h-5 items-center gap-1 text-sm font-extrabold leading-5 text-ink";
const controlClass = "field-control";

function value(form: FormData, key: string) { return String(form.get(key) ?? ""); }
function collectProblemFormData(form: HTMLFormElement): ProblemFormData {
  const data = new FormData(form);
  return {
    projectType: value(data, "projectType") as ProblemFormData["projectType"],
    selectedPackage: value(data, "selectedPackage"),
    selectedHelp: value(data, "selectedHelp"),
    fullName: value(data, "fullName"),
    companyName: value(data, "companyName"),
    companyType: value(data, "companyType"),
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
  return readProjectSelection({ vrsta: params.get("vrsta") ?? undefined, paket: params.get("paket") ?? undefined, pomoc: params.get("pomoc") ?? undefined });
}

function replaceSelectionInUrl(type: ProjectType | "", packageId: string, helpId = "") {
  const url = new URL(window.location.href);
  if (type) url.searchParams.set("vrsta", type);
  else url.searchParams.delete("vrsta");
  if (type === "web" && packageId) url.searchParams.set("paket", packageId);
  else url.searchParams.delete("paket");
  if (type === "prices" && helpId) url.searchParams.set("pomoc", helpId);
  else url.searchParams.delete("pomoc");
  window.history.replaceState(null, "", url);
}

type ProblemFormProps =
  | { initialSelection: ProjectSelection; webshopSummary?: never }
  | { initialSelection?: never; webshopSummary: string | null };

export function ProblemForm({ initialSelection, webshopSummary }: ProblemFormProps) {
  const isWebshopQuote = webshopSummary !== undefined;
  const [projectType, setProjectType] = useState<ProjectType | "">(initialSelection?.type ?? "shop");
  const [selectedPackage, setSelectedPackage] = useState<string>(initialSelection?.packageId ?? "");
  const [selectedHelp, setSelectedHelp] = useState<string>(initialSelection?.helpId ?? "");
  const [errors, setErrors] = useState<Array<keyof ProblemFormData>>([]);
  const [status, setStatus] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isWebshopQuote) return;
    function selectProject(event: Event) {
      const detail = (event as CustomEvent<{ type: ProjectType; packageId: string }>).detail;
      setProjectType(detail.type);
      setSelectedPackage(detail.type === "web" ? detail.packageId : "");
      setSelectedHelp("");
      setErrors([]);
    }
    function restoreSelection() {
      const selection = selectionFromLocation();
      setProjectType(selection.type);
      setSelectedPackage(selection.packageId);
      setSelectedHelp(selection.helpId ?? "");
      setErrors([]);
    }
    window.addEventListener(projectSelectionEvent, selectProject);
    window.addEventListener("popstate", restoreSelection);
    return () => {
      window.removeEventListener(projectSelectionEvent, selectProject);
      window.removeEventListener("popstate", restoreSelection);
    };
  }, [isWebshopQuote]);

  function hasError(name: keyof ProblemFormData) { return errors.includes(name); }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting || isSuccess || webshopSummary === null) return;
    const form = event.currentTarget;
    const data = collectProblemFormData(form);
    if (webshopSummary !== undefined) {
      const note = data.problem.trim();
      data.projectType = "shop";
      data.problem = note ? `${webshopSummary}\n\nNapomena kupca\n${note}` : webshopSummary;
    }
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
      const result = (await response.json().catch(() => null)) as { ok?: boolean; error?: string; fields?: Array<keyof ProblemFormData> } | null;
      if (!response.ok || result?.ok !== true) {
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

  const formLayout = isWebshopQuote ? "" : "contact-panel";

  return <div className="inquiry">
    <form
      className={`inquiry-form items-start ${formLayout}`}
      aria-labelledby={isWebshopQuote ? "webshop-quote-title" : undefined}
      method="post"
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="hidden" aria-hidden="true"><label htmlFor="website">Website</label><input id="website" name="website" tabIndex={-1} autoComplete="off" /></div>
      {!isWebshopQuote && <div className={`${fieldWrapperClass} sm:col-span-2`}>
        <label className={labelClass} htmlFor="projectType">Što vam treba? *</label>
        <select
          id="projectType"
          name="projectType"
          required
          className={controlClass}
          value={projectType}
          onChange={event => {
            const type = event.target.value as ProjectType | "";
            setProjectType(type);
            setSelectedPackage("");
            setSelectedHelp("");
            replaceSelectionInUrl(type, "");
          }}
          aria-invalid={hasError("projectType") || undefined}
          aria-describedby={hasError("projectType") ? "projectType-error" : undefined}
        >
          <option value="">Odaberite vrstu projekta</option>
          <option value="web">Trebam web-stranicu</option>
          <option value="shop">Trebam webshop</option>
          <option value="tool">Trebam interni alat ili poslovnu aplikaciju</option>
          <option value="saas">Trebam drugo poslovno rješenje</option>
          <option value="prices">Trebam pomoć s baznim cijenama i cjenikom</option>
          <option value="unsure">Nisam još siguran</option>
        </select>
        <FieldError name="projectType" show={hasError("projectType")} />
      </div>}
      {!isWebshopQuote && projectType === "prices" && <div className={`${fieldWrapperClass} sm:col-span-2`}>
        <label className={labelClass} htmlFor="selectedHelp">S čime trebate pomoć?</label>
        <select id="selectedHelp" name="selectedHelp" className={controlClass} value={selectedHelp} onChange={event => {
          setSelectedHelp(event.target.value);
          replaceSelectionInUrl("prices", "", event.target.value);
        }} aria-invalid={hasError("selectedHelp") || undefined} aria-describedby="selectedHelp-description">
          <option value="">Odaberite ili opišite potrebu ispod</option>
          {priceHelpOptions.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}
        </select>
        <p id="selectedHelp-description" className="text-sm text-muted">{priceHelpOptions.find(item => item.id === selectedHelp)?.description ?? "Navedite gdje prodajete i koji sustav koristite. Predložit ćemo opseg tehničke pomoći."}</p>
        <FieldError name="selectedHelp" show={hasError("selectedHelp")} />
      </div>}
      {!isWebshopQuote && projectType === "web" && <div className={`${fieldWrapperClass} sm:col-span-2`}><label className={labelClass} htmlFor="selectedPackage">Web-paket <span className="font-normal text-muted">(neobavezno)</span></label><select id="selectedPackage" name="selectedPackage" className={controlClass} value={selectedPackage} onChange={event => { setSelectedPackage(event.target.value); replaceSelectionInUrl("web", event.target.value); }} aria-invalid={hasError("selectedPackage") || undefined}><option value="">Još nisam odabrao paket</option>{webPackages.map(item => <option key={item.id} value={item.id}>{item.name} — {item.price.toLocaleString("hr-HR")} €</option>)}</select><FieldError name="selectedPackage" show={hasError("selectedPackage")} /></div>}
      <Field name="fullName" label="Ime i prezime *" error={hasError("fullName")} wide={isWebshopQuote} />
      <Field name="email" label="E-pošta *" type="email" error={hasError("email")} wide={isWebshopQuote} />
      <Field name="companyName" label="Naziv poslovnog subjekta *" error={hasError("companyName")} wide={isWebshopQuote} />
      <div className={`${fieldWrapperClass} ${isWebshopQuote ? "sm:col-span-2" : ""}`}>
        <label className={labelClass} htmlFor="companyType">Vrsta subjekta *</label>
        <select id="companyType" name="companyType" required defaultValue="" className={controlClass}
          aria-invalid={hasError("companyType") || undefined}
          aria-describedby={hasError("companyType") ? "companyType-error" : undefined}>
          <option value="">Odaberite vrstu subjekta</option>
          {companyTypes.map(type => <option key={type} value={type}>{type}</option>)}
        </select>
        <FieldError name="companyType" show={hasError("companyType")} />
      </div>
      {isWebshopQuote ? (
        <TextField name="problem" label="Napomena (neobavezno)" error={hasError("problem")} />
      ) : (
        <>
          <TextField name="problem" label="Kratak opis potrebe *" error={hasError("problem")} help="Barem 20 znakova. Nemojte slati povjerljive poslovne podatke." />
          <details className="group optional-details sm:col-span-2">
            <summary className="flex min-h-9 cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold text-teal-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-dark">
              Dodajte detalje <span aria-hidden="true" className="group-open:rotate-45">+</span>
            </summary>
            <div className="mt-3 grid gap-x-4 gap-y-2 sm:grid-cols-2">
              <Field name="phone" label="Telefon (neobavezno)" type="tel" />
              <Field name="currentWebsite" label="Postojeći web (neobavezno)" type="url" />
            </div>
          </details>
        </>
      )}
      <div className={`grid gap-3 sm:col-span-2 ${isWebshopQuote ? "" : "sm:flex sm:items-center"}`}>
        <button
          className="button"
          type="submit"
          disabled={isSubmitting || isSuccess || webshopSummary === null}
        >
          {isSubmitting ? "Šaljem..." : isSuccess ? "Poslano" : "Pošaljite upit"}
        </button>
        <p role="status" aria-live="polite" className={"form-status " + (isSuccess ? "form-success" : "form-error")}>
          {isSuccess && <InquiryConfirmation />}{status}
        </p>
      </div>
    </form>
    <p className="form-privacy">Slanjem upita potvrđujete da ste upoznati s načinom obrade podataka opisanim u <a className="font-bold text-teal-dark underline underline-offset-4 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-3 focus-visible:outline-orange-dark" href="/privatnost">Politici privatnosti</a>.</p>
  </div>;
}

function FieldError({ name, show }: { name: keyof ProblemFormData; show: boolean }) {
  if (!show) return null;
  const businessErrors = { companyName: "Unesite naziv poslovnog subjekta.", companyType: "Odaberite vrstu subjekta." };
  const message = name === "companyName" || name === "companyType" ? businessErrors[name] : "Provjerite ovo polje.";
  return <p id={`${name}-error`} className="text-sm font-bold text-orange-dark">{message}</p>;
}
function Field({ name, label, error = false, type = "text", wide = false }: { name: keyof ProblemFormData; label: string; error?: boolean; type?: string; wide?: boolean }) {
  const autoComplete: Partial<Record<keyof ProblemFormData, string>> = { fullName: "name", companyName: "organization", email: "email", phone: "tel", currentWebsite: "url" };
  return <div className={`${fieldWrapperClass} ${wide ? "sm:col-span-2" : ""}`}>
    <label className={labelClass} htmlFor={name}>{label}</label>
    <input className={controlClass} id={name} name={name} type={type}
      required={requiredProblemFields.some(field => field === name)} autoComplete={autoComplete[name]}
      aria-invalid={error || undefined} aria-describedby={error ? `${name}-error` : undefined} />
    <FieldError name={name} show={error} />
  </div>;
}
function TextField({ name, label, error = false, help }: { name: "problem" | "manualProcess"; label: string; error?: boolean; help?: string }) { return <div className={`${fieldWrapperClass} sm:col-span-2`}><label className={labelClass} htmlFor={name}>{label}</label><textarea className={`${controlClass} min-h-28 resize-y`} id={name} name={name} rows={4} required={name === "problem" && Boolean(help)} aria-invalid={error || undefined} aria-describedby={[help ? `${name}-help` : "", error ? `${name}-error` : ""].filter(Boolean).join(" ") || undefined} />{help && <p id={`${name}-help`} className="text-xs leading-5 text-muted">{help}</p>}<FieldError name={name} show={error} /></div>; }

export { requiredProblemFields };
