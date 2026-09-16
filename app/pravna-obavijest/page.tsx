import type { Metadata } from "next";
import { LegalPage, legalEmailLink, legalParagraph } from "../legal-page";

export const metadata: Metadata = {
  title: "Podaci o društvu | deweb",
  description: "Informacije o operatoru i sadržaju web-stranice deweb.",
  alternates: { canonical: "/pravna-obavijest" },
  robots: { index: false, follow: true },
};

const companyDetails = [
  ["Tvrtka", "deweb jednostavno društvo s ograničenom odgovornošću za posredovanje u prijevozu putnika i razvoj digitalnih platformi"],
  ["Skraćena tvrtka", "deweb j.d.o.o."],
  ["Sjedište", "Prvča 58, Prvča"],
  ["OIB", "24631103366"],
  ["MBS", "030310031"],
  ["Sud", "Društvo je upisano pri Trgovačkom sudu u Osijeku - Stalna služba u Slavonskom Brodu"],
  ["Direktor / član uprave", "Dinko Vuković"],
  ["Temeljni kapital", "10,00 EUR, u cijelosti uplaćen"],
  ["Poslovni račun (IBAN)", "HR9823400091111346962"],
  ["Banka", "Privredna banka Zagreb d.d. (PBZ)"],
] as const;

export default function CompanyInfoPage() {
  return (
    <LegalPage title="Podaci o društvu">
      <dl className="m-0 divide-y divide-line">
        {companyDetails.map(([label, detail]) => (
          <div key={label} className="grid gap-2 py-4 first:pt-0 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-6">
            <dt className="font-extrabold leading-7">{label}</dt>
            <dd className="m-0 min-w-0 break-words leading-7 text-muted">{detail}</dd>
          </div>
        ))}
        <div className="grid gap-2 py-4 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-6">
          <dt className="font-extrabold leading-7">Kontakt</dt>
          <dd className="m-0 leading-7"><a className={legalEmailLink} href="mailto:dinko@deweb.hr">dinko@deweb.hr</a></dd>
        </div>
      </dl>
      <p className={legalParagraph}>deweb j.d.o.o. nije u sustavu PDV-a.</p>
    </LegalPage>
  );
}
