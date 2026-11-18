import Image from "next/image";
import { MobileMenu } from "./mobile-menu";
import { Icon } from "./ui-icon";

const links = [
  ["Usluge", "/#usluge"],
  ["Radovi", "/#radovi"],
  ["Suradnja", "/#proces"],
  ["Alati", "/alati"],
] as const;

export function SiteHeader() {
  return (
    <header className="site-header">
      <a className="skip" href="#sadrzaj">Preskočite na sadržaj</a>
      <div className="frame masthead">
        <a href="/" className="brand" aria-label="deweb — naslovnica">
          <Image src="/deweb-logo.svg" alt="deweb" width={128} height={30} priority />
        </a>
        <nav className="desktop-nav" aria-label="Glavna navigacija">
          {links.map(([label, href]) => <a href={href} key={label}>{label}</a>)}
        </nav>
        <div className="header-actions">
          <a href="/#kontakt" className="button header-cta">Zatražite ponudu <Icon name="up-right" /></a>
          <MobileMenu links={links} />
        </div>
      </div>
    </header>
  );
}
