# Ručna provjera 11 slučajeva kontrasta

Datum: 15. 9. 2026. Stranica: lokalni production build početne (`/`). Izvor: ponovljen isti `agent-browser a11y --tags wcag2a,wcag2aa --json` audit s axe-core 4.12.1 na 1440 × 900 px, nakon 660 px skrolanja. Rezultat je ponovno bio **0 potvrđenih kršenja** i **11 nepotpunih `color-contrast` čvorova**. CLI u općem JSON rezultatu vraća samo prvih deset čvorova iako navodi `nodeCount: 11`; jedanaesti, oznaka `✓`, potvrđen je zasebnim auditom `--selector '.hero-panels'` (`nodeCount: 1`). Redoslijed tablice slijedi tih deset zapisa i potom izdvojeni jedanaesti.

## Metoda

Foreground, veličina i težina fonta očitani su iz `getComputedStyle` stvarnih elemenata. Za svaki tekstni red dobiveni su `Range.getClientRects()`. Samo u QA pregledniku boja teksta privremeno je postavljena na `transparent` bez promjene rasporeda; snimke su zatim uzorkovane piksel po piksel unutar stvarnih područja redaka, s rubom od 1 px izvan uzorka. Tako izmjerena pozadina uključuje slojeve hero gradijenta te poluprozirnu, zamućenu pozadinu sticky navigacije. U tablici je najnepovoljnija izmjerena boja koju redak prelazi, ne deklarirani `background-color`. Za `✓` je dodatno potvrđena jednobojna podloga samog znaka. Omjeri su izračunati WCAG formulom za relativnu sRGB luminanciju i prikazani na dvije decimale; odluke su donesene prema neokrugljenim vrijednostima.

Prag za običan tekst je **4,5:1**, a za veliki **3:1**. Velikim se računa najmanje 24 CSS px regular ili najmanje 18,67 CSS px bold (18 pt odnosno 14 pt pri 96 dpi). Tekst od 20 px / 400 i 14 px / 600 zato je ovdje običan tekst. Tekst hero naslova od 60,48 px / 900 je veliki tekst. Originalni audit je pokrenut pri skrolu od 660 px; hero elementi iznad vidljivog dijela uzorkovani su na istoj širini nakon povratka na vrh, a navigacija na izvornom položaju skrola.

| # | Element i tekst (selector) | Stranica / viewport | Foreground | Stvarna najnepovoljnija pozadina | Font; kategorija | Ratio | Required | Status |
|---:|---|---|---|---|---|---:|---:|---|
| 1 | „Web-stranice” — `header nav a[href="#web-stranice"]` | `/`, 1440 px | `#081832` | `#fefefe` | 14 px / 700; običan | 17,54:1 | 4,5:1 | PASS |
| 2 | „Interni alati” — `header nav a[href="#interni-alati"]` | `/`, 1440 px | `#081832` | `#feffff` | 14 px / 700; običan | 17,66:1 | 4,5:1 | PASS |
| 3 | „Radovi” — `header nav a[href="#radovi"]` | `/`, 1440 px | `#081832` | `#ffffff` | 14 px / 700; običan | 17,69:1 | 4,5:1 | PASS |
| 4 | „Kako radimo” — `header nav a[href="#proces"]` | `/`, 1440 px | `#081832` | `#fefeff` | 14 px / 700; običan | 17,55:1 | 4,5:1 | PASS |
| 5 | „Kontakt” — `header nav a[href="#kontakt"]` | `/`, 1440 px | `#081832` | `#fefefe` | 14 px / 700; običan | 17,54:1 | 4,5:1 | PASS |
| 6 | „Web-stranice i poslovne aplikacije po mjeri” — `.hero-surface p.mb-6` | `/`, 1440 px | `#004d58` | `#fcfdfd` | 12 px / 900; običan | 9,36:1 | 4,5:1 | PASS |
| 7 | „Web koji predstavlja vaš posao.” — tekstni čvor `#hero-title` prije unutarnjeg `span` | `/`, 1440 px | `#081832` | `#fbfafa` | 60,48 px / 900; veliki | 16,98:1 | 3:1 | PASS |
| 8 | „Alati koji ga pojednostavljuju.” — `#hero-title > span` | `/`, 1440 px | `#004d58` | `#faf7f7` | 60,48 px / 900; veliki | 8,95:1 | 3:1 | PASS |
| 9 | „Izrađujemo i redizajniramo poslovne web-stranice te razvijamo interne alate i poslovne aplikacije po mjeri — od predstavljanja usluga do organizacije upita, ponuda i svakodnevnog rada.” — `.hero-surface p.mt-7` | `/`, 1440 px | `#536579` | `#f9f5f3` | 20 px / 400; običan | 5,53:1 | 4,5:1 | PASS |
| 10 | „Dva različita puta, jedan jasan početak: recite nam što želite postići.” — `.hero-surface p.mt-5` | `/`, 1440 px | `#5d6e82` | `#f3efeb` | 14 px / 600; običan | 4,57:1 | 4,5:1 | PASS |
| 11 | „✓” — `.hero-panels span.bg-teal.text-white` | `/`, 1440 px | `#ffffff` | `#006d7b` | 12 px / 700; običan | 6,05:1 | 4,5:1 | PASS |

