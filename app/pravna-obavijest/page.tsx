import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pravna obavijest | deweb",
  description: "Pravna obavijest za ranu landing stranicu deweb.",
};

export default function LegalNoticePage() {
  return (
    <main className="mx-auto grid w-[min(100%-36px,880px)] gap-8 py-12 text-ink">
      {/* TODO: Final legal review before production. */}
      <a className="text-sm font-extrabold text-teal-dark underline underline-offset-4" href="/">
        deweb
      </a>
      <section className="grid gap-5 rounded-lg border border-line bg-white p-6 shadow-soft">
        <p className="m-0 text-sm font-black uppercase text-teal">Pravna obavijest</p>
        <h1 className="m-0 text-4xl font-black leading-tight">Pravna obavijest</h1>
        <p className="m-0 leading-7 text-muted">
          Ova pravna obavijest služi kao privremeni okvir za ranu javnu landing stranicu.
        </p>
        <p className="m-0 leading-7 text-muted">
          Informacije na stranici opisuju mogući način suradnje i ne predstavljaju konačan pravni,
          financijski ili tehnički savjet.
        </p>
        <p className="m-0 leading-7 text-muted">
          Završni podaci o operatoru, obvezama i pravnim formulacijama trebaju se potvrditi prije
          produkcijskog lansiranja.
        </p>
        <p className="m-0 font-extrabold text-ink">Operator: deweb j.d.o.o.</p>
      </section>
    </main>
  );
}
