# deweb landing — provjere prije objave

Datum: 14. rujna 2026. Status: **BLOCKED — stvarna dostava i primitak e-pošte nisu potvrđeni.** CTA prije hidratacije je u nastavku ovog dokumenta popravljen i potvrđen. Ovo je lokalna provjera; produkcija nije mijenjana.

## Put kontaktnog upita i uzrok prethodne blokade

`app/problem-form.tsx` šalje JSON kao `POST /api/contact` s ograničenjem čekanja od 12 sekundi. `app/api/contact/route.ts` radi na Next.js Node poslužitelju: čita zahtjev, odbija nevaljan sadržaj, zadržava postojeći honeypot i poziva `sendContactEmail` iz `lib/problem-email.ts`. Ta funkcija šalje jedan HTTP `POST` na Resendov `/emails`. Primatelj je `CONTACT_TO_EMAIL`, pošiljatelj `CONTACT_FROM_EMAIL`, a `reply_to` je adresa upisana u obrazac. `RESEND_API_KEY` ostaje na serveru. U pregledanom kodu nema automatske potvrde korisniku, drugog mail poziva, baze ni web-hooka; pravila i automatizacije na Resend računu nisu ovdje provjereni.

Prethodni browser QA namjerno je postavio mrežno blokiranje `**/api/contact` i simulirao `window.fetch`, prema `05-implementation-qa.md` i prihvatnim uputama. To objašnjava zašto tada nije bilo stvarne dostave; ne dokazuje kvar aplikacije, mreže ni Resenda. U ovom QA-u je POST za browser mock također namjerno blokiran kao zaštita. Lokalno **nema `.env*` datoteka ni postavljenih** `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` procesnih varijabli (provjerena je samo prisutnost naziva, bez ispisa vrijednosti). Produkcijska konfiguracija nije pregledana. Adresa navedena kao primjer u `README.md` nije odobreni testni inbox.

Resendov HTTP 2xx znači da je servis prihvatio zahtjev, ne da ga je dostavio primatelju. Ova aplikacija ne čita kasniji status dostave. Primitak se može potvrditi tek u odobrenom sandučiću ili zasebnim pouzdanim statusom servisa.

## Kontrolirani stvarni test — pripremljen, nije poslan

Prije slanja Dinko treba izričito odobriti Dewebov testni inbox kao primatelja **i** adresu koja će se upisati u obrazac kao Reply-To. Lokalno treba sigurno postaviti tri navedene varijable, s provjerenim Resend pošiljateljem, bez izmjene produkcijske konfiguracije. Treba provjeriti dopušta li račun dodatne automatizacije prema adresi iz obrasca. Ako nema pristupa sandučiću, vlasnik treba potvrditi primitak i broj primjeraka svake konkretne TEST poruke. Nijednu adresu pronađenu u projektu ne treba smatrati odobrenom samim time što je zapisana.

| Slučaj, najviše jedna stvarna poruka | Očekivani sadržaj | Browser predaja | Resend prihvat | Status dostave | Sandučić |
| --- | --- | --- | --- | --- | --- |
| TEST A — Jednostavni web, 790 € | `web`, `simple`, „Jednostavni web”, hrvatski znakovi, odobren Reply-To | PASS samo uz mock; stvarno BLOCKED | BLOCKED | BLOCKED | BLOCKED |
| TEST B — Poslovni web, 1.290 € | `web`, `business`, „Poslovni web”, hrvatski znakovi, odobren Reply-To | PASS samo uz mock; stvarno BLOCKED | BLOCKED | BLOCKED | BLOCKED |
| TEST C — Interni poslovni alat | `tool`, bez web-paketa i bez web-cijene; opis procesa, hrvatski znakovi, odobren Reply-To | PASS samo uz mock; stvarno BLOCKED | BLOCKED | BLOCKED | BLOCKED |

Unit test sastavlja sva tri nacrta e-pošte s jedinstvenom oznakom, provjerava `to`, `reply_to`, vrstu, paket i hrvatske znakove; ne šalje e-poštu. Browser mock potvrdio je preodabir i predani payload za `simple` i `business` kroz web CTA te za `tool` bez paketa. Stvarni integracijski test treba napraviti tek kad su prethodni uvjeti ispunjeni, bez stvarnih klijentskih podataka, uz evidenciju ID-a prihvaćene poruke, kasnijeg statusa i točne potvrde primitka. Ne ponavljati pokušaj automatski nakon timeouta jer ishod može biti nepoznat.

## Potvrđene male korekcije

- `app/problem-form.tsx`: nakon timeouta poruka više ne sugerira da upit sigurno nije primljen; kaže da se primitak ne može potvrditi i da tekst ostaje u obrascu. Zadržani su validacija, honeypot, zaključavanje gumba i podaci nakon pogreške.
- `lib/problem-email.ts`: uspjeh nakon odgovora API-ja kaže da je upit predan za slanje, bez tvrdnje da je poruka već stigla u inbox.
- `app/page.tsx`: samo uvodni odlomak na gradijentu dobio je tamniju boju `#536579`; struktura i ostale boje nisu mijenjane.
- `lib/problem-email.test.ts`: dodana izolirana matrica TEST A/B/C za sadržaj nacrta e-pošte i preciznost uspješne poruke.

