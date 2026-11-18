import type { Metadata } from "next";
import Link from "next/link";
import { SITE_ORIGIN } from "../../../lib/seo-policy";
import { sources } from "../../../lib/sidrene-cijene-podaci";
import { PriceQuestionnaire } from "./upitnik";
import styles from "./upitnik.module.css";
import { PriceHelp } from "./pomoc";
import { Icon } from "../../ui-icon";

const title = "Sidrena (bazna) cijena: kada je obvezna? | deweb";
const description = "Provjerite trebate li istaknuti sidrenu (baznu) cijenu u Hrvatskoj. Alat pokriva jedinične cijene, najnižu cijenu prije sniženja i mrežne cjenike.";
const canonical = `${SITE_ORIGIN}/alati/sidrene-cijene`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical },
  openGraph: { title, description, url: canonical, locale: "hr_HR", siteName: "deweb", type: "website" },
};

const sourceLink = "font-bold text-teal-dark underline underline-offset-4";

export default function AnchorPricePage() {
  return (
    <main id="sadrzaj" className={styles.tool}>
      <header className={`page-heading ${styles.heading}`}>
        <div className="frame">
          <Link href="/alati" className="back-link print:hidden"><Icon name="left" /> Svi alati</Link>
          <div className="section-intro">
            <h1>Moram li isticati baznu cijenu?</h1>
            <div><p>Odgovorite na pitanja o svojoj prodaji. Saznat ćete koje cijene prikazati i trebate li objaviti cjenik na webu.</p>
              <a href="#pomoc" className="text-link print:hidden">Trebam pomoć s provedbom <Icon name="right" /></a>
            </div>
          </div>
        </div>
      </header>
      <div className="frame section">
        <PriceQuestionnaire />
        <PriceHelp />
      <section className="mt-12 max-w-3xl border-t border-line pt-7 print:hidden" aria-labelledby="price-guide">
        <h2 id="price-guide" className="text-2xl font-black">Što je sidrena (bazna) cijena?</h2>
        <p className="mt-3 leading-7 text-muted">Bazna cijena polazi od cijene na određeni datum ili na dan kada ste prvi put ponudili proizvod. Ako je tada bio na akciji, pravilnik određuje koji raniji iznos treba uzeti. Upitnik primjenjuje pravila od 17. studenoga 2026. <a className={sourceLink} href={sources.baseRule.url}>Pravilnik o baznoj cijeni</a></p>
        <dl className="mt-5 grid gap-5">
          <div>
            <dt className="font-extrabold">Najniža cijena prije sniženja</dt>
            <dd className="mt-1 leading-7 text-muted">Kad je roba na javnom sniženju, uz sniženu cijenu ističete najnižu cijenu koju ste primjenjivali u 30 dana prije početka akcije. <a className={sourceLink} href={sources.discountChange.url}>Pravila o sniženjima</a></dd>
          </div>
          <div>
            <dt className="font-extrabold">Jedinična cijena</dt>
            <dd className="mt-1 leading-7 text-muted">Cijena po kilogramu ili litri kupcu pomaže usporediti pakiranja različitih veličina. <a className={sourceLink} href={sources.unit.url}>Pravilnik s popisom robe i iznimkama</a></dd>
          </div>
          <div>
            <dt className="font-extrabold">Mrežni cjenik</dt>
            <dd className="mt-1 leading-7 text-muted">Ako imate vlastiti web, upitnik će provjeriti trebate li na njemu objaviti aktualni cjenik. <a className={sourceLink} href={sources.listRule.url}>Pravilnik o objavi cjenika</a></dd>
          </div>
        </dl>
      </section>
      </div>
    </main>
  );
}
