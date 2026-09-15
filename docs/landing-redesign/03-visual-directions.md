# Define — vizualni smjerovi i usporedba

Datum: 14. 9. 2026. Vizuali su konceptualne reference za kompoziciju i atmosferu. **Nijedan nije screenshot implementiranog redizajna ili konačan koncept.** Autoritativni predloženi sadržaj nalazi se u [02-content-directions.md](02-content-directions.md); činjenična podloga u [01-evidence-and-positioning.md](01-evidence-and-positioning.md).

## Što nasljeđujemo

Originalni `public/deweb-logo.svg` i favicon; tamnu tintu, teal, bijelu i narančasti akcent; razumljive kontrole; izvediv responsive grid. Logo ostaje u svojoj originalnoj plavoj paleti. Teal preuzima standardni glavni CTA jer bijeli tekst na njemu ima provjeren kontrast 6,05:1. Narančasta ostaje mali naglasak ili tamnija postojeća varijanta nakon provjere kontrasta.

U sva tri smjera izostaviti dekorativne dashboard brojke, beskonačan typing, univerzalnu mrežu kartica, velike nefunkcionalne hero vizuale, generičke gradijente i nametljivo kretanje. Cijena je nepoznata, ne nula; nema brojčanih rezultata ni referentnih logotipa.

Tipografija mora biti stvarno dostupna: postojeća deklaracija „Inter” nije dokaz učitanog fonta. Jedna provjerena sans obitelj/system stack dovoljan je za S1/S3; S2 može koristiti sistemski serif za naslove. Fontove ne birati prema približnom izgledu generirane slike.

## S1 — Jasna ponuda, konkretan rad

[Konceptualni vizual S1](concepts/01-jasna-ponuda.png)

**Vizualni jezik:** mirna komercijalna stranica. Usluga ima najveći vizualni prioritet, sljedeći je CTA, zatim jedan dokaz. Iznad prvog dokaza dvije pregledne uslužne cjeline, bez imitacije pricing kartica. Sekcije razdvajaju razmak i tanke linije, ne kutija oko svakog odlomka.

**Tipografija:** čitljiv sans; H1 okvirno 52–64 px desktop, 36–40 px mobile, line-height oko 1,1; body 16–18 px i 1,55–1,7. Najviše tri težine. Konkretne veličine služe početnoj razradi, a prihvat određuju stvarni prijelomi i gates.

**Boje:** pretežno bijela, ink tekst, muted za dopunsko objašnjenje, teal za glavni CTA i manje naglaske. Pale teal podloga samo dokaznog bloka. Orange jedan mali marker; bez njegove bijele 16 px tipografije na osnovnoj orange podlozi.

**Kompozicija:** najviše 1120–1200 px širine; hero jedan tekstualni blok ili odmjerena podjela s dokaznim detaljem. Nema obvezne min-height hero vrijednosti vezane za puni ekran. Dvije uslužne cjeline vode do stvarnog primjera; autor i proces su kratki.

**Fotografije/snimke:** snimka stvarnog internog kalkulatora s vidljivim statusom, captionom i jednom anotacijom. Ne izmišljati generički webshop mockup kao portfolio. Ako nema klijentskog materijala, dovoljan je ovaj vlastiti rad. Autentičan portret je opcionalan i nije hero dekoracija.

**Motion:** H1, usluga, CTA i dokaz vidljivi odmah. Eventualni hover i kratke promjene stanja 120–200 ms; bez animiranog brojenja, driftanja i skrivanja sadržaja. Smanjeno kretanje uklanja transformacije.

**Mobilno:** jedna kolona; hero CTA unutar prvog 390 × 844 prikaza s uobičajenim veličinama teksta; usluge odmah nakon hero sadržaja. Dokaz nije minijatura cijele desktop stranice: prikazati čitljiv relevantan detalj i tekst. Header s izravnim kontaktom. Bez stickya koji prekriva formu.

**Rizik i složenost:** najmanje tehničkih promjena, visoka održivost. Posebnost mora dolaziti iz stvarnog dokaza i copyja, ne dodatnih ukrasa.

## S2 — Osobni studio

[Konceptualni vizual S2](concepts/02-osobni-studio.png)

**Vizualni jezik:** čitljiva editorialna stranica autora. Veliki, ali sadržajno kratki naslovi; potpis, radna bilješka i objašnjena odluka stvaraju karakter. Asimetrija služi redoslijedu čitanja, ne eksperimentu.

