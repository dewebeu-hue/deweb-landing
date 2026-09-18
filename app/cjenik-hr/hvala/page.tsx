import Image from "next/image";
import type { Metadata } from "next";
import { SiteFooter } from "../../site-footer";
import { readCjenikHrPackage, type CjenikHrPackage } from "../../../lib/cjenik-hr-product";

export const metadata: Metadata = {
  title: "Hvala na upitu | Cjenik HR | deweb",
  description: "Potvrda zaprimljenog upita za Cjenik HR.",
  robots: { index: false, follow: false },
};

const messages: Record<CjenikHrPackage, { title: string; copy: string }> = {
  plugin: { title: "Zahtjev za ponudu je zaprimljen.", copy: "Ponuda za plugin priprema se u sigurnom poslovnom toku. Nakon uspješne obrade bit će poslana na email koji ste naveli. Ponuda nije račun." },
  setup: { title: "Zahtjev za ponudu je zaprimljen.", copy: "Ponuda za plugin i postavljanje priprema se nakon provjere podataka. Nakon uspješne obrade bit će poslana na navedeni email. Ponuda nije račun." },
  other: { title: "Upit za drugi sustav je zaprimljen.", copy: "Pregledat ćemo opis postojećeg sustava i javiti se s prvim pitanjima ili procjenom sljedećeg koraka." },
};

export default async function CjenikHrThankYouPage({ searchParams }: { searchParams: Promise<{ paket?: string | string[] }> }) {
  const params = await searchParams;
  const selected = readCjenikHrPackage(Array.isArray(params.paket) ? params.paket[0] : params.paket);
  const message = messages[selected];
  return (
    <>
      <header className="border-b border-line bg-white"><div className="mx-auto flex min-h-[72px] w-[min(100%-36px,1160px)] items-center"><a href="/" aria-label="deweb — početna stranica"><Image src="/deweb-logo.svg" alt="deweb" width={126} height={29} priority /></a></div></header>
      <main className="hero-surface grid min-h-[70vh] place-items-center px-[18px] py-16">
        <section className="w-full max-w-2xl rounded-3xl border border-[#bfd4d8] bg-white p-7 text-center shadow-[0_24px_65px_rgba(8,42,61,0.12)] sm:p-12" aria-labelledby="thanks-title">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-teal text-2xl font-black text-white" aria-hidden="true">✓</span>
          <p className="mt-6 text-xs font-black uppercase tracking-[0.16em] text-teal-dark">Hvala</p>
          <h1 id="thanks-title" className="mt-3 text-3xl font-black tracking-[-0.04em] text-ink sm:text-4xl">{message.title}</h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-muted">{message.copy}</p>
          <p className="mt-4 text-sm leading-6 text-muted">Obrada i provjera uplate nisu trenutačne. Ako odgovor ne vidite u uobičajenom roku, provjerite mapu neželjene pošte ili nam pišite na <a className="font-black text-teal-dark underline underline-offset-4" href="mailto:dinko@deweb.hr">dinko@deweb.hr</a>.</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><a href="/cjenik-hr" className="inline-flex min-h-[50px] items-center justify-center rounded-lg bg-teal px-6 text-sm font-black text-white hover:bg-teal-dark">Natrag na Cjenik HR</a><a href="/" className="inline-flex min-h-[50px] items-center justify-center rounded-lg border-2 border-teal px-6 text-sm font-black text-teal-dark hover:bg-teal-soft">deweb početna</a></div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
