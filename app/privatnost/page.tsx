import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privatnost | deweb",
  description: "Privatnost i obrada podataka za ranu landing stranicu deweb.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto grid w-[min(100%-36px,880px)] gap-8 py-12 text-ink">
      {/* TODO: Final legal review before production. */}
      <a className="text-sm font-extrabold text-teal-dark underline underline-offset-4" href="/">
        deweb
      </a>
      <section className="grid gap-5 rounded-lg border border-line bg-white p-6 shadow-soft">
        <p className="m-0 text-sm font-black uppercase text-teal">Privatnost</p>
        <h1 className="m-0 text-4xl font-black leading-tight">Politika privatnosti</h1>
        <p className="m-0 leading-7 text-muted">
          Ovo je rana landing stranica za deweb. Stranica u v1 služi za predstavljanje usluge i
          pripremu budućeg zaprimanja upita.
        </p>
        <p className="m-0 leading-7 text-muted">
          Ne koristimo analitičke ni marketinške kolačiće u ovoj verziji stranice. Ne dodajemo
          Google Analytics, Meta Pixel, Hotjar, chat widgete, marketinške kolačiće ni treće
          ugrađene servise.
        </p>
        <p className="m-0 leading-7 text-muted">
          Podaci poslani kroz kontakt formu koriste se za obradu upita i komunikaciju s
          pošiljateljem.
        </p>
        <p className="m-0 leading-7 text-muted">
          Podaci iz obrasca koriste se samo za odgovor na upit i pripremu prijedloga rješenja.
        </p>
        <p className="m-0 font-extrabold text-ink">Operator: deweb j.d.o.o.</p>
      </section>
    </main>
  );
}
