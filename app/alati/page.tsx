import type { Metadata } from "next";
import { webshopPricingForEnvironment } from "../../lib/webshop-price-config";
import { FeatureIcon } from "../feature-icon";
import { Icon } from "../ui-icon";

export const metadata: Metadata = {
  title: "Besplatni alati | deweb",
  description: "Provjerite obveze za bazne cijene i mrežni cjenik ili pripremite zahtjeve za webshop.",
  robots: { index: false, follow: false },
};

export default function ToolsPage() {
  const showPrices = webshopPricingForEnvironment(process.env.VERCEL_ENV).approval !== "draft";
  return (
    <main id="sadrzaj" className="tools-directory">
      <div className="page-heading">
        <div className="frame section-intro"><h1>Besplatni alati</h1><p>Provjerite koje cijene trebate prikazati kupcima ili pripremite zahtjeve prije razgovora o webshopu.</p></div>
      </div>
      <section className="frame section">
        <article className="tool-feature mb-8">
          <div>
            <h2 className="icon-heading"><FeatureIcon name="price" /><span>Moram li isticati baznu cijenu?</span></h2>
            <p>Provjerite obveze za poslovnicu, webshop i sajam. Dobit ćete kratak popis koraka uz članke propisa.</p>
            <a className="button button-light" href="/alati/sidrene-cijene">Provjerite svoje obveze <Icon name="right" /></a>
          </div>
          <div className="tool-inventory"><h3>Što ćete provjeriti</h3><ul><li>Baznu cijenu</li><li>Najnižu cijenu prije akcije</li><li>Cijenu po jedinici mjere</li><li>Cjenik na webu</li></ul></div>
        </article>
        <article className="tool-feature">
          <div>
            <h2 className="icon-heading"><FeatureIcon name="calculator" /><span>Kalkulator cijene webshopa</span></h2>
            <p>{showPrices ? "Saznajte okvirnu cijenu novog webshopa, redizajna ili preseljenja. Odabir i procjenu možete poslati zajedno s upitom." : "Složite zahtjeve za novi webshop, redizajn ili preseljenje. Svoj odabir možete poslati zajedno s upitom."}</p>
            <a className="button button-light" href="/alati/kalkulator-cijene-webshopa">Otvorite kalkulator <Icon name="right" /></a>
          </div>
          <div className="tool-inventory"><h3>Što ćete odabrati</h3><ul><li>Vrstu projekta</li><li>Veličinu kataloga</li><li>Način unosa proizvoda</li><li>Dodatne funkcije</li></ul></div>
        </article>
      </section>
    </main>
  );
}
