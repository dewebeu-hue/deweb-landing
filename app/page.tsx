import Image from "next/image";
import type { CSSProperties } from "react";
import { ProblemForm } from "./problem-form";
import { ScrollReveal } from "./scroll-reveal";

const problems = [
  "Upiti dolaze preko WhatsAppa, maila i poziva — i dio se izgubi.",
  "Klijenti stalno pitaju iste stvari.",
  "Ponude, dokumenti i statusi se vode ručno.",
  "Excel je postao glavni sustav firme.",
  "Nemate pregled tko čeka odgovor, uplatu ili termin.",
  "Znate da se nešto može automatizirati, ali ne znate odakle krenuti.",
];

const examples = [
  "Mini CRM za upite i klijente",
  "Sustav za termine i podsjetnike",
  "Portal za klijente i dokumente",
  "Automatizirano slanje ponuda",
  "Interni dashboard za posao, statuse i uplate",
  "AI asistent za česta pitanja i pripremu odgovora",
  "Evidencija narudžbi, prijevoza, servisa ili terenskog rada",
  "Jednostavan sustav za prijave, zahtjeve ili rezervacije",
];

const offers = [
  {
    title: "Problem brief",
    price: "Procjena nakon problema",
    description: "Kratka analiza problema i prijedlog 2–3 moguća digitalna rješenja.",
    bestFor: "Kada znate da imate problem, ali ne znate što točno treba izraditi.",
    output: "Sažetak problema, preporučeni MVP, procjena složenosti i sljedeći koraci.",
  },
  {
    title: "Brzi MVP alat",
    price: "Cijena ovisi o opsegu",
    description: "Jednostavan alat koji rješava jedan konkretan problem.",
    bestFor: "Upiti, evidencije, obrasci, statusi, klijenti, podsjetnici, jednostavni dashboardi.",
    output: "Prva funkcionalna verzija koju možete testirati u stvarnom radu.",
    featured: true,
  },
  {
    title: "Custom poslovni sustav",
    price: "Procjena nakon problema",
    description: "Veći interni sustav ili mini SaaS za specifičan workflow firme.",
    bestFor: "Kada želite ozbiljniji alat, više korisnika, portal, automatizacije ili integracije.",
    output: "Planirana izrada u fazama, s mogućnošću održavanja i nadogradnje.",
  },
];

const steps = [
  "Pošaljete problem",
  "Postavimo nekoliko dodatnih pitanja",
  "Dobijete 2–3 moguća rješenja",
  "Odabiremo MVP",
  "Izrađujemo i testiramo",
  "Isporučujemo, održavamo i nadograđujemo po potrebi",
];

const why = [
  "Fokus na male poduzetnike",
  "Prvo problem, zatim tehnologija",
  "Jednostavna rješenja prije velikih sustava",
  "MVP pristup: brzo testirati prije velikog ulaganja",
  "AI i automatizacija samo kad stvarno imaju smisla",
  "Jasna komunikacija i izvedivi koraci",
];

function revealDelay(index: number): CSSProperties {
  return { "--reveal-delay": `${index * 70}ms` } as CSSProperties;
}