## Kontrast na stvarnom gradijentu

Axe-core 4.12.1 nije mogao automatski odrediti pozadinu pet tekstualnih elemenata hero sekcije. Dodatno je prijavio ukrasni znak izbornika i, na tabletu, ukrasnu kvačicu u `aria-hidden` panelu kao neodređene znakove. To nisu tekstualne informacije. Ručno mjerenje: u lokalnom Chromiumu na 360, 390, 768, 1440 i 1920 px očitani su stvarni pravokutnici i CSS boje teksta, a zatim je snimljena ista renderirana pozadina s privremeno skrivenim sadržajem hero sekcije. Za svaki piksel pozadine unutar pravokutnika izračunat je WCAG omjer; u tablici je najmanji omjer kroz svih pet širina. Skriveni sadržaj nije promjena koda ili pozadine.

| Element | Najniži omjer | Kriterij | Rezultat |
| --- | ---: | ---: | --- |
| Nadnaslov, 12 px bold | 8,13:1 | 4,5:1 | PASS |
| Glavni H1, 33,6–64 px bold | 14,64:1 | 3:1 | PASS |
| Istaknuti dio H1, 33,6–64 px bold | 7,96:1 | 3:1 | PASS |
| Uvodni odlomak, 18–20 px regular | prije 4,33:1 na 768 px; poslije **4,96:1** na istom pikselu (`#dfecef` odnosno RGB 223,236,239) | 4,5:1 | PASS nakon korekcije |
| Završna rečenica, 14 px semibold | 4,66:1 | 4,5:1 | PASS |

Najniži omjeri ispravljenog odlomka po širini: 360/390 px 5,56:1, 768 px 4,96:1, 1440 px 5,53:1, 1920 px 5,53:1. Boja nakon nove lokalne gradnje potvrđena je u pregledniku kao `rgb(83, 101, 121)`. Ponovljeni axe audit nakon završetka ulazne animacije: **0 potvrđenih prekršaja**; sedam neodređenih čvorova na 768 px uključuje navedene tekstove i ukrasne znakove. Prerano pokrenuti audit tijekom animacije dao je prolazne kontrastne nalaze na elementima koji još ulaze; nakon smirivanja više ih nema.

## Prethodna regresija i granice dokaza (prije popravka CTA)

| Provjera | Rezultat |
| --- | --- |
| `npm test` | PASS — 27/27, uključujući novi TEST A/B/C nacrt |
| `npm run typecheck` | PASS |
| `npm run build` | PASS — Next.js 16.2.7, sve navedene rute uključujući dinamički `/api/contact` izgrađene |
| `git diff --check` | PASS — bez whitespace pogrešaka; samo upozorenja o budućoj LF/CRLF normalizaciji |
| Lokalni `POST /api/contact` s nevaljanom e-poštom i kratkim opisom | PASS — HTTP 400, prije mail transporta |
| Browser CTA: jednostavni web, poslovni web, poslovni alat | PASS — preodabir `web/simple`, `web/business`, odnosno `tool` i polje za opis procesa |
| Browser CTA kliknut prije React hidratacije | FAIL za preodabir — sidro radi, ali vrsta ostaje prazna; validacija sprječava slanje dok se ručno ne odabere |
| Browser mock: odbijanje 502 | PASS — bez uspjeha, gumb se otključava, unos ostaje |
| Browser mock: nerazriješen zahtjev i 12 s timeout | PASS — loading završava, unos ostaje, poruka priznaje nepoznat ishod |
| Browser mock: običan dvostruki klik | PASS — jedan paralelni poziv u istom pokušaju, gumb ostaje zaključan tijekom slanja |
| Browser mock: 200 `{ok:true}` | PASS — jedan payload, formular se prazni i gumb ostaje zaključan; ovo nije dokaz stvarnog slanja |
| Browser 390/1440 px, lokalni novi build | PASS — bez horizontalnog prelijevanja, provjeren izgled i boja odlomka, bez prijavljenih JS pogrešaka u konzoli |
| Lint | NOT RUN — `package.json` nema lint skriptu |
| Stvarni Resend i sandučić | BLOCKED — nema lokalne konfiguracije i izričito odobrenog testnog inboxa/Reply-To niti potvrde primitka |

Vrlo rani automatizirani klik odmah nakon `reload`, prije React hidratacije, otvorio je sidro bez preodabira; isti CTA nakon hidratacije predao je točan paket. To je bio zatečeni problem, riješen u nastavku ispod.

Nakon **zasebno odobrene objave** treba na stvarnoj domeni kratko provjeriti tri CTA preodabira, serversku validaciju, konfigurirane varijable bez ispisa vrijednosti, jednu kontroliranu TEST poruku prema odobrenoj adresi i njezin status/primitak. Lokalni PASS nije dokaz produkcijskog okruženja niti odobrenje za deploy. Nije rađen commit, push, reset, stash, deploy, DNS ili promjena vanjskih sustava; zatečene promjene su sačuvane.

