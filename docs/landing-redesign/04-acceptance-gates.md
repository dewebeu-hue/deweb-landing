# Acceptance gates za kasniju implementaciju

Datum: 14. 9. 2026. Ovo su ponovljivi uvjeti budućeg prihvata, **ne izvještaj da je redizajn prošao QA**. Sadašnji audit i stvarno izvršene provjere opisani su u [00-current-state-audit.md](00-current-state-audit.md). Implementacija smije početi tek nakon sljedeće neovisne fresh-context kritike, odluke vlasnika i konkretnog implementacijskog zadatka.

## Sadržaj i poslovna jasnoća

| Gate | Postupak | Prihvat / razlog za vraćanje na doradu |
| --- | --- | --- |
| G01: petosekundno razumijevanje | U kasnijoj evaluaciji pokazati gotov hero bez prethodnog objašnjenja na 390 i 1440 px. Pet pripadnika ciljane skupine, koji nisu radili na dizajnu, dobiva pet sekundi; zatim pitati što deweb nudi, kome i što je sljedeći korak. U ovoj fazi nitko nije kontaktiran. | Najmanje 4/5 može imenovati web/webshop uslugu i ciljnu publiku te prepoznati upit kao sljedeću radnju. Ako misle da je primarna ponuda besplatan alat ili generički AI sustav, copy treba doradu. Mali uzorak je usability signal, ne dokaz tržišne potražnje. Bez sudionika status ostaje NOT RUN. |
| G02: jedna dominantna konverzija | Evidentirati sve CTA-e, tekst, odredište i vizualni prioritet. Pregledati hero, dokaz i kontakt. | Sve primarne radnje vode na isti kontakt. Sekundarni dokaz/alat ima niži vizualni prioritet. Nema obveznog kalkulatora, registracije ili drugog novog obrasca prije upita. |
| G03: cijela prodajna priča | Pročitati samo H1/H2 i prve rečenice svake sekcije. | Dosljedan slijed usluga → dokaz → način suradnje → upit. Jedna taksonomija usluga. Ne vraćati paralelne pakete MVP/CRM/AI ako nisu primarna potvrđena ponuda. |
| G04: provjerljiv dokaz | Za svaku činjenicu/reference provjeriti ID iz evidence matrixa i izvor. | Jasna oznaka produkcije, aktivnog projekta, pilota, internog alata, koncepta ili demoa. Bez neodobrenih brojki, citata, logotipa, lokacija, partnerstava i rokova. Bez generiranih portreta ili screenshotova predstavljenih kao stvarni rad. |
| G05: bez brojčane cjenovne aktivacije | Pregledati stvarnu konfiguraciju, rezultat, javni tekst i metadata. | Draft cjenik ostaje draft; nema cijene, prikrivenog fallbacka, iznosa 0, poreznog zaključka ili „od” cijene. Za alat sažetak ne znači cjenovnu ponudu. |
| G06: konačan copy ima vlasnika | Dinko potvrđuje usluge, publiku, osobni opis, što se dobiva nakon upita i sadržaj eventualne reference. | Potvrda zapisana uz verziju copyja. Sporni sadržaj se izostavlja ili precizira; prazan dokazni blok ne popunjava se izmišljanjem. |

## Struktura, pristupačnost i responsive ponašanje

Projektni cilj su provjerljiva ponašanja usklađena s WCAG 2.2 AA; ne davati izjavu o potpunoj sukladnosti na osnovi samog automatskog testa. Referentni izvori pregledani 14. 9. 2026.: [W3C kontrast teksta](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) i [W3C veličina ciljeva](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).

