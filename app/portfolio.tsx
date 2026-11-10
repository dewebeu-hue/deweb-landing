import Image from "next/image";
import { publishedProjects } from "../lib/portfolio-projects";

const projectsInDevelopment = [
  { name: "Ponude", type: "Pilot", summary: "Poslovna aplikacija za izradu i praćenje ponuda, s katalogom, PDF-om i podsjetnicima." },
  { name: "Konfiguratori za ponude", type: "Demonstracije", summary: "Primjeri kako kupac sam odabire opcije proizvoda, a prodaja dobiva strukturiran upit." },
  { name: "VSME Passport", type: "U razvoju", summary: "Alat za organiziranje podataka o održivosti malih i srednjih poduzeća." },
  { name: "Kalkulator opsega webshopa", type: "Javni prototip", summary: "Iz kratkih odgovora sastavlja sažetak zahtjeva za izradu webshopa.", href: "/alati/kalkulator-cijene-webshopa" },
];

const projectLink = "inline-flex min-h-11 items-center font-extrabold text-teal-dark underline underline-offset-4 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-3 focus-visible:outline-orange-dark";

export function Portfolio() {
  return (
    <section id="radovi" className="border-y border-line bg-[#f5f9fa] py-16 md:py-20" aria-labelledby="work-title">
      <div className="mx-auto w-[min(100%-36px,1160px)]">
        <div className="reveal-on-scroll" data-reveal>
          <h2 id="work-title" className="text-[2rem] font-black leading-[1.12] tracking-[-0.035em] text-ink sm:text-[2.65rem] lg:text-[3.1rem]">Odabrani radovi</h2>
          <p className="mt-4 max-w-[65ch] leading-7 text-muted">Webshop i vlastite platforme koje možete otvoriti, uz poslovne alate koje razvijamo i testiramo.</p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {publishedProjects.map((project) => (
            <article key={project.name} className="reveal-on-scroll flex flex-col overflow-hidden rounded-xl border border-line bg-white" data-reveal>
              <Image src={project.image} alt={project.alt} width={1120} height={573} sizes="(min-width: 1196px) 370px, (min-width: 768px) 31vw, calc(100vw - 36px)" className="h-auto w-full border-b border-line" />
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-2xl font-black tracking-tight text-ink">{project.name}</h3>
                <p className="mt-1 text-sm font-bold text-teal-dark">{project.type}</p>
                <p className="mb-4 mt-3 leading-7 text-muted">{project.summary}</p>
                <a href={project.href} className={`${projectLink} mt-auto self-start`} aria-label={`Otvori ${project.domain}`}>
                  {project.domain}
                </a>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 grid gap-5 border-t border-line pt-7 lg:grid-cols-[0.7fr_1.3fr] lg:gap-12">
          <h3 className="text-2xl font-black leading-tight tracking-tight text-ink">Piloti, prototipi i razvoj</h3>
          <ul className="divide-y divide-line">
            {projectsInDevelopment.map((project) => (
              <li key={project.name} className="py-4 first:pt-0">
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
