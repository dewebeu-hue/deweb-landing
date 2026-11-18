import type { Metadata } from "next";
import { webshopPricingForEnvironment } from "../../../lib/webshop-price-config";
import { estimateWebshop, formatWebshopRange, projectLabels } from "../../../lib/webshop-price";
import { WebshopCalculator } from "./webshop-calculator";
import { Icon } from "../../ui-icon";

export const metadata: Metadata = {
  title: "Kalkulator cijene webshopa | deweb",
  description: "Pripremite procjenu za izradu, redizajn ili preseljenje webshopa prema veličini kataloga, unosu proizvoda i dodatnim funkcijama.",
  robots: { index: false, follow: false },
};

export default function WebshopCalculatorPage() {
  const config = webshopPricingForEnvironment(process.env.VERCEL_ENV);
  const showPrices = config.approval !== "draft";
  return (
    <main id="sadrzaj">
      <div className="page-heading calculator-heading">
        <div className="frame">
          <a className="back-link" href="/alati"><Icon name="left" /> Svi alati</a>
          <div className="section-intro">
            <h1>Koliko košta webshop?</h1>
            <div><p>{showPrices ? "Odaberite veličinu kataloga, način unosa proizvoda i dodatke. Odmah ćete vidjeti okvirnu cijenu ili što zahtijeva zasebnu procjenu." : "Odaberite veličinu kataloga, unos proizvoda i dodatke koje trebate za izradu ponude."}</p><a className="text-link" href="#odabir">Prijeđite na odabir <Icon name="down" /></a></div>
          </div>
          {showPrices && (
            <div className="starting-prices">
              <dl>
                {(["new", "redesign", "migration"] as const).map(project => {
                  const price = estimateWebshop({
                    projectType: project, catalogSize: "upTo20", contentSupport: project === "migration" ? "import" : "self",
                    specialMode: "standard", specialNeeds: [],
                  }, config).range;
                  return price ? <div key={project}><dt>{projectLabels[project]}</dt><dd>od {formatWebshopRange({ min: price.min, max: price.min })}</dd></div> : null;
                })}
              </dl>
              <p>Za osnovni opseg do 20 proizvoda i standardnu kupnju. Kod preseljenja je uključen uvoz iz pripremljene tablice.</p>
              {config.approval === "preview" && <p className="preview-note">Prijedlog cjenika za pregled.</p>}
            </div>
          )}
        </div>
      </div>
      <div className="frame calculator-body" id="odabir"><WebshopCalculator config={config} /></div>
      <section className="section frame split-section calculator-scope">
        <h2>Što obuhvaća osnovna izrada?</h2>
        <div className="body-copy">
          <p>Prilagođavamo predložak vašem brendu, postavljamo katalog, košaricu, jedan standardni način kartičnog plaćanja uz kompatibilni dodatak i osnovna pravila dostave. Rad provjeravamo probnom narudžbom. Procjena podrazumijeva jedan jezik i pripremljene materijale.</p>
          <p>Opise, fotografije, prijevode, povijest narudžbi i složenije funkcije dogovaramo prema opsegu. Konačnu ponudu dobivate nakon provjere zahtjeva.</p>
        </div>
      </section>
    </main>
  );
}
