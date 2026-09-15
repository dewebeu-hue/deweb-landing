"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { webshopPriceConfig } from "../../../lib/webshop-price-config";
import {
  catalogLabels, contentLabels, emptyAnswers, estimateWebshop, projectLabels,
  requirementsSummary, specialLabels, type AnswerField, type Answers, type SpecialNeed,
} from "../../../lib/webshop-price";

type Option = { value: string; label: string };
const fieldClass = "min-w-0 rounded-lg border border-line bg-white p-4 transition hover:border-teal focus-within:border-teal focus-within:ring-4 focus-within:ring-teal/15 has-[:checked]:border-teal has-[:checked]:bg-teal-soft";
const radioClass = "mt-1 h-5 w-5 shrink-0 accent-teal focus-visible:outline focus-visible:outline-4 focus-visible:outline-orange";

function RadioQuestion({ number, title, hint, name, options, value, error, onChange }: {
  number: string; title: string; hint: string; name: AnswerField; options: Option[]; value: string;
  error?: string; onChange: (value: string) => void;
}) {
  return (
    <fieldset className="min-w-0 border-t border-line py-7" aria-describedby={error ? `${name}-error` : undefined} aria-invalid={error ? true : undefined}>
      <legend className="text-lg font-black text-ink"><span className="mr-3 text-sm text-teal-dark">{number}</span>{title}</legend>
      <p className="mt-2 text-sm leading-6 text-muted">{hint}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {options.map(option => (
          <label key={option.value} className={`${fieldClass} flex min-h-14 cursor-pointer items-start gap-3 text-sm font-bold leading-6 text-ink`}>
            <input className={radioClass} type="radio" name={name} value={option.value} checked={value === option.value} onChange={() => onChange(option.value)} />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
      {error && <p id={`${name}-error`} className="mt-3 text-sm font-bold text-orange-dark" role="alert">{error}</p>}
    </fieldset>
  );
}

export function WebshopCalculator() {
  const [answers, setAnswers] = useState<Answers>(emptyAnswers);
  const [attempted, setAttempted] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);
  const estimate = estimateWebshop(answers, webshopPriceConfig);
  const errors = attempted ? estimate.errors : {};
  const complete = estimate.status === "manual" || estimate.status === "pricing_unavailable" || estimate.status === "priced";

  function update<K extends keyof Answers>(name: K, value: Answers[K]) {
    setAnswers(previous => ({ ...previous, [name]: value }));
    setCopyStatus("");
  }
  function toggleNeed(need: SpecialNeed) {
    update("specialNeeds", answers.specialNeeds.includes(need) ? answers.specialNeeds.filter(item => item !== need) : [...answers.specialNeeds, need]);
  }
  function showResult() {
    setAttempted(true);
    if (complete) requestAnimationFrame(() => resultRef.current?.focus());
    else {
      const firstError = Object.keys(estimate.errors)[0] as AnswerField | undefined;
      if (firstError) window.setTimeout(() => document.querySelector<HTMLInputElement>(`input[name="${firstError}"]`)?.focus(), 80);
    }
  }
  async function copySummary() {
    try {
      await navigator.clipboard.writeText(requirementsSummary(estimate));
      setCopyStatus("Sažetak je kopiran. Zalijepite ga u opis problema u obrascu.");
    } catch {
      setCopyStatus("Kopiranje nije uspjelo. Označite i kopirajte sažetak ispod.");
    }
  }

  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,.9fr)] lg:items-start lg:gap-10">
      <section aria-labelledby="questions-title" className="min-w-0 rounded-xl border border-line bg-white p-5 shadow-soft sm:p-8">
        <h2 id="questions-title" className="m-0 text-2xl font-black">Vaši zahtjevi</h2>
        <p className="mt-2 text-sm leading-6 text-muted">Kontaktni podaci nisu potrebni za ovaj pregled.</p>
        <RadioQuestion number="01" title="Što trebate?" hint="Odaberite novi webshop ili redizajn postojećeg." name="projectType" options={Object.entries(projectLabels).map(([value, label]) => ({ value, label }))} value={answers.projectType} error={errors.projectType} onChange={value => update("projectType", value as Answers["projectType"])} />
        <RadioQuestion number="02" title="Koliko proizvoda planirate pri pokretanju?" hint="Rasponi služe za opis zahtjeva; granice cjenovnih paketa nisu odobrene." name="catalogSize" options={Object.entries(catalogLabels).map(([value, label]) => ({ value, label }))} value={answers.catalogSize} error={errors.catalogSize} onChange={value => update("catalogSize", value as Answers["catalogSize"])} />
        <RadioQuestion number="03" title="Kako ćete unijeti proizvode i sadržaj?" hint="Odaberite najbliži odgovor; detalje ćete moći razjasniti kasnije." name="contentSupport" options={Object.entries(contentLabels).map(([value, label]) => ({ value, label }))} value={answers.contentSupport} error={errors.contentSupport} onChange={value => update("contentSupport", value as Answers["contentSupport"])} />
        <RadioQuestion number="04" title="Trebate li poseban način prodaje?" hint="Posebne zahtjeve možete označiti u sljedećem koraku." name="specialMode" options={[{ value: "standard", label: "Ne, standardna kupnja" }, { value: "custom", label: "Da, imam posebne zahtjeve" }, { value: "unknown", label: "Nisam siguran/sigurna" }]} value={answers.specialMode} error={errors.specialMode} onChange={value => setAnswers(previous => ({ ...previous, specialMode: value as Answers["specialMode"], specialNeeds: value === "custom" ? previous.specialNeeds : [] }))} />
        {answers.specialMode === "custom" && <fieldset className="min-w-0 border-t border-line py-7" aria-describedby={errors.specialNeeds ? "specialNeeds-error" : undefined} aria-invalid={errors.specialNeeds ? true : undefined}>
          <legend className="text-lg font-black">Što vam treba dodatno?</legend>
          <p className="mt-2 text-sm leading-6 text-muted">Odaberite sve što odgovara. Ti zahtjevi traže zaseban razgovor o opsegu.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">{Object.entries(specialLabels).map(([value, label]) => <label key={value} className={`${fieldClass} flex min-h-14 cursor-pointer items-start gap-3 text-sm font-bold leading-6`}><input className={radioClass} type="checkbox" name="specialNeeds" checked={answers.specialNeeds.includes(value as SpecialNeed)} onChange={() => toggleNeed(value as SpecialNeed)} /><span>{label}</span></label>)}</div>
          {errors.specialNeeds && <p id="specialNeeds-error" className="mt-3 text-sm font-bold text-orange-dark" role="alert">{errors.specialNeeds}</p>}
        </fieldset>}
        <button type="button" onClick={showResult} className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-orange px-6 py-3 font-extrabold text-white outline-offset-4 transition hover:bg-orange-dark focus-visible:outline focus-visible:outline-4 focus-visible:outline-teal-dark sm:w-auto">Prikaži pregled zahtjeva</button>
      </section>

      <section aria-labelledby="result-title" className="min-w-0 rounded-xl border border-line bg-[#f4f9fb] p-5 sm:p-8">
        <p className="m-0 text-xs font-black uppercase tracking-[.14em] text-teal-dark">Vaš pregled</p>
        <h2 id="result-title" className="mt-3 text-2xl font-black">Opseg i procjena</h2>
        {estimate.summary.length > 0 ? <ul className="mt-5 grid gap-3">{estimate.summary.map(line => <li key={line} className="rounded-lg border border-line bg-white px-4 py-3 text-sm font-semibold leading-6">{line}</li>)}</ul> : <p className="mt-4 leading-7 text-muted">Odgovorite na pitanja za prikaz opsega.</p>}
        <div ref={resultRef} tabIndex={-1} className="mt-6 border-t border-line pt-6 outline-none focus-visible:ring-4 focus-visible:ring-orange/30" aria-live="polite">
          {!complete && <p className="m-0 leading-7 text-muted">Dovršite pitanja kako biste vidjeli stanje procjene. Neodabrani odgovori nisu pretpostavljeni.</p>}
          {estimate.status === "pricing_unavailable" && <div><p className="m-0 text-lg font-black text-ink">Cijena trenutačno nije dostupna</p><p className="mt-2 leading-7 text-muted">Cjenik, opseg i porezni prikaz još nisu odobreni. To ne znači da vaš projekt nužno traži individualnu procjenu.</p></div>}
          {estimate.status === "manual" && <div><p className="m-0 text-lg font-black text-ink">Za ove zahtjeve potreban je razgovor</p><ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-muted">{estimate.reasons.map(reason => <li key={reason}>{reason}</li>)}</ul><p className="mt-3 text-sm leading-6 text-muted">Cjenik u ovoj razvojnoj verziji također nije odobren.</p></div>}
          {estimate.status === "priced" && estimate.range && <div><p className="m-0 text-lg font-black">Okvirna jednokratna izrada</p><p className="mt-2 text-2xl font-black text-teal-dark">{new Intl.NumberFormat("hr-HR", { style: "currency", currency: "EUR" }).format(estimate.range.min / 100)} – {new Intl.NumberFormat("hr-HR", { style: "currency", currency: "EUR" }).format(estimate.range.max / 100)}</p><p className="mt-2 text-sm text-muted">{estimate.taxDisplay} · Konačna ponuda nakon provjere zahtjeva.</p></div>}
        </div>
        <div className="mt-6 border-t border-line pt-6"><h3 className="text-base font-black">Tekući i vanjski troškovi</h3><p className="mt-2 text-sm leading-6 text-muted">U ovoj verziji nisu definirani ni uključeni u izračun. Potrebno ih je potvrditi zasebno.</p></div>
        {complete && <div className="mt-6 border-t border-line pt-6"><h3 className="text-base font-black">Sažetak za ponudu</h3><pre className="mt-3 whitespace-pre-wrap break-words rounded-lg border border-line bg-white p-4 font-sans text-sm leading-6 text-ink">{requirementsSummary(estimate)}</pre><button type="button" onClick={copySummary} className="mt-4 min-h-12 rounded-lg border border-teal px-5 py-3 font-extrabold text-teal-dark outline-offset-4 hover:bg-teal-soft focus-visible:outline focus-visible:outline-4 focus-visible:outline-orange">Kopiraj sažetak</button><p className="mt-2 min-h-5 text-sm text-muted" role="status" aria-live="polite">{copyStatus}</p><p className="mt-4 text-sm leading-6 text-muted">Za slanje otvorite postojeći obrazac i zalijepite sažetak u polje za opis problema. Ovaj alat ništa nije poslao.</p><Link href="/#problem-form" className="mt-4 inline-flex min-h-12 items-center justify-center rounded-lg bg-orange px-5 py-3 text-center font-extrabold text-white outline-offset-4 hover:bg-orange-dark focus-visible:outline focus-visible:outline-4 focus-visible:outline-teal-dark">Zatraži ponudu prema ovom izračunu</Link></div>}
      </section>
    </div>
  );
}