export default function Home() {
  return (
    <>
      <ScrollReveal />
      <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-line/90 bg-white/95 px-5 py-3 backdrop-blur md:px-12">
        <a className="flex min-h-11 items-center" href="#top" aria-label="deweb početna">
          <Image src="/deweb-logo.svg" alt="deweb" width={136} height={31} priority />
        </a>
        <nav className="hidden items-center gap-8 text-sm font-extrabold text-muted md:flex" aria-label="Glavna navigacija">
          <a className="flex min-h-11 items-center hover:text-teal" href="#how-it-works">
            Kako funkcionira
          </a>
          <a className="flex min-h-11 items-center hover:text-teal" href="#examples">
            Primjeri
          </a>
          <a className="flex min-h-11 items-center hover:text-teal" href="#offer">
            Suradnja
          </a>
        </nav>
        <a className="hidden min-h-11 items-center justify-center rounded-lg bg-teal px-5 text-sm font-extrabold text-white shadow-[0_10px_22px_rgba(0,109,123,0.22)] md:inline-flex" href="#problem-form">
          Pošalji problem
        </a>
      </header>

      <main id="top">
        <section className="mx-auto grid w-[min(100%-36px,1120px)] gap-9 py-14 md:py-16 lg:min-h-[calc(100svh-156px)] lg:grid-cols-[1fr_0.88fr] lg:items-center">
          <div className="reveal-on-scroll" data-reveal>
            <p className="mb-4 text-sm font-black uppercase text-teal">Digitalna rješenja za male poduzetnike</p>
            <h1 className="mb-5 max-w-[680px] text-[2.45rem] font-black leading-[1.05] text-ink sm:text-[3.55rem] lg:text-[4.15rem]">
              <span className="typing-headline">
                Opišite problem u poslu. Mi predlažemo rješenje i izrađujemo alat.
              </span>
            </h1>
            <p className="mb-7 max-w-[660px] text-[1.03rem] leading-8 text-muted sm:text-[1.15rem] lg:text-[1.22rem]">
              Ne morate znati trebate li aplikaciju, automatizaciju, AI asistenta ili interni sustav.
              Vi objasnite problem, a deweb predloži nekoliko izvedivih rješenja.
            </p>
            <div className="grid gap-3 sm:flex sm:items-center">
              <a className="inline-flex min-h-[52px] items-center justify-center rounded-lg bg-orange px-6 py-3 text-base font-extrabold text-white shadow-[0_14px_28px_rgba(233,86,22,0.22)] transition hover:-translate-y-px hover:bg-orange-dark sm:min-w-[190px]" href="#problem-form">
                Pošalji problem
              </a>
              <a className="inline-flex min-h-[52px] items-center justify-center rounded-lg border border-[#b7ccd5] bg-white px-6 py-3 text-base font-extrabold text-teal-dark transition hover:-translate-y-px hover:border-teal sm:min-w-[190px]" href="#how-it-works">
                Kako funkcionira
              </a>
            </div>
            <p className="mt-5 max-w-[650px] text-sm leading-7 text-muted">
              Bez velikih obećanja. Prvo razumijemo problem, zatim predlažemo izvediv MVP.
            </p>
          </div>
          <HeroVisual />
        </section>

        <section className="border-y border-line bg-[#f4f9fb] py-14" aria-labelledby="problem-title">
          <div className="mx-auto w-[min(100%-36px,1120px)]">
            <h2 id="problem-title" className="reveal-on-scroll mb-7 max-w-3xl text-[1.9rem] font-black leading-tight text-ink sm:text-[2.5rem] lg:text-[3.05rem]" data-reveal>
              Prepoznajete li ovo?
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {problems.map((problem, index) => (
                <article className="motion-card reveal-on-scroll grid grid-cols-[auto_1fr] gap-4 rounded-lg border border-line bg-white p-5" data-reveal style={revealDelay(index)} key={problem}>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal text-xs font-black text-white">{String(index + 1).padStart(2, "0")}</span>
                  <p className="m-0 font-bold leading-7 text-[#18314f]">{problem}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid w-[min(100%-36px,1120px)] gap-8 py-16 lg:grid-cols-[0.88fr_1.12fr]" aria-labelledby="solution-title">
          <h2 id="solution-title" className="reveal-on-scroll max-w-3xl text-[1.9rem] font-black leading-tight text-ink sm:text-[2.5rem] lg:text-[3.05rem]" data-reveal>
            Ne prodajemo gotov alat za sve. Slažemo rješenje oko vašeg problema.
          </h2>
          <ol className="grid gap-3">
            {["Vi opišete problem.", "deweb predloži 2–3 rješenja.", "Zajedno biramo najjednostavniji izvediv smjer.", "Izrađujemo MVP ili interni alat.", "Nakon isporuke možemo održavati i nadograđivati."].map((item, index) => (
              <li className="motion-card reveal-on-scroll grid min-h-14 grid-cols-[32px_1fr] items-center gap-4 rounded-lg border border-line bg-white p-4 font-extrabold text-ink" data-reveal style={revealDelay(index)} key={item}>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-soft text-xs font-black text-teal-dark">{index + 1}</span>
                {item}
              </li>
            ))}
          </ol>
        </section>

        <section id="examples" className="mx-auto w-[min(100%-36px,1120px)] py-16" aria-labelledby="examples-title">
          <h2 id="examples-title" className="reveal-on-scroll mb-7 text-[1.9rem] font-black leading-tight text-ink sm:text-[2.5rem] lg:text-[3.05rem]" data-reveal>
            Primjeri rješenja
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {examples.map((example, index) => (
              <article className="motion-card reveal-on-scroll min-h-32 rounded-lg border border-line bg-gradient-to-b from-white to-[#f9fcfd] p-5" data-reveal style={revealDelay(index)} key={example}>
                <span className="mb-5 block h-9 w-9 rounded-lg border border-[#b7ccd5] bg-[linear-gradient(#006d7b,#006d7b),linear-gradient(#006d7b,#006d7b),linear-gradient(#006d7b,#006d7b)] bg-[length:18px_2px,13px_2px,20px_2px] bg-[position:9px_10px,9px_18px,9px_26px] bg-no-repeat" />
                <h3 className="m-0 text-base font-black leading-snug text-ink">{example}</h3>
              </article>
            ))}
          </div>
        </section>

        <section id="offer" className="border-y border-line bg-[#f4f9fb] py-14" aria-labelledby="offer-title">
          <div className="mx-auto w-[min(100%-36px,1120px)]">
            <h2 id="offer-title" className="reveal-on-scroll mb-7 text-[1.9rem] font-black leading-tight text-ink sm:text-[2.5rem] lg:text-[3.05rem]" data-reveal>
              Tri razine suradnje
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {offers.map((offer, index) => (
                <article className={`motion-card reveal-on-scroll rounded-lg border bg-white p-6 ${offer.featured ? "border-teal/50 shadow-soft" : "border-line"}`} data-reveal style={revealDelay(index)} key={offer.title}>
                  <p className="mb-5 inline-flex rounded-full bg-teal-soft px-3 py-1 text-xs font-black text-teal-dark">{offer.price}</p>
                  <h3 className="mb-3 text-2xl font-black leading-tight text-ink">{offer.title}</h3>
                  <p className="text-muted">{offer.description}</p>
                  <h4 className="mb-2 mt-6 text-xs font-black uppercase text-teal-dark">Najbolje za</h4>
                  <p className="text-muted">{offer.bestFor}</p>
                  <h4 className="mb-2 mt-6 text-xs font-black uppercase text-teal-dark">Dobivate</h4>
                  <p className="mb-0 text-muted">{offer.output}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="mx-auto w-[min(100%-36px,1120px)] py-16" aria-labelledby="how-title">
          <h2 id="how-title" className="reveal-on-scroll mb-7 text-[1.9rem] font-black leading-tight text-ink sm:text-[2.5rem] lg:text-[3.05rem]" data-reveal>
            Kako funkcionira
          </h2>
          <div className="process-motion-wrap reveal-on-scroll relative overflow-hidden rounded-lg border border-line bg-white" data-reveal>
            <span className="process-progress" aria-hidden="true" />
            <ol className="grid md:grid-cols-2 lg:grid-cols-3">
              {steps.map((step, index) => (
                <li className="process-step grid min-h-20 grid-cols-[42px_1fr] items-center gap-3 border-b border-line bg-white p-4 font-extrabold text-ink last:border-b-0 md:min-h-28 md:border-r lg:[&:nth-child(3n)]:border-r-0" style={revealDelay(index)} key={step}>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal text-sm font-black text-white">{index + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="border-y border-line bg-[#f4f9fb] py-14" aria-labelledby="why-title">
          <div className="mx-auto grid w-[min(100%-36px,1120px)] gap-8 lg:grid-cols-[0.88fr_1.12fr]">
            <h2 id="why-title" className="reveal-on-scroll text-[1.9rem] font-black leading-tight text-ink sm:text-[2.5rem] lg:text-[3.05rem]" data-reveal>
              Zašto deweb?
            </h2>
            <ul className="grid gap-3">
              {why.map((item, index) => (
                <li className="reveal-on-scroll relative border-b border-line py-4 pl-11 font-extrabold text-ink before:absolute before:left-2 before:top-5 before:h-5 before:w-5 before:rounded-full before:bg-orange after:absolute after:left-[15px] after:top-[23px] after:h-2.5 after:w-1.5 after:rotate-45 after:border-b-2 after:border-r-2 after:border-white" data-reveal style={revealDelay(index)} key={item}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="problem-form" className="mx-auto grid w-[min(100%-36px,1120px)] gap-8 py-16 lg:grid-cols-[0.88fr_1.12fr]" aria-labelledby="contact-title">
          <div className="reveal-on-scroll" data-reveal>
            <h2 id="contact-title" className="mb-3 text-[1.9rem] font-black leading-tight text-ink sm:text-[2.5rem] lg:text-[3.05rem]">
              Pošaljite problem
            </h2>
            <p className="max-w-xl text-lg leading-8 text-muted">
              Ne morate znati tehničko rješenje. Dovoljno je opisati što vam oduzima vrijeme,
              novac ili živce.
            </p>
          </div>
          <div className="reveal-on-scroll" data-reveal style={revealDelay(1)}>
            <ProblemForm />
          </div>
        </section>
      </main>

      <footer className="grid gap-4 border-t border-line bg-[#f4f9fb] px-5 py-8 md:flex md:items-center md:justify-between md:px-12">
        <div className="grid gap-2">
          <p className="m-0 text-sm font-extrabold text-ink">deweb</p>
          <a className="text-teal-dark underline underline-offset-4" href="https://deweb.hr">
            deweb.hr
          </a>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-extrabold text-muted" aria-label="Legalne stranice">
          <a className="hover:text-teal" href="/privatnost">
            Privatnost
          </a>
          <a className="hover:text-teal" href="/uvjeti">
            Uvjeti korištenja
          </a>
          <a className="hover:text-teal" href="/pravna-obavijest">
            Pravna obavijest
          </a>
        </nav>
      </footer>
    </>
  );
}

function HeroVisual() {
  return (
    <div className="hero-visual-motion reveal-on-scroll grid min-h-[420px] gap-5 overflow-hidden rounded-lg border border-line bg-[radial-gradient(circle_at_85%_12%,rgba(233,86,22,0.14),transparent_34%),linear-gradient(145deg,rgba(225,244,245,0.92),rgba(255,255,255,0.82))] p-6 shadow-soft md:grid-cols-[0.92fr_34px_1.12fr] md:items-center lg:min-h-[360px]" data-reveal aria-hidden="true">
      <div className="grid gap-3">
        {["WhatsApp upiti", "Email i pozivi", "Excel tablice", "Papirnate bilješke"].map((item, index) => (
          <div className="hero-source-card flex min-h-14 items-center gap-3 rounded-lg border border-line bg-white/95 p-3 font-black text-ink shadow-[0_10px_26px_rgba(8,42,61,0.08)]" style={revealDelay(index)} key={item}>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-soft text-xs font-black text-teal-dark">{item[0]}</span>
            {item}
          </div>
        ))}
      </div>
      <div className="hero-flow-line relative h-9 w-0.5 bg-[repeating-linear-gradient(180deg,#006d7b,#006d7b_6px,transparent_6px,transparent_12px)] md:h-0.5 md:w-9 md:bg-[repeating-linear-gradient(90deg,#006d7b,#006d7b_6px,transparent_6px,transparent_12px)]" />
      <div className="hero-dashboard rounded-lg border border-line bg-white/95 p-5 shadow-[0_10px_26px_rgba(8,42,61,0.08)]">
        <div className="mb-6 flex items-center justify-between text-sm font-black text-muted">
          <span>Pregled posla</span>
          <span className="rounded-full bg-teal-soft px-3 py-1 text-teal-dark">U redu</span>
        </div>
        <div className="mb-5 grid h-24 grid-cols-5 items-end gap-2 border-b border-line px-1">
          {[34, 58, 46, 74, 88].map((height) => (
            <span className="hero-chart-bar rounded-t-md bg-gradient-to-b from-[#1f8a97] to-[#c8edf0]" style={{ height: `${height}%` }} key={height} />
          ))}
        </div>
        <div className="mb-4 grid grid-cols-[82px_1fr] items-center gap-4">
          <span className="hero-donut relative h-20 w-20 rounded-full bg-[conic-gradient(#e95616_0_32%,#006d7b_32%_70%,#dce9ee_70%_100%)] after:absolute after:inset-[18px] after:rounded-full after:bg-white" />
          <span className="grid gap-3">
            <span className="h-3 rounded-full bg-[#dce9ee]" />
            <span className="h-3 w-4/5 rounded-full bg-[#dce9ee]" />
            <span className="h-3 w-3/5 rounded-full bg-[#dce9ee]" />
          </span>
        </div>
        <div className="flex justify-between border-t border-line py-3">
          <span>Upiti</span>
          <strong className="text-xl text-ink">18</strong>
        </div>
        <div className="flex justify-between border-t border-line py-3">
          <span>Čeka odgovor</span>
          <strong className="text-xl text-ink">4</strong>
        </div>
      </div>
    </div>
  );
}
