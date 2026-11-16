"use client";

import { useEffect, useRef, useState, type FormEvent, type MouseEvent } from "react";
import Link from "next/link";
import { amountCheckLabel, assessResults, formatResults, obligations, statusLabels, type Guidance, type ResultRow } from "../../../lib/sidrene-cijene";
import { ASSESSMENT_PERIOD, consultationReports, offerName as nameOf, questions, selected, selects, sources, websiteDomain, websiteTypes, type Answers, type Offer, type QuestionId, type WebsiteType } from "../../../lib/sidrene-cijene-podaci";
import styles from "./upitnik.module.css";

const steps = ["Kupci i ponuda", "Gdje prodajete i oglašavate", "Roba i cijene", "Ranije cijene i popusti"];
const primary = `${styles.press} inline-flex min-h-12 items-center justify-center rounded-lg bg-teal-dark px-5 py-2.5 text-center text-sm font-bold text-white hover:bg-teal`;
const secondary = `${styles.press} inline-flex min-h-11 items-center justify-center rounded-lg border border-line bg-white px-4 py-2 text-center text-sm font-bold text-teal-dark hover:bg-teal-soft`;
const link = "inline-flex min-h-11 items-center text-sm font-bold text-teal-dark underline decoration-teal/40 underline-offset-4 hover:decoration-teal-dark";
const statusStyle = { applies: "bg-teal-soft text-teal-dark", outside: "bg-slate-100 text-slate-700", check: "bg-[#fff0dc] text-[#7b3c09]" };
const singular: QuestionId[] = ["legacy", "unit", "prior", "proof", "discountProof"];
const sole = ["none", "unknown", "standard"];
const prompts: Partial<Record<QuestionId, string>> = {
  buyers: "Ako građanima i tvrtkama nudite različite cijene, dodajte ih kao dvije ponude.",
  goods: "Primjer za majicu: „Nova” i „Na komad, bez pakiranja”.",
  website: "Ako imate samo Instagram, Facebook ili stranicu na tuđoj platformi, odaberite „Nemam vlastiti web”.",
  sales: "Primjer: outlet i sajam. Ako se cijene razlikuju, dodajte zasebnu ponudu za svako mjesto.",
  ads: "Primjer: prodajete u trgovini, a cijene objavljujete na Instagramu.",
  regulation: "Ako propis određuje cijenu samo za dio ponude, taj dio dodajte zasebno.",
  legacy: "O ovom odgovoru ovisi datum za provjeru bazne cijene.",
  unit: "Provjeravamo treba li prikazati cijenu po kilogramu, litri ili drugoj jedinici.",
  discountProof: "Gledajte cijene istog artikla na mjestu na kojem ga snižavate.",
};
const productLists: Partial<Record<QuestionId, string[]>> = {
  legacy: ["Hrana i piće", "Kozmetika, proizvodi za čišćenje i toaletne potrepštine", "Proizvodi za kućanstvo"],
  unit: ["Hrana za ljude i životinje", "Deterdženti, pelene te proizvodi za njegu i higijenu tijela, kose ili zubi", "Boje i lakovi (osim slikarskih), motorna ulja i tekućine te destilirana voda"],
};

