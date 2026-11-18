import Image from "next/image";
import { Icon } from "./ui-icon";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="frame">
        <div className="footer-upper">
          <div>
            <a className="footer-brand" href="/" aria-label="deweb — naslovnica">
              <Image src="/deweb-logo.svg" alt="deweb" width={210} height={49} />
            </a>
            <p>Web-stranice i poslovni alati po mjeri</p>
          </div>
          <div className="footer-contact">
            <a href="mailto:dinko@deweb.hr">dinko@deweb.hr <Icon name="up-right" /></a>
            <a href="/tehnicka-provjera-weba">Tehnička provjera weba</a>
            <a href="/alati/sidrene-cijene">Bazne cijene i cjenik</a>
            <a href="/alati/kalkulator-cijene-webshopa">Kalkulator cijene webshopa</a>
          </div>
        </div>
        <div className="footer-lower">
          <p>© 2026 deweb j.d.o.o.</p>
          <nav aria-label="Pravne i informativne stranice">
            <a href="/privatnost">Politika privatnosti</a>
            <a href="/uvjeti">Uvjeti korištenja</a>
            <a href="/pravna-obavijest">Podaci o društvu</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
