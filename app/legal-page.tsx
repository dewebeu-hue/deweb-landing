import type { ReactNode } from "react";

export const legalParagraph = "legal-p";
export const legalHeading = "legal-h";
export const legalEmailLink = "inline-link";

const documents = [
  ["Politika privatnosti", "/privatnost"],
  ["Uvjeti korištenja", "/uvjeti"],
  ["Podaci o društvu", "/pravna-obavijest"],
] as const;

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main id="sadrzaj">
      <div className="page-heading compact-heading"><div className="frame"><h1>{title}</h1></div></div>
      <div className="frame document-layout">
        <nav className="document-nav" aria-label="Pravne i informativne stranice — izbor dokumenta">
          {documents.map(([label, href]) => <a href={href} key={href} aria-current={title === label ? "page" : undefined}>{label}</a>)}
        </nav>
        <article className="document-body" aria-label={title}>{children}</article>
      </div>
    </main>
  );
}