function stepQuestions(a: Answers): QuestionId[][] {
  const customer = selects(a, "buyers", "consumer");
  if (!customer) return [["buyers"]];
  const own = selects(a, "roles", "own", "platform");
  const feeOnly = !own && selects(a, "roles", "fee");
  const thirdOnly = !own && selects(a, "roles", "display") && !feeOnly;
  const goods = !feeOnly && selects(a, "kinds", "goods");
  const partial = !selects(a, "sales", "none") || !selects(a, "ads", "none");
  return [
    ["buyers", "roles", ...(!feeOnly && !thirdOnly ? ["kinds" as const] : [])],
    ["territory", "sales", "website", "ads", ...(selected(a, "sales").filter(x => !sole.includes(x)).length > 1 || selects(a, "sales", "shop", "outlet", "market") ? ["locations" as const] : [])],
    thirdOnly ? [] : ["activity", "pricing", "regulation", ...(goods ? ["goods", "legacy"] as const : []),
      ...(goods && !selects(a, "goods", "loose", "auction") ? ["unit" as const] : []),
      ...(goods && selects(a, "unit", "yes") && !selects(a, "goods", "loose", "auction") ? ["unitException" as const] : [])],
    !partial || thirdOnly ? [] : [
      ...(goods && selects(a, "legacy", "yes") ? ["prior" as const] : []), "history",
      ...(!selects(a, "history", "unknown", "other") && selected(a, "history").length ? ["proof" as const] : []),
      "discount", ...(selects(a, "discount", "public", "coupon") && (goods || selects(a, "sales", "shop", "outlet")) ? ["discountProof" as const] : []),
    ],
  ];
}

function usableAnswers(a: Answers): Answers {
  const active = new Set(stepQuestions(a).flat());
  return Object.fromEntries(Object.entries(a).filter(([key]) => active.has(key as QuestionId))) as Answers;
}

