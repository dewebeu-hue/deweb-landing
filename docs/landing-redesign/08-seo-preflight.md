# deweb landing — SEO preflight prije objave

Datum: 14. rujna 2026. **SEO STATUS: PASS** za lokalni izvor i lokalni produkcijski build. **SEO READY FOR DEPLOY REVIEW.** Ovo nije potvrda ponašanja trenutačno objavljene stranice ni odobrenje za deploy. Produkcija, Search Console i vanjski sustavi nisu mijenjani.

## Opseg i izvor istine

Pregledani su zatečeni `git status`, globalni `C:/Users/deweb/Documents/AGENTS.md` (projektni `AGENTS.md` nije pronađen), upute `premium-product-ui`, postojeći izvještaji `00-current-state-audit.md`, `04-acceptance-gates.md`, `05-implementation-qa.md` i `06-prelaunch-verification.md`, stvarni App Router kod, lokalni produkcijski HTML i DOM. Radno stablo je prije zadatka već sadržavalo mnoge nevezane izmjene; sve su sačuvane. Nije rađen commit, push, reset, stash, deploy ni slanje obrasca. Nisu čitane vrijednosti tajni.

Projekt koristi Next.js 16.2.7 App Router. Pronađene rute: `/`, `/privatnost`, `/uvjeti`, `/pravna-obavijest`, `/alati`, `/alati/kalkulator-cijene-webshopa`, `/api/contact`, te sada `/robots.txt` i `/sitemap.xml`. Početna je dinamički serverski renderirana zbog CTA parametara `vrsta` i `paket`; ostale stranice su statičke. U Git povijesti aplikacije pronađene su samo početna i tri pravne stranice; nema poznatog premještenog vrijednog URL-a ni definiranih redirecta u `next.config.ts`. To ne može dokazati da vanjski povijesni URL-ovi nikada nisu postojali.

