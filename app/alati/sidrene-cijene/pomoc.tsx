import { priceHelpHref, priceHelpOptions } from "../../../lib/price-help";
import { Icon } from "../../ui-icon";
import styles from "./upitnik.module.css";

export function PriceHelp() {
  return <section id="pomoc" className={styles.help} aria-labelledby="price-help-title">
    <div className={styles.helpIntro}>
      <h2 id="price-help-title">Trebate pomoć s provedbom?</h2>
      <p>Možemo pripremiti podatke, doraditi webshop i postaviti objavu cjenika. Odaberite s čime trebate pomoć pa opišite kako danas radite.</p>
    </div>
    <ul className={styles.helpOptions}>
      {priceHelpOptions.map(item => <li key={item.id}>
        <a href={priceHelpHref(item.id)}>
          <span><strong>{item.title}</strong><span>{item.description}</span></span>
          <Icon name="up-right" />
        </a>
      </li>)}
    </ul>
    <p className={styles.helpNote}>Prvo pregledamo vaše podatke i mogućnosti sustava, a zatim dogovaramo opseg, cijenu i rok. Vi potvrđujete povijesne iznose i uvjete prodaje.</p>
  </section>;
}
