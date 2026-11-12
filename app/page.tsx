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
import serviceIllustration from "./service-illustration.module.css";

export const metadata: Metadata = {
  title: "Izrada web-stranica, webshopova i poslovnih alata | deweb",
  description: "deweb izrađuje web-stranice, webshopove i poslovne alate po mjeri. Pogledajte radove i opišite svoj projekt.",
  openGraph: {
    title: "Izrada web-stranica, webshopova i poslovnih alata | deweb",
    description: "Izrada web-stranica, webshopova i poslovnih alata po mjeri.",
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
const button = "inline-flex min-h-[52px] items-center justify-center rounded-lg bg-teal px-6 py-3 text-center text-sm font-extrabold text-white transition hover:bg-teal-dark focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-3 focus-visible:outline-orange-dark";
const outlineButton = "inline-flex min-h-[52px] items-center justify-center rounded-lg border-2 border-teal bg-white px-6 py-3 text-center text-sm font-extrabold text-teal-dark transition hover:bg-teal-soft focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-3 focus-visible:outline-orange-dark";
const topAction = "min-h-12 items-center justify-center rounded-lg bg-teal px-5 py-3 text-center text-sm font-extrabold text-white transition-[background-color,transform] duration-150 hover:bg-teal-dark focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-3 focus-visible:outline-orange-dark active:scale-[.97] motion-reduce:transform-none motion-reduce:transition-none motion-reduce:active:scale-100";

const nav = [
  ["Web-stranice", "#web-stranice"],
  ["Webshopovi", "#webshopovi"],
  ["Poslovni alati", "#interni-alati"],
  ["Radovi", "#radovi"],
  ["Kontakt", "#kontakt"],
] as const;

const servicePaths = [
  { id: "web", goal: "Predstaviti posao i primati upite", service: "Web-stranice i redizajn", href: "#web-stranice" },
  { id: "shop", goal: "Prodavati online", service: "Izrada i dorada webshopa", href: "#webshopovi" },
  { id: "tool", goal: "Smanjiti ručni rad", service: "Poslovni alati za upite, ponude i evidenciju", href: "#interni-alati" },
] as const;

const serviceImageSizes = "(min-width: 1200px) 510px, (min-width: 768px) 42vw, (min-width: 356px) 320px, calc(100vw - 36px)";

const toolExamples = [
  ["Upiti na više mjesta", "Evidencija upita može pokazati tko čeka odgovor i koji je sljedeći korak."],
  ["Ponude se sastavljaju ručno", "Alat može pomoći pripremiti dosljednu ponudu iz dogovorenih podataka."],
  ["Status posla nije jasan", "Pregled radnih naloga može povezati odgovorne osobe, korake i rokove."],
  ["Tim koristi nepovezane tablice", "Interni portal može objediniti podatke i dogovorene pristupe."],
] as const;

const process = [
  ["Dogovor i ponuda", "Kratko razgovaramo o cilju, materijalima i opsegu. Dobivate prijedlog, cijenu i rok prije početka."],
  ["Izrada i dorade", "Pripremamo strukturu i izvedbu. Vi dostavljate materijale, provjeravate točnost i objedinjeno šaljete dorade."],
  ["Provjera i predaja", "Zajedno pregledamo dogovoreno rješenje. Web objavljujemo nakon prihvata i završnog plaćanja; za poslovne alate predaju definiramo ponudom."],
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
          <a href="#kontakt" className={`${topAction} hidden lg:inline-flex`}>Zatražite ponudu</a>
          <MobileMenu links={nav} />
        </div>
      </header>

      <main id="vrh">
        <section className="hero-surface" aria-labelledby="hero-title">
          <div className={`${frame} ${serviceIllustration.art} grid items-center gap-4 py-9 md:grid-cols-[1.08fr_0.92fr] md:gap-8 md:py-14 lg:gap-14 lg:py-[68px]`}>
            <div className="min-w-0 max-w-[570px]">
              <h1 id="hero-title" className="text-balance text-[clamp(2.55rem,4.9vw,4.4rem)] font-black leading-[1.02] tracking-[-0.04em] text-ink">
                Web za kupce. <span className="text-teal-dark">Alati za vaš tim.</span>
              </h1>
              <p className="mt-4 max-w-[44ch] text-base leading-7 text-ink md:mt-5 md:text-xl md:leading-8">
                Izrađujemo web-stranice, webshopove i poslovne alate po mjeri. Web-stranice od {webPackages[0].price.toLocaleString("hr-HR")} €.
              </p>
              <nav className="mt-6 md:mt-8" aria-label="Odaberite što želite postići">
                <ul className="grid gap-2">
                  {servicePaths.map(({ id, goal, service, href }) => (
                    <li key={href}>
                      <a href={href} data-service-choice={id} className={`${serviceIllustration.choice} group flex min-h-[65px] items-center justify-between gap-3 rounded-lg bg-white px-4 py-3 text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-dark md:px-5`}>
                        <span className="grid min-w-0 gap-0.5">
                          <strong className="text-[0.98rem] font-extrabold leading-snug md:text-[1.04rem]">{goal}</strong>
                          <span className="text-sm leading-snug text-teal-dark">{service}</span>
                        </span>
                        <span aria-hidden="true" className="mr-1 size-2.5 shrink-0 rotate-45 border-r-2 border-t-2 border-teal transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0" />
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
              <ProjectLink type="unsure" className="mt-2 inline-flex min-h-11 items-center text-sm font-bold text-teal-dark underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-orange-dark">Nisam siguran što mi treba</ProjectLink>
            </div>
            <div aria-hidden="true" className="pointer-events-none relative mx-auto aspect-square w-full max-w-[20rem] select-none md:max-w-[510px]">
              <div className={serviceIllustration.platform} />
              {servicePaths.map(({ id }) => (
                <div key={id} className={`${serviceIllustration.piece} ${serviceIllustration[id]}`}>
                  {id === "web" ? (
                    <div className={serviceIllustration.browser}>
                      <div className={serviceIllustration.browserBar}>
                        <span className={serviceIllustration.browserControls} />
                        <span className={serviceIllustration.browserAddress}>www.</span>
                      </div>
                      <div className={serviceIllustration.browserPage}>
                        <div className={serviceIllustration.browserNav} />
                        <div className={serviceIllustration.browserCopy}>
                          <span />
                          <span />
                          <span />
                        </div>
                        <div className={serviceIllustration.browserImage} />
                      </div>
                    </div>
                  ) : id === "tool" ? (
                    <div className={serviceIllustration.toolTile} />
                  ) : (
                    <Image
                      src="/deweb-usluge.webp"
                      alt=""
                      fill
                      sizes={serviceImageSizes}
                      loading="eager"
                      className={serviceIllustration.texture}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="web-stranice" className={`${frame} py-16 md:py-20`} aria-labelledby="web-title">
          <div className="reveal-on-scroll grid gap-4 lg:grid-cols-[0.78fr_1.22fr] lg:gap-14" data-reveal><h2 id="web-title" className={heading}>Web-stranice i redizajn</h2><p className="max-w-2xl text-lg leading-8 text-muted">Za tvrtke koje žele jasno predstaviti ponudu i olakšati kupcima slanje upita. Dogovaramo sadržaj, izrađujemo stranicu i zajedno pregledavamo završnu verziju.</p></div>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {webPackages.map((item, index) => <article key={item.id} data-reveal className={`reveal-on-scroll ${index === 1 ? "reveal-delay-1" : ""} flex flex-col rounded-xl border p-6 md:p-8 ${item.id === "business" ? "border-teal-soft bg-[#f0f8f8]" : "border-line bg-white"}`}>
              <h3 className="text-[1.8rem] font-black leading-tight text-ink">{item.name}</h3><p className="mb-1 mt-2 text-4xl font-black tracking-tight text-ink">{item.price.toLocaleString("hr-HR")} €</p><p className="mb-6 text-sm font-semibold text-muted">Cijena izrade web-stranice</p>
              <p className="font-extrabold leading-7 text-ink">{item.scope}</p>
              <p className="mt-3 rounded-lg bg-white/70 px-4 py-3 text-sm font-bold leading-6 text-ink">{item.bestFor}</p>
              <ul className="mb-8 mt-4 grid list-disc gap-3 pl-5 text-sm leading-6 text-muted marker:text-teal-dark">{item.features.map(feature => <li key={feature}>{feature}</li>)}</ul>
              <ProjectLink type="web" packageId={item.id} className={`${item.id === "business" ? button : outlineButton} mt-auto w-full`}>Odaberite {item.name.toLowerCase()}</ProjectLink>
            </article>)}
          </div>
          <div className="mt-7 grid gap-5 rounded-2xl border border-line bg-[#f5f9fa] p-6 md:grid-cols-2 md:p-8">
            <div><h3 className="text-lg font-black text-ink">Što nije dio web-paketa</h3><p className="mt-3 text-sm leading-7 text-muted">{webOfferTerms.exclusions}</p><p className="mt-3 text-sm leading-7 text-muted">{webOfferTerms.editing}</p></div>
            <div><h3 className="text-lg font-black text-ink">Troškovi i dogovor</h3><p className="mt-3 text-sm leading-7 text-muted">{webOfferTerms.external}</p><p className="mt-3 text-sm leading-7 text-muted">{webOfferTerms.delivery}</p></div>
          </div>
          <p className="mt-5 text-sm font-bold leading-6 text-ink">{webOfferTerms.tax}</p>
          <aside className="mt-9 flex flex-wrap items-center justify-between gap-x-8 gap-y-3" aria-labelledby="technical-review-title">
            <div>
              <h3 id="technical-review-title" className="text-lg font-black text-ink">Već imate web-stranicu?</h3>
              <p className="mt-2 text-sm leading-6 text-muted">Provjeravamo sigurnosne postavke, ažuriranja i rade li ključne funkcije vaše stranice.</p>
            </div>
            <a href="/tehnicka-provjera-weba" className="inline-flex min-h-11 items-center font-extrabold text-teal-dark underline underline-offset-4 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-3 focus-visible:outline-orange-dark">Tehnička provjera weba</a>
          </aside>
        </section>

        <section id="webshopovi" className="bg-[#e5f3f5] py-14 md:py-20" aria-labelledby="shop-title">
          <div className={`${frame} grid items-start gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16`}>
            <h2 id="shop-title" className={heading}>Webshopovi po mjeri</h2>
            <div>
              <p className="max-w-[56ch] text-lg leading-8 text-ink">Prije izrade dogovaramo kako ćete voditi katalog, naplaćivati narudžbe i organizirati dostavu. Opseg i cijenu definiramo prema vašoj trgovini i potrebnim integracijama.</p>
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
                <ProjectLink type="shop" className={`${topAction} inline-flex`}>Razgovarajmo o webshopu</ProjectLink>
                <a href="/alati/kalkulator-cijene-webshopa" className="inline-flex min-h-11 items-center text-sm font-extrabold text-teal-dark underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-orange-dark">Izračunajte cijenu webshopa</a>
              </div>
            </div>
          </div>
        </section>

        <section id="interni-alati" className="py-16 md:py-20" aria-labelledby="tools-title">
          <div className={frame}>
            <div className="reveal-on-scroll grid gap-4 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16" data-reveal><h2 id="tools-title" className={heading}>Poslovni alati po mjeri</h2><div><p className="text-lg leading-8 text-muted">Krećemo od posla koji danas radite ručno. Ovisno o potrebi, izrađujemo alat za evidenciju, ponude, upite ili radne naloge. Ponudu definiramo prema dogovorenom opsegu.</p></div></div>
            <div className="reveal-on-scroll mt-9 grid gap-3 sm:grid-cols-2" data-reveal>
              {toolExamples.map(([problem, possibility]) => (
                <article key={problem} className="rounded-xl bg-[#f5f9fa] p-6 md:p-7">
                  <h3 className="text-xl font-black text-ink">{problem}</h3>
                  <p className="mt-3 leading-7 text-muted">{possibility}</p>
                </article>
              ))}
            </div>
            <div className="mt-9 flex flex-wrap items-center gap-5"><ProjectLink type="tool" className={button}>Opišite svoj proces</ProjectLink><p className="m-0 max-w-lg text-sm leading-6 text-muted">Prvo provjeravamo što treba riješiti, što je izvedivo i koji opseg ima smisla.</p></div>
          </div>
        </section>

        <Portfolio />

        <section id="proces" className={`${frame} py-16 md:py-20`} aria-labelledby="process-title">
          <h2 id="process-title" className={heading}>Kako izgleda suradnja</h2>
          <ol className="mt-9 grid list-decimal gap-7 pl-6 marker:font-black marker:text-teal-dark md:grid-cols-3 md:gap-12">
            {process.map(([title, copy], index) => (
              <li key={title} data-reveal className={`reveal-on-scroll ${index === 0 ? "" : `reveal-delay-${index}`}`}>
                <h3 className="pl-1 text-xl font-black text-ink">{title}</h3>
                <p className="mt-3 pl-1 leading-7 text-muted">{copy}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="pitanja" className="bg-[#f5f9fa] py-16 md:py-20" aria-labelledby="faq-title"><div className={`${frame} grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:gap-16`}><div className="reveal-on-scroll" data-reveal><p className={`${eyebrow} mb-3`}>Česta pitanja</p><h2 id="faq-title" className={heading}>Prije nego što krenemo.</h2></div><div className="grid gap-3">
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
  return <details className="group rounded-xl border border-line bg-white px-5 py-4"><summary className="flex min-h-9 cursor-pointer list-none items-center justify-between gap-4 font-extrabold text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-dark">{q}<span aria-hidden="true" className="text-xl text-teal-dark group-open:rotate-45">+</span></summary><p className="mb-1 mt-4 leading-7 text-muted">{children}</p></details>;
}
