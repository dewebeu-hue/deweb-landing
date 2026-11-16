import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SITE_ORIGIN } from "../../../lib/seo-policy";
import { PriceQuestionnaire } from "./upitnik";
import styles from "./upitnik.module.css";

export const metadata: Metadata = {
  title: "Moram li isticati sidrenu cijenu? | deweb",
  description: "Provjerite koje se obveze za sidrenu cijenu, cijenu po jedinici mjere, sniženja i mrežni cjenik odnose na vaše ponude, poslovnice i oglase.",
  alternates: { canonical: `${SITE_ORIGIN}/alati/sidrene-cijene` },
};

export default function AnchorPricePage() {
  return (
    <main className={`${styles.tool} mx-auto min-h-screen w-[min(100%-36px,1120px)] pb-20 text-ink`}>
      <div className="flex items-center justify-between gap-4 border-b border-line py-5 print:hidden">
        <Link href="/" aria-label="deweb početna"><Image src="/deweb-logo.svg" alt="deweb" width={136} height={31} priority /></Link>
        <Link href="/alati" className="inline-flex min-h-11 items-center text-sm font-extrabold text-teal-dark underline underline-offset-4">Svi alati</Link>
      </div>
      <header className="max-w-3xl pb-7 pt-7 sm:pb-9 sm:pt-10 print:pb-2 print:pt-0">
        <h1 className="text-[2rem] font-black leading-[1.1] tracking-[-.035em] sm:text-[3.25rem] print:text-2xl">Moram li isticati sidrenu cijenu?</h1>
        <p className="mt-4 max-w-2xl leading-7 text-muted sm:text-lg print:hidden">Provjerite što trebate istaknuti za svaku ponudu, mjesto prodaje i oglas. Upute možete kopirati ili ispisati bez prijave.</p>
      </header>
      <PriceQuestionnaire />
    </main>
  );
}
