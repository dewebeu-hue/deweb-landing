import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SITE_ORIGIN } from "../../../lib/seo-policy";
import { sources } from "../../../lib/sidrene-cijene-podaci";
import { PriceQuestionnaire } from "./upitnik";
import styles from "./upitnik.module.css";

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
    <main className={`${styles.tool} mx-auto min-h-screen w-[min(100%-36px,1120px)] pb-20 text-ink`}>
      <div className="flex items-center justify-between gap-4 border-b border-line py-5 print:hidden">
        <Link href="/" aria-label="deweb početna"><Image src="/deweb-logo.svg" alt="deweb" width={136} height={31} priority /></Link>
        <Link href="/alati" className="inline-flex min-h-11 items-center text-sm font-extrabold text-teal-dark underline underline-offset-4">Svi alati</Link>
      </div>
      <header className="max-w-3xl pb-7 pt-7 sm:pb-9 sm:pt-10 print:pb-2 print:pt-0">
        <h1 className="text-[2rem] font-black leading-[1.1] tracking-[-.035em] sm:text-[3.25rem] print:text-2xl">Moram li isticati sidrenu cijenu?</h1>
        <p className="mt-4 max-w-2xl leading-7 text-muted sm:text-lg print:hidden">Odgovorite na pitanja o svojoj prodaji. Saznat ćete koje cijene prikazati i trebate li objaviti cjenik na webu.</p>
      </header>
      <PriceQuestionnaire />
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
    </main>
  );
}
