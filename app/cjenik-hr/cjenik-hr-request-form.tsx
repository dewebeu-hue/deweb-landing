"use client";

import { useState, type FormEvent } from "react";
import {
  cjenikHrCurrentSystems,
  cjenikHrThankYouPackage,
  type CjenikHrCurrentSystem,
  type CjenikHrField,
  type CjenikHrRequestData,
  type CjenikHrRequestType,
  type CjenikHrWooStatus,
  type CjenikHrWordpressStatus,
} from "../../lib/cjenik-hr-request";
import { cjenikHrProduct, formatCjenikHrPrice } from "../../lib/cjenik-hr-product";

const emptyForm: CjenikHrRequestData = {
  requestType: "plugin",
  fullName: "",
  companyName: "",
  email: "",
  domain: "",
  wordpressStatus: "unsure",
  woocommerceStatus: "unsure",
  currentSystem: "unsure",
  note: "",
  website: "",
};

const inputClass = "mt-2 min-h-[48px] w-full rounded-lg border border-[#b8cbd0] bg-white px-3 py-2 text-base text-ink outline-none transition focus:border-teal focus:ring-4 focus:ring-[#d9eeee]";

const systemLabels: Record<CjenikHrCurrentSystem, string> = {
  wordpress: "WordPress",
  woocommerce: "WooCommerce",
  synesis: "Synesis",
  pantheon: "Pantheon",
  minimax: "Minimax",
  shopify: "Shopify",
  prestashop: "PrestaShop",
  custom: "Vlastiti sustav",
  other: "Drugi sustav",
  none: "Nemamo sustav",
  unsure: "Nisam siguran/na",
};