Kod #7 axe HTML sadrži i unutarnji `span`, ali taj tekst ima drugu foreground boju, pa je izmjeren zasebno kao #8. Kod #10 stvarni omjer prije zaokruživanja iznosi 4,569:1.

## Provjera breakpointa

Isti audit na 390 px dao je 0 kršenja i 6 nepotpunih slučajeva, a na 768 px 0 kršenja i 7 nepotpunih slučajeva. Pet desktop navigacijskih veza (#1–5) na obje je širine skriveno i zamijenjeno mobilnim izbornikom. Hero znak #11 skriven je na 390 px, a na 768 px ima iste potvrđene boje `#ffffff` / `#006d7b` i omjer 6,05:1. Isti hero elementi ponovno su mjereni odvojeno na obje širine:

| Izvorni # | 390 px: najniži ratio / pozadina / font | 768 px: najniži ratio / pozadina / font | Prag | Status |
|---:|---|---|---:|---|
| 6 | 8,28:1 / `#e6f1f2` / 12 px / 900 | 8,91:1 / `#f4f8f8` / 12 px / 900 | 4,5:1 | PASS |
| 7 | 14,66:1 / `#e0ecee` / 33,6 px / 900 | 15,72:1 / `#ebf3f4` / 33,6 px / 900 | 3:1 | PASS |
| 8 | 8,47:1 / `#ebf3f4` / 33,6 px / 900 | 8,55:1 / `#ecf4f5` / 33,6 px / 900 | 3:1 | PASS |
| 9 | 5,54:1 / `#f2f7f8` / 18 px / 400 | 5,00:1 / `#e0edef` / 20 px / 400 | 4,5:1 | PASS |
| 10 | 4,66:1 / `#f6f1ee` / 14 px / 600 | 4,81:1 / `#f3f6f7` / 14 px / 600 | 4,5:1 | PASS |
| 11 | Skriveno | 6,05:1 / `#006d7b` / 12 px / 700 | 4,5:1 | PASS na 768 px |

Na 390 i 768 px alat dodatno označava dekorativni znak „☰” u mobilnom izborniku jer sadrži samo netekstni znak. To nije jedan od izvornih 11 slučajeva; foreground je `#081832`, podloga sa stilom `bg-white` je `#ffffff`, a omjer iznosi 17,69:1 (prag 4,5:1).

Razlog nepotpunosti automatske procjene: axe ne određuje pouzdano pozadinu pri CSS gradijentu te slojevima poluprozirne/sticky navigacije; za #5 navodi moguću djelomičnu prekrivenost, a za #11 samo netekstni znak. Ručna provjera stvarnih piksela nije našla pad ispod praga. **Nema promjena koda, boja, gradijenta, motiona ni dizajna; before/after nije primjenjivo.**

CONTRAST REVIEW PASS — 11/11
