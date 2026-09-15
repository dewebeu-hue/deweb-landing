# deweb.hr — Discover: postojeća početna

Datum: 14. 9. 2026. Opseg: istraživanje, dokumentacija i snimke. **Redizajn nije implementiran; konačni koncept nije odabran.** Preporuka ide na neovisnu fresh-context kritiku u sljedećem zadatku.

Povezano: [dokazi i pozicioniranje](01-evidence-and-positioning.md), [sadržajni smjerovi](02-content-directions.md), [vizualni smjerovi](03-visual-directions.md), [mjerila prihvata](04-acceptance-gates.md).

## Upute, skillovi i metoda

Pročitani su nadređeni `C:/Users/deweb/Documents/AGENTS.md`, projektni README, dokumenti Faze 0/1A i relevantni izvori aplikacije. Pretragom nije pronađen dodatni projektni AGENTS.md. Nadređena uputa traži premium-product-ui za UI rad.

| Skill / stvarna putanja | Primjena |
| --- | --- |
| `C:/Users/deweb/.codex/skills/premium-product-ui/SKILL.md` | Pročitan u cijelosti; primijenjeni jasnoća ponude, tok prije dekoracije, vizualna hijerarhija, izvedivost i istraživanje različitih koncepata. |
| `C:/Users/deweb/.codex/plugins/cache/openai-curated-remote/vercel/0.21.4/skills/agent-browser/SKILL.md` | Pročitan; korišten postojeći lokalni CLI za pregled i stvarne snimke. |
| `C:/Users/deweb/.codex/skills/.system/imagegen/SKILL.md` | Pročitan u cijelosti; ugrađeni imagegen izradio je tri dokumentacijska vizuala, bez API ključa i bez aplikacijskih asseta. |
| `C:/Users/deweb/.codex/skills/deweb-implementation/SKILL.md` | Pročitan radi provjere primjenjivosti; izričito isključuje read-only/dokumentacijske zadatke, pa nije korišten kao implementacijski workflow. |
| `C:/Users/deweb/.codex/skills/deweb-qa-gate/SKILL.md` | Pročitan; primijenjeno razlikovanje stvarnih provjera od neizvršenih. Nema implementacijske ni produkcijske potvrde. |

Pretraženi su lokalni skillovi i instalirani plugin skillovi za Discover/Define, copywriting, sadržajnu strategiju i konverziju landing stranica. **Nije pronađen dodatni relevantan skill za copy ili konverziju, ni izričito imenovan Discover → Define → Deliver postupak.** Premium-product-ui sadrži srodne korake razumijevanja proizvoda, smjera i provjere. Discover → Define → Deliver ovdje je organizacija zadatka prema korisničkom zahtjevu: pregled činjenica → usporedba smjerova → isporuka dokumentacije. Deliver ne znači razvoj ili objavu.

Skillovi nisu mijenjani. Prvi pokušaj čitanja browser skilla koristio je pogrešan cache korijen; zatim je pronađena i pročitana gore navedena ispravna datoteka.

## Zaštićeno zatečeno stanje

Na početku je Git pokazao `M app/page.tsx` te untracked rute, logiku, testove, dokumentaciju i snimke mikroalata iz Faze 1A. Diff početne sastoji se od niza `services` i sekcije „Konkretna rješenja”. Taj rad pripada zatečenom stanju.

Prije audita zabilježeni su SHA-256 otisci aplikacijskih datoteka, javnih asseta, konfiguracije, package/lockfilea i postojeće dokumentacije mikroalata. Završna usporedba zabilježena je na kraju ovog dokumenta. Nema commita, pusha, stasha, reseta, izmjene ovisnosti ili deploya. Vrijednosti tajni nisu čitane; kontakt nije poslan.

## Lokalna i javna verzija

Mjerodavan vizualni pregled proveden je na postojećem lokalnom production serveru `http://127.0.0.1:3018/`. Nije bilo potrebe pokretati novi server niti graditi aplikaciju za dokumentacijski audit. Prisutnost novog bloka usluga provjerena je u DOM-u, pa snimke uključuju zatečenu korisničku izmjenu.

