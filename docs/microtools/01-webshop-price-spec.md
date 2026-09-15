# Specifikacija: kalkulator cijene webshopa

Status: **tehnički nacrt spreman; brojčani poslovni model BLOCKED**. Predložena ruta: `/alati/kalkulator-cijene-webshopa`; nadređena ruta `/alati` kasnije je jednostavan popis tri najavljena alata (cijena webshopa, isplativost kvalificiranih upita, marža i doprinos po narudžbi). Ovaj dokument specificira samo prvi alat. Izvori i provjere su u [00-project-audit.md](00-project-audit.md).

## Svrha i jedan smjer

Posjetitelj u kratkom toku dobiva razumljiv opseg webshop projekta, uvjetnu okvirnu cijenu i jasnu razliku između jednokratne izrade te budućih/vanjskih troškova. Veza s plaćenom uslugom je tekstualna: deweb izrađuje novi webshop ili redizajn i nakon pregleda zahtjeva šalje konkretnu ponudu. Bez tvrdnji o zajamčenoj prodaji ili tržišnim prosjecima.

Smjer: miran, jasan alat unutar postojećeg deweb identiteta. Jedan naslov i kratak opis, lijevo pitanja, desno ili ispod sažetak; na mobitelu jedna kolona. Koristiti postojeći ink/teal/orange, logo, svijetlu pozadinu, kartice, tipografsku hijerarhiju i obrasce fokusa. Narančasti CTA samo za završni korak. Bez velikog redizajna, novih računa, baze, pretplata, AI API-ja, vanjskih plaćenih servisa ili animiranja samih brojeva.

## Najkraći skup pitanja

Sva pitanja moraju imati oznaku, kratak pomoćni tekst i neodabranu početnu vrijednost. Kategorije i granice su prijedlog za potvrdu, ne cjenik.

1. **Što trebate?** Novi webshop / redizajn postojećeg. Redizajn s nepoznatom migracijom označiti za ručnu procjenu.
2. **Koliko proizvoda planirate pri pokretanju?** Rasponi `do 50`, `51–500`, `više od 500` / `ne znam`. Granice mora potvrditi Dinko; zadnje dvije neizvjesne opcije mogu završiti ručnom procjenom ako nisu pokrivene matricom.
3. **Kako ćete unijeti proizvode i sadržaj?** Sami / deweb treba pomoći s unosom ili prijenosom / još nije jasno. Pomoć s unosom cjenovno se računa samo ako postoji potvrđen standardni opseg; nepoznat izvor podataka ili složena migracija idu ručno.
4. **Trebate li poseban način prodaje?** Ne, standardna kupnja / da: integracija s ERP/POS ili drugim sustavom, B2B pravila, pretplate, više jezika ili valuta, posebna dostava/naplata / nisam siguran. Omogućiti više oznaka kada je odgovor „da”; svaka označena posebnost pokreće ručnu procjenu dok nema potvrđeno standardno pravilo.

Bez traženja prometa, prihoda, marže, podataka o kupcima ili kontakta za sam izračun. Kontakt se unosi tek kada posjetitelj zatraži ponudu.

## Model pravila odvojen od UI-a

Jedna čista, deterministička funkcija prima tipizirane izbore i verzioniranu odobrenu konfiguraciju. Ona vraća `status: incomplete | invalid | priced | manual | pricing_unavailable`, normaliziran popis odabranih zahtjeva, opis uključenog/isključenog opsega, razloge za ručnu procjenu, te — samo za `priced` — jednokratni okvirni raspon i odvojene kategorije tekućih/vanjskih troškova. UI samo prikazuje rezultat; ne sadrži cijene niti neovisno računa iznose.

Predložena konfiguracija nakon odobrenja: `base[novi|redizajn]`, `catalogTier[tier]`, `contentSupport[choice]`, `includedScope`, `manualTriggers`, `recurringCostPolicy`, `rounding`, `currency`, `taxDisplay`, `version`, `approvedAt`. Svaka cjenovna stavka ima donju i gornju granicu u najmanjoj jedinici valute; nema decimalnog računanja u UI-u. Za standardni slučaj raspon je zbroj odgovarajućih donjih, odnosno gornjih granica, uz potvrđeno pravilo zaokruživanja. Uvijek prikazati verziju/datumski okvir poslovnih pravila interno za provjeru. Nula i prazna vrijednost nisu zamjenjive.

