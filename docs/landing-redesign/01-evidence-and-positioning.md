# Dokazi, tržište i pozicioniranje

Datum pregleda: 14. 9. 2026. Ovo su istraživački nalazi i preporuke, ne odobrena nova ponuda. [Audit izvora i snimke](00-current-state-audit.md).

## Što znači status dokaza

**Potvrđeno** znači da postoji identificirani dokaz za usko navedenu tvrdnju. Kada je dokaz kod, potvrđuje ponašanje ili sadržaj koda, ne učinak na prodaju. **Nepotpuno** znači da postoji dio dokaza, ali nedostaje opseg, odobrenje ili rezultat. **Nepotvrđeno** znači da u pregledanim izvorima nema podloge za javnu tvrdnju.

Kontekst „solo studio” i „nula prihoda” dolazi iz korisničkog briefa; nije provjeren računovodstvom. Nula prihoda ne dokazuje da ne postoje aktivni, besplatni ili neobjavljeni projekti. Samo nisu dokumentirani u ovom repozitoriju. Raniji pogrešno poslani MOIRA prompt pripada drugom projektu i nije deweb referenca.

## Evidence matrix

| ID | Tvrdnja / sadržaj | Gdje se pojavljuje | Dostupan dokaz | Status | Preporuka |
| --- | --- | --- | --- | --- | --- |
| E01 | Digitalna rješenja za male poduzetnike | Hero, layout metadata, `why` | Izričito navedena ciljna skupina; nema istraživanja potražnje | Potvrđeno kao sadašnje pozicioniranje | Precizirati vrstu kupljive usluge i prvi use-case. |
| E02 | Predlažemo rješenje i izrađujemo alat | Hero | Lokalni kalkulator je funkcionalan interni primjer; nema klijentske isporuke | Nepotpuno | Zadržati kao opis usluge uz konkretan prikaz i status; bez generalizacije rezultata. |
| E03 | Aplikacije, automatizacija, AI asistent, interni sustav | Hero body | Samo popis i ideje; nema takvih dokumentiranih sustava | Nepotvrđeno kao dokazana ekspertiza/isporuka | Ukloniti iz prve poruke; nuditi pojedinačno tek uz kapacitet i dokaz. |
| E04 | Webshop napravljen za prodaju | `services[0]`, lokalni diff | Opis namjere; nema webshop implementacije ni prodajnih podataka u ovom repou | Nepotpuno | Precizirati „Izrada i redizajn webshopa” i funkcionalne ciljeve; ne obećavati više prodaje. |
| E05 | Mobilno iskustvo, brzina, put od proizvoda do kupnje | `services[0].description` | Responsive deweb stranice postoje; checkout kupnje ovdje ne postoji | Nepotpuno | Pretvoriti u provjerljive kriterije isporuke, ne ostvarene klijentske rezultate. |
| E06 | Landing povezan s kampanjom i mjerenjem konverzija | `services[1]` | Nema kampanjskih izvještaja ni implementirane analitike | Nepotvrđeno | Landing zadržati; upravljanje kampanjom i mjerenje odvojiti dok Dinko ne potvrdi uslugu. |
| E07 | Kalkulator/obrazac prikuplja informacije prije prodajnog razgovora | `services[2]`, mikroalat | Četiri pitanja i strukturirani sažetak; postojeći ProblemForm | Potvrđeno za interni tok | Zadržati kao dokaz funkcije; kvaliteta ili broj prodajnih upita nisu dokazani. |
| E08 | Gube se upiti između WhatsAppa, maila i poziva | `problems[0]` | Hipotetski scenarij, ne zapis korisničkog istraživanja | Nepotvrđeno kao činjenica o publici | Precizirati u pitanje ili ukloniti ako nova primarna publika traži web. |
| E09 | Ponavljaju se pitanja; dokumenti/statusi su ručni; Excel je glavni sustav; nema pregleda; nije jasno odakle automatizirati | `problems[1..5]` | Nema intervjua ili dijagnostike korisnika | Nepotvrđeno kao opći tržišni nalaz | Najviše jedan relevantan scenarij uz konkretnu web uslugu, ne šest generičkih boli. |
| E10 | Rad oko konkretnog problema; najjednostavniji izvediv smjer | Hero, solution sekcija, `why` | Načelo u sadržaju; kalkulator uvjetno ilustrira ograničavanje opsega | Nepotpuno | Zadržati kao radni princip i pokazati jednu odluku; ne ponavljati tri puta. |
| E11 | Klijent dobiva 2–3 rješenja | Solution, steps, Problem brief | Samo javni tekst, nema potvrđenog procesa/isporuke | Nepotvrđeno | Zamijeniti „prijedlog opsega i sljedećeg koraka” do vlasničke odluke. |
| E12 | Mini CRM, termini/podsjetnici, klijentski portal | `examples[0..2]` | Nema repoa, snimke, linka, statusa ili rezultata | Nepotvrđeno kao reference | Ukloniti iz dokaznog bloka; eventualno označiti kao moguća rješenja. |
| E13 | Automatske ponude, interni dashboard, AI FAQ | `examples[3..5]` | Isto; ilustrativni hero dashboard nije aplikacija | Nepotvrđeno kao reference | Ukloniti iz portfolija i primarnog prodajnog toka. |
| E14 | Evidencije i sustav zahtjeva/rezervacija | `examples[6..7]` | Kontakt forma nije takav poslovni sustav | Nepotvrđeno kao reference | Ukloniti iz dokaznog bloka; ne proširivati značenje postojeće forme. |
| E15 | Problem brief daje sažetak, preporučeni MVP i procjenu složenosti | `offers[0]` | Objavljen opis, bez predloška isporuke i uvjeta naplate | Nepotpuno | Dinko potvrđuje je li to plaćena usluga ili faza ponude. Ne obećavati besplatnu analizu. |
| E16 | Brzi MVP isporučuje funkcionalnu verziju za rad | `offers[1]` | Kalkulator pokazuje ograničen interni alat; ne brzinu isporuke | Nepotpuno | „Brzi” ukloniti bez opsega i roka; korisnički rezultat opisati konkretno. |
| E17 | Custom sustav, više korisnika, portal, integracije, mini SaaS | `offers[2]` | Nema takvog projekta u pregledanom repozitoriju | Nepotvrđeno kao izvedena sposobnost | Ukloniti iz prve prodajne ponude; ne širiti platformu. |
| E18 | Održavanje i nadogradnje nakon isporuke | Solution, steps, offers | Mogućnost navedena u tekstu; bez ugovorenog režima/podrške | Nepotpuno | „Prema zasebnom dogovoru” tek nakon Dinkove potvrde sadržaja; bez SLA-a ili 24/7. |
| E19 | Prvo problem, zatim tehnologija; jednostavno prije velikog sustava | `why[1..2]` | Vrijednosti, bez klijentskog ishoda | Nepotpuno | Zadržati kao načelo potkrijepljeno objašnjenim internim primjerom. |
| E20 | Brzo testirati prije velikog ulaganja | `why[3]` | Nema mjerenja vremena/troška | Nepotvrđeno kao rezultat | Precizirati fazno provjeravanje dogovorenog opsega; bez uštede ili brzine. |
| E21 | AI samo kad ima smisla; jasna komunikacija i izvedivi koraci | `why[4..5]` | Izjava namjere | Nepotpuno | Jasnoću pokazati copyjem i procesom; AI maknuti iz hero poruke. |
| E22 | 18 upita, 4 čekaju odgovor, rastući graf i donut | `HeroVisual` | Hardkodirana dekoracija, `aria-hidden=true`, bez oznake demo za videće korisnike | Nepotvrđeno kao poslovni podatak | Ukloniti iz novog dokaznog sadržaja; ne tumačiti kao ostvareni rezultat. |
| E23 | Cijena/opseg dogovaraju se pojedinačno | `offers`, `app/uvjeti/page.tsx` | Tekst i izostanak odobrene matrice | Potvrđeno kao trenutačni način prikaza | Zadržati bez iznosa; konačne uvjete potvrđuje Dinko. |
| E24 | Kalkulator daje brojčanu cijenu webshopa | Naziv rute/alata može to sugerirati | Draft config blokira cijenu; UI pošteno objašnjava status | Nepotvrđeno kao aktivna usluga | Link nazvati pripremom opsega; ne reklamirati trenutačno nedostupni izračun. |
| E25 | Kontakt sustav obrađuje i šalje upit | ProblemForm, API, lib | Kod obrade; raniji lokalni testovi sa zamjenskim fetcherom | Potvrđeno za implementaciju; dostava u produkciji nepotpuna | Zadržati kanal; ne tvrditi da je mail isporučen bez provjere. |
| E26 | Nema analitičkih/marketinških kolačića | Privatnost i aplikacijski izvori | Nema tracking implementacije u kodu | Potvrđeno u lokalnom aplikacijskom opsegu | Zadržati bez dodavanja analitike; hosting nije pregledan. |
| E27 | deweb je solo studio / Dinko vodi rad | Korisnički brief; postojeći copy koristi „mi” | Izjava vlasnika o solo studiju; bez biografije/portreta | Potvrđeno iz briefa; javni opis nepotpun | Predložiti „Dinko / solo studio”; vlasnik potvrđuje javnu formulaciju i odgovornosti. |
| E28 | Klijenti, prihodi, rast konverzije, rokovi, testimonialsi, partnerstva | Nema javnog dokaznog bloka ni asseta | Nijedan potvrđeni izvor u ovom repou | Nepotvrđeno | Ne dodavati brojke, logotipe, citate, rokove ni badgeve. |