**Tipografija:** sistemski serif poput Georgije samo za H1/H2, postojeći sans za body i kontrole. Najviše dvije obitelji; bez vrlo tankih rezova i tijesnog razmaka slova. H1 približno 56–64 px desktop / 36–42 px mobile, prije svega čitljivi prijelomi. Tekst do oko 60–70 znakova po retku.

**Boje:** blaga papirnata #FAF9F6 kao lokalna predložena podloga, postojeći ink/teal, mali orange markeri. To je ograničena dopuna, ne novi brand sustav. Nema izblijedjelog sitnog copyja.

**Kompozicija:** desktop glavni stupac i uža marginalna bilješka, tanki obrubi i uređen vertikalni ritam. Dokaz djeluje kao kratka razrada projekta, s čitljivim captionom; usluge kao jasan indeks. Ne duplirati „o meni” kroz cijelu stranicu.

**Fotografije/snimke:** autentičan portret Dinka ili stvarna radna fotografija samo ako je dostavljena i odobrena. Bez toga kvalitetan tipografski potpis. Jedna stvarna snimka uz objašnjenje konkretne odluke; bez lažnog prije/poslije.

**Motion:** vrlo malo; eventualno kratko otkrivanje sekundarne anotacije koje ne skriva glavni tekst. Bez parallaxa, horizontalnog scrolla, zamjene kursora ili animacije slova.

**Mobilno:** marginalna bilješka dolazi nakon pripadnog sadržaja; serif se prilagođava stvarnom hrvatskom tekstu, ne siljenju željenog broja redaka. Naslov usluge i CTA ostaju rano vidljivi. Opisi projekta postaju kratki odlomci uz jednu sliku.

**Rizik i složenost:** urednička kvaliteta i autentičnost autora ključne su ovisnosti. Više rada na tipografskoj dosljednosti, ali bez teškog JS-a.

## S3 — Otvorena radionica

[Konceptualni vizual S3](concepts/03-otvorena-radionica.png)

**Vizualni jezik:** miran, funkcionalan prikaz malog dijela stvarnog rada. Numerirane oznake označavaju korake, ne lažne statistike. Služiti se tankim linijama i anotacijama; ne pretvoriti javnu prodajnu stranicu u developerski dashboard.

**Tipografija:** čitljivi sans kao glavni font; sistemski monospace samo za male oznake 01/02/03. Nikakav kod, API naziv ili tehnički status ne zamjenjuje objašnjenje koristi. „Razvojna verzija” ostaje vidljivo uz alat jer utječe na korisnikovo očekivanje.

**Boje:** bijela i ink, teal za akciju, pale teal za odvojeni sažetak. Orange pokazuje jednu anotaciju, ne cijeli interaktivni sustav. Sva stanja imaju tekstualnu oznaku, ne samo boju.

**Kompozicija:** uslužni hero → veliki horizontalni dokazni prikaz → konkretna tumačenja → primjene i kontakt. Dva stupca samo kada snimka i objašnjenje ostaju čitljivi. Za minimum koristiti tri kratke figure „odgovori / promjena / sažetak”; ako interakcija ne donosi više razumijevanja, ne implementirati je.

**Fotografije/snimke:** stvarni snimljeni alat i njegovi kontrolirani prikazi. Sadržaj mora biti onaj postojeće aplikacije; ne generirani upitnik opće web usluge. Ne trebaju stock laptop, bilježnica, kava, sintetički ured ni fotografija za popunjavanje hero prostora.

**Motion:** ako se kasnije odobri preklop prikaza, korisnik ga pokreće gumbom i vidi neposrednu promjenu. Pristupačan status, očuvan fokus, bez autoplay carousela. Statične figure imaju punu vrijednost i bez JavaScripta.

**Mobilno:** usluga i komercijalni CTA prije demonstracije. Pitanja i sažetak jedan ispod drugog; sažetak ne prekriva sadržaj. Nema iframea s komprimiranom desktop aplikacijom ni vodoravnog pomicanja. Tekst uz dokaz kaže da alat nije obvezan za upit.

**Rizik i složenost:** više pažnje traže odnos dvaju tokova i eventualna stanja. Besplatni alat može preuzeti prodajni cilj. Održavanje snimki jednostavnije je od ugrađivanja cijelog kalkulatora.

