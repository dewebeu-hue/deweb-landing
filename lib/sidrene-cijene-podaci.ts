export const VERIFIED = "2026-11-16";
export const ASSESSMENT_PERIOD = "Pravila od 17. 11. 2026. nadalje";

const nn = "https://narodne-novine.nn.hr/clanci/sluzbeni/";
const law = `${nn}2022_02_19_203.html`;
const amendment = `${nn}2026_06_59_728.html`;
const legacy = `${nn}2025_05_75_979.html`;
const source = (title: string, url: string, section: string, scope: string, applies: string, type = "Objavljeni propis") =>
  ({ title, url, section, scope, applies, type, checked: VERIFIED });

export const sources = {
  consumer: source("ZZP · NN 19/2022", law, "čl. 4. i 5.", "Potrošač, trgovac i proizvod", "od 28. 5. 2022.; čitati s izmjenama"),
  article7: source("ZZP · NN 59/2026", amendment, "čl. 4. i 66. (novi čl. 7. st. 1.–9. ZZP-a)", "Bazna i jedinična cijena te objava cjenika", "od 17. 11. 2026."),
  unit: source("Pravilnik · NN 105/2026", `${nn}2026_09_105_1270.html`, "čl. 3.–9.", "Jedinične cijene robe i cjenik usluga na prodajnom mjestu", "od 26. 9. 2026."),
  discount: source("ZZP · NN 19/2022", law, "čl. 8. st. 4. i čl. 19. st. 4.–7.", "Posebni oblici prodaje i prikaz prethodne cijene", "od 28. 5. 2022.; čitati s izmjenama"),
  discountChange: source("ZZP · NN 59/2026", amendment, "čl. 10.–14. i 66. (čl. 19.–24. ZZP-a)", "Posebni oblici prodaje, lako kvarljiva roba i roba pred istekom", "od 17. 6. 2026."),
  euDiscount: source("Smjernice Europske komisije · 2021/C 526/02", "https://eur-lex.europa.eu/legal-content/HR/TXT/?uri=oj%3AJOC_2021_526_R_0002", "t. 2.1. i 2.3.", "Personalizirani popusti i različiti prodajni kanali za robu", "objavljeno 29. 12. 2021.", "Službeno pojašnjenje"),
  legacyBase: source("Odluka · NN 75/2025", legacy, "t. VI.–VII.", "Referenca ranije dodatne cijene za šest skupina robe", "raniji režim od 15. 5. 2025."),
  decisionBase: source("Odluka · NN 101/2026", `${nn}2026_09_101_1212.html`, "t. II.–VI.", "Dodatna cijena robe i usluga", "objavljena; stupanje na snagu pomaknuto na 17. 11. 2026.; najavljen prestanak"),
  decisionList: source("Odluka · NN 101/2026", `${nn}2026_09_101_1213.html`, "t. II.–IX.", "Mrežni cjenici robe i usluga", "objavljena; stupanje na snagu pomaknuto na 17. 11. 2026.; najavljen prestanak"),
  postponeBase: source("Izmjena · NN 110/2026", `${nn}2026_09_110_1309.html`, "t. I.–II.", "Odgoda odluke o dodatnoj cijeni", "od 30. 9. 2026."),
  postponeList: source("Izmjena · NN 110/2026", `${nn}2026_09_110_1310.html`, "t. I.–II.", "Odgoda odluke o mrežnim cjenicima", "od 30. 9. 2026."),
  ministry: source("Ministarstvo gospodarstva · pojašnjenja", "https://mingo.gov.hr/vijesti/pojasnjenja-za-primjenu-dodatne-cijene-i-objavu-cjenika-od-1-listopada/10440", "Odjeljci o prikazu, iznimkama i mrežnim stranicama", "Odluke NN 101/2026; ne tumači konačne pravilnike", "22. 9. 2026.; rok u objavi naknadno odgođen", "Službeno pojašnjenje"),
  opg: source("Savjetodavna · pojašnjenje za OPG", "https://savjetodavna.mps.hr/2026/10/01/obveza-isticanja-dodatne-sidrene-cijene-i-objave-cjenika-proizvoda-i-usluga/", "Uvod i odjeljak o dodatnoj cijeni", "Registrirani OPG u ranijem režimu; tumačenje odluka", "1. 10. 2026.; ne zamjenjuje pravilnik", "Službeno pojašnjenje"),
  draftBase: source("e-Savjetovanje 10333", "https://esavjetovanja.gov.hr/Econ/10333", "Prijedlog pravilnika o isticanju bazne cijene", "Referentni dan, obuhvat, izuzeća i način prikaza", "najavljeno 17. 11. 2026.; konačna objava nije potvrđena", "Nacrt ili najava"),
  draftList: source("e-Savjetovanje 10332", "https://esavjetovanja.gov.hr/Econ/10332", "Prijedlog pravilnika o načinu objave cjenika", "Obuhvat, format, polja, rokovi i arhiva mrežnog cjenika", "najavljeno 17. 11. 2026.; konačna objava nije potvrđena", "Nacrt ili najava"),
  consultation: source("Ministarstvo gospodarstva · savjetovanja", "https://mingo.gov.hr/vijesti/ministar-susnjar-kroz-dijalog-s-gospodarstvenicima-do-provedivih-pravila-i-vece-zastite-potrosaca/10461", "Odjeljci o referentnim datumima i savjetovanjima", "Najava obuhvata, iznimaka i trajanja savjetovanja", "savjetovanja 14. 10.–13. 11. 2026.", "Nacrt ili najava"),
  government: source("Vlada RH · objava od 14. 11.", "https://vlada.gov.hr/inspektorat-nece-kaznjavati-zbog-baznih-cijena-nego-upozoravati/47604", "Izjava o početku primjene i nadzoru", "Najavljeni edukativni pristup nadzoru; nije izuzeće", "14. 11. 2026.; trajanje nije određeno", "Nacrt ili najava"),
  repeal: source("Vlada RH · 225. sjednica", "https://vlada.gov.hr/225-sjednica-vlade-47594/47594", "Dnevni red, prijedlozi a)–c) o prestanku važenja", "Prestanak važenja odluka NN 75/2025 i NN 101/2026", "sjednica 14. 11. 2026.; konačna objava nije potvrđena", "Nacrt ili najava"),
};
export type SourceId = keyof typeof sources;