## Inventar dokaznog materijala i statusa projekta

| Materijal | Klasifikacija | Smije dokazivati | Ne smije dokazivati |
| --- | --- | --- | --- |
| Sadašnja deweb početna, kod i snimke | Vlastita stranica; javni tekst potvrđen GET-om, lokalna verzija ima dodatnu izmjenu | Strukturu, responsive izvedbu, vlastiti vizualni rad | Uspjeh klijenta ili rast prodaje |
| Kontakt komponenta i server obrada | Implementirana funkcija vlastite stranice | Postojanje kontaktnog toka i validacije | Učinkovitost akvizicije ili potvrđenu dostavu u stvarnom mailboxu |
| Webshop kalkulator | Interni alat u aktivnom lokalnom razvoju; draft/noindex | Pripremu zahtjeva, validaciju, jasno razlikovanje nepotvrđene cijene | Odobren cjenik, objavljen SaaS, klijentski webshop ili prodajne rezultate |
| SVG logo i favicon | Vlastiti brand asseti | Identitet deweba | Partnerstva/certifikate |
| Hero dashboard | Dekorativni koncept/demo ilustracija | Samo ideju konsolidacije informacija | Broj stvarnih upita, statistiku ili isporučeni sustav |
| Popis osam mogućih rješenja | Ideje bez projektne evidencije | Opis mogućnosti uz jasnu oznaku | Aktivne projekte, pilote ili produkcijske reference |
| Klijentski projekti/piloti, portreti, izjave, izvještaji | Nisu dostupni u pregledanom repou | Ništa bez dodatnih izvora | Ne popunjavati praznine generiranim materijalom |

