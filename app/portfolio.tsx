import Image from "next/image";
import { publishedProjects } from "../lib/portfolio-projects";

const projectsInDevelopment = [
  { name: "Konfiguratori za ponude", type: "Demonstracije", summary: "Primjeri kako kupac sam odabire opcije proizvoda, a prodaja dobiva strukturiran upit." },
  { name: "VSME Passport", type: "U razvoju", summary: "Alat za organiziranje podataka o održivosti malih i srednjih poduzeća." },
];

const [featuredProject, ...otherProjects] = publishedProjects;

const projectLink = "inline-flex min-h-11 items-center font-extrabold text-teal-dark underline underline-offset-4 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-3 focus-visible:outline-orange-dark";

export function FeaturedWork() {
  return (
    <section
      aria-labelledby="moira-title"
      className="mx-auto my-10 grid w-[min(100%-36px,1160px)] items-center gap-6 rounded-2xl bg-[#f4eae8] p-4 sm:p-6 md:my-14 lg:grid-cols-[1.55fr_1fr] lg:gap-8"
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
        <h2 id="moira-title" className="text-[clamp(2rem,4vw,3.5rem)] font-black leading-none tracking-[-0.035em] text-ink">
          {featuredProject.name}
        </h2>
        <p className="mt-3 font-bold leading-6 text-ink">Klijentski rad · webshop za odjeću i tekstil</p>
        <p className="mt-3 max-w-[42ch] leading-7 text-ink">{featuredProject.summary}</p>
        <p className="mt-3 leading-7 text-ink">Kupac na proizvodu može provjeriti veličinu ili, na odabranim artiklima, upisati tekst za personalizirani vez.</p>
        <div className="mt-3 flex flex-wrap gap-x-5">
          <a href="https://moira-hr.com/product/tunika-vez-pleter/" className={`${projectLink} text-sm`}>Pogledajte vodič za veličine</a>
          <a href="https://moira-hr.com/product/rucnik-vez-klasje/" className={`${projectLink} text-sm`}>Pogledajte opciju veza</a>
        </div>
      </div>
    </section>
  );
}

export function Portfolio() {
  return (
    <section id="radovi" className="bg-[#f5f9fa] py-16 md:py-20" aria-labelledby="work-title">
      <div className="mx-auto w-[min(100%-36px,1160px)]">
        <h2 id="work-title" className="text-[2rem] font-black leading-[1.12] tracking-[-0.035em] text-ink sm:text-[2.65rem] lg:text-[3.1rem]">
          Vlastite platforme
        </h2>

        <div className="mt-7 grid gap-9 md:grid-cols-2 lg:gap-10">
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
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
