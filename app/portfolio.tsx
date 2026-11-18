import Image from "next/image";
import { publishedProjects } from "../lib/portfolio-projects";
import { Icon } from "./ui-icon";

const [moira, ...platforms] = publishedProjects;

export function Portfolio() {
  return (
    <section id="radovi" className="frame section work-section" aria-labelledby="work-title">
      <div className="section-intro">
        <h2 id="work-title">Odabrani radovi</h2>
        <p>Od kupnje izvezene tunike do pronalaska prijevoza. Pogledajte što korisnici mogu napraviti na projektima koje smo izradili.</p>
      </div>
      <article className="featured-work">
        <a className="work-image moira-image" aria-label="Otvori MOIRA webshop" href={moira.href}>
          <Image src={moira.image} alt={moira.alt} width={1120} height={573}
            sizes="(min-width: 1320px) 680px, (min-width: 820px) 54vw, 88vw" />
        </a>
        <div className="featured-copy">
          <h3>{moira.name}</h3>
          <p className="work-type">Webshop za odjeću i tekstil</p>
          <p>Novo sučelje povezali smo s postojećom WooCommerce trgovinom. Na stranici tunike kupac može pogledati vez izbliza te odabrati boju i veličinu.</p>
          <a href="https://moira-hr.com/proizvod/tunika-vez-pleter/" className="text-link">Pogledajte proizvod <Icon name="up-right" /></a>
        </div>
      </article>
      <div className="work-pair">
        {platforms.map(project => (
          <article key={project.name}>
            <a href={project.href} className={"work-image " + (project.name === "idesh" ? "idesh-image" : "buvljak-image")} aria-label={"Otvori " + project.domain}>
              <Image src={project.image} alt={project.alt} width={1120} height={573}
                sizes="(min-width: 1320px) 518px, (min-width: 650px) 40vw, 82vw" />
            </a>
            <div className="work-heading"><h3><a href={project.href}>{project.name}</a></h3><span>{project.type}</span></div>
            <p>{project.summary}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