export function PriceQuestionnaire() {
  const nextId = useRef(2);
  const [offers, setOffers] = useState<Offer[]>([{ id: 1, name: "", answers: {} }]);
  const [activeId, setActiveId] = useState(1);
  const [step, setStep] = useState(0);
  const [view, setView] = useState<"questions" | "results">("questions");
  const [invalid, setInvalid] = useState<QuestionId>();
  const [invalidDomain, setInvalidDomain] = useState<WebsiteType>();
  const [announce, setAnnounce] = useState("");
  const [move, setMove] = useState(false);
  const [focusId, setFocusId] = useState("");
  const [copyFallback, setCopyFallback] = useState(false);
  const index = offers.findIndex(offer => offer.id === activeId);
  const offer = offers[index];
  const a = offer.answers;
  const activeSteps = stepQuestions(a);
  const questionsNow = activeSteps[step] ?? [];
  const nextStep = activeSteps.findIndex((entry, i) => i > step && entry.length > 0);
  const assessmentOffers = offers.map(item => ({ ...item, answers: usableAnswers(item.answers) }));
  const results = view === "results" ? assessResults(assessmentOffers) : undefined;

  useEffect(() => {
    if (!focusId) return;
    const target = document.getElementById(focusId);
    target?.focus({ preventScroll: true });
    target?.scrollIntoView({ block: "start", behavior: "instant" });
    setFocusId("");
  }, [focusId, step, activeId, view]);

  function goTo(index: number, target = "questionnaire-title", animate = false) {
    setInvalid(undefined);
    setInvalidDomain(undefined);
    setMove(animate);
    setView("questions");
    setStep(index);
    setFocusId(target);
  }

  function updateOffer(update: (item: Offer) => Offer) {
    setOffers(current => current.map(item => item.id === activeId ? update(item) : item));
  }

  function toggle(key: QuestionId, value: string) {
    setInvalid(undefined);
    updateOffer(item => {
      const values = selected(item.answers, key);
      const options = singular.includes(key) || sole.includes(value) ? [value] : values.includes(value)
        ? values.filter(v => v !== value) : [...values.filter(v => !sole.includes(v)), value];
      return { ...item, answers: { ...item.answers, [key]: options } };
    });
  }

  function addOffer(event: MouseEvent<HTMLButtonElement>) {
    const id = nextId.current++;
    setOffers(current => [...current, { id, name: "", answers: {} }]);
    setActiveId(id);
    setAnnounce(`Dodana je ponuda ${offers.length + 1}.`);
    goTo(0, "offer-name", event.detail > 0);
  }

  function editOffer(id: number, key?: QuestionId) {
    const item = offers.find(x => x.id === id);
    if (!item) return;
    const at = key ? stepQuestions(item.answers).findIndex(section => section.includes(key)) : -1;
    setActiveId(id);
    goTo(Math.max(at, 0), at >= 0 ? `question-${key}` : "questionnaire-title");
  }

  function removeOffer() {
    if (offers.length < 2) return;
    const remaining = offers.filter(item => item.id !== activeId);
    setOffers(remaining);
    setActiveId(remaining[Math.max(index - 1, 0)].id);
    setAnnounce(`Uklonjena je ponuda „${nameOf(offer, index)}”.`);
    goTo(0);
  }

  function finish() {
    setCopyFallback(false);
    setView("results");
    setFocusId("results-title");
  }

  function advance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const missing = questionsNow.find(key => !selected(a, key).length);
    if (missing) {
      setInvalid(missing);
      setFocusId(`question-${missing}`);
      return;
    }
    if (questionsNow.includes("website")) {
      const invalidSite = websiteTypes.find(type => selects(a, "website", type) && offer.websiteDomains?.[type]?.trim() && !websiteDomain(offer.websiteDomains[type]));
      if (invalidSite) {
        setInvalidDomain(invalidSite);
        setFocusId(`website-domain-${invalidSite}`);
        return;
      }
    }
    if (nextStep >= 0) goTo(nextStep, undefined, move);
    else finish();
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(formatResults(assessmentOffers));
      setCopyFallback(false);
      setAnnounce("Rezultat je kopiran.");
    } catch {
      setCopyFallback(true);
      setAnnounce("Automatsko kopiranje nije dostupno. Označite i kopirajte tekst.");
      setFocusId("copy-result");
    }
  }

  function printResults() {
    const closedDetails = [...document.querySelectorAll<HTMLDetailsElement>("[data-showing-results] details:not([open])")];
    window.addEventListener("afterprint", () => closedDetails.forEach(details => { details.open = false; }), { once: true });
    closedDetails.forEach(details => { details.open = true; });
    window.print();
  }

  return <>
    <p role="status" className="sr-only">{announce}</p>
    {!results ? <div className="grid items-start gap-5 print:hidden md:grid-cols-[minmax(13rem,15rem)_minmax(0,1fr)] lg:gap-8">
      <aside className="min-w-0 rounded-xl bg-[#edf6f7] p-4 sm:p-5" aria-label="Ponude i datum">
        <p className="text-sm font-bold text-teal-dark">{ASSESSMENT_PERIOD}</p>
        <div className="mt-4 border-t border-teal/20 pt-3">
          <p className="text-sm font-bold">Vaše ponude <span className="ml-1 font-medium text-teal-dark">({offers.length})</span></p>
          <ul className="mt-2 flex flex-wrap gap-2 md:flex-col">
            {offers.map((item, i) => <li key={item.id} className="min-w-0 max-w-full">
              <button type="button" className={`${secondary} max-w-full !justify-start !text-left [overflow-wrap:anywhere] md:w-full ${item.id === activeId ? "!border-teal-dark !bg-teal-dark !text-white" : ""}`} aria-current={item.id === activeId ? "true" : undefined} onClick={() => editOffer(item.id)}>{nameOf(item, i)}</button>
            </li>)}
          </ul>
          <button type="button" onClick={addOffer} className={`${link} mt-1 text-left`}><span aria-hidden="true" className="mr-1.5 text-lg">+</span> Dodaj ponudu</button>
        </div>
      </aside>
      <section className="min-w-0 rounded-xl border border-line bg-white p-4 sm:p-7 lg:p-8" aria-labelledby="questionnaire-title">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-4">
          <div className="min-w-0 text-sm font-semibold text-teal-dark [overflow-wrap:anywhere]">{nameOf(offer, index)}</div>
          <div className="flex gap-1.5" aria-label={`Korak ${step + 1} od ${steps.length}`} role="img">
            {steps.map((title, i) => <span key={title} className={`h-1.5 w-6 rounded-full sm:w-8 ${i === step ? "bg-orange-dark" : i < step ? "bg-teal" : "bg-line"}`} />)}
          </div>
        </div>
        <form onSubmit={advance} className="mt-5">
          <div key={`${activeId}-${step}`} className={move ? styles.arrive : undefined}>
            <h2 id="questionnaire-title" tabIndex={-1} className="break-words text-2xl font-black leading-tight tracking-[-.025em] outline-none sm:text-3xl">{steps[step]}</h2>
            {step === 0 && <label className="mt-4 block max-w-md text-sm font-semibold" htmlFor="offer-name">Naziv ponude <span className="font-normal text-muted">(neobavezno)</span>
              <input id="offer-name" type="text" maxLength={80} value={offer.name} onChange={e => updateOffer(item => ({ ...item, name: e.target.value }))} className="mt-1.5 block min-h-11 w-full rounded-lg border border-slate-400 px-3 text-base" placeholder="Npr. Odjeća u outletu" />
            </label>}
            {questionsNow.map(key => {
              const hint = key === "history" ? `Datum za provjeru bazne cijene prema najavi je ${selects(a, "legacy", "yes") ? "2. 5. 2025." : "10. 9. 2026."}` : prompts[key];
              const multi = !singular.includes(key);
              const items = productLists[key];
              const description = [invalid === key && `error-${key}`, (multi || hint) && `hint-${key}`, items && `items-${key}`].filter(Boolean).join(" ");
              return <fieldset key={key} id={`question-${key}`} tabIndex={-1} aria-describedby={description || undefined} className="mt-6 min-w-0 outline-none">
                <legend className="text-base font-extrabold leading-snug sm:text-lg">{questions[key][0]}</legend>
                {(multi || hint) && <p id={`hint-${key}`} className="mt-1.5 text-sm leading-6 text-muted">{multi ? "Možete označiti više odgovora. " : ""}{hint}</p>}
                {items && <ul id={`items-${key}`} className="mt-1.5 list-disc space-y-0.5 pl-5 text-sm leading-6 text-muted">{items.map(item => <li key={item}>{item}</li>)}</ul>}
                {invalid === key && <p id={`error-${key}`} role="alert" className="mt-2 text-sm font-bold text-[#9c2a0b]">Odaberite odgovor ili označite „Ne znam”.</p>}
                <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
                  {Object.entries(questions[key][1]).map(([value, name]) => {
                    const checked = selected(a, key).includes(value);
                    return <label key={value} className={`${styles.option} flex min-h-12 min-w-0 cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 text-[.9375rem] font-semibold leading-6 focus-within:ring-2 focus-within:ring-teal focus-within:ring-offset-1 ${checked ? "border-teal bg-teal-soft text-teal-dark" : "border-line bg-[#fcfefe] hover:border-teal/60"}`}>
                      <input type={multi ? "checkbox" : "radio"} name={key} checked={checked} onChange={() => toggle(key, value)} className="mt-[.2rem] h-[1.15rem] w-[1.15rem] shrink-0 accent-teal-dark" />
                      <span className="min-w-0 break-words">{name}</span>
                    </label>;
                  })}
                </div>
                {key === "website" && websiteTypes.some(type => selects(a, "website", type)) && <div className="mt-4 max-w-md space-y-3">
                  <p id="website-domain-help" className="text-sm leading-6 text-muted">Ako imate više webova iste vrste, upišite adresu weba koji koristite za ovu ponudu.</p>
                  {websiteTypes.filter(type => selects(a, "website", type)).map(type => <label key={type} htmlFor={`website-domain-${type}`} className="block text-sm font-bold">
                    {type === "shop" ? "Adresa webshopa" : "Adresa weba bez košarice"} <span className="font-normal text-muted">(neobavezno)</span>
                    <input id={`website-domain-${type}`} type="text" inputMode="url" maxLength={253} autoCapitalize="none" spellCheck={false} placeholder="npr. trgovina.hr" aria-invalid={invalidDomain === type || undefined} aria-describedby={invalidDomain === type ? `website-domain-help website-domain-error-${type}` : "website-domain-help"}
                      className="mt-1.5 block min-h-11 w-full rounded-lg border border-slate-400 px-3 text-base" value={offer.websiteDomains?.[type] ?? ""} onChange={event => {
                        const value = event.target.value;
                        setInvalidDomain(undefined);
                        updateOffer(item => ({ ...item, websiteDomains: { ...item.websiteDomains, [type]: value } }));
                      }} />
                    {invalidDomain === type && <span id={`website-domain-error-${type}`} role="alert" className="mt-1 block text-[#9c2a0b]">Upišite adresu poput trgovina.hr.</span>}
                  </label>)}
                </div>}
              </fieldset>;
            })}
          </div>
          <div className="mt-7 flex flex-wrap items-center gap-2 border-t border-line pt-4">
            {step > 0 && <button type="button" className={secondary} onClick={e => goTo(activeSteps.findLastIndex((entry, i) => i < step && entry.length > 0), undefined, e.detail > 0)}>Natrag</button>}
            <button type="submit" className={primary} onClick={e => setMove(e.detail > 0)}>{nextStep >= 0 ? "Nastavi" : "Prikaži rezultate"}</button>
            {step === 0 && offers.length > 1 && <button type="button" className={`${link} ml-auto`} onClick={removeOffer}>Ukloni ovu ponudu</button>}
          </div>
        </form>
      </section>
    </div> : <section data-showing-results aria-labelledby="results-title" className="min-w-0 print:text-[10pt]">
      <div className="rounded-xl bg-[#edf6f7] p-4 sm:p-6 print:bg-white print:p-0">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-xl">
            <h2 id="results-title" tabIndex={-1} className="text-2xl font-black tracking-[-.025em] outline-none sm:text-3xl print:text-lg">Što trebate napraviti</h2>
            <p className="mt-2 text-sm leading-6 text-muted print:text-black">{ASSESSMENT_PERIOD}</p>
          </div>
        </div>
        <ul aria-label="Pregled ponuda" className="mt-4 divide-y divide-teal/20 border-y border-teal/20 print:hidden">
          {results.offerResults.map(({ offer: item, name, groups }) => {
            const rows = groups.flatMap(group => group.items);
            const needsCheck = rows.some(row => row.status === "check" || row.pending || row.amountNeedsCheck);
            return <li key={item.id} className="flex flex-wrap items-center justify-between gap-x-3 py-1.5">
              <a href={`#offer-result-${item.id}`} className={`${link} min-w-0 [overflow-wrap:anywhere]`}>{name}</a>
              {needsCheck && <span className="text-sm font-semibold text-teal-dark">Još za provjeriti</span>}
              {rows.some(row => row.status === "applies") && <span className="text-sm font-semibold text-teal-dark">Imate obveze</span>}
            </li>;
          })}
          {results.websites.length > 0 && <li><a href="#website-results" className={link}>Cjenik na webu</a></li>}
        </ul>
        <div className="mt-4 flex flex-wrap gap-2 print:hidden">
          <button type="button" className={primary} onClick={copy}>Kopiraj rezultat</button>
          <button type="button" className={secondary} onClick={printResults}>Ispiši</button>
          <button type="button" className={secondary} onClick={addOffer}>Dodaj ponudu</button>
        </div>
        {announce === "Rezultat je kopiran." && <p aria-hidden="true" className="mt-3 text-sm font-semibold text-teal-dark print:hidden">{announce}</p>}
        {copyFallback && <label className="mt-4 block text-sm font-bold print:hidden" htmlFor="copy-result">Označite i kopirajte tekst rezultata
          <textarea readOnly id="copy-result" rows={5} value={formatResults(assessmentOffers)} onFocus={e => e.currentTarget.select()} className="mt-2 w-full rounded-lg border border-teal bg-white p-3 text-base" />
        </label>}
      </div>
      {results.offerResults.map(({ offer: item, name, groups, notes }) => <article key={item.id} id={`offer-result-${item.id}`} className="mt-7 min-w-0 scroll-mt-4 border-t border-line print:mt-4">
        <div className="flex flex-wrap items-center justify-between gap-2 py-3">
          <h3 className="min-w-0 text-xl font-black [overflow-wrap:anywhere] sm:text-2xl print:text-base">{name}</h3>
          <button type="button" className={`${secondary} print:hidden`} onClick={() => editOffer(item.id)} aria-label={`Uredi odgovore: ${name}`}>Uredi odgovore</button>
        </div>
        {notes.length > 0 && <details className="mb-2 rounded-lg bg-[#edf6f7] px-3 text-sm leading-6 text-teal-dark sm:px-4 print:bg-white print:text-black">
          <summary className="min-h-11 cursor-pointer py-2.5 font-bold">Napomene za ovu ponudu</summary>
          <ul className="grid gap-1 pb-3">{notes.map(note => <li key={note}>{note}</li>)}</ul>
        </details>}
        {groups.map((group, j) => {
          const outside = group.items.filter(row => row.status === "outside");
          return <div key={`${group.title}-${j}`} className="mt-3 min-w-0 rounded-xl border border-line bg-white print:border-0">
            <h4 className="rounded-t-xl bg-slate-50 px-3 py-2.5 text-[.9375rem] font-extrabold leading-snug sm:px-5 print:bg-white print:px-0">{group.title}</h4>
            <div className="divide-y divide-line">
              {group.items.filter(row => row.status !== "outside").map((row, k) => <GuidanceRow key={`${row.obligation}-${k}`} row={row} edit={row.question && stepQuestions(item.answers).flat().includes(row.question) ? () => editOffer(item.id, row.question) : undefined} />)}
              {outside.length > 0 && <details>
                <summary className="min-h-11 cursor-pointer px-3 py-3 text-sm font-bold text-teal-dark sm:px-5 print:px-0">Obveze koje ovdje ne vrijede ({outside.length})</summary>
                <div className="divide-y divide-line">{outside.map((row, k) => <GuidanceRow key={`${row.obligation}-${k}`} row={row} />)}</div>
              </details>}
            </div>
          </div>;
        })}
      </article>)}
      {results.websites.length > 0 && <section id="website-results" aria-labelledby="website-title" className="mt-7 min-w-0 border-t border-line pt-3">
        <h3 id="website-title" className="text-xl font-black sm:text-2xl print:text-base">Cjenik na webu</h3>
        {results.websites.map(site => <div key={site.key} data-website-result className="mt-3 min-w-0 rounded-xl border border-line bg-white print:border-0">
          <h4 className="rounded-t-xl bg-slate-50 px-3 py-2.5 text-[.9375rem] font-extrabold [overflow-wrap:anywhere] sm:px-5 print:bg-white print:px-0">{site.title}</h4>
          <div className="border-b border-line px-3 py-2 text-sm leading-6 text-muted sm:px-5 print:px-0 print:text-black">
            <p><strong>Ponude za koje trebate provjeriti što ulazi u cjenik</strong></p>
            <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1">{site.scopes.map(scope => <li key={scope} className="[overflow-wrap:anywhere]">{scope}</li>)}</ul>
          </div>
          <GuidanceRow row={site.row} edit={site.row.question ? () => editOffer(site.offerId, site.row.question) : undefined} />
          {site.details.length > 0 && <ul className="border-t border-line px-3 py-2 text-sm leading-6 sm:px-5 print:px-0">
            {site.details.map(({ key, scopes, row }) => <li key={key} className="py-1">
              <p><strong>{scopes.map(scope => scope.detail).join("; ")}</strong> · {statusLabels[row.status]}</p><p>{row.action}</p>
              <ResultDetails row={row} />
              {row.question && scopes.map(scope => <button key={scope.offerId} type="button" className={`${link} mr-3 print:hidden`} onClick={() => editOffer(scope.offerId, row.question)}>Dopuni odgovor za {scope.detail}</button>)}
            </li>)}
          </ul>}
        </div>)}
      </section>}
      {results.showCta && <p className="mt-6 rounded-xl bg-teal-soft p-4 font-semibold text-teal-dark print:hidden"><Link className="underline underline-offset-4" href="/#kontakt">Zatražite pomoć s objavom cjenika</Link></p>}
    </section>}
    <details className="mt-7 rounded-xl border border-line bg-white px-4 py-2 sm:px-6 print:hidden">
      <summary className="min-h-11 cursor-pointer py-3 text-sm font-extrabold text-teal-dark">Propisi i službeni izvori</summary>
      <p className="leading-7 text-muted">Upitnik pokriva prodaju u Hrvatskoj prema pravilima od 17. studenoga 2026. U rezultatu je označeno što još treba provjeriti u konačnim pravilnicima.</p>
      <ul className="mt-3 divide-y divide-line text-sm leading-6">{Object.entries(sources).map(([id, source]) => <li key={id} className="py-2">
        <a href={source.url} className="font-bold text-teal-dark underline underline-offset-4">{source.title} · {source.section}</a>
        <p className="text-muted">{source.type} · {source.scope}. Primjena: {source.applies}</p>
        {(id === "draftBase" || id === "draftList") && <p className="text-muted">Datum objave izvješća: {consultationReports[id] ?? "nije potvrđen"}.</p>}
      </li>)}</ul>
    </details>
  </>;
}