export const consultationReports: Record<"draftBase" | "draftList", string | null> = { draftBase: null, draftList: null };

export const questions = {
  buyers: ["Tko kupuje ovu ponudu?", { consumer: "Građani za osobnu uporabu", company: "Poslovni kupci", institution: "Ustanove", buyer: "Otkupljivači", unknown: "Ne znam", other: "Drugo" }],
  roles: ["Tko prodaje i tko naplaćuje?", { own: "Ja prodajem izravno", platform: "Ja sam prodavatelj preko posrednika", display: "Prikazujem ili posredujem tuđe ponude", fee: "Potrošaču naplaćujem vlastitu naknadu", unknown: "Ne znam", other: "Drugo" }],
  kinds: ["Što nudite?", { goods: "Roba", service: "Usluga", rent: "Najam", stay: "Smještaj", travel: "Prijevoz", ticket: "Ulaznice", digital: "Digitalni sadržaj", subscription: "Pretplata", bundle: "Paket robe i usluga", voucher: "Vaučer ili poklon bon", unknown: "Ne znam", other: "Drugo" }],
  goods: ["Što opisuje robu?", { new: "Nova", used: "Rabljena", packed: "Pakirana", loose: "U rasutom stanju (npr. na kilogram)", pieces: "Na komad, bez pakiranja", custom: "Po mjeri ili u varijantama", defect: "Roba s greškom", expiry: "Lako kvarljiva ili pred istekom", auction: "Javna dražba, umjetnička djela ili antikviteti", standard: "Ništa od navedenoga", unknown: "Ne znam", other: "Drugo" }],
  activity: ["U kojem svojstvu nudite ovu ponudu?", { retail: "Registrirana trgovina na malo", opg: "Upisani OPG (izravna prodaja)", service: "Pružatelj usluga", other: "Druga djelatnost", unknown: "Ne znam" }],
  legacy: ["Pripada li roba ranijim skupinama proizvoda?", { yes: "Da: hrana, piće, kozmetika, čišćenje, toaletne potrepštine ili proizvodi za kućanstvo", no: "Ne, druga skupina", unknown: "Ne znam" }],
  unit: ["Pripada li roba kategorijama s jediničnom cijenom?", { yes: "Da: hrana i hrana za životinje, deterdženti, pelene, boje i lakovi (osim slikarskih), motorna ulja i tekućine, destilirana voda, njega i higijena tijela, kose ili zubi", no: "Ne, nijedna od navedenih kategorija", unknown: "Ne znam" }],
  unitException: ["Vrijedi li neko izuzeće za jediničnu cijenu?", { same: "Jedinična i maloprodajna cijena imaju isti iznos", small: "Manje od 50 g ili 50 ml", gift: "Poklon paket ili komplet", special: "Roba u posebnom obliku prodaje", treats: "Poslastice za kućne ljubimce ili kolači", limits: "Alkohol do 100 ml ili smrznuti desert do 500 ml", pieces: "Voće ili povrće na komad ili u svežnju", free: "Besplatna roba", none: "Nijedno", unknown: "Ne znam", other: "Drugo" }],
  pricing: ["Kako nastaje cijena?", { fixed: "Fiksni iznos", hour: "Satnica", measure: "Cijena po jedinici mjere", fee: "Fiksna doplata ili izlazak", quote: "Individualna ponuda nakon procjene", dynamic: "Dinamička cijena (npr. po terminu ili potražnji)", unknown: "Ne znam", other: "Drugo" }],
  regulation: ["Uređuje li poseban propis cijenu usluge ili robe?", { market: "Tržišna cijena", regulated: "Cijena uređena posebnim propisom", unknown: "Ne znam", other: "Drugo" }],
  sales: ["Gdje se ova ponuda stvarno prodaje?", { shop: "Fizička poslovnica", outlet: "Outlet", stand: "Štand ili tržnica", fair: "Sajam", door: "Kućni prag ili kod kupca", webshop: "Vlastiti webshop", booking: "Rezervacijski sustav", market: "Marketplace ili portal posrednika", social: "Društvena mreža (npr. Instagram)", messages: "Poruke, telefon ili e-pošta", none: "Još nema prodaje", unknown: "Ne znam", other: "Drugo" }],
  website: ["Imate li vlastitu mrežnu stranicu?", { shop: "Vlastiti webshop", info: "Prezentacijski web bez košarice", none: "Nemam vlastiti web (mogu imati profil ili marketplace)", unknown: "Ne znam", other: "Drugo" }],
  ads: ["Gdje javno prikazujete iznose za ovu ponudu?", { web: "Vlastiti web ili webshop", market: "Marketplace ili rezervacijski portal", social: "Javne objave na društvenim mrežama", paid: "Plaćeni digitalni oglasi", mail: "Newsletter s javnom ili općom ponudom", print: "Letci, katalozi ili plakati", broadcast: "TV ili radio", none: "Nigdje ne oglašavam iznos", unknown: "Ne znam", other: "Drugo" }],
  territory: ["Na koja je tržišta ponuda usmjerena?", { hr: "Hrvatska", foreign: "Druge države", unknown: "Ne znam", other: "Drugo" }],
  locations: ["Kako se cijene razlikuju po mjestima prodaje?", { one: "Jedno mjesto ili kanal", same: "Ista cijena na više mjesta", different: "Različite cijene po mjestima ili kanalima", sellers: "Više prodavatelja s vlastitim cijenama", unknown: "Ne znam", other: "Drugo" }],
  prior: ["Jeste li za isti artikl već morali isticati dodatnu cijenu?", { yes: "Da, prema ranijoj odluci", no: "Ne", unknown: "Ne znam" }],
  history: ["Što znate o ponudi na referentni dan?", { existing: "Ista ponuda i redovna cijena su postojale", stock: "Ponuda je postojala, privremeno bez zalihe", new: "Prvi put je ponuđena poslije tog dana", renamed: "Ista ponuda je dobila novu šifru ili naziv", changed: "Novo izdanje: promijenjen je proizvod ili sadržaj ponude", promo: "Ponuda je taj dan bila na akciji", unknown: "Ne znam", other: "Drugo" }],
  proof: ["Možete li dokazati redovnu ili početnu cijenu?", { yes: "Da, imam datirani cjenik, izvoz ili drugu evidenciju", no: "Nemam dokaz", unknown: "Ne znam gdje provjeriti" }],
  discount: ["Kako nudite popust za ovu ponudu?", { public: "Javno sniženje, akcija ili rasprodaja", coupon: "Javno dostupan kupon ili kod", personal: "Stvarno individualni popust", expiry: "Posebna prodaja zbog kvarljivosti ili isteka roka", none: "Nema sniženja", unknown: "Ne znam", other: "Drugo" }],
  discountProof: ["Imate li evidenciju cijena prije sniženja za isto mjesto?", { full: "Imam potpunu povijest za prethodnih 30 dana", partial: "Povijest je nepotpuna", first: "Prva prodaja, nema prethodne cijene", unknown: "Ne znam" }],
} as const;

