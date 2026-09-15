# Faza 0 — pregled projekta deweb.hr /alati

Datum pregleda: 14. 9. 2026. Opseg: lokalni repozitorij, bez produkcijskih poziva ili objave. Povezana specifikacija: [01-webshop-price-spec.md](01-webshop-price-spec.md).

## Stvarno stanje

- Uputa: `C:/Users/deweb/Documents/AGENTS.md` traži `premium-product-ui` za UI rad. Skill `C:/Users/deweb/.codex/skills/premium-product-ui/SKILL.md` je pročitan i primijenjen na smjer specifikacije; nije mijenjan. U korijenu repozitorija nema dodatnog `AGENTS.md`.
- Framework: Next.js App Router 16.2.7, React/React DOM 19.2.7 i TypeScript 6.0.3 prema lokalno instaliranim paketima. `package.json` koristi oznake `latest`, pa je lockfile bitan za reproducibilnost. Stilovi su Tailwind CSS 3.4.19 preko `tailwind.config.ts`, `postcss.config.mjs` i `app/globals.css`.
- Rute: `app/page.tsx` je početna; `app/privatnost/page.tsx`, `app/uvjeti/page.tsx`, `app/pravna-obavijest/page.tsx` su pravne stranice; `app/api/contact/route.ts` je POST API. Nema `/alati` rute, kalkulatora, zasebne zajedničke navigacije ni direktorija komponenti.
- Vizualni identitet: `public/deweb-logo.svg` i `public/favicon.svg`; `tailwind.config.ts` definira ink, muted, line, teal i orange, soft sjenu i font-family listu. `app/globals.css` koristi Inter kao prvi izbor uz sistemske zamjene, ali nema uvoza/hostanja Inter fonta ni `next/font`; prikaz Intera zato ovisi o uređaju. Početna koristi svijetlu podlogu, mrežasti uzorak, zaobljene kartice, narančasti primarni CTA i teal naglaske. `app/scroll-reveal.tsx` i CSS imaju podršku za smanjeno kretanje.
- SEO: `app/layout.tsx` postavlja globalni naslov, opis, ikonu i `lang="hr"`; pravne rute imaju lokalni metadata. Nema zasebnog metadata za alate, `metadataBase`, canonical, Open Graph, sitemap ili robots datoteke/rute u repozitoriju. Nije provjerena produkcijska konfiguracija indeksiranja; globalni robots/noindex se ne dira.
- Analitika: u pregledanom kodu nema instrumentacije. `app/privatnost/page.tsx` kaže da v1 nema analitičkih/marketinških kolačića; `lib/legal-pages.test.ts` provjerava odsutnost poznatih tracking skripti. Nisu provjereni vanjski hosting ili produkcijska konfiguracija.

## Ponovna uporaba i stvarne granice

| Izvor | Uporaba za `/alati` i kalkulator | Ograničenje |
| --- | --- | --- |
| `app/page.tsx` | Vizualni obrazac naslova, grid širine do 1120 px, kartica, CTA-a, lokalnog headera i footera; copy usluge „Webshop i redizajn” za vezu s plaćenom uslugom | Header i footer nisu izdvojene komponente. Navedeni blok usluge trenutačno je dio tuđe nezavršene izmjene. |
| `tailwind.config.ts`, `app/globals.css` | Boje, tipografija, sjena, razmaci i stanja fokusa kao polazište | Inter nije lokalno učitan; ne uvoditi novi vizualni sustav. |
| `public/deweb-logo.svg`, `public/favicon.svg` | Identitet novih ruta | Zadržati postojeće datoteke. |
| `app/problem-form.tsx` | Postojeći UX za upit: obvezna polja, statusi, honeypot, CTA i tekst o privatnosti | Komponenta trenutačno nema ulazne propove za početne vrijednosti. U ovoj fazi nije mijenjana. |
| `lib/problem-email.ts`, `app/api/contact/route.ts` | Već postojeća validacija i obrada kontaktnog upita preko Resenda | API šalje email; ne koristiti ga za probne poruke. Nema pohrane upita. |
| `app/layout.tsx`, `lib/seo.test.ts` | Uzorak Next metadata i SEO provjere | Metadata za kalkulator trebaju biti zasebni. |
| `app/scroll-reveal.tsx` | Eventualno diskretno otkrivanje statičnog sadržaja | Rezultat kalkulatora mora biti vidljiv bez animacije. |

## Poslovni izvori i status odobrenja

Pretraženi su svi neignorirani tekstualni izvori u repozitoriju i `assets` (prazan). Nema `docs` sadržaja prije ovog pregleda, zasebne webshop ponude, cjenika, tablice cijena ni dokaza o odobrenju cjenovnih stavki. Nisu pregledavani privatni dokumenti izvan projekta ni produkcijski sustavi.