function GuidanceRow({ row, edit }: { row: ResultRow; edit?: () => void }) {
  return <div data-result-row className="grid min-w-0 gap-1.5 px-3 py-3 sm:grid-cols-[minmax(10rem,14rem)_minmax(0,1fr)] sm:gap-4 sm:px-5 print:block print:px-0 print:py-2">
    <div className="min-w-0">
      <p className="text-sm font-extrabold">{obligations[row.obligation]}</p>
      <span data-result-status className={`mt-1 inline-block rounded px-2 py-1 text-xs font-bold ${statusStyle[row.status]}`}>{statusLabels[row.status]}</span>
      {row.amountNeedsCheck && <p className="mt-1 text-xs font-bold text-[#7b3c09]">{amountCheckLabel}</p>}
      {row.pending && <p className="mt-1 text-xs font-bold text-[#7b3c09]">Čeka objavu pravilnika</p>}
    </div>
    <div className="min-w-0">
      <p className="text-[.9375rem] font-semibold leading-6">{row.action}</p>
      <ResultDetails row={row} />
      {edit && <button type="button" className={`${link} print:hidden`} aria-label={`Uredi odgovor za: ${obligations[row.obligation]}`} onClick={edit}>Uredi odgovor</button>}
    </div>
  </div>;
}

function ResultDetails({ row }: { row: Guidance }) {
  return <details data-result-sources>
    <summary className="min-h-11 cursor-pointer py-3 text-sm font-bold text-teal-dark">{row.example ? "Zašto, primjer i izvori" : "Zašto i izvori"}</summary>
    <p className="text-sm leading-6 text-muted print:text-black">{row.reason}</p>
    {row.example && <p className="mt-2 whitespace-pre-wrap break-words rounded bg-[#edf6f7] px-3 py-2 text-sm leading-6 text-teal-dark print:text-black"><strong className="block">Primjer</strong>{row.example}</p>}
    <ul className="mt-2 space-y-1 text-sm leading-6">
      {row.refs.map(id => <li key={id}>
        <a href={sources[id].url} className="font-semibold text-teal-dark underline underline-offset-4">{sources[id].title} · {sources[id].section}</a> <span className="text-muted">({sources[id].type})</span>
      </li>)}
    </ul>
  </details>;
}