export type QuestionId = keyof typeof questions;
export type Answers = Partial<{ [K in QuestionId]: readonly (keyof typeof questions[K][1])[] }>;
export const websiteTypes = ["shop", "info"] as const;
export type WebsiteType = typeof websiteTypes[number];
export type Offer = { id: number; name: string; answers: Answers; websiteDomains?: Partial<Record<WebsiteType, string>> };
export const offerName = (offer: Offer, index: number) => offer.name.trim() || `Ponuda ${index + 1}`;

export function websiteDomain(value: string | undefined): string | undefined {
  const input = value?.trim();
  if (!input) return;
  try {
    const url = new URL(input.includes("://") ? input : `https://${input}`);
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) return;
    const host = url.hostname.replace(/^www\./, "").replace(/\.$/, "");
    if (host.includes(".") && /^[a-z0-9-]+(?:\.[a-z0-9-]+)+$/.test(host)) return host;
  } catch {
    return;
  }
}
export const selects = <K extends QuestionId>(answers: Answers, key: K, ...values: (keyof typeof questions[K][1])[]) =>
  values.some(value => (answers[key] as readonly unknown[] | undefined)?.includes(value));
export const selected = (answers: Answers, key: QuestionId): readonly string[] => (answers[key] as readonly string[] | undefined) ?? [];
export const label = (key: QuestionId, value: string): string => (questions[key][1] as Record<string, string>)[value] ?? value;
