"use client";

import { useMemo, useState, type FormEvent } from "react";
import { cjenikHrCurrentSystems, cjenikHrThankYouPackage, type CjenikHrCurrentSystem, type CjenikHrRequestType, type CjenikHrWooStatus, type CjenikHrWordpressStatus } from "../../lib/cjenik-hr-request";
import { type CjenikHrCustomerType, type CjenikHrOrderField } from "../../lib/cjenik-hr-order";
import { cjenikHrProduct, formatCjenikHrPrice } from "../../lib/cjenik-hr-product";

type FormData = {
  requestId: string; requestType: CjenikHrRequestType; customerType: CjenikHrCustomerType;
  fullName: string; companyName: string; companyOib: string; billingAddress: string;
  postalCode: string; city: string; country: "HR"; email: string; domain: string;
  wordpressStatus: CjenikHrWordpressStatus; woocommerceStatus: CjenikHrWooStatus;
  currentSystem: CjenikHrCurrentSystem; note: string; website: string;
};

const inputClass = "mt-2 min-h-[48px] w-full rounded-lg border border-[#b8cbd0] bg-white px-3 py-2 text-base text-ink outline-none transition focus:border-teal focus:ring-4 focus:ring-[#d9eeee]";
const systemLabels: Record<CjenikHrCurrentSystem, string> = {
  wordpress: "WordPress", woocommerce: "WooCommerce", synesis: "Synesis", pantheon: "Pantheon",
  minimax: "Minimax", shopify: "Shopify", prestashop: "PrestaShop", custom: "Vlastiti sustav",
  other: "Drugi sustav", none: "Nemamo sustav", unsure: "Nisam siguran/na",
};

function createRequestId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID().replaceAll("-", "");
  return `${Date.now()}_${Math.random().toString(36).slice(2)}_${Math.random().toString(36).slice(2)}`;
}

function initialForm(): FormData {
  return {
    requestId: createRequestId(), requestType: "plugin", customerType: "business", fullName: "", companyName: "",
    companyOib: "", billingAddress: "", postalCode: "", city: "", country: "HR", email: "", domain: "",
    wordpressStatus: "unsure", woocommerceStatus: "unsure", currentSystem: "unsure", note: "", website: "",
  };
}

