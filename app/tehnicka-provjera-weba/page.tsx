import type { Metadata } from "next";
import { Icon } from "../ui-icon";

export const metadata: Metadata = {
  title: "Tehnička provjera i dorada web-stranice | deweb",
  description: "Provjera sigurnosnih postavki, WordPress dodataka, kontaktnih obrazaca i analitike za tvrtke i web-agencije. Dorade prema dogovorenom opsegu.",
  alternates: { canonical: "/tehnicka-provjera-weba" },
};

const areas = [
  ["WordPress i dodaci", "Pregledavamo aktivne verzije, poznate sigurnosne propuste i što treba ažurirati."],
  ["Domena i sigurnosne postavke", "Provjeravamo HTTPS i zaštitne postavke weba. Po dogovoru pregledavamo i zaštitu od lažnog predstavljanja e-poštom."],
  ["Upiti i mjerenje posjeta", "Prema dogovoru provjeravamo rade li kontaktni obrasci, bilježi li analitika posjete i funkcioniraju li dijelovi weba koje mijenjate."],
] as const;

export default function TechnicalReviewPage() {
  return (
    <main id="sadrzaj">
      <div className="page-heading audit-heading">
        <div className="frame inner-hero-grid">
          <div>
            <h1>Tehnička provjera weba</h1>
            <p className="lede">Za vlasnike WordPress stranica i agencije koje ih održavaju. Saznajte gdje stranica zapinje i što prvo vrijedi popraviti.</p>
            <div className="hero-actions">
              <a href="mailto:dinko@deweb.hr?subject=Tehni%C4%8Dka%20provjera%20weba" className="button">Pošaljite adresu weba <Icon name="up-right" /></a>
              <a href="/#kontakt" className="text-link">Kontaktni obrazac <Icon name="right" /></a>
            </div>
          </div>
          <aside className="deliverable" aria-labelledby="deliverable-title">
            <h2 id="deliverable-title">Što dobivate</h2>
            <ul>
              <li><Icon name="check" />Potvrđene nalaze i objašnjenje njihova utjecaja.</li>
              <li><Icon name="check" />Popis popravaka poredan prema važnosti.</li>
              <li><Icon name="check" />Ponudu s opsegom i cijenom ako želite da preuzmemo dorade.</li>
            </ul>
          </aside>
        </div>
      </div>
      <section className="frame split-section section" aria-labelledby="scope-title">
        <h2 id="scope-title">Što provjeravamo</h2>
        <dl className="scope-list">{areas.map(([area, text]) => <div key={area}><dt>{area}</dt><dd>{text}</dd></div>)}</dl>
      </section>
      <section className="process-section section">
        <div className="frame split-section">
          <h2>Podrška za agencije</h2>
          <div className="body-copy"><p>Možemo preuzeti pojedinačnu provjeru ili dogovorene dorade na webu koji održavate. Vašem timu predajemo popis izmjena i opis provjera.</p><p>Prije popravka osiguramo kopiju za povrat i promjenu provjerimo na testnoj verziji. Nakon objave ponovimo dogovorene provjere.</p></div>
        </div>
      </section>
    </main>
  );
}
