import type { Metadata } from "next";
import { LegalPage, legalHeading, legalParagraph } from "../legal-page";

export const metadata: Metadata = {
  title: "Uvjeti korištenja | deweb",
  description: "Osnovne informacije o korištenju web-stranice deweb i slanju poslovnih upita.",
  alternates: { canonical: "/uvjeti" },
  robots: { index: false, follow: true },
};

export default function TermsPage() {
  return (
    <LegalPage title="Uvjeti korištenja">
      <p className={legalParagraph}>Ova web-stranica predstavlja usluge deweb j.d.o.o.</p>
      <p className={legalParagraph}>
        Slanje kontaktnog obrasca ili zahtjeva za ponudu ne predstavlja sklapanje ugovora niti obvezuje korisnika ili deweb na ugovaranje projekta.
      </p>
      <h2 className={legalHeading}>Web-paketi i cijene</h2>
      <p className={legalParagraph}>Objavljene cijene odnose se isključivo na opseg naveden uz pojedini paket.</p>
      <p className={legalParagraph}>Ako zahtjev izlazi iz tog opsega, deweb prije početka rada dostavlja zasebnu ponudu.</p>
      <p className={legalParagraph}>deweb j.d.o.o. nije u sustavu PDV-a i prikazane cijene ne uvećavaju se za PDV.</p>
      <h2 className={legalHeading}>Plaćanje</h2>
      <p className={legalParagraph}>
        Ako nije drukčije navedeno u pojedinačnoj ponudi, plaćanje standardnog web-projekta je 50% prije početka rada i 50% nakon prihvata završne verzije, prije produkcijske objave.
      </p>
      <h2 className={legalHeading}>Rok izrade</h2>
      <p className={legalParagraph}>
        Rok izrade dogovara se prije početka projekta i počinje teći nakon primitka dogovorenog predujma, potrebnih materijala i pristupa.
      </p>
      <h2 className={legalHeading}>Obveze klijenta</h2>
      <p className={legalParagraph}>Klijent se obvezuje:</p>
      <ul className="m-0 grid list-disc gap-2 pl-5 leading-7 text-muted">
        <li>dostaviti točne podatke;</li>
        <li>imati prava za korištenje fotografija, logotipa i ostalih materijala koje dostavlja;</li>
        <li>dati povratnu informaciju unutar dogovorenih rokova;</li>
        <li>odobriti sadržaj prije objave.</li>
      </ul>
      <h2 className={legalHeading}>Dorade</h2>
      <p className={legalParagraph}>Jednostavni paket uključuje jedan objedinjeni krug dorada, a poslovni paket dva.</p>
      <p className={legalParagraph}>Dodatne ili naknadne izmjene dogovaraju se zasebno.</p>
      <h2 className={legalHeading}>Domena i hosting</h2>
      <p className={legalParagraph}>Domena i produkcijski hosting standardno ostaju na računu i pod kontrolom klijenta.</p>
      <p className={legalParagraph}>deweb dobiva tehnički pristup potreban za izradu i podršku.</p>
      <p className={legalParagraph}>Ako se hosting kojim upravlja deweb ugovori zasebno, to se posebno navodi u ponudi.</p>
      <p className={legalParagraph}>Hosting kojim upravlja deweb nije uključen u web-pakete od 790 € i 1.290 €.</p>
      <p className={legalParagraph}>Troškovi domene, hostinga, licenci i drugih vanjskih usluga nisu uključeni osim ako je izričito navedeno drukčije.</p>
      <p className={legalParagraph}>
        Domena je u vlasništvu klijenta. Ako već imate domenu, zadržavate postojeći račun i pristupe. Za novu domenu deweb može pomoći s registracijom i postavljanjem, ali registrant i račun za naplatu ostaju klijentovi. Produkcijski hosting plaćate izravno pružatelju usluge. Nakon primopredaje imate ili zadržavate pristup domeni, DNS-u, hostingu i produkcijskom projektu. Prestankom suradnje ne gubite kontrolu nad domenom ili produkcijskim hostingom.
      </p>
      <h2 className={legalHeading}>Nakon objave</h2>
      <p className={legalParagraph}>
        U roku od 30 dana nakon produkcijske objave, deweb bez dodatne naknade ispravlja tehničke nedostatke koji predstavljaju odstupanje od dogovorenog i odobrenog opsega projekta.
      </p>
      <p className={legalParagraph}>Novi zahtjevi, sadržajne izmjene i dodatne funkcionalnosti nisu obuhvaćeni ovim razdobljem.</p>
      <h2 className={legalHeading}>Prava na izvorni kod i komponente</h2>
      <p className={legalParagraph}>
        Vlasništvo izvornog koda i prava korištenja specifičnih komponenti ili licenci definiraju se ponudom kada su relevantni. Predaja projekta ne podrazumijeva automatski prijenos svih internih deweb rješenja za ponovnu uporabu ili licenci.
      </p>
    </LegalPage>
  );
}
