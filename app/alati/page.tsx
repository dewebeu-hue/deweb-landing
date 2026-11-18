import type { Metadata } from "next";
import { webshopPricingForEnvironment } from "../../lib/webshop-price-config";
import { Icon } from "../ui-icon";

export const metadata: Metadata = {
  title: "Besplatni alati | deweb",
  description: "Jednostavni deweb alati za pripremu digitalnog projekta. Prvi alat pomaže opisati zahtjeve za webshop.",
  robots: { index: false, follow: false },
};

export default function ToolsPage() {
  const showPrices = webshopPricingForEnvironment(process.env.VERCEL_ENV).approval !== "draft";
  return (
    <main id="sadrzaj" className="tools-directory">
      <div className="page-heading">
        <div className="frame section-intro"><h1>Besplatni alati</h1><p>Pripremite zahtjeve prije razgovora o projektu. Za webshop možete odmah složiti pregled kataloga, načina prodaje i potrebnih funkcija.</p></div>
      </div>
      <section className="frame section">
        <article className="tool-feature">
          <div>
            <h2>Kalkulator cijene webshopa</h2>
            <p>{showPrices ? "Saznajte okvirnu cijenu novog webshopa, redizajna ili preseljenja. Odabir i procjenu možete poslati zajedno s upitom." : "Složite zahtjeve za novi webshop, redizajn ili preseljenje. Svoj odabir možete poslati zajedno s upitom."}</p>
            <a className="button button-light" href="/alati/kalkulator-cijene-webshopa">Otvorite kalkulator <Icon name="right" /></a>
          </div>
          <div className="tool-inventory"><h3>Što ćete odabrati</h3><ul><li>Vrstu projekta</li><li>Veličinu kataloga</li><li>Način unosa proizvoda</li><li>Dodatne funkcije</li></ul></div>
        </article>
      </section>
    </main>
  );
}
