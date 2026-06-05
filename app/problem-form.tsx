"use client";

import { FormEvent, useState } from "react";
import {
  prepareProblemSubmission,
  requiredProblemFields,
  successMessage,
  validateProblemForm,
  type ProblemFormData,
  type RequiredProblemField,
} from "../lib/problem-email";

const fieldLabels: Record<RequiredProblemField, string> = {
  fullName: "Ime i prezime",
  companyName: "Naziv firme",
  email: "Email",
  businessType: "Čime se firma bavi?",
  problem: "Koji problem želite riješiti?",
  currentSolution: "Kako to danas rješavate?",
  urgency: "Koliko je hitno?",
  solutionType: "Kakvo rješenje tražite?",
};

const fieldWrapperClass = "grid content-start gap-2";
const labelClass = "flex min-h-5 items-center gap-1 text-sm font-extrabold leading-5 text-ink";
const optionalLabelClass = "font-semibold text-muted";
const controlClass =
  "h-12 w-full rounded-lg border border-[#b7ccd5] px-3 text-base text-ink outline-none focus:ring-4 focus:ring-orange/20 aria-[invalid=true]:border-orange aria-[invalid=true]:ring-4 aria-[invalid=true]:ring-orange/15";
const textareaClass =
  "min-h-32 w-full resize-y rounded-lg border border-[#b7ccd5] px-3 py-3 text-base text-ink outline-none focus:ring-4 focus:ring-orange/20 aria-[invalid=true]:border-orange aria-[invalid=true]:ring-4 aria-[invalid=true]:ring-orange/15";

function collectProblemFormData(form: HTMLFormElement): ProblemFormData {
  const formData = new FormData(form);

  return {
    fullName: String(formData.get("fullName") ?? ""),
    companyName: String(formData.get("companyName") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    businessType: String(formData.get("businessType") ?? ""),
    problem: String(formData.get("problem") ?? ""),
    currentSolution: String(formData.get("currentSolution") ?? ""),
    urgency: String(formData.get("urgency") ?? ""),
    solutionType: String(formData.get("solutionType") ?? ""),
  };
}

export function ProblemForm() {
  const [missingFields, setMissingFields] = useState<RequiredProblemField[]>([]);
  const [status, setStatus] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const data = collectProblemFormData(form);
    const validation = validateProblemForm(data);

    if (!validation.valid) {
      setMissingFields([...validation.missingFields]);
      setIsSuccess(false);
      setStatus("Molimo ispunite obavezna polja prije slanja.");
      window.requestAnimationFrame(() => {
        form.elements.namedItem(validation.missingFields[0]) instanceof HTMLElement &&
          (form.elements.namedItem(validation.missingFields[0]) as HTMLElement).focus();
      });
      return;
    }

    const submission = prepareProblemSubmission(data);
    // TODO: Connect the real backend/API/email intake here before enabling live inquiry submission.
    void submission;

    setMissingFields([]);
    setIsSuccess(true);
    setStatus(successMessage);
  }

  function hasError(name: RequiredProblemField) {
    return missingFields.includes(name);
  }

  return (
    <div className="grid gap-3">
      <form className="grid items-start gap-4 rounded-lg border border-line bg-white p-5 shadow-soft sm:grid-cols-2 sm:p-6" onSubmit={handleSubmit} noValidate>
        <Field name="fullName" label="Ime i prezime" hasError={hasError("fullName")} />
        <Field name="companyName" label="Naziv firme" hasError={hasError("companyName")} />
        <Field name="email" label="Email" type="email" hasError={hasError("email")} />
        <Field name="phone" label="Telefon" type="tel" optionalText="opcionalno" />
        <Field name="businessType" label="Čime se firma bavi?" hasError={hasError("businessType")} wide />
        <TextArea name="problem" label="Koji problem želite riješiti?" hasError={hasError("problem")} />
        <TextArea name="currentSolution" label="Kako to danas rješavate?" hasError={hasError("currentSolution")} rows={4} />
        <Select
          name="urgency"
          label="Koliko je hitno?"
          hasError={hasError("urgency")}
          options={["Nije hitno", "Treba mi uskoro", "Hitno je"]}
        />
        <Select
          name="solutionType"
          label="Kakvo rješenje tražite?"
          hasError={hasError("solutionType")}
          options={["Samo prijedlog", "Brzi MVP", "Ozbiljniji sustav", "Nisam siguran"]}
        />
        <div className="grid gap-3 sm:col-span-2 sm:flex sm:items-center">
          <button className="min-h-[52px] rounded-lg bg-orange px-6 py-3 text-base font-extrabold text-white shadow-[0_14px_28px_rgba(233,86,22,0.22)] transition hover:-translate-y-px hover:bg-orange-dark" type="submit">
            Pošalji problem
          </button>
          <p className={`m-0 rounded-lg px-3 py-2 text-sm font-bold ${isSuccess ? "bg-teal-soft text-teal-dark" : "text-muted"}`} role="status" aria-live="polite">
            {status}
          </p>
        </div>
      </form>
      <p className="m-0 rounded-lg border border-line bg-white px-4 py-3 text-sm font-semibold leading-6 text-muted">
        U ovoj verziji forma još nije spojena na sustav za zaprimanje upita. Podaci se neće slati dok ne aktiviramo zaprimanje.
      </p>
    </div>
  );
}