Read-only web pregled [javne početne](https://deweb.hr/) istoga datuma vratio je stari hero i blokove o internim alatima, ali nije vratio novi blok webshop/landing/upiti. To je opažanje tekstualnog odgovora, ne dokaz točnog deploy commita ili potpuni produkcijski audit. Ne predstavljati lokalni novi blok kao potvrđeno objavljen.

## Cijela struktura i sadržaj

| Redoslijed | Izvor u `app/page.tsx` | Što posjetitelj dobiva | Dijagnoza |
| --- | --- | --- | --- |
| Header | `Home`, sticky header | Logo; desktop „Kako funkcionira”, „Primjeri”, „Suradnja”, CTA | Ispod 768 px ostaje samo logo. „Primjeri” vodi na popis mogućnosti, ne radove. |
| 1. Hero | `Home`, `HeroVisual` | Široko obećanje rješavanja problema; aplikacije, AI, automatizacija; dva CTA-a | Plaćena konkretna web usluga nije imenovana. Dashboard dodatno sugerira interni softver. |
| 2. Usluge | `services`, nova korisnička izmjena | Webshop/redizajn, landing/kampanja, kvalificirani upiti | Najjasniji komercijalni sadržaj, ali nije usklađen s ostatkom stranice. |
| 3. Problemi | `problems` | Šest primjera operativnih poteškoća | Velik dio govori o organizaciji poslovanja, ne o kupnji webshopa ili web-stranice. |
| 4. Rješenje oko problema | inline lista od pet koraka | Objašnjava suradnju | Ponavlja hero i kasniji proces; potiskuje dokaz rada. |
| 5. Primjeri rješenja | `examples`, `#examples` | Osam ideja: CRM, termini, portal, ponude, dashboard, AI, evidencije, rezervacije | Nema poveznice, screenshota, statusa ili opisa isporučenog projekta. To nije portfolio. |
| 6. Tri razine suradnje | `offers`, `#offer` | Problem brief, Brzi MVP, Custom sustav | Druga taksonomija ponude od bloka usluga; ne objašnjava kako ugovoriti web projekt. |
| 7. Kako funkcionira | `steps`, `#how-it-works` | Šest koraka | Udvostručen proces; „2–3 rješenja” i održavanje trebaju vlasničku potvrdu. |
| 8. Zašto deweb | `why` | Šest načela | Namjere i generičke vrline bez prikazanih konkretnih odluka ili dokaza. |
| 9. Kontakt | `#problem-form`, `ProblemForm` | Devet vidljivih polja i slanje | Funkcionalan temelj, ali velik vizualni obrazac i jezik internog sustava. |
| Footer | `Home`, footer | Brand, domena, tri pravne poveznice | Sažet i koristan. Bez lažnih logotipa, društvenih brojača ili dodatnih prodajnih radnji. |

Dvije hero radnje imaju jasnu primarnu/sekundarnu funkciju, ali su na mobitelu gotovo jednako velike. Glavni problem nije mnoštvo različitih obrazaca: svi prodajni CTA-i vode na isti kontakt. Konkuriraju **obećanja i kategorije usluga**, a procesni sekundarni CTA šalje posjetitelja mimo novog bloka usluga.

## Stvarni pregled na tri širine

Viewporti su 390 × 844, 768 × 1024 i 1440 × 1000 CSS px. Postojeći browser/system font, zoom 100 %. Scroll je prošao cijelu stranicu; prije full-page snimke sva 43 `data-reveal` elementa bila su vidljiva. Full-page snimke zato prikazuju završno pročitano stanje, ne početni animirani kadar.

| Širina | Visina dokumenta | Početak konkretnih usluga | Početak kontaktnog bloka | scrollWidth | Nalaz |
| --- | ---: | ---: | ---: | ---: | --- |
| 390 | 10.090 px | 1.633 px | 8.165 px | 390 px | Nema vodoravnog prelijevanja; generički hero i visoka dekoracija odgađaju uslugu. Kontakt je dostupan ranijim hero linkom. |
| 768 | 7.347 px | 1.182 px | 5.882 px | 768 px | Hero i vizual još su jedan ispod drugog; tri paketa postaju uski stupci s mnogo prijeloma teksta. |
| 1440 | 5.908 px | 913 px | 4.577 px | 1440 px | Dobra poravnanja, ali velik broj jednako istaknutih sekcija i kartica; dokaz rada ne pojavljuje se. |

Navedene visine su izmjereno stanje ove konfiguracije; nisu opći rezultat za sve uređaje. Nije proveden test razumijevanja s kupcima niti izmjerena konverzija.

Snimke:
- [390 — cijela](screenshots/home-390-full.png), [hero](screenshots/home-390-hero.png), [kontakt](screenshots/home-390-contact.png).
- [768 — cijela](screenshots/home-768-full.png), [hero](screenshots/home-768-hero.png).
- [1440 — cijela](screenshots/home-1440-full.png), [hero](screenshots/home-1440-hero.png), [usluge i problemi](screenshots/home-1440-services-problems.png), [primjeri i ponuda](screenshots/home-1440-examples-offer.png), [proces i razlozi](screenshots/home-1440-process-why.png), [kontakt i footer](screenshots/home-1440-contact-footer.png).
- [1440 — tipkovnički fokus uz reduced motion](screenshots/home-1440-keyboard-reduced-motion.png).

## Vizualni identitet i motion

`public/deweb-logo.svg` i `public/favicon.svg` su jedini javni slikovni asseti. Logo koristi tamnoplave i svijetloplave tonove (#19235b, #193269, #2992d1, #2fa2dc). Čuvati originalni SVG, ne precrtavati wordmark prema generiranim slikama.

`tailwind.config.ts`: ink #081832, muted #5d6e82, line #d8e5eb, teal #006d7b, teal-dark #004d58, teal-soft #e1f4f5, orange #e95616, orange-dark #bd3d08. Globalna pozadina je bijela s diskretnom mrežom; česte su zaobljene kartice, obrubi i sjene. Container je do 1120 px; razmaci sekcija uglavnom 56–64 px; mobilni bočni odmak 18 px.

Inter je naveden u CSS-u, ali nije učitan kroz font datoteku, import ili next/font. Browser `document.fonts` nije sadržavao registriran webfont. Stvarna zamjena ovisi o uređaju; nije dokazano da se prikazuje Inter. Za redizajn izabrati reproducibilno rješenje: postojeći system stack ili jedan lokalno hostan font, tek u kasnijoj implementaciji.

H1 koristi 3,8 s typing animaciju uz odgodu 0,25 s. To troši gotovo cijeli prozor za petosekundno razumijevanje. Ostale animacije: reveal 620 ms, drift kartica, graf, donut, linija procesa i hover podizanje. Dashboard s izmišljenim brojevima nema dokaznu vrijednost.

Provjeren reduced-motion: media query aktivan, H1 animationName `none`, backgroundSize `100% 100%`, 43/43 reveal elementa vidljiva. To je dobar temelj. Nije proveden puni screen-reader audit.

## Kontakt, pristupačnost, SEO i analitika

`app/problem-form.tsx` ima devet vidljivih polja: ime, firma, email, telefon, djelatnost, problem, trenutačno rješenje, hitnost, vrsta rješenja. Logika zahtijeva pet polja; server dodatno provjerava oblik emaila i najmanje 20 znakova opisa. Postoje loading, success, failure i zaštita od ponovnog slanja te honeypot. UI šalje POST na `app/api/contact/route.ts`, a `lib/problem-email.ts` server-side Resendu. Nema vlastite baze upita.

Nalazi bez slanja:
- Vidljivi labeli i povezani ID-jevi postoje. Obvezna polja u DOM-u nemaju `required` ili `aria-required`; većina opcionalnih polja nije tako označena.
- Iako server razlikuje pogreške, tekst uz polje je uvijek „Ovo polje je obavezno.” To nije dovoljno za pogrešan email ili prekratak opis.
- Obrazac koristi `outline-none` i fokusni prsten orange/20; pojačati razlikovanje fokusa u kasnijem zadatku.
- Prvi Tab fokusira logo i ima vidljiv browser outline. Nema skip-linka. Puna tipkovnička i screen-reader provjera svih stanja nije izvršena.
- Izmjerene boje CTA-a i standardni sRGB izračun daju bijelo/orange **3,62:1**, bijelo/teal **6,05:1**, muted/bijelo **5,23:1**. CTA tekst 16 px nije veliki tekst, pa narančasta podloga ne doseže 4,5:1. To je postojeći nedostatak, ne regresija audita. [W3C kriterij kontrasta](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

`app/layout.tsx` postavlja hrvatski jezik, title/description i favicon. U repo izvorima nema canonical, metadataBase, Open Graph, JSON-LD, sitemap ili robots rute/datoteke. `lib/seo.test.ts` zaključava sadašnji tekst metapodataka; naziv testa „approved” nije dokaz novog poslovnog odobrenja. Nema implementirane analitike u aplikaciji; vanjska hosting instrumentacija nije provjerena.

Pravne stranice postoje, ali sadrže TODO za završni pravni pregled. Privatnost još govori o pripremi budućeg zaprimanja upita iako kontaktna obrada postoji. Taj sadržaj treba uskladiti u zasebno odobrenom opsegu; ovaj audit nije pravna potvrda.

## Odnos prema mikroalatima

`/alati` i `/alati/kalkulator-cijene-webshopa` postoje lokalno, imaju vlastiti noindex/nofollow i oznaku razvojnog statusa. Početna nema link prema njima. Alat se vraća prema početnoj i `/#problem-form`; prijenos je ručno kopiranje sažetka, ne automatsko ispunjavanje.

Dokument Faze 0 kaže da rute ne postoje; to je povijesno stanje, nadopunjeno Fazi 1A u specifikaciji. Ne tumačiti ga kao sadašnji nedostatak. Kalkulator je dokaz implementiranog internog toka, **ne odobren cjenik, javno potvrđeni proizvod ili klijentski rezultat**.

## Izvršeno i granice

Izvršeno: pregled izvora, git status/diff, inventar asseta i skillova, tri responsive širine s cijelom stranicom, reduced-motion, prvi Tab fokus, DOM semantika i boje, pregledničke pogreške (nema prijavljenih), read-only tržišno istraživanje te tekstualni GET javne početne.

Nisu izvršeni: novi build, test suite/typecheck/lint za aplikaciju, Lighthouse, test s korisnicima, potpuni accessibility audit, slanje kontakta, provjera produkcijskog maila/analitike, izmjena ili objava. Aplikacija nije mijenjana; povijesni rezultati 27/27 iz Faze 1A nisu predstavljeni kao nov test ovog audita.

Pokušaji pregleda Marker i Hortus izvora nisu dali uporabljiv puni sadržaj (Marker je vratio stranicu s naslovom „Ažuriranje - Form”, Hortus grešku). Zato nisu temelj zaključaka niti preporuka.

## Završna provjera isporuke

- SHA-256 usporedba svih 46 zaštićenih datoteka prije/poslije: **0 promijenjenih, 0 nestalih**. Obuhvaćeni su aplikacijski kod, javni asseti, konfiguracija, package/lockfile i postojeći mikroalati/dokumentacija.
- Otisak zatečenog `app/page.tsx`: `5FAB4216F0D26AC9231C5E38111EF5431D95C83C99EB179A599F928543217718`; jednak prije i poslije. Njegov zatečeni git diff nije mijenjan.
- Novi git status dodaje isključivo sadržaj `docs/landing-redesign/`: pet Markdown dokumenata, 12 audit screenshotova i tri generirana konceptna vizuala kao dokumentacijske priloge.
- Provjera relativnih poveznica svih pet dokumenata: **0 nedostajućih odredišta**.
- `git diff --check`: exit 0; samo zatečeno upozorenje LF/CRLF za `app/page.tsx`. Budući da Git ta provjera ne obuhvaća untracked datoteke, novi dokumenti dodatno su provjereni po putanjama i sadržaju.
- Vlastita preglednička audit sesija zatvorena je nakon snimanja. Prethodno pokrenuti lokalni server i ostale sesije nisu mijenjani.

Isporuka Discover + Define je dovršena. Sljedeći korak je neovisna kritika svih smjerova u zasebnom zadatku; preporuka S1 nije konačan izbor i implementacija nije započeta.
