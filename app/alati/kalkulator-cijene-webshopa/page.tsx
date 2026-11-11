import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { webshopPricingForEnvironment } from "../../../lib/webshop-price-config";
import { estimateWebshop, formatWebshopRange, projectLabels } from "../../../lib/webshop-price";
import { WebshopCalculator } from "./webshop-calculator";

export const metadata: Metadata = {
  title: "Kalkulator cijene webshopa | deweb",
  description: "Pripremite procjenu za izradu, redizajn ili preseljenje webshopa prema veličini kataloga, unosu proizvoda i dodatnim funkcijama.",
  robots: { index: false, follow: false },
};

export default function WebshopCalculatorPage() {
  const config = webshopPricingForEnvironment(process.env.VERCEL_ENV);
  const showPrices = config.approval !== "draft";

  return (
    <main className="mx-auto min-h-screen w-[min(100%-36px,1120px)] pb-16 text-ink sm:pb-24">
      <div className="flex items-center justify-between gap-4 py-5">
        <Link href="/" aria-label="deweb početna"><Image src="/deweb-logo.svg" alt="deweb" width={136} height={31} /></Link>
        <Link href="/alati" className="inline-flex min-h-11 items-center text-sm font-extrabold text-teal-dark underline underline-offset-4 focus-visible:outline focus-visible:outline-4 focus-visible:outline-orange-dark">Svi alati</Link>
      </div>
      <header className="mt-2 rounded-2xl bg-[#edf6f7] p-6 sm:px-10 sm:py-10">
        <h1 className="max-w-[18ch] text-balance text-[2.3rem] font-black leading-[1.08] tracking-[-0.035em] sm:text-[3.35rem]">Koliko košta izrada webshopa?</h1>
        <p className="mt-4 max-w-[58ch] text-base leading-7 text-ink sm:text-lg">
          {showPrices ? "Odaberite veličinu kataloga, način unosa proizvoda i dodatke. Dobit ćete okvirnu cijenu izrade i pregled stavki." : "Odaberite veličinu kataloga, način unosa proizvoda i dodatke za pripremu ponude."}
        </p>
        {showPrices && (
          <>
            <dl className="mt-7 grid gap-5 sm:grid-cols-3">
              {(["new", "redesign", "migration"] as const).map(project => {
                const price = estimateWebshop({
                  projectType: project, catalogSize: "upTo20",
                  contentSupport: project === "migration" ? "import" : "self",
                  specialMode: "standard", specialNeeds: [],
                }, config).range;
                if (!price) return null;
                return (
                  <div key={project}>
                    <dt className="text-sm font-semibold text-teal-dark">{projectLabels[project]}</dt>
                    <dd className="mt-1 text-[1.65rem] font-black leading-tight">od {formatWebshopRange({ min: price.min, max: price.min })}</dd>
                  </div>
                );
              })}
            </dl>
            <p className="mt-5 text-sm leading-6 text-teal-dark">
              Početne cijene vrijede za osnovni opseg s katalogom do 20 proizvoda i standardnom kupnjom. Početna cijena preseljenja uključuje uvoz iz pripremljene tablice.
            </p>
            {config.approval === "preview" && <p className="mt-2 text-sm font-bold text-teal-dark">Prijedlog cjenika za pregled.</p>}
          </>
        )}
      </header>

      <WebshopCalculator config={config} />

      <section className="mt-12 max-w-3xl" aria-labelledby="about-calculator">
        <h2 id="about-calculator" className="text-2xl font-black">Što uključuje osnovna izrada?</h2>
        <p className="mt-3 leading-7 text-muted">
          Prilagodbu predloška brendu, katalog s kategorijama, košaricu, jedan standardni način kartičnog plaćanja uz kompatibilni dodatak, osnovna pravila dostave i probnu narudžbu. Procjena podrazumijeva jedan jezik i pripremljene materijale.
        </p>
        <p className="mt-3 leading-7 text-muted">
          Opise, fotografije, prijevode, prijenos povijesti narudžbi i složenije funkcije dogovaramo prema opsegu. Konačna ponuda slijedi nakon provjere zahtjeva.
        </p>
      </section>
    </main>
  );
}
