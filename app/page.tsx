import Image from "next/image";
import type { Metadata } from "next";
import { ProblemForm } from "./problem-form";
import { ProjectLink } from "./project-link";
import { MobileMenu } from "./mobile-menu";
import { ScrollReveal } from "./scroll-reveal";
import { readProjectSelection, type ProjectSelectionParams } from "../lib/project-selection";
import { webOfferTerms, webPackages } from "../lib/web-packages";
import { SITE_ORIGIN } from "../lib/seo-policy";

export const metadata: Metadata = {
  title: "Izrada web-stranica i poslovnih aplikacija | deweb",
  description: "deweb izrađuje i redizajnira poslovne web-stranice te razvija interne alate i poslovne aplikacije po mjeri. Pogledajte ponudu i opišite svoj projekt.",
  openGraph: {
    title: "Izrada web-stranica i poslovnih aplikacija | deweb",
    description: "Izrada i redizajn poslovnih web-stranica te interni alati i poslovne aplikacije po mjeri.",
    url: `${SITE_ORIGIN}/`,
    siteName: "deweb",
    images: [{ url: "/og-deweb.png", width: 1200, height: 630, alt: "deweb — web-stranice i poslovne aplikacije" }],
    locale: "hr_HR",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

const frame = "mx-auto w-[min(100%-36px,1160px)]";
const eyebrow = "text-xs font-black uppercase tracking-[0.16em] text-teal-dark";
const heading = "text-[2rem] font-black leading-[1.12] tracking-[-0.035em] text-ink sm:text-[2.65rem] lg:text-[3.1rem]";
const button = "inline-flex min-h-[52px] items-center justify-center rounded-lg bg-teal px-6 py-3 text-center text-sm font-extrabold text-white shadow-[0_12px_25px_rgba(0,77,88,0.17)] transition hover:bg-teal-dark focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-3 focus-visible:outline-orange-dark";
const outlineButton = "inline-flex min-h-[52px] items-center justify-center rounded-lg border-2 border-teal bg-white px-6 py-3 text-center text-sm font-extrabold text-teal-dark transition hover:bg-teal-soft focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-3 focus-visible:outline-orange-dark";

const nav = [
  ["Web-stranice", "#web-stranice"],
  ["Interni alati", "#interni-alati"],
  ["Radovi", "#radovi"],
  ["Kako radimo", "#proces"],
  ["Kontakt", "#kontakt"],
] as const;

const toolExamples = [
  ["Upiti na više mjesta", "Evidencija upita može pokazati tko čeka odgovor i koji je sljedeći korak."],
  ["Ponude se sastavljaju ručno", "Alat može pomoći pripremiti dosljednu ponudu iz dogovorenih podataka."],
  ["Status posla nije jasan", "Pregled radnih naloga može povezati odgovorne osobe, korake i rokove."],
  ["Tim koristi nepovezane tablice", "Interni portal može objediniti podatke i dogovorene pristupe."],
] as const;

const process = [
  ["01", "Dogovor i ponuda", "Kratko razgovaramo o cilju, materijalima i opsegu. Dobivate prijedlog, cijenu i rok prije početka."],
  ["02", "Izrada i dorade", "Pripremamo strukturu i izvedbu. Vi dostavljate materijale, provjeravate točnost i objedinjeno šaljete dorade."],
  ["03", "Provjera i predaja", "Zajedno pregledamo dogovoreno rješenje. Web objavljujemo nakon prihvata i završnog plaćanja; za poslovne alate predaju definiramo ponudom."],
] as const;

export default async function Home({ searchParams }: { searchParams: Promise<ProjectSelectionParams> }) {
  const initialSelection = readProjectSelection(await searchParams);
  return (
    <>
      <link rel="canonical" href={`${SITE_ORIGIN}/`} />
      <ScrollReveal />
      <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
        <div className={`${frame} flex min-h-[76px] items-center justify-between gap-4`}>
          <a href="#vrh" aria-label="deweb — na početak" className="inline-flex min-h-11 items-center focus-visible:outline focus-visible:outline-4 focus-visible:outline-orange-dark">
            <Image src="/deweb-logo.svg" alt="deweb" width={136} height={31} priority />
          </a>
          <nav className="hidden items-center gap-6 lg:flex" aria-label="Glavna navigacija">
            {nav.map(([label, href]) => <a key={href} href={href} className="inline-flex min-h-11 items-center text-sm font-bold text-ink hover:text-teal focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-dark">{label}</a>)}
          </nav>
          <a href="#kontakt" className={`${button} hidden lg:inline-flex`}>Zatražite ponudu <span aria-hidden="true" className="ml-2">↗</span></a>
          <MobileMenu links={nav} />
        </div>
      </header>

      <main id="vrh">
        <section className="hero-surface overflow-hidden border-b border-line" aria-labelledby="hero-title">
          <div className={`${frame} grid gap-10 py-16 md:py-20 lg:min-h-[690px] lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-12`}>
            <div>
              <p className={`${eyebrow} mb-6`}>Web-stranice i poslovne aplikacije po mjeri</p>
              <h1 id="hero-title" className="max-w-[710px] text-[clamp(2.1rem,4.2vw,4rem)] font-black leading-[1.07] tracking-[-0.05em] text-ink">
                Web koji predstavlja vaš posao. <span className="block text-teal-dark">Alati koji ga pojednostavljuju.</span>
              </h1>
              <p className="mt-7 max-w-[650px] text-lg leading-8 text-[#536579] md:text-xl md:leading-9">Izrađujemo i redizajniramo poslovne web-stranice te razvijamo interne alate i poslovne aplikacije po mjeri — od predstavljanja usluga do organizacije upita, ponuda i svakodnevnog rada.</p>
              <div className="mt-9 grid gap-3 sm:flex sm:flex-wrap">
                <a href="#web-stranice" className={button}>Trebam web-stranicu <span aria-hidden="true" className="ml-2">↘</span></a>
                <a href="#interni-alati" className={outlineButton}>Trebam poslovni alat <span aria-hidden="true" className="ml-2">↘</span></a>
              </div>
              <p className="mt-5 text-sm font-semibold leading-6 text-muted">Dva različita puta, jedan jasan početak: recite nam što želite postići.</p>
            </div>
            <div className="hero-panels hidden gap-4 md:grid" aria-hidden="true">
              <div className="rounded-2xl border border-[#bfdce2] bg-white p-5 shadow-[0_24px_55px_rgba(8,42,61,0.1)] sm:p-6">
                <div className="mb-5 flex items-center justify-between border-b border-line pb-4"><span className="text-xs font-black uppercase tracking-widest text-teal-dark">01 / Predstaviti posao</span><span className="h-3 w-3 rounded-full bg-orange" /></div>
                <div className="mb-4 h-3 w-2/3 rounded-full bg-[#cbdde4]" /><div className="mb-6 h-3 w-4/5 rounded-full bg-[#e1ebef]" />
                <div className="grid grid-cols-3 gap-2"><div className="h-20 rounded-lg bg-[#def1f2]" /><div className="h-20 rounded-lg bg-[#f4e9e1]" /><div className="h-20 rounded-lg bg-[#e8eef4]" /></div>
                <div className="mt-5 h-8 w-28 rounded-lg bg-teal" />
              </div>
              <div className="ml-4 rounded-2xl border border-[#bfdce2] bg-[#f8fcfd] p-5 shadow-[0_24px_55px_rgba(8,42,61,0.1)] sm:ml-10 sm:p-6">
                <div className="mb-5 flex items-center justify-between border-b border-line pb-4"><span className="text-xs font-black uppercase tracking-widest text-teal-dark">02 / Pojednostaviti rad</span><span className="grid h-6 w-6 place-items-center rounded-md bg-teal text-xs font-bold text-white">✓</span></div>
                {["Upit zaprimljen", "Ponuda u pripremi", "Sljedeći korak dogovoren"].map((item, index) => <div key={item} className="mb-2 flex items-center gap-3 rounded-lg border border-line bg-white px-3 py-2 text-xs font-bold text-ink"><span className="grid h-6 w-6 place-items-center rounded-full bg-teal-soft text-teal-dark">{index + 1}</span>{item}</div>)}
              </div>
            </div>
          </div>
        </section>

        <section className={`${frame} py-16 md:py-20`} aria-labelledby="paths-title">
          <div className="mb-9 max-w-2xl"><p className={`${eyebrow} mb-3`}>Odaberite što vam treba</p><h2 id="paths-title" className={heading}>Jasnije predstavljanje ili jednostavniji rad?</h2></div>
          <div className="grid gap-5 md:grid-cols-2">
            <article className="motion-card reveal-on-scroll rounded-2xl border border-line bg-white p-7 shadow-[0_14px_38px_rgba(8,42,61,0.06)] md:p-9" data-reveal><span className="mb-6 block text-xs font-black uppercase tracking-widest text-teal-dark">Web-stranice / redizajn</span><h3 className="text-2xl font-black text-ink">Da vas kupci lakše razumiju i kontaktiraju.</h3><p className="mt-4 leading-7 text-muted">Struktura sadržaja, dizajn i izvedba za manju tvrtku ili obrt. Uz jasno definirane web-pakete znate što je uključeno.</p><a href="#web-stranice" className="mt-6 inline-flex min-h-11 items-center font-extrabold text-teal-dark underline underline-offset-4">Pogledajte web-ponudu <span aria-hidden="true" className="ml-2">↗</span></a></article>
            <article className="motion-card reveal-on-scroll reveal-delay-1 rounded-2xl border border-line bg-white p-7 shadow-[0_14px_38px_rgba(8,42,61,0.06)] md:p-9" data-reveal><span className="mb-6 block text-xs font-black uppercase tracking-widest text-teal-dark">Interni alati / aplikacije</span><h3 className="text-2xl font-black text-ink">Da se svakodnevni posao manje oslanja na improvizaciju.</h3><p className="mt-4 leading-7 text-muted">Ako upite, ponude ili status posla vodite na više mjesta, možemo procijeniti kakav bi alat imao smisla.</p><a href="#interni-alati" className="mt-6 inline-flex min-h-11 items-center font-extrabold text-teal-dark underline underline-offset-4">Pogledajte kako pristupamo alatima <span aria-hidden="true" className="ml-2">↗</span></a></article>
          </div>
        </section>

        <section id="radovi" className="border-y border-line bg-[#f5f9fa] py-16 md:py-20" aria-labelledby="work-title">
          <div className={frame}>
            <div className="reveal-on-scroll" data-reveal><p className={`${eyebrow} mb-3`}>Pogled u rad</p><h2 id="work-title" className={`${heading} max-w-3xl`}>Vlastiti web i alat, jasno označeni.</h2>
            <p className="mt-4 max-w-3xl leading-8 text-muted">Ovi primjeri pokazuju naš trenutni rad. Nisu klijentske reference ni tvrdnje o rezultatima.</p></div>
            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              <article className="reveal-on-scroll overflow-hidden rounded-2xl border border-line bg-white shadow-[0_16px_42px_rgba(8,42,61,0.07)]" data-reveal>
                <Image src="/work/deweb-landing-lokalno.png" alt="Prikaz lokalno izvedene naslovnice deweb stranice s dvije jasno odvojene usluge" width={1440} height={900} loading="lazy" sizes="(min-width: 1024px) 560px, 100vw" className="h-[250px] w-full border-b border-line object-cover object-top sm:h-[320px]" />
                <div className="p-6"><p className="text-xs font-black uppercase tracking-widest text-teal-dark">Vlastita stranica · lokalna verzija</p><h3 className="mt-3 text-xl font-black text-ink">deweb landing</h3><p className="mt-3 leading-7 text-muted">U ovoj izvedbi web-ponuda i poslovni alati imaju zasebne puteve, a odabir web-paketa vodi u kontaktni obrazac.</p></div>
              </article>
              <article className="reveal-on-scroll reveal-delay-1 overflow-hidden rounded-2xl border border-line bg-white shadow-[0_16px_42px_rgba(8,42,61,0.07)]" data-reveal>
                <Image src="/work/kalkulator-u-razvoju.png" alt="Prikaz sučelja vlastitog kalkulatora opsega webshopa u razvoju" width={1440} height={2116} loading="lazy" sizes="(min-width: 1024px) 560px, 100vw" className="h-[250px] w-full border-b border-line object-cover object-top sm:h-[320px]" />
                <div className="p-6"><p className="text-xs font-black uppercase tracking-widest text-teal-dark">Vlastiti alat · u razvoju</p><h3 className="mt-3 text-xl font-black text-ink">Kalkulator opsega webshopa</h3><p className="mt-3 leading-7 text-muted">Zahtjeve razlaže u razumljiv pregled i sljedeći korak. Prikaz je razvojna verzija; cijene webshopa nisu odobren cjenik.</p></div>
              </article>
            </div>
          </div>
        </section>

        <section id="web-stranice" className={`${frame} py-16 md:py-20`} aria-labelledby="web-title">
          <div className="reveal-on-scroll grid gap-7 lg:grid-cols-[0.78fr_1.22fr] lg:gap-14" data-reveal><div><p className={`${eyebrow} mb-3`}>Web-stranice i redizajn</p><h2 id="web-title" className={heading}>Web koji jasno kaže što radite.</h2></div><p className="max-w-2xl text-lg leading-8 text-muted">Kroz kratak razgovor utvrđujemo što nudite i kome. Predlažemo raspored, uređujemo vaše informacije i izrađujemo web. Vi provjeravate točnost i odobravate završnu verziju.</p></div>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {webPackages.map((item, index) => <article key={item.id} data-reveal className={`motion-card reveal-on-scroll ${index === 1 ? "reveal-delay-1" : ""} flex flex-col rounded-2xl border p-6 md:p-8 ${item.id === "business" ? "border-teal bg-[#f0f8f8] shadow-[0_22px_55px_rgba(0,77,88,0.12)]" : "border-line bg-white"}`}>
              <div className="mb-5 flex min-h-7 items-center justify-between gap-2"><p className="m-0 text-xs font-black uppercase tracking-widest text-teal-dark">Web-paket {item.id === "simple" ? "01" : "02"}</p>{item.id === "business" && <span className="rounded-full bg-teal px-3 py-1 text-xs font-extrabold text-white">Preporučeni</span>}</div>
              <h3 className="text-[1.8rem] font-black leading-tight text-ink">{item.name}</h3><p className="mb-1 mt-2 text-4xl font-black tracking-tight text-ink">{item.price.toLocaleString("hr-HR")} €</p><p className="mb-6 text-sm font-semibold text-muted">Cijena izrade web-stranice</p>
              <p className="border-t border-line pt-5 font-extrabold leading-7 text-ink">{item.scope}</p>
              <ul className="mb-8 mt-4 grid gap-3 text-sm leading-6 text-muted">{item.features.map(feature => <li key={feature} className="relative pl-6 before:absolute before:left-0 before:top-0 before:font-black before:text-teal-dark before:content-['✓']">{feature}</li>)}</ul>
              <ProjectLink type="web" packageId={item.id} className={`${item.id === "business" ? button : outlineButton} mt-auto w-full`}>Odaberite {item.name.toLowerCase()} <span aria-hidden="true" className="ml-2">↗</span></ProjectLink>
            </article>)}
          </div>
          <div className="mt-7 grid gap-5 rounded-2xl border border-line bg-[#f5f9fa] p-6 md:grid-cols-2 md:p-8">
            <div><h3 className="text-lg font-black text-ink">Što nije dio web-paketa</h3><p className="mt-3 text-sm leading-7 text-muted">{webOfferTerms.exclusions}</p><p className="mt-3 text-sm leading-7 text-muted">{webOfferTerms.editing}</p></div>
            <div><h3 className="text-lg font-black text-ink">Troškovi i dogovor</h3><p className="mt-3 text-sm leading-7 text-muted">{webOfferTerms.external}</p><p className="mt-3 text-sm leading-7 text-muted">{webOfferTerms.delivery}</p></div>
          </div>
          <p className="mt-5 text-sm font-bold leading-6 text-ink">{webOfferTerms.tax}</p>
        </section>

        <section id="interni-alati" className="border-y border-line bg-[#eaf5f5] py-16 md:py-20" aria-labelledby="tools-title">
          <div className={frame}>
            <div className="reveal-on-scroll grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16" data-reveal><div><p className={`${eyebrow} mb-3`}>Interni alati i poslovne aplikacije</p><h2 id="tools-title" className={heading}>Manje ručnog prepisivanja. Bolji pregled posla.</h2></div><div><p className="text-lg leading-8 text-muted">Izrađujemo alate prema stvarnom procesu: od jednostavne evidencije do poslovne aplikacije ili SaaS rješenja kada takav opseg ima smisla. Prvo provjeravamo što treba riješiti i što je izvedivo.</p><p className="mt-5 text-xl font-black text-teal-dark">Ponuda prema opsegu.</p></div></div>
            <p className="mt-10 text-xs font-black uppercase tracking-widest text-teal-dark">Primjeri mogućih projekata</p>
            <div className="reveal-on-scroll mt-4 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2" data-reveal>{toolExamples.map(([problem, possibility], i) => <article key={problem} className="bg-white p-6 md:p-7"><span className="text-sm font-black text-orange-dark">0{i + 1}</span><h3 className="mt-3 text-xl font-black text-ink">{problem}</h3><p className="mt-3 leading-7 text-muted">{possibility}</p></article>)}</div>
            <div className="mt-9 flex flex-wrap items-center gap-5"><ProjectLink type="tool" className={button}>Opišite svoj proces <span aria-hidden="true" className="ml-2">↗</span></ProjectLink><p className="m-0 max-w-lg text-sm leading-6 text-muted">Prvo provjeravamo što treba riješiti, što je izvedivo i koji opseg ima smisla.</p></div>
          </div>
        </section>

        <section id="proces" className={`${frame} py-16 md:py-20`} aria-labelledby="process-title"><div className="reveal-on-scroll" data-reveal><p className={`${eyebrow} mb-3`}>Kako radimo</p><h2 id="process-title" className={heading}>Od prvog razgovora do jasne predaje.</h2></div><div className="mt-9 grid gap-4 md:grid-cols-3">{process.map(([num, title, copy], index) => <article key={num} data-reveal className={`reveal-on-scroll ${index === 0 ? "" : `reveal-delay-${index}`} border-t-2 border-teal pt-5`}><span className="text-sm font-black text-teal-dark">{num}</span><h3 className="mt-5 text-xl font-black text-ink">{title}</h3><p className="mt-3 leading-7 text-muted">{copy}</p></article>)}</div></section>

        <section id="pitanja" className="border-y border-line bg-[#f5f9fa] py-16 md:py-20" aria-labelledby="faq-title"><div className={`${frame} grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:gap-16`}><div className="reveal-on-scroll" data-reveal><p className={`${eyebrow} mb-3`}>Česta pitanja</p><h2 id="faq-title" className={heading}>Prije nego što krenemo.</h2></div><div className="grid gap-3">
          <Faq q="Moram li imati pripremljene tekstove i fotografije?">Dostavljate informacije i materijale koje imate. Mi ih uređujemo i raspoređujemo u dogovorenom opsegu; vi potvrđujete njihovu točnost.</Faq>
          <Faq q="Možete li obnoviti postojeću stranicu?">Da, redizajn je moguća polazna točka. Nakon pregleda postojećeg weba i sadržaja predlažemo odgovarajući opseg.</Faq>
          <Faq q="Mogu li zadržati postojeću domenu?">To ovisi o pristupu i postavkama postojeće domene i hostinga. Provjeravamo ih prije dogovora o objavi.</Faq>
          <Faq q="Mogu li sam mijenjati sadržaj?">{webOfferTerms.editing} Ne podrazumijevamo CMS bez prethodnog dogovora.</Faq>
          <Faq q="Koji su dodatni i godišnji troškovi?">{webOfferTerms.external}</Faq>
          <Faq q="Kako izgleda plaćanje i što se događa nakon objave?">{webOfferTerms.delivery} Održavanje se dogovara zasebno.</Faq>
        </div></div></section>

        <section id="kontakt" className={`${frame} grid gap-9 py-16 md:py-20 lg:grid-cols-[0.78fr_1.22fr] lg:gap-16`} aria-labelledby="contact-title"><div className="reveal-on-scroll" data-reveal><p className={`${eyebrow} mb-3`}>Kontakt</p><h2 id="contact-title" className={heading}>Recite nam što trebate. Dobit ćete jasan prijedlog.</h2><p className="mt-5 leading-8 text-muted">Odaberite vrstu projekta i kratko opišite potrebu. Nije potrebna opsežna specifikacija ni slanje povjerljivih poslovnih podataka.</p></div><div id="problem-form" className="scroll-mt-28"><ProblemForm initialSelection={initialSelection} /></div></section>
      </main>

      <footer className="border-t border-line bg-[#f5f9fa] py-8"><div className={`${frame} flex flex-wrap items-center justify-between gap-6`}><div><Image src="/deweb-logo.svg" alt="deweb" width={110} height={25} /><p className="mt-3 text-sm text-muted">Web-stranice i poslovni alati po mjeri.</p></div><nav aria-label="Pravne stranice" className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold text-teal-dark"><a href="/privatnost" className="underline underline-offset-4">Privatnost</a><a href="/uvjeti" className="underline underline-offset-4">Uvjeti korištenja</a><a href="/pravna-obavijest" className="underline underline-offset-4">Pravna obavijest</a></nav></div></footer>
    </>
  );
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return <details className="group rounded-xl border border-line bg-white px-5 py-4"><summary className="flex min-h-9 cursor-pointer list-none items-center justify-between gap-4 font-extrabold text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-dark">{q}<span aria-hidden="true" className="text-xl text-teal-dark group-open:rotate-45">+</span></summary><p className="mb-1 mt-4 border-t border-line pt-4 leading-7 text-muted">{children}</p></details>;
}