| Gate | Postupak | Prihvat |
| --- | --- | --- |
| G07: semantički sadržaj | DOM pregled + accessibility tree, uz isključen CSS ili čitanje dokumenta redom. | Jedan jasan H1, smisleni H2/H3 bez preskakanja radi veličine fonta, header/nav/main/footer, razumljivi linkovi, figure s captionima. Dekoracija je skrivena od pomoćne tehnologije; relevantna slika ima smislen alt. |
| G08: tipkovnica | Od vrha proći Tab/Shift+Tab; Enter aktivira linkove, Space gumbe, strelice native radio kontrole. Provjeriti svaki stvarno dodani meni/prekidač i povrat fokusa. | Skip-link do maina; logičan redoslijed; bez zamke, hover-only sadržaja i neaktivabilnih kartica. Fokus nije zaklonjen sticky headerom. Native elementi imaju dostupna imena. |
| G09: vidljiv fokus i kontrast | Provjeriti default/hover/focus/error/disabled boje iz computed styles i sRGB kontrast. | Običan tekst najmanje 4,5:1; veliki tekst 3:1 prema W3C definiciji. Relevantne granice kontrola i fokus najmanje 3:1 prema susjednoj podlozi kao projektni kriterij. Fokus najmanje 2 px ili usporediv jasan prsten; ne samo slaba orange/20 sjena. |
| G10: ciljevi na dodir | Izmjeriti kontrole na 390 px, uključujući header, CTA, radio i navigaciju. | Projektni cilj 44 × 44 CSS px za samostalne kontrole. To je stroži projektni cilj; WCAG 2.2 AA SC 2.5.8 ima minimum 24 × 24 uz definirane iznimke. Inline tekstualni linkovi imaju dovoljan razmak i jasno se razlikuju. |
| G11: responsive i reflow | Chromium 320/390/768/1024/1440 px; barem jedan WebKit mobilni pregled ako alat postoji. Ponoviti uz 200 % zoom i 400 % reflow na širokom viewportu. | scrollWidth nije veći od clientWidth osim zanemarive rasterizacije ≤1 px. Nema odrezanog teksta, CTA-a, tablica ili horizontalnog scrolla. Slike i sažeci ostaju razumljivi. Nedostupni engine označiti NOT RUN. |
| G12: mobilni sadržaj | Ručno pročitati cijelu stranicu na 390 × 844 i 768 × 1024, te spremiti snimke nakon scrolla kroz sve sekcije. | U uobičajenom prikazu H1, objašnjenje usluge i primarni CTA stanu rano u prvi ekran; već sljedeći sadržaj je usluga/dokaz, bez obveznog velikog dekorativnog vizuala. Uvećan tekst smije povećati visinu bez gubitka sadržaja. |
| G13: reduced motion i dostupnost bez animacije | Otvoriti svježu stranicu uz prefers-reduced-motion: reduce; ponoviti uz isključen JS za statični sadržaj. | H1, usluga, dokaz i CTA vidljivi odmah; nema typing-reveala, parallaxa, autoplay ili pulsiranja. Bez JS-a statična prodajna priča ostaje čitljiva; kontaktna funkcija ne smije pokazivati lažan uspjeh. |
| G14: screen-reader provjera | U kasnijem QA-u provjeriti NVDA/VoiceOver ili dostupni ekvivalent: naslov, landmarki, CTA, labeli, greške i status. | Obveznost se objavljuje semantički; pogreške opisuju pravi problem i povezuju se s poljem; status je pravovremen i ne čita cijelu stranicu pri svakom kliku. Bez screen readera taj dio ostaje NOT RUN. |

## Budžeti brzine, slika i fontova

Sljedeće vrijednosti su **predloženi projektni budžeti**, ne izmjereno sadašnje stanje, tržišni standard ili obećani Lighthouse rezultat. Kritika i kasniji implementacijski brief mogu ih izmijeniti uz obrazloženje.

- Početni H1 i glavni CTA isporučuju se kao HTML, bez čekanja slike, animacije ili interaktivne demonstracije.
- Nove slike za početni viewport: ukupno do 160 KiB pri 390 px, do 240 KiB pri 1440 px. Koristiti stvarni potreban crop/rezoluciju, AVIF/WebP gdje je prikladno, eksplicitne dimenzije/aspect-ratio i `sizes`. Bez dekorativnog videa i 3D-a.
- Screenshotovi ispod prvog ekrana učitavaju se odgođeno. Ne isporučivati ove 1536 × 1024 konceptne PNG boardove kao produkcijske slike.
- System font znači 0 novih font zahtjeva. Ako se opravda lokalni webfont: najviše dvije početne WOFF2 datoteke, ukupno do 120 KiB, font-display swap i provjeren fallback. Ne koristiti vanjski font servis ni preload neupotrijebljenih rezova.
- Za preporučeni statični S1: cilj najviše 15 KiB dodatnog komprimiranog početnog JS-a prema istom produkcijskom buildu sadašnje početne. Ne uvoditi animation/UI biblioteku zbog ovog redizajna. Za eventualni S3 widget definirati odvojeni budžet i odgoditi njegovo učitavanje.
- Screenshot/portret mora imati rezerviran prostor; nema vidljivog pomicanja H1/CTA pri dolasku fonta ili slike. Dodatni sadržaj ne smije uzrokovati odgođeni skok prema kontaktu.

**Ponovljivi postupak:** zabilježiti commit ili SHA izvora, Node/browser verziju, viewport, produkcijski lokalni build, cold cache, identične mrežne i CPU postavke; tri ponavljanja istog navigacijskog scenarija. U Network/Performance izvještaju zabilježiti compressed transfer za document/CSS/JS/font/slike, ključni početni prikaz i layout shifts. Uspoređivati medijan i raspon, a ne odabrani najbolji rezultat. Nalaz lokalnog servera nije dokaz produkcijske brzine. Lighthouse se može priložiti kao dijagnostika bez obećanja proizvoljnog ukupnog scorea.

## SEO i odnos prema alatima

