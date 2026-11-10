import Image from "next/image";
import { Fragment } from "react";
import { publishedProjects } from "../lib/portfolio-projects";
import styles from "./project-spotlight.module.css";

export function ProjectSpotlight() {
  return (
    <fieldset className={styles.spotlight}>
      <legend className="sr-only">Odaberite projekt za prikaz</legend>
      {publishedProjects.map((project, index) => (
        <Fragment key={project.domain}>
          <input
            id={`spotlight-${index}`}
            type="radio"
            name="deweb-spotlight"
            className={`sr-only ${styles.choice}`}
            defaultChecked={index === 0}
          />
          <label htmlFor={`spotlight-${index}`} className={styles.tab}>{project.name}</label>
          <figure className={styles.project}>
            <Image
              src={project.image}
              alt={project.alt}
              width={1120}
              height={573}
              sizes="(min-width: 1196px) 618px, (min-width: 900px) 52vw, calc(100vw - 36px)"
              preload={index === 0}
              loading={index === 0 ? undefined : "eager"}
              className={styles.image}
            />
            <figcaption className={styles.caption}>
              <span>{project.previewCaption}</span>
              <a href={project.href} className={styles.projectLink} aria-label={`Otvori ${project.domain}`}>
                {project.domain}
                <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 18 18 6M7 6h11v11" />
                </svg>
              </a>
            </figcaption>
          </figure>
        </Fragment>
      ))}
    </fieldset>
  );
}
