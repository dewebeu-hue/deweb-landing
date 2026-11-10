import Image from "next/image";
import type { Metadata } from "next";
import { ProblemForm } from "./problem-form";
import { ProjectLink } from "./project-link";
import { MobileMenu } from "./mobile-menu";
import { ScrollReveal } from "./scroll-reveal";
import { readProjectSelection, type ProjectSelectionParams } from "../lib/project-selection";
import { webOfferTerms, webPackages } from "../lib/web-packages";
import { SITE_ORIGIN } from "../lib/seo-policy";
import { SiteFooter } from "./site-footer";
import { Portfolio } from "./portfolio";
import { ProjectSpotlight } from "./project-spotlight";

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
  ["Radovi", "#radovi"],
  ["Web-stranice", "#web-stranice"],
  ["Interni alati", "#interni-alati"],
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
      <header className="sticky top-0 z-30 bg-white">
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
        <section className="hero-surface" aria-labelledby="hero-title">
          <div className={`${frame} grid items-center gap-8 py-10 md:py-16 min-[900px]:grid-cols-[0.9fr_1.1fr] lg:gap-12 lg:py-20`}>
            <div className="min-w-0">
              <h1 id="hero-title" className="max-w-[15ch] text-balance text-[clamp(2.35rem,4.6vw,3.75rem)] font-black leading-[1.05] tracking-[-0.035em] text-ink">
                Web-stranice i poslovni alati
              </h1>
              <p className="mt-5 max-w-[43ch] text-base leading-7 text-ink md:text-lg md:leading-8">
                Izrađujemo i redizajniramo poslovne web-stranice te razvijamo alate za upite, ponude i organizaciju posla.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-1">
                <a href="#kontakt" className="inline-flex min-h-[48px] items-center justify-center rounded-lg bg-teal px-5 py-3 text-sm font-extrabold text-white transition-[background-color,transform] duration-150 hover:bg-teal-dark focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-3 focus-visible:outline-orange-dark active:scale-[.97] motion-reduce:transform-none motion-reduce:transition-none motion-reduce:active:scale-100">Razgovarajmo o projektu</a>
                <a href="#radovi" className="inline-flex min-h-11 items-center text-sm font-extrabold text-teal-dark underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-orange-dark">Pogledajte radove</a>
              </div>
            </div>
            <ProjectSpotlight />
          </div>
        </section>

        <Portfolio />

        <section id="web-stranice" className={`${frame} py-16 md:py-20`} aria-labelledby="web-title">
          <div className="reveal-on-scroll grid gap-7 lg:grid-cols-[0.78fr_1.22fr] lg:gap-14" data-reveal><div><p className={`${eyebrow} mb-3`}>Web-stranice i redizajn</p><h2 id="web-title" className={heading}>Web koji jasno kaže što radite.</h2></div><p className="max-w-2xl text-lg leading-8 text-muted">Kroz kratak razgovor utvrđujemo što nudite i kome. Predlažemo raspored, uređujemo vaše informacije i izrađujemo web. Vi provjeravate točnost i odobravate završnu verziju.</p></div>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {webPackages.map((item, index) => <article key={item.id} data-reveal className={`motion-card reveal-on-scroll ${index === 1 ? "reveal-delay-1" : ""} flex flex-col rounded-2xl border p-6 md:p-8 ${item.id === "business" ? "border-teal bg-[#f0f8f8] shadow-[0_22px_55px_rgba(0,77,88,0.12)]" : "border-line bg-white"}`}>
              <div className="mb-5 flex min-h-7 items-center justify-between gap-2"><p className="m-0 text-xs font-black uppercase tracking-widest text-teal-dark">Web-paket {item.id === "simple" ? "01" : "02"}</p>{item.id === "business" && <span className="rounded-full bg-teal px-3 py-1 text-xs font-extrabold text-white">Preporučeni</span>}</div>
              <h3 className="text-[1.8rem] font-black leading-tight text-ink">{item.name}</h3><p className="mb-1 mt-2 text-4xl font-black tracking-tight text-ink">{item.price.toLocaleString("hr-HR")} €</p><p className="mb-6 text-sm font-semibold text-muted">Cijena izrade web-stranice</p>
              <p className="border-t border-line pt-5 font-extrabold leading-7 text-ink">{item.scope}</p>
              <p className="mt-3 rounded-lg bg-white/70 px-4 py-3 text-sm font-bold leading-6 text-ink">{item.bestFor}</p>
              <ul className="mb-8 mt-4 grid gap-3 text-sm leading-6 text-muted">{item.features.map(feature => <li key={feature} className="relative pl-6 before:absolute before:left-0 before:top-0 before:font-black before:text-teal-dark before:content-['✓']">{feature}</li>)}</ul>
              <ProjectLink type="web" packageId={item.id} className={`${item.id === "business" ? button : outlineButton} mt-auto w-full`}>Odaberite {item.name.toLowerCase()} <span aria-hidden="true" className="ml-2">↗</span></ProjectLink>
            </article>)}
          </div>
          <div className="mt-7 grid gap-5 rounded-2xl border border-line bg-[#f5f9fa] p-6 md:grid-cols-2 md:p-8">
            <div><h3 className="text-lg font-black text-ink">Što nije dio web-paketa</h3><p className="mt-3 text-sm leading-7 text-muted">{webOfferTerms.exclusions}</p><p className="mt-3 text-sm leading-7 text-muted">{webOfferTerms.editing}</p></div>
            <div><h3 className="text-lg font-black text-ink">Troškovi i dogovor</h3><p className="mt-3 text-sm leading-7 text-muted">{webOfferTerms.external}</p><p className="mt-3 text-sm leading-7 text-muted">{webOfferTerms.delivery}</p></div>
          </div>
          <p className="mt-5 text-sm font-bold leading-6 text-ink">{webOfferTerms.tax}</p>
          <aside className="mt-9 flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-t border-line pt-6" aria-labelledby="technical-review-title">
            <div>
              <h3 id="technical-review-title" className="text-lg font-black text-ink">Već imate web-stranicu?</h3>
              <p className="mt-2 text-sm leading-6 text-muted">Provjeravamo sigurnosne postavke, ažuriranja i rade li ključne funkcije vaše stranice.</p>
            </div>
            <a href="/tehnicka-provjera-weba" className="inline-flex min-h-11 items-center font-extrabold text-teal-dark underline underline-offset-4 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-3 focus-visible:outline-orange-dark">Tehnička provjera weba</a>
          </aside>
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
          <Faq q="Mogu li zadržati postojeću domenu?">Da. Ako već imate domenu, zadržavate postojeći račun i pristupe. Prije objave provjeravamo postavke domene i hostinga.</Faq>
          <Faq q="Tko kontrolira domenu i pristupe nakon izrade?">{webOfferTerms.ownership}</Faq>
          <Faq q="Mogu li kasnije mijenjati sadržaj?">{webOfferTerms.editing}</Faq>
          <Faq q="Moram li plaćati održavanje?">{webOfferTerms.maintenance}</Faq>
          <Faq q="Koji su dodatni i godišnji troškovi?">{webOfferTerms.external} {webOfferTerms.managedHosting}</Faq>
          <Faq q="Kako izgleda plaćanje i što se događa nakon objave?">{webOfferTerms.delivery}</Faq>
        </div></div></section>

        <section id="kontakt" className={`${frame} grid gap-9 py-16 md:py-20 lg:grid-cols-[0.78fr_1.22fr] lg:gap-16`} aria-labelledby="contact-title"><div className="reveal-on-scroll" data-reveal><p className={`${eyebrow} mb-3`}>Kontakt</p><h2 id="contact-title" className={heading}>Recite nam što trebate. Dobit ćete jasan prijedlog.</h2><p className="mt-5 leading-8 text-muted">Odaberite vrstu projekta i kratko opišite potrebu. Nije potrebna opsežna specifikacija ni slanje povjerljivih poslovnih podataka.</p><aside className="mt-7 rounded-xl border border-line bg-[#f5f9fa] p-5" aria-label="Izravni kontakt"><p className="text-sm font-black text-ink">Imate pitanje prije slanja upita?</p><p className="mt-3 font-extrabold text-ink">Dinko Vuković</p><p className="text-sm font-semibold text-muted">deweb</p><a className="mt-3 inline-flex min-h-11 items-center font-extrabold text-teal-dark underline underline-offset-4" href="mailto:dinko@deweb.hr">dinko@deweb.hr</a><p className="mt-3 text-sm leading-6 text-muted">Razgovarat ćete izravno s osobom koja vodi vaš projekt.</p></aside></div><div id="problem-form" className="scroll-mt-28"><ProblemForm initialSelection={initialSelection} /></div></section>
      </main>

      <SiteFooter />
    </>
  );
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return <details className="group rounded-xl border border-line bg-white px-5 py-4"><summary className="flex min-h-9 cursor-pointer list-none items-center justify-between gap-4 font-extrabold text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-dark">{q}<span aria-hidden="true" className="text-xl text-teal-dark group-open:rotate-45">+</span></summary><p className="mb-1 mt-4 border-t border-line pt-4 leading-7 text-muted">{children}</p></details>;
}
