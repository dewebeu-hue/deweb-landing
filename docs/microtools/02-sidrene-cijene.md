# Moram li isticati sidrenu cijenu?

Upitnik na /alati/sidrene-cijene primjenjuje objavljene propise za hrvatsko tržište od 17. studenoga 2026. Odgovori ostaju u memoriji otvorene stranice. Zasebno unesite ponude ako se razlikuju kupci, prodavatelj, cijene, način formiranja cijene, povijest ili opseg popusta.

Poveznice za pomoć vode na postojeći kontaktni obrazac s vrstom projekta „Bazne cijene i mrežni cjenik”. Korisnik može odabrati doradu webshopa, mrežni cjenik i arhivu, podatke za poslovnicu ili sajam, povezivanje sustava ili početni dogovor. Odabir ide u upit zajedno s imenom, nazivom firme ili obrta, e-poštom i opisom potrebe. Opseg, cijena i rok dogovaraju se nakon pregleda podataka i sustava.

## Izvori i pravila

- [Bazna cijena, NN 132/2026-1583](https://narodne-novine.nn.hr/clanci/sluzbeni/2026_11_132_1583.html). Čl. 3. st. 1. određuje 2. 5. 2025. za šest skupina robe i 10. 9. 2026. za ostalu robu i usluge te upućuje na dan prvog uvrštenja ako je ponuda novija. Ako je na odgovarajući dan vrijedio popust, st. 2.–3. za šest skupina koriste najnižu maloprodajnu cijenu u 30 dana prije početka tadašnjeg popusta, a st. 4.–5. za ostalu robu i usluge koriste prethodno primijenjenu maloprodajnu cijenu.
- Čl. 4. istog pravilnika primjenjuje se na konkretnu cijenu uređenu posebnim aktom, cijenu za određenu skupinu potrošača ili način plaćanja, pojedinačnu neusporedivu cijenu, dinamičku cijenu bez objektivne usporedbe, cijenu na automatu i posredovanje za tuđu ponudu. Vlastita naknada posrednika procjenjuje se kao njegova usluga. Čl. 5.–6. uređuju prikaz pri prodaji. Čl. 7. razlikuje tiskani i TV oglas s maloprodajnom cijenom od ostalih oglasa. Čl. 8. daje 30 dana od početka primjene za ranije izrađeni tiskani materijal.
- [Mrežni cjenik, NN 132/2026-1584](https://narodne-novine.nn.hr/clanci/sluzbeni/2026_11_132_1584.html). Čl. 3. propisuje sadržaj i redoslijed stupaca, objavu izmjene do 11:00 na dan izmjene, arhivu 15 dana od zamjene te objavu po prodajnom mjestu ako cjenici nisu isti. Čl. 4. određuje izuzeća po cijeni i posredničkom kanalu. Čl. 5. traži automatizirano dohvaćanje, a čl. 6. uređuje CSV ili XML, isti URL za izmjenu, naziv i strukturu datoteke te kodiranje.
- [ZZP, NN 19/2022](https://narodne-novine.nn.hr/clanci/sluzbeni/2022_02_19_203.html) i [izmjene NN 59/2026](https://narodne-novine.nn.hr/clanci/sluzbeni/2026_06_59_728.html). Čl. 4.–5. određuju potrošački opseg. Čl. 7. uređuje cijene i objavu cjenika. Čl. 8. i 19.–24. primjenjuju se zasebno na aktualni popust. Kod javne akcije najniža cijena u 30 dana računa se prije početka te akcije.
- [NN 105/2026, čl. 3.–9.](https://narodne-novine.nn.hr/clanci/sluzbeni/2026_09_105_1270.html) uređuje prikaz maloprodajne cijene, jedinične cijene robe i cjenik usluga na prodajnom mjestu.

## Provjera činjenica i rezultata

- „Potrebna provjera” uz pojedinu stavku navodi činjenicu koja nedostaje, primjerice je li na povijesni datum vrijedio popust ili jesu li cjenici prodajnih mjesta isti. Kad obveza vrijedi, a povijesni iznos nije potvrđen, rezultat zadržava obvezu i traži provjeru iznosa.
- Objava cijene na Instagramu odvojeno se procjenjuje od prodaje preko istog profila. Kupci koji kupuju za osobnu uporabu odvojeni su od otkupljivača i poslovnih kupaca. Za jednu domenu u rezultatu je jedan pregled objave sa stavkama po prodajnim mjestima i vrstama ponude.
- Programska provjera obuhvaća četiri grane povijesnog popusta, OPG i otkup, Instagram prodaju i oglas, tiskani i TV oglas, outlet i webshop te posrednika s vlastitom naknadom. Izvori i članci su u lib/sidrene-cijene-podaci.ts, a odluke i upute u lib/sidrene-cijene.ts.
