import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { WebshopCalculator } from "./webshop-calculator";

export const metadata: Metadata = {
  title: "Kalkulator cijene webshopa | deweb",
  description: "Odaberite osnovne zahtjeve za webshop i pripremite pregled opsega. Cjenovna procjena čeka odobrenje deweb cjenika.",
  robots: { index: false, follow: false },
};

export default function WebshopCalculatorPage() {
  return (
    <main className="mx-auto min-h-screen w-[min(100%-36px,1120px)] pb-24 text-ink">
      <div className="flex items-center justify-between gap-4 border-b border-line py-5">
        <Link href="/" aria-label="deweb početna"><Image src="/deweb-logo.svg" alt="deweb" width={136} height={31} /></Link>
        <Link href="/alati" className="min-h-11 text-sm font-extrabold text-teal-dark underline underline-offset-4 focus-visible:outline focus-visible:outline-4 focus-visible:outline-orange">Svi alati</Link>
      </div>
      <nav aria-label="Putanja stranice" className="mt-7 text-sm font-semibold text-muted"><Link href="/alati" className="underline underline-offset-4">Alati</Link><span aria-hidden="true" className="mx-2">/</span>Kalkulator cijene webshopa</nav>
      <header className="max-w-3xl pt-10 sm:pt-14">
        <p className="mb-4 text-sm font-black uppercase tracking-wide text-teal-dark">Besplatni alat / webshop</p>
        <h1 className="m-0 text-[2.45rem] font-black leading-[1.08] sm:text-[3.7rem]">Što treba vašem webshopu?</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">Odgovorite na četiri kratka pitanja. Dobit ćete sažetak zahtjeva koji možete koristiti za razgovor o izradi ili redizajnu.</p>
        <p className="mt-5 inline-flex rounded-full border border-orange/30 bg-orange/10 px-4 py-2 text-sm font-bold text-orange-dark">Razvojna verzija — cjenik još nije odobren.</p>
      </header>
      <WebshopCalculator />
      <section className="mt-16 max-w-3xl border-t border-line pt-10" aria-labelledby="about-calculator">
        <h2 id="about-calculator" className="text-2xl font-black">Što ovaj pregled obuhvaća?</h2>
        <p className="mt-3 leading-7 text-muted">Bilježi vrstu projekta, okvirnu veličinu kataloga, način unosa sadržaja i posebne zahtjeve. Granice odabira služe opisu zahtjeva; nisu potvrđeni cjenovni paketi. Konačan opseg i cijena dogovaraju se nakon razgovora.</p>
        <p className="mt-3 leading-7 text-muted">Tekući i vanjski troškovi u ovoj verziji nisu definirani ni obračunati. Alat ne procjenjuje porez i ne šalje vaše odgovore.</p>
      </section>
    </main>
  );
}