Prije korekcija lokalni `/robots.txt` i `/sitemap.xml` vraćali su 404, nije bilo canonicala ni `metadataBase`, a naslov/opis u korijenskom layoutu opisivali su staro pozicioniranje. `/alati` je već imao `noindex, nofollow` i ostao je razvojna verzija. Prema [Googleovim uputama za `noindex`](https://developers.google.com/search/docs/crawling-indexing/block-indexing), te stranice nisu blokirane u robots.txt: crawler mora moći pročitati njihovu meta direktivu.

## Rezultati po gateu

| Provjera | Status | Dokaz i granica |
| --- | --- | --- |
| Indexability | **PASS** | Završni lokalni build s `VERCEL_ENV=production`: `/` 200, bez `noindex` i bez `X-Robots-Tag`. Završni build s `VERCEL_ENV=preview`: `/` i CTA query URL 200 s `noindex, nofollow`. `development` grana potvrđena unit testom. Ne-Vercel staging bez `VERCEL_ENV` treba zasebnu konfiguracijsku provjeru. |
| robots.txt | **PASS** | Lokalni GET 200; `Allow: /`, `Disallow: /api/`, produkcijski sitemap URL. Draft stranice nisu disallowane. |
| Sitemap | **PASS** | Lokalni GET 200, valjan XML sa samo `https://deweb.hr/`. Nema API-ja, draft alata, privremenih pravnih stranica, query URL-ova ni izmišljenog `lastModified`. Implementacija slijedi [Next.js sitemap konvenciju](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap). |
| Canonical | **PASS** | Stvarni `<head>` početne i `/?vrsta=...` sadrži jedan `<link rel="canonical" href="https://deweb.hr/">`; bez localhosta, preview domene ili parametara. Next.js normalizira root URL iz Metadata API-ja bez završne `/`, pa je za traženi točni zapis korišten Reactov link koji se u provjerenom produkcijskom HTML-u podiže u `<head>`. Draft/noindex rute nemaju canonical na početnu. Usklađeno s [Googleovim pravilima za canonical URL](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls). |
| Title | **PASS** | Početna: `Izrada web-stranica i poslovnih aplikacija \| deweb`. Pravne i draft alatne rute imaju vlastite opisne naslove. |
| Meta description | **PASS** | Početna prirodno navodi izradu i redizajn poslovnih web-stranica te interne alate i aplikacije po mjeri; bez neprovjerenih rezultata. Ostale stranice imaju vlastite opise. |
| H1 / heading hierarchy | **PASS** | Renderirani DOM početne ima jedan H1, zatim tematske H2/H3 za web, alate, radove, proces, pitanja i kontakt. Brandovski H1 ostao je isti; prvi vidljivi odlomak sada eksplicitno opisuje obje usluge. |
| Language | **PASS** | `<html lang="hr">` u lokalnom generiranom HTML-u svih pregledanih stranica; OG locale `hr_HR`. |
| Open Graph | **PASS** | Početna ima title, description, URL, site name, locale, website tip i vlastitu 1200 × 630 sliku. `og:image` lokalno vraća 200; PNG je 46.359 B. `twitter:card=summary_large_image`. Prikaz na društvenim servisima nakon deploya nije testiran. |
| Structured data | **PASS** | U renderiranom DOM-u nema JSON-LD. Namjerno nije dodana neodobrena Organization/LocalBusiness, review, rating, Offer ni FAQ schema. [Googleove smjernice za strukturirane podatke](https://developers.google.com/search/docs/appearance/structured-data/sd-policies) traže istinit i odgovarajući sadržaj. |
| Internal linking | **PASS** | Header/CTA vode na postojeće sekcije weba, alata, radova, procesa i kontakta; footer vodi na sve tri postojeće pravne rute. Sva provjerena interna sidra imaju cilj u HTML-u. `/alati` nije dodan u navigaciju jer je razvojni i `noindex`, u skladu s G16. |
| Image SEO | **PASS** | Relevantni screenshotovi imaju smislene altove i eksplicitne dimenzije. Dvije slike radova ispod početnog ekrana sada su `loading="lazy"` s odgovarajućim `sizes`. Hero nema sliku; logo i OG slika nisu punjeni SEO ključnim riječima. |
| Redirects / 404 | **PASS** | Lokalna nepostojeća ruta vraća HTTP 404 i `noindex`; nema redirect chaina ni poznatog zamijenjenog URL-a u pregledanoj Git povijesti i konfiguraciji. Potpun vanjski povijesni URL inventar nije dostupan. |
| Mobile/content readability | **PASS** | Stvarni Chromium na 390, 768 i 1440 px: `scrollWidth` jednak širini viewporta, jedan H1, prvi odlomak i dva CTA-a čitljivi; screenshots su vizualno pregledani. Ključni tekst postoji u početnom serverskom HTML-u bez interakcije, canvasa ili čekanja animacije. |
| Business-tools content coverage | **PASS** | Prvi vidljivi odlomak, zasebni H2, primjeri evidencije upita/ponuda/radnih naloga, CTA i kontaktni put čuvaju poslovne aplikacije i interne alate kao ravnopravnu ponudu. SaaS je spomenut samo kao mogući tip projekta. |
| Performance preflight | **PASS** | Nema hero slike, vanjskih skripti ni novih font zahtjeva; CSS koristi sistemski fallback. Lokalni `agent-browser vitals` pri 1440 px: LCP kandidat H1, CLS 0, FCP 76 ms, TTFB 22,1 ms; pri 390 px: LCP kandidat uvodni odlomak, CLS 0, FCP 72 ms, TTFB 20,7 ms. Ovo je topli lokalni Chromium, bez mrežnog/CPU throttlinga i bez stvarnih korisnika; nije Lighthouse ni dokaz produkcijskih CWV. INP nije izmjeren jer nije bilo interakcije. Nema jasne regresije koju bi ovaj opseg trebao popravljati. |
| Tests | **PASS** | `npm test`: 32/32, bez stvarnog slanja e-pošte. Prvi pokušaj nakon izmjena nije prošao zbog starih regex očekivanja i Node ESM import putanje; testovi su usklađeni, završni rezultat prolazi. |
| Typecheck | **PASS** | `npm run typecheck`: exit 0. |
| Build | **PASS** | `npm run build` s `VERCEL_ENV=preview` i zatim `VERCEL_ENV=production`: oba exit 0. Završni `.next` je produkcijska grana. |
| Lint | **NOT RUN** | `package.json` nema lint skriptu. |

U završnoj produkcijskoj grani lokalni `robots.txt` i `sitemap.xml` vraćaju 200; `/`, CTA URL, pravne i alatne rute vraćaju 200; nepostojeći URL vraća 404. `/alati` i kalkulator ostaju `noindex, nofollow`. Tri privremene pravne stranice sada su `noindex, follow` i izostavljene iz sitemapa jer same u sadržaju navode potrebu za završnom pravnom provjerom. Njihov tekst nije mijenjan. Odobrenje pravnog sadržaja i stvarni kontaktni delivery iz `06-prelaunch-verification.md` odvojeni su preduvjeti za širu objavu, ne dokazi SEO kvara početne.

## A) Stvarno promijenjeno

- U `app/layout.tsx` postavljen je produkcijski `metadataBase` i aktualan fallback opis. `lib/seo-policy.ts` daje `noindex, nofollow` za Vercel preview/development, a u produkciji ne postavlja nepotrebnu robots direktivu. Tako Nextov 404 zadržava samo vlastiti `noindex`.
- U `app/page.tsx` usklađeni su title, description i OG podaci s dvije glavne ponude; dodan je točan root canonical i prirodno preciziran prvi vidljivi odlomak. Slike radova ispod prvog ekrana učitavaju se odgođeno.
- Dodani su `app/robots.ts`, `app/sitemap.ts` i vlastiti `public/og-deweb.png` u postojećim bojama i s postojećim logotipom.
- Privremene pravne stranice dobile su `noindex, follow`; razvojni alati nisu mijenjani. `lib/seo.test.ts` i jedan zastarjeli tekstualni assertion u `lib/contact-visibility.test.ts` prilagođeni su aktualnoj metapodatkovnoj i footer formulaciji.

## B) Već ispravno

Hrvatski `lang`, brandovski H1 i smislena H2/H3 struktura, postojeća web/alat podjela, interna sidra, pravni linkovi, kontekst internih alata, alt tekstovi, eksplicitne dimenzije slika, izostanak neodobrenog JSON-LD-a i marketinškog trackinga te draft `noindex` na `/alati` postojali su prije ovog preflighta. Nije mijenjan vizualni identitet, cijene, paketi ni kontaktni workflow.

## C) Tek nakon produkcijskog deploya

Treba potvrditi stvarni HTTPS odgovor za `https://deweb.hr/`, eventualno preusmjeravanje između `www` i non-`www`, robots/sitemap dostupnost, canonical i robots u produkcijskom HTML-u, stvarne `X-Robots-Tag`/hosting direktive, eventualni CDN cache, OG prikaz i Search Console stanje. Lokalni kod ne potvrđuje DNS, hosting konfiguraciju, vanjsku povijest URL-ova ni indeksaciju. Pregled javne domene u ovom zadatku pokazao je ranije objavljenu verziju landinga; novi lokalni sadržaj nije proglašen objavljenim. Ako se koristi staging koji ne postavlja [Vercelov `VERCEL_ENV`](https://vercel.com/docs/environment-variables/system-environment-variables), njegovu zaštitu od indeksiranja treba zasebno dokazati prije izlaganja tražilicama. U pregledanom aplikacijskom kodu nije pronađen Search Console verifikacijski token i nijedan nije dodan.

## D) Točan post-deploy SEO smoke-test

1. Otvoriti `https://deweb.hr/` i potvrditi HTTP 200, HTTPS te izravno konačno odredište za eventualni `http`/`www` redirect. Provjeriti stvarni HTML: jedan title i description, `lang="hr"`, jedan H1, canonical točno `https://deweb.hr/`, bez `noindex` u meta i HTTP zaglavljima.
2. Otvoriti `https://deweb.hr/?vrsta=web&paket=simple` i potvrditi isti root canonical, bez parametara; CTA preodabir provjeriti bez slanja forme.
3. Otvoriti `/robots.txt` i `/sitemap.xml`: oba 200; sitemap sadrži samo canonical javno indeksabilne stranice; robots ne blokira `/` ni crawleru pristup draft `noindex` stranicama.
4. Provjeriti `/alati` i kalkulator (`noindex, nofollow`) te tri pravne rute (`noindex, follow` dok je pravni tekst privremen); nepostojeća ruta mora dati stvarni 404. Pregledati bar jedan preview URL i potvrditi `noindex` u stvarnom odgovoru.
5. Provjeriti OG URL/sliku i mobilni prikaz; po mogućnosti prikupiti Lighthouse mobilni i desktop nalaz te stvarne CWV podatke nakon dovoljno prometa, bez tumačenja lokalnih milisekundi kao produkcijskih vrijednosti.
6. U Search Console, tek uz vlasnikov pristup i nakon zasebno odobrene objave: potvrditi property/URL, pokrenuti URL Inspection za početnu, po potrebi predati sitemap te pratiti indeksaciju, canonical izbor i crawl pogreške. Ovdje nije rađena prijava ni submit.

## E) Izmijenjene datoteke u ovom SEO zadatku

`app/layout.tsx`, `app/page.tsx`, `app/robots.ts`, `app/sitemap.ts`, `app/privatnost/page.tsx`, `app/uvjeti/page.tsx`, `app/pravna-obavijest/page.tsx`, `lib/seo-policy.ts`, `lib/seo.test.ts`, `lib/contact-visibility.test.ts`, `public/og-deweb.png`, `docs/landing-redesign/08-seo-preflight.md`. Sve ostale zatečene promjene ostale su sačuvane. `git diff --check` završio je bez whitespace pogrešaka; Git je ispisao samo upozorenja o mogućoj budućoj LF/CRLF normalizaciji. Nema lint skripte i nisu mijenjani dependency ni lockfile.