export function CjenikHrRequestForm({ isPreview = false }: { isPreview?: boolean }) {
  const [data, setData] = useState<FormData>(() => initialForm());
  const [step, setStep] = useState<1 | 2>(1);
  const [errors, setErrors] = useState<string[]>([]);
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  const [compatibilityNote, setCompatibilityNote] = useState("");
  const isStandardOrder = data.requestType !== "other_system";
  const packagePrice = data.requestType === "setup" ? cjenikHrProduct.setupPrice : cjenikHrProduct.pluginPrice;
  const progressLabel = useMemo(() => `Korak ${step} od 2`, [step]);

  function update<K extends keyof FormData>(field: K, value: FormData[K]) {
    setData(current => ({ ...current, [field]: value }));
    setErrors(current => current.filter(item => item !== field));
  }

  function selectRequestType(type: CjenikHrRequestType) {
    if (data.wordpressStatus === "no" && type !== "other_system") {
      setCompatibilityNote("Plugin radi u WordPressu. Za drugi sustav odaberite procjenu prilagodbe.");
      update("requestType", "other_system");
      return;
    }
    setCompatibilityNote("");
    update("requestType", type);
  }

  function selectWordpressStatus(value: CjenikHrWordpressStatus) {
    update("wordpressStatus", value);
    if (value === "no" && data.requestType !== "other_system") {
      update("requestType", "other_system");
      setCompatibilityNote("Za sustav bez WordPressa odabrali smo ručnu procjenu za drugi sustav.");
    } else setCompatibilityNote("");
  }

  function goToDetails() {
    if (!data.requestType) return setErrors(["requestType"]);
    setErrors([]); setStatus(""); setStep(2);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step === 1) return goToDetails();
    setSending(true); setStatus(""); setErrors([]);
    try {
      const response = await fetch(isStandardOrder ? "/api/cjenik-hr/checkout" : "/api/cjenik-hr", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": data.requestId },
        body: JSON.stringify(data),
      });
      const result: { ok?: boolean; error?: string; fields?: CjenikHrOrderField[]; accepted?: boolean; publicOrderToken?: string; checkoutUrl?: string } = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) {
        setErrors(result.fields ?? []);
        setStatus(result.error ?? "Zahtjev nije poslan. Pokušajte ponovno.");
        return;
      }
      sessionStorage.setItem("cjenikHrLastAccepted", result.accepted ? "yes" : "lead");
      if (result.publicOrderToken) sessionStorage.setItem("cjenikHrOrderToken", result.publicOrderToken);
      if (isStandardOrder && result.checkoutUrl) {
        window.location.assign(result.checkoutUrl);
        return;
      }
      window.location.assign(`/cjenik-hr/hvala?paket=${cjenikHrThankYouPackage(data.requestType)}`);
    } catch {
      setStatus("Zahtjev nije poslan. Provjerite vezu i pokušajte ponovno.");
    } finally { setSending(false); }
  }

  const hasError = (field: string) => errors.includes(field);

  return (
    <form onSubmit={submit} noValidate className="rounded-2xl border border-[#bfd4d8] bg-white p-5 shadow-[0_20px_55px_rgba(8,42,61,0.10)] sm:p-7">
      <div className="flex items-center justify-between gap-4 border-b border-line pb-4">
        <p className="text-sm font-black text-ink">{progressLabel}</p>
        <div className="flex gap-1" aria-hidden="true"><span className="h-2 w-10 rounded-full bg-teal" /><span className={`h-2 w-10 rounded-full ${step === 2 ? "bg-teal" : "bg-[#dbe7e9]"}`} /></div>
      </div>

      {step === 1 ? <>
        <fieldset className="mt-5">
          <legend className="text-base font-black text-ink">Odaberite paket</legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {([[
              "plugin", "Samo plugin", formatCjenikHrPrice(cjenikHrProduct.pluginPrice),
            ], ["setup", "Plugin + postavljanje", formatCjenikHrPrice(cjenikHrProduct.setupPrice)], ["other_system", "Drugi sustav", "Ručna procjena"]] as const).map(([value, label, price]) => (
              <label key={value} className={`cursor-pointer rounded-xl border p-4 transition ${data.requestType === value ? "border-teal bg-[#edf8f8] shadow-[inset_0_0_0_1px_#006d7b]" : "border-line hover:border-[#82b7bd]"}`}>
                <input className="sr-only" type="radio" name="requestType" value={value} checked={data.requestType === value} onChange={() => selectRequestType(value)} />
                <span className="block text-sm font-black text-ink">{label}</span><span className="mt-1 block text-xs font-bold text-teal-dark">{price}</span>
              </label>
            ))}
          </div>
        </fieldset>
        {isStandardOrder && <fieldset className="mt-6"><legend className="text-base font-black text-ink">Kupac je</legend><div className="mt-3 grid grid-cols-2 gap-3">{(["business", "consumer"] as const).map(value => <label key={value} className={`cursor-pointer rounded-xl border p-4 text-sm font-black ${data.customerType === value ? "border-teal bg-[#edf8f8]" : "border-line"}`}><input className="sr-only" type="radio" checked={data.customerType === value} onChange={() => update("customerType", value)} /><span>{value === "business" ? "Tvrtka ili obrt" : "Fizička osoba"}</span></label>)}</div></fieldset>}
        <p className="mt-5 rounded-lg bg-[#f5f9fa] px-4 py-3 text-sm leading-6 text-muted">{isStandardOrder ? isPreview ? `Cijena paketa je ${formatCjenikHrPrice(packagePrice)}. Slijedi sigurno testno plaćanje preko Stripea; nema stvarne naplate.` : `Cijena paketa je ${formatCjenikHrPrice(packagePrice)}. Nakon provjere podataka priprema se ponuda; ovo nije trenutna kupnja.` : "Drugi sustav ostaje ručni upit bez automatske ponude, naplate ili isporuke."}</p>
        <button type="submit" className="mt-5 inline-flex min-h-[52px] w-full items-center justify-center rounded-lg bg-teal px-6 text-sm font-black text-white hover:bg-teal-dark focus-visible:outline focus-visible:outline-4 focus-visible:outline-orange-dark">Nastavite na podatke</button>
      </> : <>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-widest text-teal-dark">{isStandardOrder ? isPreview ? "TEST PLAĆANJE" : "Podatci za ponudu" : "Podatci za upit"}</p><p className="mt-1 text-sm text-muted">Hrvatska je trenutačno jedina podržana država naplate.</p></div><button type="button" onClick={() => setStep(1)} className="min-h-11 text-sm font-black text-teal-dark underline underline-offset-4">Promijenite paket</button></div>
        <div className="grid gap-x-4 sm:grid-cols-2">
          <Field label={data.customerType === "business" && isStandardOrder ? "Kontakt osoba" : "Ime i prezime"} required error={hasError("fullName")}><input name="fullName" autoComplete="name" className={inputClass} value={data.fullName} onChange={e => update("fullName", e.target.value)} aria-invalid={hasError("fullName")} /></Field>
          {(data.customerType === "business" || !isStandardOrder) && <Field label="Tvrtka ili obrt" required={isStandardOrder} error={hasError("companyName")}><input name="companyName" autoComplete="organization" className={inputClass} value={data.companyName} onChange={e => update("companyName", e.target.value)} aria-invalid={hasError("companyName")} /></Field>}
          {data.customerType === "business" && isStandardOrder && <Field label="OIB tvrtke ili obrta" required error={hasError("companyOib")}><input name="companyOib" inputMode="numeric" pattern="[0-9]{11}" maxLength={11} className={inputClass} value={data.companyOib} onChange={e => update("companyOib", e.target.value.replace(/\D/g, "").slice(0, 11))} aria-invalid={hasError("companyOib")} /></Field>}
          <Field label="Email" required error={hasError("email")}><input name="email" type="email" autoComplete="email" className={inputClass} value={data.email} onChange={e => update("email", e.target.value)} aria-invalid={hasError("email")} /></Field>
          {isStandardOrder && <><Field label="Adresa za ponudu" required error={hasError("billingAddress")}><input name="billingAddress" autoComplete="street-address" className={inputClass} value={data.billingAddress} onChange={e => update("billingAddress", e.target.value)} aria-invalid={hasError("billingAddress")} /></Field><Field label="Poštanski broj" required error={hasError("postalCode")}><input name="postalCode" inputMode="numeric" autoComplete="postal-code" maxLength={5} className={inputClass} value={data.postalCode} onChange={e => update("postalCode", e.target.value.replace(/\D/g, "").slice(0, 5))} aria-invalid={hasError("postalCode")} /></Field><Field label="Grad" required error={hasError("city")}><input name="city" autoComplete="address-level2" className={inputClass} value={data.city} onChange={e => update("city", e.target.value)} aria-invalid={hasError("city")} /></Field><Field label="Država" required><input name="country" className={`${inputClass} bg-[#f5f9fa]`} value="Hrvatska" readOnly /></Field></>}
          <Field label={`Domena${data.requestType === "setup" ? " — obavezno" : ""}`} required={data.requestType === "setup"} error={hasError("domain")}><input name="domain" inputMode="url" placeholder="primjer.hr" className={inputClass} value={data.domain} onChange={e => update("domain", e.target.value)} aria-invalid={hasError("domain")} /></Field>
          <Field label="Koristite li WordPress?" required error={hasError("wordpressStatus")}><select name="wordpressStatus" className={inputClass} value={data.wordpressStatus} onChange={e => selectWordpressStatus(e.target.value as CjenikHrWordpressStatus)}><option value="yes">Da</option><option value="no">Ne</option><option value="unsure">Nisam siguran/na</option></select></Field>
          <Field label="Koristite li WooCommerce?" required error={hasError("woocommerceStatus")}><select name="woocommerceStatus" className={inputClass} value={data.woocommerceStatus} onChange={e => update("woocommerceStatus", e.target.value as CjenikHrWooStatus)}><option value="yes">Da</option><option value="no">Ne</option><option value="unsure">Nisam siguran/na</option></select></Field>
          <Field label="Koji sustav sada koristite?" required error={hasError("currentSystem")}><select name="currentSystem" className={inputClass} value={data.currentSystem} onChange={e => update("currentSystem", e.target.value as CjenikHrCurrentSystem)}>{cjenikHrCurrentSystems.map(value => <option key={value} value={value}>{systemLabels[value]}</option>)}</select></Field>
        </div>
        {compatibilityNote && <p className="mt-3 rounded-lg bg-[#fff5ec] px-3 py-2 text-sm font-bold leading-6 text-[#7d340f]" role="status">{compatibilityNote}</p>}
        <Field label="Kratka napomena"><textarea name="note" rows={4} className={`${inputClass} resize-y`} placeholder="Broj prodajnih mjesta, format postojećeg cjenika ili što želite provjeriti." value={data.note} onChange={e => update("note", e.target.value)} /></Field>
        <div className="absolute -left-[9999px]" aria-hidden="true"><label htmlFor="chr-website">Web-stranica</label><input id="chr-website" name="website" tabIndex={-1} autoComplete="off" value={data.website} onChange={e => update("website", e.target.value)} /></div>
        <p className="mt-5 text-xs leading-5 text-muted">Ne šaljite lozinke, pristupne podatke, kartične podatke ni poslovne dokumente. Za kartično plaćanje preusmjeravamo vas na Stripe; deweb ne prima niti sprema puni broj kartice ili CVC. <a className="font-bold text-teal-dark underline underline-offset-2" href="/privatnost">Politika privatnosti</a>.</p>
        {status && <p className="mt-4 rounded-lg border border-[#e3c5b3] bg-[#fff5ec] px-4 py-3 text-sm font-bold text-[#7d340f]" role="alert">{status}</p>}
        <button type="submit" disabled={sending} className="mt-5 inline-flex min-h-[52px] w-full items-center justify-center rounded-lg bg-teal px-6 text-sm font-black text-white shadow-[0_12px_25px_rgba(0,77,88,0.17)] transition hover:bg-teal-dark disabled:cursor-wait disabled:opacity-70 focus-visible:outline focus-visible:outline-4 focus-visible:outline-orange-dark">{sending ? "Šaljemo…" : isStandardOrder ? isPreview ? data.requestType === "setup" ? "Testiraj kupnju s postavljanjem — 79 €" : "Testiraj kupnju — 39 €" : "Zatražite ponudu" : "Pošaljite upit"}</button>
      </>}
    </form>
  );
}

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: boolean; children: React.ReactNode }) {
  return <label className="mt-4 block text-sm font-extrabold text-ink">{label}{required && <span className="ml-1 text-[#a13c12]" aria-hidden="true">*</span>}{children}{error && <span className="mt-1 block text-xs font-bold text-[#a13c12]">Provjerite ovo polje.</span>}</label>;
}
