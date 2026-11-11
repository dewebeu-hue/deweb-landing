"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { projectSelectionHref } from "../../../lib/project-selection";
import type { PriceConfig, SpecialNeed } from "../../../lib/webshop-price-config";
import {
  catalogLabels, contentLabels, contentScope, emptyAnswers, estimateWebshop, formatWebshopRange,
  projectLabels, projectScope, requirementsSummary, specialLabels, specialScope,
  type AnswerField, type Answers,
} from "../../../lib/webshop-price";

type Option = { value: string; label: string; detail?: string };
const optionClass = "flex min-h-14 min-w-0 cursor-pointer items-start gap-3 rounded-lg border border-line bg-white px-3.5 py-3 transition-colors duration-150 hover:border-teal focus-within:border-teal has-[:checked]:border-teal has-[:checked]:bg-teal-soft motion-reduce:transition-none";
const controlClass = "mt-0.5 h-5 w-5 shrink-0 accent-teal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-dark";
const actionClass = "inline-flex min-h-12 items-center justify-center rounded-lg bg-teal px-5 py-3 text-center font-extrabold text-white transition-colors duration-150 hover:bg-teal-dark focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-3 focus-visible:outline-orange-dark motion-reduce:transition-none";

function RadioQuestion({ title, hint, name, options, value, error, onChange }: {
  title: string; hint?: string; name: AnswerField; options: Option[]; value: string;
  error?: string; onChange: (value: string) => void;
}) {
  return (
    <fieldset className="min-w-0" aria-describedby={error ? `${name}-error` : undefined} aria-invalid={Boolean(error)}>
      <legend className="text-lg font-black text-ink">{title}</legend>
      {hint && <p className="mt-1 text-sm leading-6 text-muted">{hint}</p>}
      <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
        {options.map(option => (
          <label key={option.value} className={optionClass}>
            <input className={controlClass} type="radio" name={name} value={option.value} checked={value === option.value} onChange={() => onChange(option.value)} />
            <span className="min-w-0 text-sm leading-5">
              <span className="block font-bold text-ink">{option.label}</span>
              {option.detail && <span className="mt-1 block text-muted">{option.detail}</span>}
            </span>
          </label>
        ))}
      </div>
      {error && <p id={`${name}-error`} className="mt-3 text-sm font-bold text-orange-dark" role="alert">{error}</p>}
    </fieldset>
  );
}

const projectOptions = Object.entries(projectLabels).map(([value, label]) => ({ value, label, detail: projectScope[value as keyof typeof projectScope] }));
const catalogOptions = Object.entries(catalogLabels).map(([value, label]) => ({ value, label }));
const contentOptions = Object.entries(contentLabels).map(([value, label]) => ({ value, label, detail: contentScope[value as keyof typeof contentScope] }));
const specialModes = [
  { value: "standard", label: "Standardna kupnja" },
  { value: "custom", label: "Trebam dodatne funkcije" },
  { value: "unknown", label: "Još ne znam" },
];

