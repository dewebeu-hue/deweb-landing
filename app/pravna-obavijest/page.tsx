import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pravna obavijest | deweb",
  description: "Informacije o operatoru i sadržaju web-stranice deweb.",
  robots: { index: false, follow: true },
};

export default function LegalNoticePage() {
  return (
    <main className="mx-auto grid w-[min(100%-36px,880px)] gap-8 py-12 text-ink">
      <a className="text-sm font-extrabold text-teal-dark underline underline-offset-4" href="/">
        deweb
      </a>
      <section className="grid gap-5 rounded-lg border border-line bg-white p-6 shadow-soft">
        <p className="m-0 text-sm font-black uppercase text-teal">Pravna obavijest</p>
        <h1 className="m-0 text-4xl font-black leading-tight">Pravna obavijest</h1>
        <p className="m-0 leading-7 text-muted">
          Web-stranica deweb.hr predstavlja usluge izrade i redizajna poslovnih web-stranica te
          razvoja internih alata i poslovnih aplikacija.
        </p>
        <p className="m-0 leading-7 text-muted">
          Informacije o uslugama i web-paketima opisuju standardni opseg ponude. Konkretan opseg,
          rok i uvjeti suradnje potvrđuju se ponudom prije početka izrade.
        </p>
        <p className="m-0 leading-7 text-muted">
          Sadržaj stranice služi informiranju o deweb uslugama i ne predstavlja pravni, financijski
          ni tehnički savjet.
        </p>
        <p className="m-0 font-extrabold text-ink">Operator: deweb j.d.o.o.</p>
      </section>
    </main>
  );
}
