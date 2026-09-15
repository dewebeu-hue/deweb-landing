import type { Metadata } from "next";
import { webOfferTerms } from "../../lib/web-packages";

export const metadata: Metadata = {
  title: "Uvjeti korištenja | deweb",
  description: "Osnovne informacije o korištenju web-stranice deweb i slanju poslovnih upita.",
  robots: { index: false, follow: true },
};

export default function TermsPage() {
  return (
    <main className="mx-auto grid w-[min(100%-36px,880px)] gap-8 py-12 text-ink">
      <a className="text-sm font-extrabold text-teal-dark underline underline-offset-4" href="/">
        deweb
      </a>
      <section className="grid gap-5 rounded-lg border border-line bg-white p-6 shadow-soft">
        <p className="m-0 text-sm font-black uppercase text-teal">Uvjeti korištenja</p>
        <h1 className="m-0 text-4xl font-black leading-tight">Uvjeti korištenja</h1>
        <p className="m-0 leading-7 text-muted">
          Ova web-stranica predstavlja deweb usluge izrade i redizajna poslovnih web-stranica te
          razvoja internih alata i poslovnih aplikacija.
        </p>
        <p className="m-0 leading-7 text-muted">
          Objavljene cijene web-paketa odnose se na opisani standardni opseg. Konačan opseg, rok,
          uključene usluge i uvjete suradnje potvrđujemo ponudom prije početka izrade.
        </p>
        <p className="m-0 leading-7 text-muted">
          Slanjem kontaktnog obrasca šaljete neobvezujući poslovni upit. Sam upit ne predstavlja
          prihvat ponude ni ugovaranje usluge.
        </p>
        <h2 className="m-0 text-2xl font-black">Domena, hosting i pristupi</h2>
        <p className="m-0 leading-7 text-muted">{webOfferTerms.ownership}</p>
        <p className="m-0 leading-7 text-muted">
          Ako već imate domenu, zadržavate postojeći račun i pristupe. Za novu domenu deweb može
          pomoći s registracijom i postavljanjem, ali registracija i račun za naplatu ostaju na
          klijentu. Tehnički pristup deweb koristi samo za izradu, objavu i dogovorenu podršku.
          Prestankom suradnje klijent ne gubi kontrolu nad domenom ili produkcijskim hostingom.
        </p>
        <h2 className="m-0 text-2xl font-black">Posebni dogovori</h2>
        <p className="m-0 leading-7 text-muted">{webOfferTerms.managedHosting}</p>
        <p className="m-0 leading-7 text-muted">
          Vlasništvo izvornog koda i prava korištenja specifičnih komponenti ili licenci definiraju
          se ponudom kada su relevantni. Predaja projekta ne podrazumijeva automatski prijenos svih
          internih deweb rješenja za ponovnu uporabu ili licenci.
        </p>
        <p className="m-0 font-extrabold text-ink">Operator: deweb j.d.o.o.</p>
      </section>
    </main>
  );
}
