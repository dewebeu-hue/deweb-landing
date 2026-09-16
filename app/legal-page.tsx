import type { ReactNode } from "react";
import { SiteFooter } from "./site-footer";

export const legalParagraph = "m-0 leading-7 text-muted";
export const legalHeading = "m-0 text-2xl font-black leading-tight";
export const legalEmailLink = "font-bold text-teal-dark underline underline-offset-4 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-3 focus-visible:outline-orange-dark";

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <main className="mx-auto grid w-[min(100%-36px,880px)] gap-8 py-12 text-ink">
        <a className={`justify-self-start text-sm ${legalEmailLink}`} href="/">deweb</a>
        <section className="grid min-w-0 gap-5 rounded-lg border border-line bg-white p-6 shadow-soft">
          <p className="m-0 text-sm font-black uppercase text-teal">{title}</p>
          <h1 className="m-0 text-4xl font-black leading-tight">{title}</h1>
          {children}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