Za budući projektni dokaz potrebno je: naziv i javno dopuštena identifikacija; status (produkcija/aktivni projekt/pilot/interni alat/koncept/demo); stvarni zadatak; Dinkova točna uloga; dvije odobrene snimke; što je funkcionalno, a što tek planirano; izvor eventualnog rezultata i dopuštenje objave. Ako toga nema, nema klijentske kartice. Ne izrađivati tri demo projekta samo da bi se popunio layout.

## Tržišno i referentno istraživanje

Svi izvori pregledani 14. 9. 2026. Pregledan je sadržaj službenih stranica, ne njihove privatne analitike. Opažena struktura/poruka i **naša izvedena preporuka** odvojene su u tablici. Nisu provjeravane njihove prodajne brojke, cijene, izjave klijenata ili ukupan kvalitetni rezultat. To nije cjenovna analiza niti reprezentativan tržišni uzorak.

| Referenca i relevantnost | Opaženo na izvoru | Primjenjiv princip za deweb | Što ne preuzeti |
| --- | --- | --- | --- |
| [Ekran Studio, Hrvatska](https://www.ekran.studio/) — osobno vođen web studio, bliska pozicija | Usluga malim firmama, autor i izričite oznake vlastitog koncepta/demo projekata | Prikaz rada može biti pošten i kada nije klijentska produkcija; navesti tko radi i što je stvarno | Njihov copy, osobnost, rok odgovora ili izgled koncepata. Demo ne postaje društveni dokaz. |
| [DiMaRo reference, Hrvatska](https://dimaro.com.hr/web-dizajn-reference/) — širi IT ponuđač, usporediva prodaja web usluge, veličina tima nije utvrđena | Radovi opisani kroz djelatnost, organizaciju ponude i konkretne funkcije, s poveznicama | Svaki budući deweb primjer treba imati zadatak → odluku → prikaz; logo sam nije dovoljan | Široku taksonomiju IT usluga i duga ponavljanja te sekundarne konkurentske CTA-e. |
| [Intraweb reference, Rijeka](https://intraweb.hr/reference/) — hrvatski web/webshop ponuđač, veličina nije utvrđena | Jasno razlikuje prezentacijske stranice i web trgovine te vodi na pripadne radove | Dvije razumljive kupovne potrebe bolje su od paralelnih popisa MVP/CRM/AI | Mrežu logotipa bez vlastitih potvrđenih referenci; tvrdnju o većoj prodaji. |
| [Studio Cotton, Bristol — ecommerce](https://studiocotton.co.uk/ecommerce-websites/) i [studio](https://studiocotton.co.uk/about/) — mali neovisni tim, veći i zreliji od deweba | Ponuda veže kupčevo i trgovčevo korištenje; pokazuje radove; jasno predstavlja stvarni tim | Objasniti što posjetitelj radi i što vlasnik dobiva u svakodnevnom radu; dokaz odmah uz uslugu | Njihove cijene, opseg održavanja, rezultate ili veličinu tima kao deweb polazište. |
| [Lunamar Digital, UK](https://lunamardigital.com/) — mali studio vođen osnivačima | Konkretno označava aktivni prototip i navodi da checkout još nije konfiguriran/live | Granice rada dio su povjerenja: lokalni deweb alat smije biti vrijedan primjer uz vidljiv draft status | Pretplatni model, besplatni preview, višestruke pakete i neutemeljena očekivanja rasta. |
| [Yperspective, Delft](https://yperspective.nl/) — neovisni UX studio, precizan broj ljudi nije utvrđen | Izdvaja najnoviji webshop projekt uz jasne vrste usluga i poziv na razgovor | Jedan sadržajno dobar dokaz može vrijediti više od osam generičkih kartica | Apstraktan hero, njihove brojke i široku ponudu logotipa/aplikacija. |

Hrvatski primjeri pomažu formulirati razumljivu uslugu i povezivanje s radovima. Europski su reference za osobnost, opis isporuke i iskreno označavanje faze projekta. Nisu potvrda da određeni dizajn povećava konverziju. Marketinške tvrdnje drugih studija nisu unesene u deweb copy.

Marker i Hortus bili su kandidati u pretrazi, ali puni odgovori nisu bili uporabljivi; izostavljeni su iz usporedbe. Nijedna struktura ili stil nije kopiran. Vlastiti vizualni koncepti izvedeni su iz deweb tokena, njegova internog alata i komercijalnog problema.

## Poslovna dijagnoza

**Kome se stranica sada obraća:** malom vlasniku s raspršenim administrativnim procesima koji ne zna koje softversko rješenje tražiti. Novi blok pokušava privući i trgovca ili vlasnika kojemu treba prodajna web stranica. To su različiti početni razgovori.

**Primarna plaćena usluga sada:** prema hero poruci i većini tijela, analiza problema i izrada internog MVP/custom alata. Webshop nije primarna poruka. Hoće li prvi razgovor biti plaćen, koliko košta i što završava dogovorenom ponudom nije jasno.

**Pet sekundi:** heuristički slabo za upit „trebam web-stranicu/webshop”. H1 ne imenuje te usluge, vizual sugerira dashboard, a animacija troši vrijeme čitanja. Stvarna stopa razumijevanja nije mjerena.

**Zašto odabrati deweb:** trenutačno nije dovoljno dokazano. Moguć vjerodostojan razlog je izravan rad sa solo autorom koji zna jednostavno razložiti zahtjev i pokazati funkcioniranje vlastitog rada. To nije tvrdnja o nadmoći, iskustvu ili komercijalnom rezultatu.

**Povjerenje gradi:** pošteni draft kalkulatora, funkcionalni vlastiti rad, jasan hrvatski jezik u dijelu sadržaja, koherentan identitet, kontakt bez registracije i bez izmišljenih testimonialsa.

**Povjerenje slabi:** nedosljedna ponuda; „primjeri” bez projekata; izmišljeni dashboard brojevi; generičke vrline; nejasna solo/timska komunikacija; nedovršeni pravni tekst; previše ponavljanja prije dokaza.

**Najkraći smislen put:** razumijem uslugu → vidim jedan vjerodostojan primjer i njegovu granicu → znam što opisati → otvaram postojeći kontakt. Hero CTA smije odmah voditi na kontakt. Alat je opcionalan pomoćni put i nikad preduvjet za upit.

## Usporedba pozicioniranja A–D

Ocjene 1–10 su urednička procjena na osnovi gore navedenih dokaza, ne izmjerena potražnja ili predviđanje prihoda. „Brzina prvog posla” označava relativnu jednostavnost objašnjenja, ugovaranja i opsega, bez procjene datuma.

D = **„Web stranice i webshopovi za male tvrtke.”** Konkretna vrsta usluge, uz nastavak o preglednoj ponudi i putu do upita/kupnje, bez obećanja nastalih upita ili narudžbi.

| Kriterij | A: webshopovi za male proizvođače i trgovce | B: web i webshopovi koji stvaraju upite/narudžbe | C: prodajni digitalni sustavi | D: konkretna web usluga, bez obećanja rezultata |
| --- | ---: | ---: | ---: | ---: |
| Jasnoća | 9 | 9 | 5 | 9 |
| Vjerodostojnost sada | 5 | 5 | 5 | 8 |
| Razlikovanje | 7 | 4 | 7 | 5 |
| Dostupni dokazi | 3 | 4 | 5 | 6 |
| Širina tržišta | 5 | 8 | 8 | 8 |
| Jednostavnost puta do prvog plaćenog posla | 6 | 7 | 4 | 8 |
| Kasnije širenje | 6 | 8 | 9 | 8 |

A može postati najbolja niša nakon potvrđenog webshop projekta i pristupa tim kupcima; sada nema podloge za specijalizaciju na proizvođače. B jasno komunicira posao, ali formulacija „stvaraju” sugerira učinak koji nemamo čime potkrijepiti. C odgovara budućoj širini, ali posjetitelj mora najprije učiti pojam „prodajni sustav”; vraća nas na problem apstrakcije.

D je preporučena radna pozicija. Nije izrazito originalna sama po sebi; razlikovanje mora doći iz konkretnog primjera, razumljivih objašnjenja i izravne suradnje. Kao početni prodajni fokus predlaže se ograničeni projekt web/landing stranice, uz webshop kao jasno imenovanu zasebnu vrstu projekta. Dinko mora potvrditi da to odgovara njegovom kapacitetu i stvarnim potencijalnim kupcima.

## Odluke i sadržaj za Dinka

1. Primarna usluga za prvi plaćeni posao: web/landing projekt ili webshop; koje dodatne usluge sada stvarno preuzima (sadržaj, kampanje, mjerenje, održavanje).
2. Prva publika i put do nje: uslužne male tvrtke ili trgovci/proizvođači. Ako postoji topli konkretni lead ili dovršen projekt, to može promijeniti preporuku.
3. Osobni javni nastup: ime, kratka istinita biografija, opseg osobne odgovornosti i želi li autentičan portret. Bez fotografije koncept i dalje radi.
4. Dostupni projekti izvan ovog repoa: točan status, vlastiti doprinos, odobrene snimke i dopuštenje spominjanja. Bez toga ostaje samo vlastiti rad.
5. Komercijalni proces: je li početno razjašnjenje naplativo, što se dobiva nakon upita i kakav odgovor realno može obećati. Nema proizvoljnog besplatnog audita ili roka.
6. Mikroalat: ostaje li samo lokalni dokaz u razvoju ili kasnije dopušta javnu pripremu opsega. Cjenovna aktivacija ostaje zasebno BLOCKED.
7. Pravni sadržaj i eventualno buduće mjerenje: potvrditi točan sadržaj/operatora i odvojeno odobriti instrumentaciju ako je želi.

Ovi odgovori potrebni su za konačan copy i implementacijski brief, **ne za dovršetak ovog istraživanja**.