export function CjenikHrRequestForm() {
  const [data, setData] = useState<CjenikHrRequestData>(emptyForm);
  const [errors, setErrors] = useState<CjenikHrField[]>([]);
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  const [compatibilityNote, setCompatibilityNote] = useState("");

  function selectRequestType(type: CjenikHrRequestType) {
    if (data.wordpressStatus === "no" && type !== "other_system") {
      setCompatibilityNote("Plugin radi u WordPressu. Za drugi sustav odaberite procjenu prilagodbe.");
      setData(current => ({ ...current, requestType: "other_system" }));
      return;
    }
    setCompatibilityNote("");
    setData(current => ({ ...current, requestType: type }));
    setErrors(current => current.filter(field => field !== "requestType"));
  }

  function selectWordpressStatus(value: CjenikHrWordpressStatus) {
    if (value === "no" && data.requestType !== "other_system") {
      setData(current => ({ ...current, wordpressStatus: value, requestType: "other_system" }));
      setCompatibilityNote("Za sustav bez WordPressa odabrali smo procjenu prilagodbe za drugi sustav.");
      return;
    }
    setData(current => ({ ...current, wordpressStatus: value }));
    setCompatibilityNote("");
  }

  function update<K extends keyof CjenikHrRequestData>(field: K, value: CjenikHrRequestData[K]) {
    setData(current => ({ ...current, [field]: value }));
    setErrors(current => current.filter(item => item !== field));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setStatus("");
    setErrors([]);
    try {
      const response = await fetch("/api/cjenik-hr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result: { ok?: boolean; error?: string; fields?: CjenikHrField[] } = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) {
        setErrors(result.fields ?? []);
        setStatus(result.error ?? "Upit nije poslan. Pokušajte ponovno.");
        return;
      }
      window.location.assign(`/cjenik-hr/hvala?paket=${cjenikHrThankYouPackage(data.requestType as CjenikHrRequestType)}`);
    } catch {
      setStatus("Upit nije poslan. Provjerite vezu i pokušajte ponovno.");
    } finally {
      setSending(false);
    }
  }

  const hasError = (field: CjenikHrField) => errors.includes(field);

  return (
    <form onSubmit={submit} noValidate className="rounded-2xl border border-[#bfd4d8] bg-white p-5 shadow-[0_20px_55px_rgba(8,42,61,0.10)] sm:p-7">
      <fieldset>
        <legend className="text-base font-black text-ink">Što trebate?</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {([
            ["plugin", "Samo plugin", formatCjenikHrPrice(cjenikHrProduct.pluginPrice)],
            ["setup", "Plugin + postavljanje", formatCjenikHrPrice(cjenikHrProduct.setupPrice)],
            ["other_system", "Drugi sustav", "Procjena"],
          ] as const).map(([value, label, price]) => (
            <label key={value} className={`cursor-pointer rounded-xl border p-4 transition ${data.requestType === value ? "border-teal bg-[#edf8f8] shadow-[inset_0_0_0_1px_#006d7b]" : "border-line bg-white hover:border-[#82b7bd]"}`}>
              <input className="sr-only" type="radio" name="requestType" value={value} checked={data.requestType === value} onChange={() => selectRequestType(value)} />
              <span className="block text-sm font-black text-ink">{label}</span>
              <span className="mt-1 block text-xs font-bold text-teal-dark">{price}</span>
            </label>
          ))}
        </div>
        {hasError("requestType") && <p className="mt-2 text-sm font-bold text-[#a13c12]">Plugin je namijenjen WordPressu; za drugi sustav odaberite procjenu.</p>}
        {compatibilityNote && <p className="mt-3 rounded-lg bg-[#fff5ec] px-3 py-2 text-sm font-bold leading-6 text-[#7d340f]" role="status">{compatibilityNote}</p>}
      </fieldset>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Ime i prezime" required error={hasError("fullName")}>
          <input id="chr-name" name="fullName" autoComplete="name" className={inputClass} value={data.fullName} onChange={event => update("fullName", event.target.value)} aria-invalid={hasError("fullName")} required />
        </Field>
        <Field label="Tvrtka ili obrt">
          <input id="chr-company" name="companyName" autoComplete="organization" className={inputClass} value={data.companyName} onChange={event => update("companyName", event.target.value)} />
        </Field>
        <Field label="Email" required error={hasError("email")}>
          <input id="chr-email" name="email" type="email" autoComplete="email" className={inputClass} value={data.email} onChange={event => update("email", event.target.value)} aria-invalid={hasError("email")} required />
        </Field>
        <Field label={`Domena${data.requestType === "setup" ? " — obavezno za postavljanje" : ""}`} required={data.requestType === "setup"} error={hasError("domain")}>
          <input id="chr-domain" name="domain" inputMode="url" placeholder="primjer.hr" className={inputClass} value={data.domain} onChange={event => update("domain", event.target.value)} aria-invalid={hasError("domain")} required={data.requestType === "setup"} />
        </Field>
        <Field label="Koristite li WordPress?" required error={hasError("wordpressStatus")}>
          <select id="chr-wordpress" name="wordpressStatus" className={inputClass} value={data.wordpressStatus} onChange={event => selectWordpressStatus(event.target.value as CjenikHrWordpressStatus)}>
            <option value="yes">Da</option><option value="no">Ne</option><option value="unsure">Nisam siguran/na</option>
          </select>
        </Field>
        <Field label="Koristite li WooCommerce?" required error={hasError("woocommerceStatus")}>
          <select id="chr-woo" name="woocommerceStatus" className={inputClass} value={data.woocommerceStatus} onChange={event => update("woocommerceStatus", event.target.value as CjenikHrWooStatus)}>
            <option value="yes">Da</option><option value="no">Ne</option><option value="unsure">Nisam siguran/na</option>
          </select>
        </Field>
      </div>

      <Field label="Koji sustav sada koristite?" required error={hasError("currentSystem")}>
        <select id="chr-system" name="currentSystem" className={inputClass} value={data.currentSystem} onChange={event => update("currentSystem", event.target.value as CjenikHrCurrentSystem)}>
          {cjenikHrCurrentSystems.map(value => <option key={value} value={value}>{systemLabels[value]}</option>)}
        </select>
      </Field>

      <Field label="Kratka napomena">
        <textarea id="chr-note" name="note" rows={4} className={`${inputClass} resize-y`} placeholder="Broj prodajnih mjesta, format postojećeg cjenika ili što želite provjeriti." value={data.note} onChange={event => update("note", event.target.value)} />
      </Field>

      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="chr-website">Web-stranica</label>
        <input id="chr-website" name="website" tabIndex={-1} autoComplete="off" value={data.website} onChange={event => update("website", event.target.value)} />
      </div>

      <p className="mt-5 text-xs leading-5 text-muted">Ne šaljite lozinke, pristupne podatke, kartične podatke ni poslovne dokumente. Podatke iz obrasca koristimo samo za odgovor na vaš upit. <a className="font-bold text-teal-dark underline underline-offset-2" href="/privatnost">Politika privatnosti</a>.</p>
      {status && <p className="mt-4 rounded-lg border border-[#e3c5b3] bg-[#fff5ec] px-4 py-3 text-sm font-bold text-[#7d340f]" role="alert">{status}</p>}
      <button type="submit" disabled={sending} className="mt-5 inline-flex min-h-[52px] w-full items-center justify-center rounded-lg bg-teal px-6 py-3 text-sm font-black text-white shadow-[0_12px_25px_rgba(0,77,88,0.17)] transition hover:bg-teal-dark disabled:cursor-wait disabled:opacity-70 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-3 focus-visible:outline-orange-dark">
        {sending ? "Šaljemo…" : "Pošaljite upit za Cjenik HR"}
      </button>
    </form>
  );
}

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: boolean; children: React.ReactNode }) {
  return (
    <label className="mt-4 block text-sm font-extrabold text-ink">
      {label}{required && <span className="ml-1 text-[#a13c12]" aria-hidden="true">*</span>}
      {children}
      {error && <span className="mt-1 block text-xs font-bold text-[#a13c12]">Provjerite ovo polje.</span>}
    </label>
  );
}
