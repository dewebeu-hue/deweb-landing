import type { Metadata } from "next";
import { ProblemForm } from "./problem-form";
import { ProjectLink } from "./project-link";
import { ScrollReveal } from "./scroll-reveal";
import { Portfolio } from "./portfolio";
import { ServiceHero } from "./service-hero";
import { FeatureIcon } from "./feature-icon";
import { Icon } from "./ui-icon";
import { readProjectSelection, type ProjectSelectionParams } from "../lib/project-selection";
import { webOfferTerms, webPackages } from "../lib/web-packages";
import { SITE_ORIGIN } from "../lib/seo-policy";

export const metadata: Metadata = {
  title: "Izrada web-stranica, webshopova i poslovnih alata | deweb",
  description: "deweb izrađuje web-stranice, webshopove i poslovne alate po mjeri. Pogledajte radove i opišite svoj projekt.",
  openGraph: {
    title: "Izrada web-stranica, webshopova i poslovnih alata | deweb",
    description: "Izrada web-stranica, webshopova i poslovnih alata po mjeri.",
    url: SITE_ORIGIN + "/",
    siteName: "deweb",
    images: [{ url: "/og-deweb.png", width: 1200, height: 630, alt: "deweb — web-stranice i poslovne aplikacije" }],
    locale: "hr_HR",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

const process = [
  ["Dogovor i ponuda", "Razgovaramo o cilju i materijalima. Prije početka znate što ulazi u projekt, koliko košta i koji je rok."],
  ["Izrada i dorade", "Dobivate verziju koju možete isprobati. Zajedno prolazimo sadržaj i ugrađujemo dogovorene dorade."],
  ["Provjera i predaja", "Provjeravamo rješenje na mobitelu i računalu. Web objavljujemo nakon prihvata i završnog plaćanja, a predaju poslovnog alata definiramo ponudom."],
] as const;

const questions = [
  ["Tko priprema tekstove i fotografije?", "Vi šaljete informacije i materijale koje imate. Mi ih uređujemo u dogovorenom opsegu, a vi potvrđujete završni sadržaj."],
  ["Možete li obnoviti postojeći web?", "Da. Pregledamo postojeću stranicu, sadržaj i funkcije koje koristite pa predložimo opseg redizajna."],
  ["Mogu li zadržati svoju domenu i pristupe?", webOfferTerms.ownership],
  ["Mogu li kasnije mijenjati sadržaj?", webOfferTerms.editing],
  ["Je li održavanje obvezno?", webOfferTerms.maintenance],
  ["Što se ugovara izvan web-paketa?", webOfferTerms.exclusions],
  ["Koji su dodatni i godišnji troškovi?", webOfferTerms.external + " " + webOfferTerms.managedHosting],
  ["Kako se dogovaraju plaćanje i rok?", webOfferTerms.delivery],
] as const;

export default async function Home({ searchParams }: { searchParams: Promise<ProjectSelectionParams> }) {
  const initialSelection = readProjectSelection(await searchParams);
  return (
    <main id="sadrzaj">
      <link rel="canonical" href={`${SITE_ORIGIN}/`} />
      <ScrollReveal />
      <section id="vrh" className="hero-surface" aria-labelledby="hero-title">
        <ServiceHero />
      </section>

      <Portfolio />

      <section id="web-stranice" className="pricing-section section" aria-labelledby="web-title">
        <div className="frame">
          <div className="section-intro">
            <h2 id="web-title" className="icon-heading"><FeatureIcon name="web" /><span>Web-stranice i redizajn</span></h2>
            <p>Jedna stranica za sažetu ponudu ili zasebne stranice za usluge, radove i kontakt. Oba paketa uključuju pripremu za mobitel i objavu.</p>
          </div>
          <div className="plans">
            {webPackages.map(item => (
              <article key={item.id} className={"plan " + (item.id === "business" ? "plan-business" : "")}>
                <h3>{item.name}</h3>
                <p className="price">{item.price.toLocaleString("hr-HR")} <span>€</span></p>
                <p className="plan-scope">{item.scope}.</p>
                <ul>
                  {item.features.map(feature => <li key={feature}><Icon name="check" />{feature}</li>)}
                </ul>
                <ProjectLink type="web" packageId={item.id} className="text-link">
                  Zatražite ponudu <span className="sr-only">za paket {item.name}</span><Icon name="up-right" />
                </ProjectLink>
              </article>
            ))}
          </div>
          <div className="package-notes">
            <div>
              <p>Usluge su namijenjene isključivo poslovnim korisnicima — trgovačkim društvima, obrtima i drugim subjektima koji ih ugovaraju za potrebe svoje poslovne ili profesionalne djelatnosti.</p>
              <p>{webOfferTerms.tax} Domena, hosting i licence ugovaraju se zasebno.</p>
            </div>
            <a className="text-link" href="#pitanja">Detalji paketa i troškova <Icon name="down" /></a>
          </div>
          <aside className="review-link">
            <div><h3>Već imate web?</h3><p>Možemo provjeriti postavke, obrasce i ključne funkcije prije dorade.</p></div>
            <a className="text-link" href="/tehnicka-provjera-weba"><FeatureIcon name="audit" />Tehnička provjera weba <Icon name="right" /></a>
          </aside>
        </div>
      </section>

      <section id="webshopovi" className="section shop-section" aria-labelledby="shop-title">
        <div className="frame shop-grid">
          <div className="shop-intro">
            <h2 id="shop-title" className="icon-heading"><FeatureIcon name="shop" /><span>Webshopovi po mjeri</span></h2>
            <p>Katalog, plaćanje i dostavu povezujemo u trgovinu koju možete voditi svaki dan. Novi webshop, redizajn ili preseljenje procjenjujemo prema vašim proizvodima i načinu rada.</p>
            <ProjectLink type="shop" className="text-link">Zatražite ponudu za webshop <Icon name="up-right" /></ProjectLink>
          </div>
          <div className="shop-tool">
            <h3 className="icon-heading"><FeatureIcon name="calculator" /><span>Kalkulator cijene webshopa</span></h3>
            <p>Odaberite veličinu kataloga, način unosa proizvoda i dodatne funkcije. Svoj odabir možete priložiti upitu.</p>
            <a className="button button-light" href="/alati/kalkulator-cijene-webshopa">Otvorite kalkulator <Icon name="right" /></a>
          </div>
        </div>
      </section>

      <section id="interni-alati" className="frame section" aria-labelledby="tools-title">
        <div className="tools-grid">
          <div className="tools-intro">
            <h2 id="tools-title" className="icon-heading"><FeatureIcon name="tool" /><span>Poslovni alati po mjeri</span></h2>
            <p className="lede">Pokažite nam kako danas radite ili opišite što tek želite uvesti. Zajedno određujemo što alat treba omogućiti ljudima koji ga koriste i koje podatke trebaju imati pri ruci.</p>
            <ProjectLink type="tool" className="text-link">Opišite što vam treba <Icon name="up-right" /></ProjectLink>
          </div>
          <article className="tool-examples">
            <h3>Što alat može olakšati?</h3>
            <ul>
              <li>Planiranje smjena i raspoređivanje ekipa na terenu</li>
              <li>Praćenje zaliha i opreme na više lokacija</li>
              <li>Slanje dokumenata na odobrenje i praćenje rokova</li>
              <li>Pripremu izvještaja iz podataka u više programa</li>
            </ul>
          </article>
        </div>
        <details className="disclosure experiments">
          <summary>Piloti, prototipi i razvoj <Icon name="plus" /></summary>
          <div className="experiment-list">
            <div><h4>Ponude</h4><p>U pilot-aplikaciji tim odabire artikle iz kataloga, sastavlja ponudu sa slikama, preuzima PDF i postavlja podsjetnik za razgovor s kupcem.</p></div>
            <div><h4>Konfiguratori za ponude</h4><p>Demonstracije u kojima kupac bira opcije proizvoda, a prodaja dobiva strukturiran upit.</p></div>
            <div><h4>VSME Passport</h4><p>Alat u razvoju za organiziranje podataka o održivosti malih i srednjih poduzeća.</p></div>
          </div>
        </details>
      </section>

      <section id="proces" className="process-section section" aria-labelledby="process-title">
        <div className="frame">
          <h2 id="process-title">Kako izgleda suradnja</h2>
          <ol className="process-list">
            {process.map(([title, copy]) => <li key={title} className="reveal-on-scroll" data-reveal><h3>{title}</h3><p>{copy}</p></li>)}
          </ol>
        </div>
      </section>

      <section id="pitanja" className="frame section split-section" aria-labelledby="faq-title">
        <h2 id="faq-title">Česta pitanja</h2>
        <div>
          {questions.map(([question, answer]) => (
            <details className="disclosure" key={question}>
              <summary>{question}<Icon name="plus" /></summary><p>{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section id="kontakt" className="contact-section section" aria-labelledby="contact-title">
        <div className="frame split-section">
          <div className="contact-intro">
            <h2 id="contact-title" tabIndex={-1}>Što želite izraditi?</h2>
            <p className="lede">Opišite što vam treba i što danas želite poboljšati. Upit ide izravno osobi koja će voditi vaš projekt.</p>
            <address><strong>Dinko Vuković</strong><a href="mailto:dinko@deweb.hr">dinko@deweb.hr <Icon name="up-right" /></a></address>
          </div>
          <div id="problem-form"><ProblemForm initialSelection={initialSelection} /></div>
        </div>
      </section>
    </main>
  );
}
