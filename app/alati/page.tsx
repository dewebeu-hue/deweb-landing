import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Besplatni alati | deweb",
  description: "Jednostavni deweb alati za pripremu digitalnog projekta. Prvi alat pomaže opisati zahtjeve za webshop.",
  robots: { index: false, follow: false },
};

export default function ToolsPage() {
  return (
    <main className="mx-auto min-h-screen w-[min(100%-36px,1120px)] pb-20 text-ink">
      <div className="flex items-center justify-between border-b border-line py-5">
        <Link href="/" aria-label="deweb početna"><Image src="/deweb-logo.svg" alt="deweb" width={136} height={31} /></Link>
        <span className="text-xs font-extrabold uppercase tracking-[.14em] text-teal-dark">Alati</span>
      </div>
      <section className="max-w-3xl pt-14 sm:pt-20" aria-labelledby="tools-title">
        <p className="mb-4 text-sm font-black uppercase tracking-wide text-teal-dark">deweb / besplatni alati</p>
        <h1 id="tools-title" className="m-0 text-[2.6rem] font-black leading-[1.08] text-ink sm:text-[4rem]">Manje nagađanja.<br />Jasniji prvi korak.</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">Kratki alati koji vam pomažu složiti zahtjeve prije razgovora o digitalnom rješenju. Za početak pripremite opseg webshopa.</p>
        <p className="mt-6 inline-flex rounded-full border border-orange/30 bg-orange/10 px-4 py-2 text-sm font-bold text-orange-dark">Razvojna verzija — cjenik još nije odobren.</p>
      </section>
      <section className="mt-12 max-w-3xl" aria-label="Dostupni alat">
        <article className="rounded-xl border border-line bg-white p-6 shadow-soft sm:p-8">
          <p className="m-0 text-xs font-black uppercase tracking-[.14em] text-teal-dark">Webshop / priprema opsega</p>
          <h2 className="mt-4 text-2xl font-black leading-tight sm:text-3xl">Kalkulator cijene webshopa</h2>
          <p className="mt-3 max-w-xl leading-7 text-muted">Odaberite osnovne zahtjeve i dobit ćete pregled za razgovor o ponudi. Brojčana procjena bit će dostupna tek nakon odobrenja cjenika.</p>
          <Link href="/alati/kalkulator-cijene-webshopa" className="mt-6 inline-flex min-h-12 items-center justify-center rounded-lg bg-orange px-6 py-3 font-extrabold text-white outline-offset-4 transition hover:bg-orange-dark focus-visible:outline focus-visible:outline-4 focus-visible:outline-teal-dark">Otvori alat <span aria-hidden="true" className="ml-3">↗</span></Link>
        </article>
      </section>
    </main>
  );
}
