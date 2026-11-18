import { Icon } from "./ui-icon";

export default function NotFound() {
  return (
    <main id="sadrzaj" className="frame section not-found">
      <h1>Stranica nije pronađena</h1>
      <p className="lede">Poveznica vodi na adresu koja više nije dostupna. Na naslovnici možete pronaći usluge, radove i kontakt.</p>
      <a className="button" href="/">Na naslovnicu <Icon name="right" /></a>
    </main>
  );
}
