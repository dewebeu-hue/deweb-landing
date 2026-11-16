"use client";

import { useEffect, useRef, useState, type FormEvent, type MouseEvent } from "react";
import Link from "next/link";
import { assessOffer, formatResults, obligations, statusLabels, type Guidance } from "../../../lib/sidrene-cijene";
import { CHANGE, DATES, VERIFIED, consultationReports, questions, selected, selects, sources, type Answers, type AssessmentDate, type Offer, type QuestionId } from "../../../lib/sidrene-cijene-podaci";
import styles from "./upitnik.module.css";

const steps = ["Kupci i ponuda", "Prodajna mjesta i oglasi", "Vrsta cijene i robe", "Povijest i sniženja"];
const primary = `${styles.press} inline-flex min-h-12 items-center justify-center rounded-lg bg-teal-dark px-5 py-2.5 text-center text-sm font-bold text-white hover:bg-teal`;
const secondary = `${styles.press} inline-flex min-h-11 items-center justify-center rounded-lg border border-line bg-white px-4 py-2 text-center text-sm font-bold text-teal-dark hover:bg-teal-soft`;
const link = "inline-flex min-h-11 items-center text-sm font-bold text-teal-dark underline decoration-teal/40 underline-offset-4 hover:decoration-teal-dark";
const statusStyle = { applies: "bg-teal-soft text-teal-dark", outside: "bg-slate-100 text-slate-700", check: "bg-[#fff0dc] text-[#7b3c09]" };
const singular: QuestionId[] = ["legacy", "storeType", "unit", "prior", "proof", "discountProof"];
const sole = ["none", "unknown", "standard"];
const prompts: Partial<Record<QuestionId, string>> = {
  buyers: "Označite sve koji kupuju ovu ponudu. Za kupce s različitim cijenama ili kanalima dodajte zasebne ponude.",
  roles: "Ako samo prikazujete tuđi iznos, označite posredovanje. Vlastitu naplaćenu naknadu možete označiti uz njega.",
  kinds: "Označite što nudite istim kupcima i po istim kanalima. Različite poslovne situacije unesite kao zasebne ponude.",
  goods: "Označite i kako prodajete robu: pakirano, rasuto ili na komad. Odvojite ponude ako se način prodaje razlikuje.",
  website: "Društveni profil i stranica prodavatelja na tuđoj platformi nisu vlastiti web.",
  sales: "Odaberite sve kanale za ovu ponudu. Ako druga ponuda ima drukčije kanale, dodajte je zasebno.",
  ads: "Ovo je zasebno od prodaje. Primjerice, možete prodavati u poslovnici, a iznos objaviti na Instagramu.",
  pricing: "Primjerice, označite fiksnu doplatu za izlazak i individualnu ponudu za rad.",
  regulation: "Ako imate i tržišnu i reguliranu cijenu, dodajte zasebnu ponudu za svaki dio.",
  history: "Označite što se odnosi na isti artikl ili uslugu. Promjena šifre sama po sebi ne znači novu ponudu.",
  discount: "Javno dostupan kod može biti javno sniženje. Popust dogovoren s jednim kupcem označite zasebno.",
};

function stepQuestions(a: Answers, date: AssessmentDate): QuestionId[][] {
  const customer = selects(a, "buyers", "consumer");
  if (!customer) return [["buyers"]];
  const own = selects(a, "roles", "own", "platform");
  const feeOnly = !own && selects(a, "roles", "fee");
  const thirdOnly = !own && selects(a, "roles", "display") && !feeOnly;
  const goods = !feeOnly && selects(a, "kinds", "goods");
  const partial = !selects(a, "sales", "none") || !selects(a, "ads", "none");
  const mayHaveBase = date === CHANGE || goods && selects(a, "legacy", "yes") && selects(a, "activity", "retail");
  const showHistory = !thirdOnly && partial && mayHaveBase;
  return [
    ["buyers", "roles", ...(!feeOnly && !thirdOnly ? ["kinds" as const] : [])],
    ["territory", "sales", "website", "ads", ...(selected(a, "sales").filter(x => !sole.includes(x)).length > 1 || selects(a, "sales", "shop", "outlet", "market") ? ["locations" as const] : [])],
    thirdOnly ? [] : ["activity", "pricing", "regulation", ...(goods ? ["goods", "legacy"] as const : []),
      ...(goods && date === VERIFIED && !selects(a, "legacy", "no") && !selects(a, "activity", "opg") ? ["storeType" as const] : []),
      ...(goods && !selects(a, "goods", "loose", "auction") ? ["unit" as const] : []),
      ...(goods && selects(a, "unit", "yes") && !selects(a, "goods", "loose", "auction") ? ["unitException" as const] : [])],
    !partial || thirdOnly ? [] : [...(showHistory ? [...(date === CHANGE && goods && selects(a, "legacy", "yes") ? ["prior" as const] : []), "history" as const, ...(!selects(a, "history", "unknown", "other") && selected(a, "history").length ? ["proof" as const] : [])] : []), "discount", ...(selects(a, "discount", "public", "coupon") && (goods || selects(a, "sales", "shop", "outlet")) ? ["discountProof" as const] : [])],
  ];
}