## Kako čitati generirane reference

Tri vizuala izrađena su ugrađenim `image_gen.imagegen` alatom, po jedan zaseban prompt za svaki smjer. Izvornici su ostavljeni na mjestu generiranja, a kopije su u ovom direktoriju dokumentacije. Nisu uvezene u aplikaciju. Vizuali prikazuju zamišljeni desktop i mobile radi usporedbe; oznake viewporta na slici nisu mjereni browser testovi.

Vizuali su pregledani i imaju ograničenja koja **ne treba prenijeti u implementaciju**:

| Slika | Što uzeti | Što odbaciti / zamijeniti |
| --- | --- | --- |
| S1 | Jasnu uslugu, rano vidljiv CTA, mirne retke usluga i sažet dokazni blok | Generirani browser mockup i upitnik nisu stvarni deweb rad; zamijeniti stvarnom snimkom. Ne preuzeti dodatne slogane, „bolje rezultate”, nove funkcije ni blage generirane gradijente. |
| S2 | Tipografsku razliku, autorski potpis, vezu bilješke i objašnjenog primjera | Godina „2025” je generirani artefakt, nije podatak. Opći upitnik, tvrdnje i dodatni linkovi nisu specifikacija. Zadržati pravi sadržaj iz dokumenta 02 i originalni logo. |
| S3 | Funkcionalni slijed, vidljiv status i linearan mobilni prikaz | „Zagreb, HR”, dodatni slogani i drugi izmišljeni sitni tekst nemaju izvor. Bilježnica/kava nisu autentičan dokaz i izostavljaju se. Generirani upitnik nije postojeći kalkulator; koristiti stvarna polja i snimke. |

Nijedan generirani prikaz ne potvrđuje lokaciju, datum, rezultat, citat, isporuku ili funkcionalnost. Dokument 02 ima prednost nad slikama. Ne traži se implementacija tih slika piksel po piksel niti odabir na temelju spektakla.

## Usporedba 1–10

Ocjene su analitička prosudba za sadašnje dostupne dokaze, ne rezultat korisničkog testa ni predviđanje prodaje. U retku „tehnička sigurnost” 10 znači **najmanji tehnički rizik**. „Kvaliteta dokaza” ocjenjuje koliko smjer pošteno i razumljivo predstavlja trenutačni materijal; nijedan ne dobiva ocjenu snažne klijentske reference.

| Kriterij | S1 Jasna ponuda | S2 Osobni studio | S3 Otvorena radionica |
| --- | ---: | ---: | ---: |
| Jasnoća ponude | 9 | 8 | 7 |
| Povjerenje | 8 | 8 | 7 |
| Kvaliteta dostupnog dokaza u prikazu | 5 | 5 | 6 |
| Vizualna posebnost | 7 | 9 | 8 |
| Prodajna učinkovitost — procjena toka | 8 | 7 | 6 |
| Mobilna izvedivost | 9 | 8 | 7 |
| Tehnička sigurnost — 10 je najmanji rizik | 9 | 8 | 6 |
| Dugoročna održivost | 9 | 8 | 7 |

S1 je radna preporuka zbog jasnoće i malog opsega, a ne zato što ima dokazano veći prihod. S2 može biti bolji s jakim osobnim materijalom; S3 s dokazom da demonstracija pomaže razumijevanju ponude. Za sada uzeti S1 kao kandidata i predati **sva tri** na neovisnu fresh-context kritiku.

## Potpun skup promptova za reprodukciju konceptne faze

Sljedeći promptovi dokumentiraju generiranje; nisu HTML niti implementacijski copy.

### Prompt S1