type BaseFieldProps = {
  name: keyof ProblemFormData;
  label: string;
  hasError?: boolean;
  wide?: boolean;
};

function ErrorMessage({ name, hasError = false }: { name: keyof ProblemFormData; hasError?: boolean }) {
  return (
    <p className="min-h-5 text-sm font-bold leading-5 text-orange-dark" id={`${name}-error`} aria-hidden={!hasError}>
      {hasError ? "Ovo polje je obavezno." : ""}
    </p>
  );
}

function inputErrorProps(name: keyof ProblemFormData, hasError = false) {
  return {
    "aria-invalid": hasError ? true : undefined,
    "aria-describedby": hasError ? `${name}-error` : undefined,
  };
}

function inputAutoComplete(name: keyof ProblemFormData) {
  if (name === "fullName") return "name";
  if (name === "companyName") return "organization";
  if (name === "email") return "email";
  if (name === "phone") return "tel";
  return undefined;
}

function Field({ name, label, hasError = false, type = "text", wide = false, optionalText }: BaseFieldProps & { optionalText?: string; type?: string }) {
  return (
    <div className={`${fieldWrapperClass} ${wide ? "sm:col-span-2" : ""}`}>
      <label className={labelClass} htmlFor={name}>
        {label}
        {optionalText ? <span className={optionalLabelClass}>{optionalText}</span> : null}
      </label>
      <input
        className={controlClass}
        id={name}
        name={name}
        type={type}
        autoComplete={inputAutoComplete(name)}
        {...inputErrorProps(name, hasError)}
      />
      <ErrorMessage name={name} hasError={hasError} />
    </div>
  );
}

function TextArea({ name, label, hasError, rows = 5 }: BaseFieldProps & { rows?: number }) {
  return (
    <div className={`${fieldWrapperClass} sm:col-span-2`}>
      <label className={labelClass} htmlFor={name}>
        {label}
      </label>
      <textarea
        className={textareaClass}
        id={name}
        name={name}
        rows={rows}
        {...inputErrorProps(name, hasError)}
      />
      <ErrorMessage name={name} hasError={hasError} />
    </div>
  );
}

function Select({ name, label, hasError, options }: BaseFieldProps & { options: string[] }) {
  return (
    <div className={fieldWrapperClass}>
      <label className={labelClass} htmlFor={name}>
        {label}
      </label>
      <select
        className={`${controlClass} bg-white`}
        id={name}
        name={name}
        {...inputErrorProps(name, hasError)}
      >
        <option value="">Odaberite</option>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
      <ErrorMessage name={name} hasError={hasError} />
    </div>
  );
}

export { fieldLabels, requiredProblemFields };