Redoslijed: (1) validirati sve izbore i međusobnu dosljednost; (2) ako postoji nepoznata/nevaljana vrijednost, `invalid`; (3) ako išta nedostaje, `incomplete`; (4) ako zahtjevi očito traže poseban opseg, `manual`; (5) ako nema odobrene konfiguracije, `pricing_unavailable`; (6) ako zahtjevi prelaze granice potvrđene matrice, `manual`; (7) inače `priced`. Ako je dio standardan, a dio ručan, ne prikazivati djelomičan broj kao ukupnu cijenu. Promjena izbora odmah uklanja prethodnu procjenu koja više ne vrijedi. Nepoznati proizvodi/zahtjevi ne smiju tiho pasti na najjeftiniju opciju.

## Prikaz rezultata i troškova

- **Opseg:** odabrano, što standardna izrada uključuje, što nije uključeno i koji dio traži razgovor. Oznake mora potvrditi Dinko.
- **Jednokratna izrada:** samo uz status `priced`, s oznakom „okvirna procjena prema odabranom opsegu; konačna ponuda nakon provjere zahtjeva”. Prikazati raspon u potvrđenoj valuti i uz potvrđen porezni tekst. Ako raspon nije odobren, bez numeričke cijene.
- **Tekući/vanjski troškovi:** zasebna skupina, primjerice domena, hosting, payment provider, dostavne i druge vanjske naknade, održavanje — samo one koje Dinko potvrdi kao primjenjive. Za nepoznate iznose napisati „prema uvjetima pružatelja” ili „procjenjuje se zasebno”; ne zbrajati ih s izradom niti izmišljati godišnje/mjesečne iznose.
- **Ručna procjena:** vidljivi razlog (npr. integracija, B2B, više tržišta/jezika, migracija nepoznatog opsega, katalog izvan odobrenog raspona). Rezultat je opis zahtjeva i CTA za ponudu, bez pseudo-preciznog broja.
- **Bez odobrenih cijena:** moguće je prikazati opseg i CTA, uz poruku „Okvirna cijena trenutačno nije dostupna; pošaljite zahtjeve za ručnu ponudu.” Ovo je sigurni prikaz ako se UI izrađuje prije poslovnog odobrenja.

## CTA i postojeći obrazac

Tekst CTA-a: **„Zatraži ponudu prema ovom izračunu”**. Aktivira se kada su odgovori valjani, uključujući `manual` i `pricing_unavailable`; nikad automatski ne šalje upit. U standardnom slučaju sažetak treba imati tip projekta, raspon kataloga, način unosa, posebne zahtjeve i informaciju da je cijena okvirna. Izbjegavati slanje izračunate cijene kao nepromjenjive obveze ili ponavljati osobne podatke.

Postojeći `ProblemForm` nalazi se na početnoj stranici pod `/#problem-form`. Danas ne prima početne vrijednosti, a `lib/problem-email.ts` zahtijeva ime, firmu, email, djelatnost i opis problema od najmanje 20 znakova; ne podržava zasebna polja kalkulatora. Za buduću implementaciju predlaže se prikaz iste komponente na stranici kalkulatora i usko, opcionalno početno ispunjavanje polja `problem` i po potrebi `currentSolution` strukturiranim, čitljivim sažetkom u memoriji iste stranice. Time ponašanje početne stranice i API validacija ostaju očuvani. Potrebna je mala prilagodba komponente u implementacijskoj fazi; **u ovoj fazi obrazac se ne mijenja**. Ne stavljati izbore ni iznose u URL/query string, analitiku ili logove. Ako prijenos bez izmjene obrasca nije izvediv, CTA vodi na postojeći obrazac, a uz sažetak ponuditi „Kopiraj zahtjeve” kao privremeni ručni prijenos. Korisnik mora moći urediti opis prije slanja.

## Stanja i pristupačnost

| Stanje | Očekivano ponašanje |
| --- | --- |
| Početno | Kratko objašnjenje, četiri neodabrana pitanja, u sažetku „Odgovorite na pitanja za prikaz opsega”; bez broja i bez aktivnog CTA-a. |
| Prazno/djelomično | Označiti što nedostaje; ne izračunavati iz prešutnih pretpostavki. Sačuvati postojeće odabire. |
| Nevaljano | Jasan tekst uz polje, `aria-invalid`, vidljiv fokus na prvom problemu; odbiti neočekivane vrijednosti i nedosljedne kombinacije. |
| Uspješno standardno | Sažetak i, samo uz odobrenu matricu, okvirni raspon, porezni status i zasebni troškovi; CTA prema obrascu. |
| Uspješno ručno / cijena nedostupna | Sažetak, razlog bez brojke, aktivan CTA. |
| Slanje obrasca | Koristiti postojeća stanja „Šaljem…”, uspjeh i pogrešku; ne testirati stvarnim slanjem u fazi 0. |