| Pronađeni podatak | Izvor | Vidljivo odobren? | Posljedica |
| --- | --- | --- | --- |
| Webshop i redizajn predstavljeni su kao usluga s fokusom na mobilno iskustvo, brzinu i put do kupnje. | `app/page.tsx`, niz `services`; trenutno necommitana izmjena | Ne; opis je u lokalnoj izmjeni, bez potvrde vlasnika. | Može voditi prijedlog opsega, ali nije cjenovna obveza. |
| Generičke ponude „Problem brief”, „Brzi MVP alat” i „Custom poslovni sustav” imaju opisne oznake „Procjena nakon problema” ili „Cijena ovisi o opsegu”. | `app/page.tsx`, niz `offers` | Nema vidljive poslovne potvrde; nema brojčanih cijena. | Ne može se izvesti webshop osnovica ili dodatak. |
| Opseg, rok i cijena dogovaraju se zasebno nakon razumijevanja problema; sadržaj nije obvezujuća ponuda. | `app/uvjeti/page.tsx` | Objavljeno u lokalnom kodu, ali stranica sadrži TODO za završni pravni pregled; nije potvrđen cjenik. | Kalkulator mora jasno označiti okvirnu narav procjene i ručnu ponudu. |
| README opisuje kontaktni kanal i primjere naziva varijabli okoline, bez webshop cijena. | `README.md` | Nije cjenovni izvor. | Nema poslovnih parametara za izračun. |

**Poslovni dio: BLOCKED.** Nema potvrđene osnovice, dodataka, raspona, pravila za tekuće/vanjske troškove ni poreznog prikaza. Nikakve demo cijene, pretpostavljene tržišne vrijednosti ili prodajni učinci nisu odobren cjenik. Tehnička specifikacija i kontrolni slučajevi mogu se pripremiti simbolički; brojčani izlaz ne smije biti objavljen prije odluka vlasnika.

## Odluke za Dinka

1. Potvrditi koje vrste webshop projekta deweb naplaćuje po standardnom okviru (novi/redizajn), uključene isporuke, granice kataloga i što ide isključivo na ručnu procjenu.
2. Potvrditi cjenovnu matricu ili pravilo raspona: osnovice, dodatke, popuste ako postoje, zaokruživanje, valutu i datum/verziju važenja. Ako raspon nije moguće pošteno definirati, potvrditi da alat prikazuje samo opseg i poziv na ponudu.
3. Potvrditi način prikaza poreza te koji su tekući i vanjski troškovi uključeni, isključeni ili „prema ponudi pružatelja”; bez nagađanja iznosa.
4. Potvrditi korisnički tekst ograda i poslovnu vezu na uslugu webshopa, uključujući tvrdnje o isporuci i održavanju.
5. Potvrditi želi li se kasnije minimalna agregirana analitika i odgovara li postojeći tekst privatnosti takvom mjerenju. Trenutna aplikacija nema analitiku.

## Provjere i očuvanje stanja

- `git status --porcelain=v1 --untracked-files=all` prije rada: `M app/page.tsx`. Diff su dodani blokovi „Konkretna rješenja” i niz `services`; nisu mijenjani, premještani ni odbačeni.
- Izvršeno: `npm test` — 19 testova prošlo, 0 palo. Test slanja koristi lažni `fetcher` i primjerne adrese; ne šalje email.
- Izvršeno: `./node_modules/.bin/tsc --noEmit --incremental false` — izlazni kod 0, bez ispisa grešaka i bez pisanja build cachea.
- Izvršeno: pregled skripti u `package.json`, lokalnih verzija paketa, ruta, SEO-a, kontakt obrasca, poslovnih tekstova i git diffa.
- Neizvršeno: `npm run build`, `npm run dev`, produkcijski URL/browser, POST na `/api/contact`, slanje Resend emaila, deploy. `build` piše u `.next`, a za ovaj dokumentacijski pregled ne daje nužan dodatni signal; kontaktna ruta mogla bi poslati stvarni upit.
- Neuspjele provjere: nema. Jedno čitanje s literalnim wildcardom `lib/*.test.ts` javilo je da putanja ne postoji; datoteke testova potom su pregledane ispravnim putanjama, a testovi su prošli.

## Minimalni sljedeći korak

Nakon Dinkove potvrde poslovnih parametara, zapisati verzioniranu matricu pravila i njezine testne primjere kao čistu funkciju bez UI-a. Tek potom povezati novu rutu i prikaz s postojećim identitetom i kontaktnim tokom.
