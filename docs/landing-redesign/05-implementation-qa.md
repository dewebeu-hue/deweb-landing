# deweb landing — lokalna implementacija i QA

Datum: 14. rujna 2026. Produkcija nije objavljena.

## Što je izvedeno

- Naslovnica prikazuje dva jasno odvojena područja: web-stranice/redizajn i interne alate/poslovne aplikacije. SaaS je samo mogućnost u drugom području.
- Ponuda weba koristi vlasnikove potvrđene pakete iz priloženog briefa: Jednostavni web 790 € i Poslovni web 1.290 €. Poslovni paket označen je „Preporučeni” samo u web-ponudi. Opseg, isključenja, vanjski troškovi, plaćanje i točna PDV napomena nalaze se u `lib/web-packages.ts`.
- Interni alati imaju primjere mogućih procesa i „Ponuda prema opsegu”, bez izmišljene početne cijene, postojećeg proizvoda ili obećanih rezultata.
- „Radovi” prikazuju vlastitu lokalnu verziju ove stranice i vlastiti kalkulator u razvoju, s izričitim statusima. Nisu predstavljeni kao klijentske reference. Razvojni kalkulator nije cjenik webshopa.
- Kontaktni obrazac sada prima vrstu projekta, neobvezan web-paket i prilagođena pitanja za alat/SaaS. Klijentska i serverska validacija te e-mail predaja prenose odabir. Staro sidro `/#problem-form` ostaje dostupno postojećem kalkulatoru.
- Sačuvani su logo, svijetla mrežasta podloga, deweb boje, postojeće pravne stranice, rute `/alati` i postojeći poslužiteljski kontaktni endpoint. Nisu dodane ovisnosti, analitika ni globalne robots/noindex promjene.

## Snimke

- Prije: `screenshots/before-390-full.png`, `screenshots/before-1440-full.png`.
- Završna lokalna produkcijska gradnja: `screenshots/production-360-full.png`, `screenshots/production-390-full.png`, `screenshots/production-768-full.png`, `screenshots/production-1440-full.png`, `screenshots/production-1920-full.png`.
- Prvi ekran: `screenshots/production-390-hero.png`, `screenshots/production-1440-hero.png`.

Lokalni pregled: `http://localhost:3023/` (`next start`, bez vanjske objave).

## Izvršene provjere

| Provjera | Stvarni rezultat |
| --- | --- |
| `npm run typecheck` | PASS |
| `npm test` | PASS — 26/26 |
| `npm run build` | PASS — naslovnica, `/alati`, kalkulator i pravne rute izgrađeni |
| `git diff --check` | PASS — bez whitespace pogrešaka; Git je prijavio samo očekivano upozorenje LF/CRLF |
| Lokalna produkcijska verzija, 360/390/768/1440/1920 px | PASS — širina dokumenta jednaka širini viewporta; oba prikaza rada učitana; web-paketi stalno vidljivi (`opacity: 1`) |
| Mobilna navigacija i sidra | PASS — tipkovnica otvara izbornik; odabir ga zatvara; stari `/#problem-form` vodi do obrasca |
| CTA i preodabir | PASS — poslovni alat odabire `tool` i prikazuje pitanje o ručnom procesu; preporučeni paket odabire `web` + `business` |
| Obrazac | PASS uz browser mock — prazno i neispravna e-pošta ne šalju POST; loading zaključava gumb; simulirana pogreška omogućuje ponovni pokušaj; simulirani uspjeh zaključava ponovno slanje; istek od 12 s ne prikazuje uspjeh |
| Prijenos podataka | PASS uz mock — predani payload sadrži `web` + `business` ili `tool` + opis ručnog procesa; unit test provjerava tekst e-pošte i poziv transporta s mock providerom |
| Pristupačnost | PASS uz ograničenje — axe-core: 0 potvrđenih prekršaja, 6 neodređenih kontrasta na gradijentu/ukrasnim znakovima; fokus na logotipu i izborniku vidljiv obrisom 4 px; reduced motion daje `opacity: 1`, bez pomaka i glatkog pomicanja |
| SEO i mreža | PASS — `lang=hr`, jedan H1, hrvatski title/description i OG naslov; bez JS pogrešaka i zabilježenih 4xx/5xx zahtjeva u lokalnoj produkcijskoj sesiji |

Za definirane parove boja ručni proračun daje kontrast 4,92:1 za prigušeni tekst na svijetloj podlozi `#f4f9fa` te 6,05:1 za bijeli tekst na teal gumbu. Automatski alat ne može dovršiti procjenu samog gradijenta.

Neovisni UI pregled naveo je praznu tablet snimku rada, izostanak primjera web-izvedbe, predug ukrasni mobilni hero i prekinuto staro sidro kalkulatora. Primjeri se sada učitavaju prije snimanja, vlastita web-izvedba je jasno označena, mobilni ukrasni panel skriven i sidro vraćeno.

## Nije dokazano ili nije pokrenuto

- **BLOCKED prije objave:** stvarna dostava e-pošte nije dokazana. Testovi i preglednik koriste mock; preglednik je blokirao `/api/contact` na mrežnoj razini. Nije korišten odobreni testni inbox niti slana poruka u stvarni sustav. Za dokaz dostave potreban je odobren testni primatelj/transport.
- **Nije pokrenuto:** lint, jer `package.json` nema lint skriptu.
- **Nije moguće provjeriti:** poziv i WhatsApp poveznice za deweb kontakt, jer u projektu nije potvrđen javni broj. U web-paketima su ti kanali navedeni samo kada ih pojedini klijent koristi.
- Nema potvrđenih i dopuštenih klijentskih referenci u pregledanim materijalima; prikazani su isključivo vlastiti radovi sa statusom.

Nije rađen commit, push, reset, stash ni deploy. Zatečene nepovezane promjene ostale su sačuvane.
