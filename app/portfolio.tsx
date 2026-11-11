import Image from "next/image";
import Link from "next/link";
import { publishedProjects } from "../lib/portfolio-projects";

const projectsInDevelopment = [
  { name: "Ponude", type: "Pilot", summary: "Poslovna aplikacija za izradu i praćenje ponuda, s katalogom, PDF-om i podsjetnicima." },
  { name: "Konfiguratori za ponude", type: "Demonstracije", summary: "Primjeri kako kupac sam odabire opcije proizvoda, a prodaja dobiva strukturiran upit." },
  { name: "VSME Passport", type: "U razvoju", summary: "Alat za organiziranje podataka o održivosti malih i srednjih poduzeća." },
  { name: "Kalkulator cijene webshopa", type: "Javni prototip", summary: "Iz kratkih odgovora sastavlja sažetak zahtjeva za izradu webshopa.", href: "/alati/kalkulator-cijene-webshopa" },
];

const [featuredProject, ...otherProjects] = publishedProjects;

const projectLink = "inline-flex min-h-11 items-center font-extrabold text-teal-dark underline underline-offset-4 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-3 focus-visible:outline-orange-dark";

export function Portfolio() {
  return (
    <section id="radovi" className="bg-[#f5f9fa] py-16 md:py-20" aria-labelledby="work-title">
      <div className="mx-auto w-[min(100%-36px,1160px)]">
        <h2 id="work-title" className="text-[2rem] font-black leading-[1.12] tracking-[-0.035em] text-ink sm:text-[2.65rem] lg:text-[3.1rem]">
          Odabrani radovi
        </h2>

        <article
          aria-labelledby="moira-title"
          className="mt-7 grid items-center gap-6 rounded-2xl bg-[#f4eae8] p-4 sm:p-6 lg:mt-9 lg:grid-cols-[1.8fr_1fr] lg:gap-8"
        >
          <Image
            src={featuredProject.image}
            alt={featuredProject.alt}
            width={1120}
            height={573}
            sizes="(min-width: 1196px) 695px, (min-width: 1024px) 60vw, (min-width: 640px) calc(100vw - 84px), calc(100vw - 68px)"
            className="h-auto w-full rounded-xl"
          />
          <div className="min-w-0 px-1 pb-1 sm:px-2 lg:pl-0">
            <h3 id="moira-title" className="text-[clamp(2rem,4vw,3.5rem)] font-black leading-none tracking-[-0.035em] text-ink">
              {featuredProject.name}
            </h3>
            <p className="mt-3 font-bold leading-6 text-ink">Webshop za odjeću i tekstil</p>
            <p className="mt-3 max-w-[42ch] leading-7 text-ink">{featuredProject.summary}</p>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 lg:items-start">
              <Link
                href="/alati/kalkulator-cijene-webshopa"
                className="inline-flex min-h-12 max-w-full items-center justify-center rounded-lg bg-teal px-4 py-3 text-center text-sm font-extrabold text-white transition-colors duration-150 hover:bg-teal-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-orange-dark motion-reduce:transition-none"
              >
                Izračunajte okvirnu cijenu webshopa
              </Link>
              <a href={featuredProject.href} className={`${projectLink} text-sm`}>
                Posjetite {featuredProject.domain}
              </a>
            </div>
          </div>
        </article>

        <div className="mt-10 grid gap-9 md:grid-cols-2 lg:gap-10">
          {otherProjects.map(project => (
            <article key={project.name} className="grid items-center gap-4 sm:grid-cols-[0.9fr_1.1fr] md:grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] lg:gap-5">
              <Image
                src={project.image}
                alt={project.alt}
                width={1120}
                height={573}
                sizes="(min-width: 1196px) 243px, (min-width: 1024px) 21vw, (min-width: 640px) 45vw, calc(100vw - 36px)"
                className="h-auto w-full rounded-xl"
              />
              <div className="min-w-0">
                <h3 className="text-2xl font-black tracking-tight text-ink">{project.name}</h3>
                <p className="mt-1 text-sm font-bold text-teal-dark">{project.type}</p>
                <p className="mt-2 leading-7 text-ink">{project.summary}</p>
                <a href={project.href} className={`${projectLink} text-sm`} aria-label={`Otvori ${project.domain}`}>
                  {project.domain}
                </a>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-[0.7fr_1.3fr] lg:gap-12">
          <h3 className="text-2xl font-black leading-tight tracking-tight text-ink">Piloti, prototipi i razvoj</h3>
          <ul className="grid gap-5">
            {projectsInDevelopment.map((project) => (
              <li key={project.name}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h4 className="font-black text-ink">{project.name}</h4>
                  <p className="text-sm font-bold text-teal-dark">{project.type}</p>
                </div>
                <p className="mt-2 leading-6 text-muted">{project.summary}</p>
                {project.href && <a href={project.href} className={`${projectLink} text-sm`}>Isprobajte kalkulator</a>}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
