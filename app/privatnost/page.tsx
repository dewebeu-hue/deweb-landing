import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privatnost | deweb",
  description: "Informacije o privatnosti i obradi podataka na web-stranici deweb.",
  robots: { index: false, follow: true },
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto grid w-[min(100%-36px,880px)] gap-8 py-12 text-ink">
      <a className="text-sm font-extrabold text-teal-dark underline underline-offset-4" href="/">
        deweb
      </a>
      <section className="grid gap-5 rounded-lg border border-line bg-white p-6 shadow-soft">
        <p className="m-0 text-sm font-black uppercase text-teal">Privatnost</p>
        <h1 className="m-0 text-4xl font-black leading-tight">Politika privatnosti</h1>
        <p className="m-0 leading-7 text-muted">
          Web-stranica deweb služi za predstavljanje usluga i zaprimanje poslovnih upita.
        </p>
        <p className="m-0 leading-7 text-muted">
          Ne koristimo analitičke ni marketinške kolačiće. Ne koristimo
          Google Analytics, Meta Pixel, Hotjar, chat widgete, marketinške kolačiće ni treće
          ugrađene servise.
        </p>
        <p className="m-0 leading-7 text-muted">
          Kontaktni obrazac traži ime i prezime, email, vrstu projekta i opis potrebe. Možete
          dobrovoljno navesti tvrtku ili obrt, telefon, postojeću web-stranicu, željeni paket te
          dodatne informacije o poslovnom procesu i korisnicima rješenja.
        </p>
        <p className="m-0 leading-7 text-muted">
          Podatke iz obrasca šaljemo putem servisa Resend na deweb email adresu. Koristimo ih samo
          za obradu upita, odgovor pošiljatelju i pripremu prijedloga rješenja.
        </p>
        <p className="m-0 font-extrabold text-ink">Operator: deweb j.d.o.o.</p>
      </section>
    </main>
  );
}