| Gate | Postupak | Prihvat |
| --- | --- | --- |
| G15: metapodaci | Pregledati stvarni HTML početne i pravnih/alati ruta prije i poslije. | Novi naslov i opis odgovaraju potvrđenoj usluzi. Predložak za razmatranje: „Izrada web stranica i webshopova | deweb”; opis bez zajamčene prodaje. Prilagoditi postojeći test metapodataka tek u odobrenoj implementaciji. |
| G16: indeksiranje | Usporediti robots/noindex, sitemap, canonical i status ruta s baselineom. | Redizajn ne mijenja globalnu politiku indeksiranja usput. Alati ostaju noindex u aktualnoj fazi; nema dodavanja u sitemap kao dovršenih proizvoda. Javnu poveznicu i objavu alata odobriti odvojeno. |
| G17: strukturirani podaci | Pregled izvora i rendered HTML-a. | Bez review/rating/result, Offer cijena, lažnih Organization detalja ili reference podataka. JSON-LD nije obvezan; dodaje se samo za stvaran, vidljiv i odobren sadržaj. |
| G18: poveznice i sadržaj slike | Ručno pratiti CTA i sve navigacijske/legalne linkove, bez slanja obrasca. | Nema mrtvih placeholdera, izmišljenih projektnih URL-ova ni screenshotova koji glume interaktivnu kontrolu. Podaci i odabiri ne završavaju u query stringu. |
| G19: analitika i privatnost | Pregled mrežnih zahtjeva i izvora. | Bez novog trackinga u ovom opsegu. Ako Dinko poslije zatraži mjerenje, odvojeno definirati samo agregirane događaje prikaza/CTA-a i privatnosni tekst; bez financijskih unosa, slobodnog teksta, sadržaja forme ili kontaktnih podataka. |

## Kontaktni tok bez stvarne testne poruke

Postojeći endpoint može poslati pravi email. Zato budući QA smije provjeriti happy/error/loading stanja samo uz **kontrolirano presretanje POST-a ili zamjensku lokalnu obradu s onemogućenim vanjskim slanjem**. To nije ovaj dokumentacijski zadatak i ne smije se zamijeniti nepresretnutim „testnim” upitom.

1. Pregledati sadašnje `lib/problem-email.test.ts` testove koji koriste zamjenski fetcher. Mrežno slanje mora ostati zamijenjeno.
2. U izoliranom browser testu prvo postaviti intercept za `/api/contact`; za vrijeme testa blokirati vanjski email endpoint i ostale neželjene POST-ove.
3. Tek zatim ispuniti označene sintetičke podatke. Provjeriti prazna obvezna polja, pogrešan email, prekratak opis, sporu lokalnu zamjensku obradu, uspjeh, 400/502 i prekid mreže.
4. Potvrditi: fokus na stvarnom prvom problemu, očuvanje unosa nakon greške, razumljiva poruka, loading/disabled stanje i nema dvostrukog slanja. Uspjeh testa znači uspješan lokalni mock, ne stvarno zaprimljen upit.
5. Mrežni zapis mora pokazati **0 stvarnih poruka vanjskom email servisu**. Ako presretanje nije zajamčeno, test se ne izvodi i označava se NOT RUN.

Sadašnji ugovor pet obveznih polja i payload ne mijenja se automatski zato što se preimenuje CTA. Ako kasniji zadatak želi skratiti obrazac, to zahtijeva zaseban eksplicitan opseg, dosljednu klijentsku i serversku validaciju i pripadne testove.

## Završni QA paket buduće implementacije

Priložiti stvarni git diff uz očuvanu zatečenu izmjenu; rezultate `npm test`, `npm run typecheck`, `git diff --check` i sigurnog lokalnog `npm run build`; pregledničke pogreške; snimke početne, dokaza, kontakta i grešaka na tri glavne širine; zapis tipkovnice/reduced-motion; nalaze o kontrastu i medijskim budžetima; matricu PASS/FAIL/NOT RUN po gateu.

Sada nema lint skripte u package.json: ne izvještavati „lint PASS”. Ne popravljati nepovezani kontaktni backend, pravne stranice, ovisnosti ili globalni SEO samo da bi novi koncept izgledao dovršen.

## Sljedeći zadatak — neovisna kritika, bez implementacije

Kritičaru dati svih pet dokumenata, tri konceptna vizuala i stvarne audit snimke. Zatražiti neovisnu ocjenu:
- Je li jasna plaćena usluga u prvih pet sekundi?
- Je li dostupni interni dokaz pošteno predstavljen i dostatan za predloženi početni tok?
- Je li S1 doista bolji od S2/S3 uz nula prihoda ili postoje razlozi za drukčiju preporuku?
- Koji copy i vizualna odluka moraju otpasti ili se precizirati?
- Koje vlasničke odluke blokiraju finalizaciju, a koje su obične dizajnerske odluke?

Kritiku ne pokretati automatski u ovoj fazi. Nakon nje Dinko bira smjer i potvrđuje poslovni sadržaj. Tek novi zadatak smije prijeći na implementaciju.
