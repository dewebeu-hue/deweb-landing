import type { Metadata } from "next";
import Image from "next/image";
import { SiteFooter } from "../site-footer";

export const metadata: Metadata = {
  title: "Tehnička provjera i dorada web-stranice | deweb",
  description: "Provjera sigurnosnih postavki, WordPress dodataka, kontaktnih obrazaca i analitike za tvrtke i web-agencije. Dorade prema dogovorenom opsegu.",
  alternates: { canonical: "/tehnicka-provjera-weba" },
};

const frame = "mx-auto w-[min(100%-36px,1160px)]";
const focus = "focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-orange-dark";
const textLink = `inline-flex min-h-11 items-center font-extrabold text-teal-dark underline underline-offset-4 ${focus}`;

export default function TechnicalReviewPage() {
  return (
    <>
      <header className="border-b border-line bg-white">
        <div className={`${frame} flex min-h-[76px] flex-wrap items-center justify-between gap-x-4 py-2`}>
          <a href="/" aria-label="deweb — naslovnica" className={`inline-flex min-h-11 items-center ${focus}`}>
            <Image src="/deweb-logo.svg" alt="deweb" width={136} height={31} priority />
          </a>
          <a href="/#web-stranice" className={`${textLink} text-sm`}>Web-usluge</a>
        </div>
      </header>

      <main>
        <section className="border-b border-line bg-[#f0f8f8] py-14 md:py-20" aria-labelledby="review-title">
          <div className={`${frame} grid gap-9 lg:grid-cols-[1.25fr_0.75fr] lg:items-center lg:gap-16`}>
            <div>
              <h1 id="review-title" className="m-0 max-w-[16ch] text-[clamp(2.25rem,5vw,3.75rem)] font-black leading-[1.08] tracking-[-0.035em] text-ink">
                Tehnička provjera postojećeg weba
              </h1>
              <p className="mt-5 max-w-[58ch] text-lg leading-8 text-muted">
                Ako imate WordPress stranicu ili održavate webove za klijente, možemo provjeriti sigurnosne postavke i ključne funkcije, objasniti što traži popravak i preuzeti dogovorene dorade.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2">
                <a href="mailto:dinko@deweb.hr?subject=Tehni%C4%8Dka%20provjera%20weba" className={`inline-flex min-h-[52px] items-center justify-center rounded-lg bg-teal px-5 py-3 text-center text-sm font-extrabold text-white transition-colors hover:bg-teal-dark ${focus}`}>
                  Pošaljite adresu weba
                </a>
                <a href="/#kontakt" className={`${textLink} text-sm`}>Kontaktni obrazac</a>
              </div>
            </div>

            <aside className="rounded-xl border border-line bg-white p-6 md:p-8" aria-labelledby="deliverables-title">
              <h2 id="deliverables-title" className="m-0 text-xl font-black text-ink">Što dobivate</h2>
              <ul className="mt-4 divide-y divide-line text-sm leading-6 text-muted">
                <li className="py-3">Potvrđene nalaze i njihov utjecaj na stranicu.</li>
                <li className="py-3">Redoslijed popravaka prema njihovoj važnosti.</li>
                <li className="pb-0 pt-3">Ako želite da odradimo dorade, ponudu s opsegom i cijenom prije početka.</li>
              </ul>
            </aside>
          </div>
        </section>

        <section className={`${frame} grid gap-8 py-14 md:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16`} aria-labelledby="scope-title">
          <h2 id="scope-title" className="m-0 max-w-[16ch] text-3xl font-black leading-tight tracking-[-0.025em] text-ink sm:text-4xl">
            Što provjeravamo
          </h2>
          <dl className="m-0 divide-y divide-line border-y border-line">
            <div className="py-5">
              <dt className="font-black text-ink">WordPress i dodaci</dt>
              <dd className="mt-2 leading-7 text-muted">Provjeravamo aktivne verzije, poznate sigurnosne propuste i što treba ažurirati.</dd>
            </div>
            <div className="py-5">
              <dt className="font-black text-ink">Domena i sigurnosne postavke</dt>
              <dd className="mt-2 leading-7 text-muted">Pregledavamo HTTPS i zaštitne postavke weba. Po dogovoru provjeravamo i postavke koje pomažu spriječiti lažno predstavljanje e-poštom.</dd>
            </div>
            <div className="py-5">
              <dt className="font-black text-ink">Upiti i mjerenje posjeta</dt>
              <dd className="mt-2 leading-7 text-muted">Prema dogovoru testiramo kontaktne obrasce, analitiku i druge funkcije na koje dorada može utjecati.</dd>
            </div>
          </dl>
        </section>

        <section className="border-t border-line bg-[#f5f9fa] py-12 md:py-16" aria-labelledby="agency-title">
          <div className={`${frame} grid gap-4 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16`}>
            <h2 id="agency-title" className="m-0 text-2xl font-black leading-tight text-ink sm:text-3xl">Podrška za web-agencije</h2>
            <div className="max-w-[65ch] leading-7 text-muted">
              <p className="m-0">Možemo preuzeti pojedinačnu tehničku provjeru ili dogovorene dorade na webu koji održavate. Vašem timu predajemo popis izmjena i što smo provjerili.</p>
              <p className="mb-0 mt-3">Kad dogovorimo popravak, prvo osiguramo kopiju za povrat i provjerimo promjenu na testnoj kopiji. Nakon objave ponovimo dogovorene provjere.</p>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