## Nastavak — URL odabir prije hidratacije

Uzrok je bio `app/project-link.tsx`: izvorni CTA nosio je samo `#kontakt`, a odabir se prenosio isključivo React `onClick` događajem. Prije hidratacije preglednik je mogao pratiti sidro, ali obrazac nije dobio vrstu projekta ni paket.

Popravak je ograničen na navigacijsko stanje. `lib/project-selection.ts` stvara i provjerava URL oblika `/?vrsta=web&paket=simple#kontakt` (odnosno `business` ili `tool` bez paketa). `app/page.tsx` čita `searchParams` i šalje početni odabir obrascu već u serverski generiranom HTML-u. Zato je `/` sada **dinamička serverska ruta**, što je svjesna tehnička posljedica rada bez hidratacije. Nakon hidratacije `ProjectLink` zadržava prijelaz unutar stranice i unesena polja; ručna promjena vrste ili paketa ažurira URL, a povratak preglednikom vraća izbor. Nevaljani URL parametri i paket dodan poslovnom alatu ne mogu postaviti neispravan izbor. Cijene i izgled nisu mijenjani.

| Aktualna provjera | Rezultat |
| --- | --- |
| CTA prije hidratacije | **PASS** — blokirani su svi vanjski Next JS moduli, u DOM-u nema React oznaka; klik A na 390 px vodi na `web/simple`, B na 768 px na `web/business`, C na 1440 px na `tool` bez polja web-paketa. Nema horizontalnog prelijevanja; isto je potvrđeno u serverskom HTML-u. |
| CTA nakon hidratacije i ručna promjena | **PASS** — A/B/C postavljaju ispravan izbor; upisano ime ostaje pri prijelazima; ručna promjena ažurira URL; browser Back vraća prethodni izbor. |
| `npm test` | **PASS — 29/29**, uključujući dva nova testa URL parsiranja i A/B/C poveznica. |
| `npm run typecheck` | **PASS**. |
| `npm run build` | **PASS**, Next.js 16.2.7; `/` je dinamička ruta, ostale rute i `/api/contact` izgrađene. |
| Lint | **NOT RUN** — skripta nije definirana. |
| Browser 390/768/1440 px | **PASS** — hidratizirani `web/business`, nema horizontalnog prelijevanja ni novih konzolnih pogrešaka; uvodni tekst ostaje `rgb(83, 101, 121)`, prethodni kontrast 4,96:1 na 768 px nije mijenjan. |
| Invalid payload | **PASS** — lokalni endpoint vraća HTTP 400 prije transporta; prazan browser obrazac ne šalje zahtjev. |
| Mock 502, retry i 200 | **PASS** — pogreška ne prikazuje uspjeh i čuva unos; ponovni pokušaj šalje jedan mock zahtjev, uspjeh prazni polja i zaključava gumb. |
| Mock double-submit | **PASS** — običan dvostruki klik stvara jedan paralelni pokušaj i zaključava gumb. |
| Mock timeout | **PASS** — nakon 12 s gumb se otključava, unos ostaje, poruka ne tvrdi da je ishod poznat. |
| Stvarna predaja obrasca i prihvat endpointa | **BLOCKED** — nije slan valjan stvarni zahtjev. |
| Resend request acceptance | **BLOCKED** — nema uvjeta za stvarni test. |
| Resend delivery status | **BLOCKED** — nema pristupa pouzdanom statusu dostave. |
| Inbox receipt | **BLOCKED** — nema odobrenog testnog sandučića i potvrde primitka. |
| TEST A / TEST B / TEST C | **PASS samo za lokalni mock i sastavljeni nacrt e-pošte; BLOCKED za stvarno slanje i primitak svakog slučaja.** |

Mail put nije mijenjan: obrazac → `POST /api/contact` na Node serveru → `sendContactEmail` → Resend. `CONTACT_TO_EMAIL` određuje primatelja, `CONTACT_FROM_EMAIL` pošiljatelja, `RESEND_API_KEY` autorizaciju, a adresa iz obrasca postaje Reply-To. Ponovno je provjerena samo **prisutnost** lokalne konfiguracije: nema `.env*` datoteka ni postavljenih triju procesnih varijabli; vrijednosti tajni nisu čitane ni ispisivane. Nema izričito odobrenog Dewebova testnog primatelja i Reply-To adrese niti sigurnog pristupa Resend delivery statusu. Zbog toga nije poslana nijedna stvarna TEST poruka. HTTP 200 endpointa ili prihvat Resenda i dalje se ne smije zamijeniti za potvrdu dostave ili primitka.

Za stvarni A/B/C test treba najprije pribaviti sva tri uvjeta: valjane lokalne Resend postavke, izričito odobrene testne adrese za TO i Reply-To te pouzdan uvid u delivery status (po mogućnosti i odobreni inbox). Nakon toga najviše jedna jedinstveno označena TEST poruka po slučaju, uz odvojeno bilježenje predaje, prihvata, dostave i primitka. Produkcija, DNS, cijene, poslovna ponuda i zatečene nepovezane promjene ostale su netaknute; nije bilo commita, pusha ni deploya.