Polja moraju raditi tipkovnicom i na dodir, imati vidljiv fokus, dostatan kontrast i razumljive tekstualne oznake. Promjenu rezultata objaviti pristupačno bez čitanja cijelog bloka pri svakom kliku; smanjeno kretanje poštovati kao na postojećoj stranici. Na mobitelu CTA i sažetak ne smiju zaklanjati pitanja.

## Kontrolni primjeri i kriteriji prihvata

Simboli `B`, `K` i `U` u primjerima označavaju **tek buduće odobrene** raspon-stavke osnovice, kataloga i pomoći s unosom; nisu cijene.

| Ulaz | Očekivano |
| --- | --- |
| Nijedan odgovor | `incomplete`; bez cijene i CTA-a. |
| Novi webshop, do 50, unos sami, standardna kupnja; matrica još nije potvrđena | `pricing_unavailable`; opseg i CTA, bez brojke. |
| Isti standardni ulaz uz odobrenu matricu | `priced`; donja granica `B.novi.min + K.do50.min + U.sami.min`, gornja analogno, potom odobreno zaokruživanje i porezni tekst. |
| Novi webshop, 51–500, pomoć s unosom, standardna kupnja; odobrene stavke | `priced` samo ako su svi elementi unutar potvrđenog opsega; inače `manual`. |
| Redizajn, nejasna migracija, bilo koji katalog | `manual`; navesti migraciju; bez brojke. |
| Novi webshop, do 50, sami, ERP integracija | `manual`; navesti integraciju; bez djelomične cijene. |
| Nepoznat izbor ili izmijenjen ulaz izvan dozvoljenog skupa | `invalid`; bez cijene, bez slanja. |
| Nakon valjane procjene korisnik vrati pitanje na neodabrano | `incomplete`; stari raspon odmah nestaje. |

Prihvat: (1) svi standardni izračuni koriste isključivo jednu verzioniranu odobrenu matricu; (2) nijedna ručna ili nepoznata grana ne prikazuje izmišljeni iznos; (3) uključeno, isključeno, tekuće i vanjsko jasno su razdvojeni; (4) CTA prenosi čitljiv sažetak u kontaktni tok tek nakon korisničke radnje i bez objave kroz URL; (5) postojeći obrazac i validacija i dalje rade kao prije; (6) sve razine ekrana, tipkovnica, fokus i reduced-motion su provjereni; (7) nema novih plaćenih servisa, baze ili korisničkih računa.

## SEO i minimalno mjerenje

Za rutu predložiti zasebni naslov „Kalkulator cijene webshopa | deweb” i opis koji obećava **okvirnu procjenu opsega** i jasno navodi kada je potrebna ručna ponuda; H1 „Koliko košta izrada webshopa?” ili „Kalkulator cijene webshopa” odabrati prema stvarnom sadržaju. Ispod alata dodati kratak tekst: što utječe na opseg, što kalkulator obuhvaća, što se procjenjuje posebno, razlika između izrade i vanjskih/tekućih troškova te kako dobiti ponudu. Povezati `/alati` ↔ kalkulator, početnu uslugu webshopa ↔ kalkulator i kalkulator ↔ kontakt. Ne prikazivati FAQ s tvrdnjama ili iznosima koji nisu odobreni. Lokalni metadata i eventualni canonical definirati za novu rutu nakon potvrde produkcijskog javnog URL-a; globalni robots/noindex ostaje netaknut.

Mjerenje u prvom koraku: zapisati dogovorene ciljeve kao agregatne brojače `tool_view`, `calculation_complete`, `manual_result`, `quote_cta_click` i `contact_success`. Trenutačno **nema analitike**, pa se instrumentacija ne uključuje samim dodavanjem rute. Ako postojeći hosting pruža agregirane page-view podatke, koristiti ih samo nakon provjere dostupnosti; za ostale događaje najprije potvrditi privatnosni tekst i način agregiranja bez kolačića i novih plaćenih servisa. Događaji ne smiju sadržavati izbore, veličinu kataloga, financijske iznose, opis zahtjeva, kontaktne podatke ni URL s parametrima. U fazi 0 ništa se ne šalje analitici.