export function WebshopCalculator({ config }: { config: PriceConfig }) {
  const [answers, setAnswers] = useState<Answers>(emptyAnswers);
  const [attempted, setAttempted] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);
  const estimate = estimateWebshop(answers, config);
  const errors = attempted ? estimate.errors : {};
  const complete = estimate.status === "manual" || estimate.status === "pricing_unavailable" || estimate.status === "priced";
  const showResult = attempted && complete;
  const actionLabel = config.approval === "draft" ? "Prikaži pregled" : "Izračunaj okvirnu cijenu";

  function update<K extends keyof Answers>(name: K, value: Answers[K]) {
    setAnswers(previous => ({ ...previous, [name]: value }));
    setCopyStatus("");
  }
  function toggleNeed(need: SpecialNeed) {
    setAnswers(previous => ({
      ...previous,
      specialNeeds: previous.specialNeeds.includes(need)
        ? previous.specialNeeds.filter(item => item !== need)
        : [...previous.specialNeeds, need],
    }));
    setCopyStatus("");
  }
  function submitEstimate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttempted(true);
    if (complete) {
      requestAnimationFrame(() => resultRef.current?.focus());
    } else {
      const firstError = Object.keys(estimate.errors)[0] as AnswerField | undefined;
      if (firstError) event.currentTarget.querySelector<HTMLInputElement>(`input[name="${firstError}"]`)?.focus();
    }
  }
  async function copySummary() {
    try {
      await navigator.clipboard.writeText(requirementsSummary(estimate));
      setCopyStatus("Sažetak je kopiran.");
    } catch {
      setCopyStatus("Otvorite sažetak i kopirajte ga ručno.");
    }
  }

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,.8fr)] lg:items-start lg:gap-8">
      <form aria-labelledby="questions-title" onSubmit={submitEstimate} className="min-w-0 rounded-xl border border-line bg-white p-5 sm:p-7">
        <h2 id="questions-title" className="text-2xl font-black">Vaši zahtjevi</h2>
        <div className="mt-6 space-y-7">
          <RadioQuestion title="Što trebate?" name="projectType" options={projectOptions} value={answers.projectType} error={errors.projectType} onChange={value => update("projectType", value as Answers["projectType"])} />
          <RadioQuestion title="Koliko proizvoda planirate pri pokretanju?" hint="Veličine i boje istog artikla računajte kao jedan proizvod." name="catalogSize" options={catalogOptions} value={answers.catalogSize} error={errors.catalogSize} onChange={value => update("catalogSize", value as Answers["catalogSize"])} />
          <RadioQuestion title="Kako ćemo unijeti proizvode?" name="contentSupport" options={contentOptions} value={answers.contentSupport} error={errors.contentSupport} onChange={value => update("contentSupport", value as Answers["contentSupport"])} />
          <RadioQuestion title="Trebate li dodatne funkcije?" name="specialMode" options={specialModes} value={answers.specialMode} error={errors.specialMode} onChange={value => {
            setAnswers(previous => ({ ...previous, specialMode: value as Answers["specialMode"], specialNeeds: value === "custom" ? previous.specialNeeds : [] }));
            setCopyStatus("");
          }} />
          {answers.specialMode === "custom" && (
            <fieldset className="min-w-0" aria-describedby={errors.specialNeeds ? "specialNeeds-error" : undefined} aria-invalid={Boolean(errors.specialNeeds)}>
              <legend className="text-lg font-black">Što želite dodati?</legend>
              <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                {(Object.keys(specialLabels) as SpecialNeed[]).map(need => {
                  const range = need === "bespoke" ? undefined : config.special[need];
                  return (
                    <label key={need} className={optionClass}>
                      <input className={controlClass} type="checkbox" name="specialNeeds" checked={answers.specialNeeds.includes(need)} onChange={() => toggleNeed(need)} />
                      <span className="min-w-0 text-sm leading-5">
                        <span className="block font-bold">{specialLabels[need]}</span>
                        <span className="mt-1 block text-muted">{specialScope[need]}</span>
                        {range && <span className="mt-1 block font-bold text-teal-dark">+{formatWebshopRange(range)}</span>}
                      </span>
                    </label>
                  );
                })}
              </div>
              {errors.specialNeeds && <p id="specialNeeds-error" className="mt-3 text-sm font-bold text-orange-dark" role="alert">{errors.specialNeeds}</p>}
            </fieldset>
          )}
        </div>
        <button type="submit" className={`${actionClass} mt-7 w-full sm:w-auto`}>{actionLabel}</button>
      </form>

      <section aria-labelledby="result-title" className="min-w-0 rounded-xl bg-[#edf6f7] p-5 sm:p-7 lg:sticky lg:top-6">
        <h2 id="result-title" className="text-2xl font-black">Vaša procjena</h2>
        <div ref={resultRef} tabIndex={-1} className="mt-4 scroll-mt-6 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-teal" aria-live="polite">
          {!showResult && <p className="leading-7 text-teal-dark">Odgovorite na pitanja za pregled stavki i procjene.</p>}
          {showResult && estimate.status === "pricing_unavailable" && <p className="leading-7 text-teal-dark">Pošaljite sažetak zahtjeva za ponudu.</p>}
          {showResult && estimate.status === "manual" && (
            <>
              <h3 className="text-lg font-black">Procjena nakon pregleda zahtjeva</h3>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-6 text-teal-dark">
                {estimate.reasons.map(reason => <li key={reason}>{reason}</li>)}
              </ul>
            </>
          )}
          {showResult && estimate.status === "priced" && estimate.range && (
            <>
              <p className="text-sm font-bold text-teal-dark">Okvirna cijena jednokratne izrade</p>
              <p className="mt-1 text-[clamp(1.75rem,4vw,2.65rem)] font-black leading-tight tracking-[-0.03em] tabular-nums">{formatWebshopRange(estimate.range)}</p>
              <dl className="mt-5 space-y-2.5">
                {estimate.items?.map(({ label, range }) => (
                  <div key={label} className="grid grid-cols-[1fr_auto] items-baseline gap-3 text-sm leading-5">
                    <dt>{label}</dt>
                    <dd className="whitespace-nowrap text-right font-bold tabular-nums">{formatWebshopRange(range)}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 text-sm leading-6 text-teal-dark">{estimate.taxDisplay} Konačna ponuda slijedi nakon provjere zahtjeva.</p>
            </>
          )}
        </div>
        <div className="mt-6 border-t border-teal/20 pt-4">
          <h3 className="font-black">Troškovi izvan izrade</h3>
          <p className="mt-1 text-sm leading-6 text-teal-dark">Domena, hosting, licence, certifikati, naknade za plaćanje i dostavu te održavanje ugovaraju se zasebno.</p>
        </div>
        {showResult && (
          <div className="mt-6 border-t border-teal/20 pt-4">
            <details>
              <summary className="cursor-pointer py-2 text-sm font-bold text-teal-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-dark">Sažetak za ponudu</summary>
              <pre className="mt-2 whitespace-pre-wrap break-words rounded-lg bg-white p-3 font-sans text-sm leading-6">{requirementsSummary(estimate)}</pre>
            </details>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
              <Link href={projectSelectionHref("shop")} className={actionClass}>Zatraži ponudu</Link>
              <button type="button" onClick={copySummary} className="min-h-11 text-sm font-bold text-teal-dark underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-dark">Kopiraj sažetak</button>
            </div>
            <p className="mt-3 text-sm leading-6 text-teal-dark">Sažetak možete zalijepiti u opis projekta u obrascu.</p>
            <p className="text-sm leading-6 text-teal-dark" role="status">{copyStatus}</p>
          </div>
        )}
      </section>
    </div>
  );
}
