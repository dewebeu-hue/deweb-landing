import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Uvjeti korištenja | deweb",
  description: "Osnovni uvjeti korištenja rane landing stranice deweb.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto grid w-[min(100%-36px,880px)] gap-8 py-12 text-ink">
      {/* TODO: Final legal review before production. */}
      <a className="text-sm font-extrabold text-teal-dark underline underline-offset-4" href="/">
        deweb
      </a>
      <section className="grid gap-5 rounded-lg border border-line bg-white p-6 shadow-soft">
        <p className="m-0 text-sm font-black uppercase text-teal">Uvjeti korištenja</p>
        <h1 className="m-0 text-4xl font-black leading-tight">Uvjeti korištenja</h1>
        <p className="m-0 leading-7 text-muted">
          Ova stranica prikazuje osnovne informacije o digitalnim rješenjima koja deweb može
          predložiti ili izraditi za male poduzetnike.
        </p>
        <p className="m-0 leading-7 text-muted">
          Sadržaj na stranici nije obvezujuća ponuda. Svaki prijedlog rješenja, opseg, rok i
          cijena dogovaraju se zasebno nakon razumijevanja konkretnog poslovnog problema.
        </p>
        <p className="m-0 leading-7 text-muted">
          U ovoj v1 verziji kontakt forma još nije spojena na sustav za zaprimanje upita.
        </p>
        <p className="m-0 font-extrabold text-ink">Operator: deweb j.d.o.o.</p>
      </section>
    </main>
  );
}