## Zapis Faze 1A — lokalna implementacija bez aktivacije cijena

Dodano 14. 9. 2026. Faza 1A provodi tehnički i UI dio specifikacije prije poslovnog odobrenja. Zato raniji prijedlog da se najprije odobri cjenovna matrica nije preduvjet za **lokalni pregled zahtjeva**, nego za **aktivaciju brojčane procjene**.

- Rute `app/alati/page.tsx` i `app/alati/kalkulator-cijene-webshopa/page.tsx` imaju vlastite naslove, opise i lokalni `robots: noindex, nofollow`. Postojeći globalni SEO, navigacija i footer nisu mijenjani.
- `app/alati/kalkulator-cijene-webshopa/webshop-calculator.tsx` prikazuje četiri pitanja, posebne zahtjeve, uređivanje odgovora, sažetak, stanje nepotvrđene cijene i lokalno kopiranje zahtjeva. CTA vodi na postojeći obrazac, ali ga ne ispunjava niti šalje; posjetitelju je jasno rečeno da zalijepi sažetak u opis problema.
- `lib/webshop-price.ts` sadrži validaciju i čistu procjenu; `lib/webshop-price-config.ts` sadrži jedinu aplikacijsku konfiguraciju u stanju `draft`. Iznosi, porezni prikaz i odobritelj su nepoznati. Funkcija ne vraća brojčani rezultat bez potpunog odobrenja i valjanih cjenovnih pravila. Čak i ako se iznosi ubace u `draft`, rezultat ostaje bez broja.
- Rasponi broja proizvoda iz Faze 0 u UI-u su izričito označeni kao **orijentacijski opis zahtjeva**, a ne odobrene granice cjenovnih paketa. Jedina brojčana matrica je sintetička i nalazi se isključivo u `lib/webshop-price.test.ts`.
- Posebni zahtjevi i nepoznat opseg daju pojedinačne razloge za razgovor. Standardni, potpuni unos daje `pricing_unavailable`, ne pogrešnu oznaku da je korisnikov projekt nužno složen.
- Postojeći `app/page.tsx`, `app/problem-form.tsx`, `lib/problem-email.ts` i `app/api/contact/route.ts` nisu mijenjani u Fazi 1A. Nema analitike ni slanja korisničkih odabira.

Poslovna aktivacija ostaje **BLOCKED** do Dinkove potvrde: standardni uključeni/isključeni opseg i granice za novu izradu/redizajn; osnovice i doplate odnosno rasponi za katalog i unos, pravilo zaokruživanja i verzija; valuta i porezni prikaz; tekući i vanjski troškovi te tekst konačne ograde. Do tada nema odobrene brojčane procjene ni produkcijske spremnosti.

### Lokalna provjera Faze 1A

- `npm test`: 27/27 prolaznih testova, uključujući sintetičku matricu samo u testu, blokadu cijene u `draft` stanju, nevaljane iznose i grane za ručnu procjenu.
- `npm run typecheck` i `npm run build`: prolazno. Build stvara obje nove rute kao statične stranice; nije objavljen.
- `git diff --check`: prolazno; Git javlja samo postojeće upozorenje o pretvorbi LF/CRLF za korisnički izmijenjeni `app/page.tsx`.
- Lokalni preglednik: `/alati` i kalkulator pregledani na 390, 768 i 1440 px. Početno stanje, četiri pogreške praznog obrasca, fokus prvog nevaljanog pitanja, standardni sažetak bez cijene, uređivanje izbora bez gubitka ostalih odgovora i ručna procjena posebnih zahtjeva provjereni su bez slanja obrasca. Na sve tri širine kalkulator nema vodoravno prelijevanje; obje rute imaju `noindex, nofollow`. Preglednik nije prijavio pogreške.
- Snimke pregledanih stanja: `docs/microtools/alati-{390,768,1440}.png`, `docs/microtools/kalkulator-initial-{390,768,1440}.png`, `docs/microtools/kalkulator-errors-390.png`, `docs/microtools/kalkulator-draft-{390,1440}.png` i `docs/microtools/kalkulator-manual-{390,1440}.png`.

Ovo je lokalni tehnički prolaz, ne odobrenje poslovnih pravila ni produkcijske objave.