```text
Use case: ui-mockup. Create a high fidelity conceptual design board for Croatian solo digital studio deweb, direction 1 "Jasna ponuda, konkretan rad". This is a DESIGN REFERENCE, not an implemented website. Landscape board showing a large desktop homepage composition plus one narrow mobile composition at right. Label the board "SMJER 01 — KONCEPT". Very clean commercial, deliberate hierarchy and compact hero, calm white background, ink navy #081832 typography, teal #006d7b for one primary CTA, orange #e95616 only a restrained underline, pale teal panels. Modern readable sans serif, ample but purposeful spacing, crisp straight section dividers, minimal shadows, small rounded controls. Simple lowercase deweb wordmark in navy and blue, do not invent symbols. Hero exact text "Web stranice i webshopovi za male tvrtke." supporting text "Jasna ponuda. Pregledan put do upita ili kupnje." primary CTA "Opišite svoj projekt", small text link "Pogledajte način rada". Immediately below hero: two simple horizontal service rows "Web stranice i landing stranice" and "Webshop i redizajn". Then one larger evidence section "Kako pristupam rješenju" featuring a flat schematic preview of a four-question requirements tool labelled visibly "Interni alat · razvojna verzija", no numeric prices, no metrics; modest caption and visible contact path. Mobile shows headline, CTA, service rows and the beginning of internal tool evidence in linear order, not squashed desktop. No photos, no client names, no testimonials, no client logos, no invented results, no fake portfolio, no floating cards, no graphs, no gradients, no 3D, no dark dramatic hero. This board explores hierarchy and visual atmosphere; typography is conceptual.
```
### Prompt S2

```text
Use case: ui-mockup. Create a high fidelity conceptual design board for Croatian solo digital studio deweb, direction 2 "Osobni studio". This is a DESIGN REFERENCE, not an implemented website. Landscape board with desktop homepage and a narrow mobile view. Label "SMJER 02 — KONCEPT". Strong readable editorial composition: warm off-white #FAF9F6, ink navy #081832, teal #006d7b, restrained orange #e95616 as tiny side annotations. A refined large Georgia-like serif headline with highly readable sans serif text and controls. Small lowercase navy-and-blue deweb wordmark, no new logo icon. Asymmetric editorial columns, thin horizontal rules, text grounded in the grid; no floating cards. Hero eyebrow "Web stranice i webshopovi / solo studio". Hero text "Vaš web, od prvog razgovora do izvedbe." Body "Ja sam Dinko. Iza deweba stoji jedna osoba s kojom dogovarate projekt." CTA "Opišite svoj projekt", discreet link "Pogledajte pristup". Follow hero with an editorial working-note spread titled "Jedna odluka u stvarnom alatu." It presents a schematic annotated view of four questions and a summary, labelled "Interni alat · razvojna verzija", no prices. Captions explain "Prvo zahtjevi" and "Zatim opseg". Follow with compact service index "Web stranice", "Webshopovi", "Alati uz web". Mobile serif headline maximum four lines then button, short author note, one annotated tool panel; all readable, no oversized empty hero. Do not invent Dinko's appearance: no portrait, no photos of a made-up person, no stock office. No testimonials, client logos, numerical business results, charts, pricing, gradients or decorative 3D. Typography and illustration are conceptual only.
```
### Prompt S3

```text
Use case: ui-mockup. Create a high fidelity conceptual design board for Croatian solo digital studio deweb, direction 3 "Otvorena radionica". DESIGN REFERENCE, not an implemented website. Landscape board includes one large desktop homepage and one mobile linear layout. Label "SMJER 03 — KONCEPT". Distinctive functional craftsmanship, almost a carefully annotated working notebook, but sophisticated and commercial, not a software dashboard or SaaS app. White background, navy #081832, teal #006d7b, pale teal, orange #e95616 only for small annotations. Readable modern sans serif with compact monospaced marginal labels, thin rules, no ubiquitous card grid or floating panels. Lowercase navy-and-blue deweb wordmark. Hero explicitly sells the service: "Web stranice i webshopovi. Jasni i u detaljima." Body "Od jasne ponude do obrasca, pregleda zahtjeva i sljedećeg koraka." Dominant teal CTA "Opišite svoj projekt". A quieter secondary link "Pogledajte alat". Below service-led hero a wide, flat, two-pane evidence area called "Pitanje → sažetak → razgovor". Left pane schematic 4 question controls, right pane short summary. Prominent label "Interni alat · razvojna verzija" and honest note "Cjenik još nije odobren." Do not display prices or fake data or real clients. Tool panel is an explanatory example, not a main conversion gate; show one visible service strip below with "Web", "Webshop", "Obrasci i kalkulatori". Mobile has service-led headline and CTA first, then annotated flow stacked vertically and a short summary, never two squeezed columns. No project gallery, portraits, client logos, testimonials, fake statistics, graphs, gamification, gradients, 3D or huge whitespace. Maintain clear intent to hire a solo studio.
```