function usableAnswers(a: Answers, date: AssessmentDate): Answers {
  const active = new Set(stepQuestions(a, date).flat());
  return Object.fromEntries(Object.entries(a).filter(([key]) => active.has(key as QuestionId))) as Answers;
}

const nameOf = (offer: Offer, index: number) => offer.name.trim() || `Ponuda ${index + 1}`;

function DateInput({ date, change }: { date: AssessmentDate; change: (date: AssessmentDate) => void }) {
  return <label className="block min-w-0 text-sm font-bold text-ink">
    Datum procjene
    <select value={date} onChange={e => change(e.target.value as AssessmentDate)} className="mt-1.5 block min-h-11 w-full rounded-lg border border-slate-400 bg-white px-2 py-1.5 text-sm font-semibold text-ink">
      {DATES.map(([value, title]) => <option key={value} value={value}>{title.split(" — ")[0]}</option>)}
    </select>
  </label>;
}

export function PriceQuestionnaire() {
  const nextId = useRef(2);
  const [offers, setOffers] = useState<Offer[]>([{ id: 1, name: "", answers: {} }]);
  const [activeId, setActiveId] = useState(1);
  const [step, setStep] = useState(0);
  const [date, setDate] = useState<AssessmentDate>(VERIFIED);
  const [view, setView] = useState<"questions" | "results">("questions");
  const [invalid, setInvalid] = useState<QuestionId>();
  const [announce, setAnnounce] = useState("");
  const [move, setMove] = useState(false);
  const [focusId, setFocusId] = useState("");
  const [copyFallback, setCopyFallback] = useState(false);
  const index = offers.findIndex(offer => offer.id === activeId);
  const offer = offers[index];
  const a = offer.answers;
  const activeSteps = stepQuestions(a, date);
  const questionsNow = activeSteps[step] ?? [];
  const nextStep = activeSteps.findIndex((entry, i) => i > step && entry.length > 0);
  const assessmentOffers = offers.map(item => ({ ...item, answers: usableAnswers(item.answers, date) }));
  const results = view === "results" ? assessmentOffers.map(item => assessOffer(item, date)) : [];

  useEffect(() => {
    if (!focusId) return;
    const target = document.getElementById(focusId);
    target?.focus({ preventScroll: true });
    target?.scrollIntoView({ block: "start", behavior: "instant" });
    setFocusId("");
  }, [focusId, step, activeId, view]);

  function goTo(index: number, target = "questionnaire-title", animate = false) {
    setInvalid(undefined);
    setMove(animate);
    setView("questions");
    setStep(index);
    setFocusId(target);
  }

  function changeDate(value: AssessmentDate) {
    setDate(value);
    setCopyFallback(false);
    setAnnounce("Datum procjene je promijenjen.");
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
    const at = key ? stepQuestions(item.answers, date).findIndex(section => section.includes(key)) : -1;
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
    if (nextStep >= 0) goTo(nextStep, undefined, move);
    else finish();
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(formatResults(assessmentOffers, date));
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
    {view === "questions" ? <div className="grid items-start gap-5 print:hidden md:grid-cols-[minmax(13rem,15rem)_minmax(0,1fr)] lg:gap-8">
      <aside className="min-w-0 rounded-xl bg-[#edf6f7] p-4 sm:p-5" aria-label="Ponude i datum">
        <DateInput date={date} change={changeDate} />
        <div className="mt-4 border-t border-teal/20 pt-3">
          <p className="text-sm font-bold">Vaše ponude <span className="ml-1 font-medium text-teal-dark">({offers.length})</span></p>
          <ul className="mt-2 flex flex-wrap gap-2 md:flex-col">
            {offers.map((item, i) => <li key={item.id} className="min-w-0 max-w-full">
              <button type="button" className={`${secondary} max-w-full !justify-start !text-left [overflow-wrap:anywhere] md:w-full ${item.id === activeId ? "!border-teal-dark !bg-teal-dark !text-white" : ""}`} aria-current={item.id === activeId ? "true" : undefined} onClick={() => editOffer(item.id)}>{nameOf(item, i)}</button>
            </li>)}
          </ul>
          <button type="button" onClick={addOffer} className={`${link} mt-1 text-left`}><span aria-hidden="true" className="mr-1.5 text-lg">+</span> Dodaj još jednu vrstu ponude</button>
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
              <input id="offer-name" type="text" maxLength={80} value={offer.name} onChange={e => updateOffer(item => ({ ...item, name: e.target.value }))} className="mt-1.5 block min-h-11 w-full rounded-lg border border-slate-400 px-3 text-base" placeholder="Npr. Prodaja meda na štandu" />
            </label>}
            {questionsNow.map(key => {
              const hint = key === "history" ? `Za ovu procjenu: ${date === VERIFIED || selects(a, "legacy", "yes") ? "2. 5. 2025." : "10. 9. 2026. prema najavi"} ${prompts.history}` : prompts[key];
              const multi = !singular.includes(key);
              return <fieldset key={key} id={`question-${key}`} tabIndex={-1} aria-describedby={invalid === key ? `error-${key}` : hint ? `hint-${key}` : undefined} className="mt-6 min-w-0 outline-none">
                <legend className="text-base font-extrabold leading-snug sm:text-lg">{questions[key][0]}</legend>
                <p id={`hint-${key}`} className="mt-1.5 text-sm leading-6 text-muted">{multi ? "Možete označiti više odgovora. " : ""}{hint}</p>
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
              </fieldset>;
            })}
          </div>
          {selects(a, "buyers", "consumer") && selects(a, "buyers", "buyer", "institution", "company") && step === 0 && <p className="mt-4 rounded-lg bg-teal-soft p-3 text-sm leading-6 text-teal-dark">Ako potrošači i poslovni kupci imaju različite ponude ili mjesta prodaje, unesite ih odvojeno.</p>}
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
            <p className="mt-2 text-sm leading-6 text-muted print:text-black">{date === VERIFIED ? "Postojeća pravila za 16. 11. 2026." : "Prijelaz na nova pravila 17. 11. 2026."} <span className="hidden sm:inline print:inline">Izvori provjereni 16. 11. 2026.</span></p>
          </div>
          <div className="w-full max-w-[13rem] print:hidden"><DateInput date={date} change={changeDate} /></div>
        </div>
        <ul aria-label="Pregled ponuda" className="mt-4 divide-y divide-teal/20 border-y border-teal/20 print:hidden">
          {offers.map((item, i) => {
            const rows = results[i].groups.flatMap(group => group.items);
            return <li key={item.id} className="flex flex-wrap items-center justify-between gap-x-3 py-1.5">
              <a href={`#offer-result-${item.id}`} className={`${link} min-w-0 [overflow-wrap:anywhere]`}>{nameOf(item, i)}</a>
              <span className="text-sm font-semibold text-teal-dark">{rows.filter(row => row.status === "applies").length} primjenjivo · {rows.filter(row => row.status === "check" || row.pending).length} za provjeru</span>
            </li>;
          })}
        </ul>
        <div className="mt-4 flex flex-wrap gap-2 print:hidden">
          <button type="button" className={primary} onClick={copy}>Kopiraj rezultat</button>
          <button type="button" className={secondary} onClick={printResults}>Ispiši</button>
          <button type="button" className={secondary} onClick={addOffer}>Dodaj još jednu vrstu ponude</button>
        </div>
        {announce === "Rezultat je kopiran." && <p aria-hidden="true" className="mt-3 text-sm font-semibold text-teal-dark print:hidden">{announce}</p>}
        {copyFallback && <label className="mt-4 block text-sm font-bold print:hidden" htmlFor="copy-result">Označite i kopirajte tekst rezultata
          <textarea readOnly id="copy-result" rows={5} value={formatResults(assessmentOffers, date)} onFocus={e => e.currentTarget.select()} className="mt-2 w-full rounded-lg border border-teal bg-white p-3 text-base" />
        </label>}
      </div>
      {offers.map((item, i) => <article key={item.id} id={`offer-result-${item.id}`} className="mt-7 min-w-0 scroll-mt-4 border-t border-line print:mt-4">
        <div className="flex flex-wrap items-center justify-between gap-2 py-3">
          <h3 className="min-w-0 text-xl font-black [overflow-wrap:anywhere] sm:text-2xl print:text-base">{nameOf(item, i)}</h3>
          <button type="button" className={`${secondary} print:hidden`} onClick={() => editOffer(item.id)} aria-label={`Uredi odgovore: ${nameOf(item, i)}`}>Uredi odgovore</button>
        </div>
        {results[i].notes.length > 0 && <details className="mb-2 rounded-lg bg-[#edf6f7] px-3 text-sm leading-6 text-teal-dark sm:px-4 print:bg-white print:text-black">
          <summary className="min-h-11 cursor-pointer py-2.5 font-bold">Na što se odnosi ovaj rezultat</summary>
          <ul className="grid gap-1 pb-3">{results[i].notes.map(note => <li key={note}>{note}</li>)}</ul>
        </details>}
        {results[i].groups.map((group, j) => <div key={`${group.title}-${j}`} className="mt-3 min-w-0 rounded-xl border border-line bg-white print:border-0">
          <h4 className="rounded-t-xl bg-slate-50 px-3 py-2.5 text-[.9375rem] font-extrabold leading-snug sm:px-5 print:bg-white print:px-0">{group.title}</h4>
          <div className="divide-y divide-line">
            {[...group.items].sort((x, y) => Number(x.status === "outside") - Number(y.status === "outside")).map((row, k) => <div key={`${row.obligation}-${k}`} data-result-row className="grid min-w-0 gap-1.5 px-3 py-3 sm:grid-cols-[minmax(10rem,14rem)_minmax(0,1fr)] sm:gap-4 sm:px-5 print:block print:px-0 print:py-2">
              <div className="min-w-0">
                <p className="text-sm font-extrabold">{obligations[row.obligation]}</p>
                <span data-result-status className={`mt-1 inline-block rounded px-2 py-1 text-xs font-bold ${statusStyle[row.status]}`}>{statusLabels[row.status]}</span>
                {row.pending && <p className="mt-1 text-xs font-bold text-[#7b3c09]">Čeka objavu pravilnika</p>}
              </div>
              <div className="min-w-0">
                <p className="text-[.9375rem] font-semibold leading-6">{row.action}</p>
                <p className="mt-1 text-sm leading-6 text-muted print:text-black">{row.reason}</p>
                {row.example && <p className="mt-2 whitespace-pre-wrap break-words rounded bg-[#edf6f7] px-3 py-2 text-sm leading-6 text-teal-dark print:text-black"><strong className="block">Predložak</strong>{row.example}</p>}
                <ResultSources row={row} />
                {row.question && stepQuestions(item.answers, date).some(ids => ids.includes(row.question!)) && <button type="button" className={`${link} print:hidden`} onClick={() => editOffer(item.id, row.question)}>Dopuni odgovor</button>}
              </div>
            </div>)}
          </div>
        </div>)}
      </article>)}
      {results.some(result => result.showCta) && <p className="mt-6 rounded-xl bg-teal-soft p-4 font-semibold text-teal-dark print:hidden">Trebate objaviti mrežni cjenik? <Link className="underline underline-offset-4" href="/#kontakt">Zatražite pomoć s postavljanjem</Link>.</p>}
    </section>}
    <details className="mt-7 rounded-xl border border-line bg-white px-4 py-2 sm:px-6 print:hidden">
      <summary className="min-h-11 cursor-pointer py-3 text-sm font-extrabold text-teal-dark">Izvori i granice procjene</summary>
      <p className="leading-7 text-muted">Alat daje pregled za hrvatsko tržište i dva navedena datuma. Bazna cijena s referentnog dana razlikuje se od najniže cijene prije sniženja. Najava upozoravanja pri nadzoru ne mijenja obveze.</p>
      <ul className="mt-3 divide-y divide-line text-sm leading-6">{Object.entries(sources).map(([id, source]) => <li key={id} className="py-2">
        <a href={source.url} className="font-bold text-teal-dark underline underline-offset-4">{source.title} · {source.section}</a>
        <p className="text-muted">{source.type} · {source.scope}. Primjena: {source.applies} Provjereno: 16. 11. 2026.</p>
        {(id === "draftBase" || id === "draftList") && <p className="text-muted">Datum objave izvješća: {consultationReports[id] ?? "nije potvrđen"}.</p>}
      </li>)}</ul>
    </details>
  </>;
}

function ResultSources({ row }: { row: Guidance }) {
  return <details data-result-sources>
    <summary className="min-h-11 cursor-pointer py-3 text-sm font-bold text-teal-dark">Izvori ({row.refs.length})</summary>
    <ul className="space-y-1 text-sm leading-6">
      {row.refs.map(id => <li key={id}>
        <a href={sources[id].url} className="font-semibold text-teal-dark underline underline-offset-4">{sources[id].title} · {sources[id].section}</a> <span className="text-muted">({sources[id].type})</span>
      </li>)}
    </ul>
  </details>;
}
