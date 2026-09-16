import type { Metadata } from "next";
import { LegalPage, legalEmailLink, legalHeading, legalParagraph } from "../legal-page";

export const metadata: Metadata = {
  title: "Politika privatnosti | deweb",
  description: "Informacije o privatnosti i obradi podataka na web-stranici deweb.",
  alternates: { canonical: "/privatnost" },
  robots: { index: false, follow: true },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Politika privatnosti">
      <p className={legalParagraph}>
        Voditelj obrade osobnih podataka je deweb j.d.o.o., Prvča 58, Prvča, kontakt: <a className={legalEmailLink} href="mailto:dinko@deweb.hr">dinko@deweb.hr</a>.
      </p>
      <h2 className={legalHeading}>Kontaktni upiti</h2>
      <p className={legalParagraph}>
        Kada nam pošaljete upit putem obrasca, obrađujemo podatke koje ste sami unijeli kako bismo odgovorili na vaš upit, razumjeli projekt i prema potrebi pripremili ponudu.
      </p>
      <p className={legalParagraph}>
        Podaci mogu uključivati ime, kontaktne podatke, naziv tvrtke, postojeću web-stranicu, vrstu projekta i sadržaj poruke.
      </p>
      <p className={legalParagraph}>
        Podatke obrađujemo radi odgovora na vaš upit te, kada je upit povezan s mogućim ugovaranjem usluge, radi poduzimanja radnji na vaš zahtjev prije eventualnog sklapanja ugovora.
      </p>
      <h2 className={legalHeading}>Pružatelji usluga</h2>
      <p className={legalParagraph}>
        Za tehničku obradu i dostavu kontaktnih upita koristimo pružatelje usluga potrebne za rad stranice i elektroničke pošte, uključujući Vercel, Resend i Google/Gmail, u opsegu potrebnom za pružanje tih usluga.
      </p>
      <h2 className={legalHeading}>Prijenosi podataka izvan Europskog gospodarskog prostora</h2>
      <p className={legalParagraph}>
        Pojedini pružatelji usluga koje koristimo za hosting, dostavu kontaktnih upita i elektroničku poštu mogu obrađivati osobne podatke izvan Europskog gospodarskog prostora, uključujući Sjedinjene Američke Države. Kada je to primjenjivo, takvi prijenosi temelje se na odgovarajućim mehanizmima zaštite podataka, uključujući odluke o primjerenosti, EU–US Data Privacy Framework i/ili standardne ugovorne klauzule Europske komisije, ovisno o konkretnom pružatelju i obradi.
      </p>
      <h2 className={legalHeading}>Koliko dugo čuvamo podatke?</h2>
      <p className={legalParagraph}>
        Kontaktni upiti koji ne rezultiraju poslovnom suradnjom čuvaju se 12 mjeseci, nakon čega se brišu.
      </p>
      <p className={legalParagraph}>
        Ako postanete klijent, ugovorna i računovodstvena dokumentacija čuva se prema zakonskim rokovima koji vrijede za tu vrstu dokumentacije.
      </p>
      <h2 className={legalHeading}>Vaša prava</h2>
      <p className={legalParagraph}>
        Možete zatražiti pristup svojim podacima, ispravak, brisanje, ograničenje obrade ili ostvariti druga prava koja vam pripadaju prema primjenjivim propisima.
      </p>
      <p className={legalParagraph}>
        Za zahtjeve obratite se na: <a className={legalEmailLink} href="mailto:dinko@deweb.hr">dinko@deweb.hr</a>.
      </p>
      <p className={legalParagraph}>
        Također imate pravo podnijeti pritužbu Agenciji za zaštitu osobnih podataka (AZOP).
      </p>
    </LegalPage>
  );
}
