export const VERIFIED = "2026-11-17";
export const ASSESSMENT_PERIOD = "Pravila od 17. 11. 2026. nadalje";
export const LEGACY_REFERENCE = "2. 5. 2025.";
export const GENERAL_REFERENCE = "10. 9. 2026.";

const nn = "https://narodne-novine.nn.hr/clanci/sluzbeni/";
const law = `${nn}2022_02_19_203.html`;
const amendment = `${nn}2026_06_59_728.html`;
const source = (title: string, url: string, section: string, scope: string, applies: string, type = "Objavljeni propis") =>
  ({ title, url, section, scope, applies, type, checked: VERIFIED });
const base = (section: string, scope: string) => source("NN 132/2026-1583", `${nn}2026_11_132_1583.html`, section, scope, "od 17. 11. 2026.");
const list = (section: string, scope: string) => source("NN 132/2026-1584", `${nn}2026_11_132_1584.html`, section, scope, "od 17. 11. 2026.");

export const sources = {
  consumer: source("ZZP · NN 19/2022", law, "čl. 4. i 5.", "Potrošač, trgovac i proizvod", "od 28. 5. 2022.; čitati s izmjenama"),
  article7: source("ZZP · NN 59/2026", amendment, "čl. 4. i 66. (novi čl. 7. st. 1.–9. ZZP-a)", "Bazna i jedinična cijena te objava cjenika", "od 17. 11. 2026."),
  unit: source("Pravilnik · NN 105/2026", `${nn}2026_09_105_1270.html`, "čl. 3.–9.", "Jedinične cijene robe i cjenik usluga na prodajnom mjestu", "od 26. 9. 2026."),
  discount: source("ZZP · NN 19/2022", law, "čl. 8. st. 4. i čl. 19. st. 4.–7.", "Posebni oblici prodaje i prikaz prethodne cijene", "od 28. 5. 2022.; čitati s izmjenama"),
  discountChange: source("ZZP · NN 59/2026", amendment, "čl. 10.–14. i 66. (čl. 19.–24. ZZP-a)", "Posebni oblici prodaje, lako kvarljiva roba i roba pred istekom", "od 17. 6. 2026."),
  discountConditions: source("ZZP · NN 19/2022", law, "čl. 8. st. 3. i 4.", "Posebni uvjeti prodaje i popust na proizvode", "od 28. 5. 2022.; čitati s izmjenama"),
  discountSale: source("ZZP · NN 59/2026", amendment, "čl. 19. st. 4. ZZP-a (izmjena čl. 10.)", "Najniža cijena pri prodaji robe", "od 17. 6. 2026."),
  discountAd: source("ZZP · NN 59/2026", amendment, "čl. 19. st. 6. ZZP-a (izmjena čl. 10.)", "Najniža cijena u oglasu za robu", "od 17. 6. 2026."),
  discountService: source("ZZP · NN 59/2026", amendment, "čl. 19. st. 7. i 8. ZZP-a (izmjena čl. 10.)", "Najniža cijena pri sniženju usluge i iznimke", "od 17. 6. 2026."),
  discountExpiry: source("ZZP · NN 59/2026", amendment, "čl. 19. st. 5. i čl. 24. ZZP-a", "Posebni oblici prodaje kvarljive robe i robe pred istekom", "od 17. 6. 2026."),
  euDiscount: source("Smjernice Europske komisije · 2021/C 526/02", "https://eur-lex.europa.eu/legal-content/HR/TXT/?uri=oj%3AJOC_2021_526_R_0002", "t. 2.1. i 2.3.", "Personalizirani popusti i različiti prodajni kanali za robu", "objavljeno 29. 12. 2021.", "Službeno pojašnjenje"),
  baseRule: base("čl. 3.–8.", "Bazna cijena, izuzeća, prodaja i oglašavanje"),
  baseLegacy: base("čl. 3. st. 1. podst. 1.", "Šest skupina na dan 2. 5. 2025."),
  baseLegacyNew: base("čl. 3. st. 1. podst. 2.", "Šest skupina nakon 2. 5. 2025."),
  baseGeneral: base("čl. 3. st. 1. podst. 3.", "Ostala roba i usluge na dan 10. 9. 2026."),
  baseGeneralNew: base("čl. 3. st. 1. podst. 4.", "Ostala roba i usluge nakon 10. 9. 2026."),
  baseLegacyDiscount: base("čl. 3. st. 2.", "Popust na dan 2. 5. 2025."),
  baseLegacyNewDiscount: base("čl. 3. st. 3.", "Popust pri uvrštenju nakon 2. 5. 2025."),
  baseGeneralDiscount: base("čl. 3. st. 4.", "Popust na dan 10. 9. 2026."),
  baseGeneralNewDiscount: base("čl. 3. st. 5.", "Popust pri uvrštenju nakon 10. 9. 2026."),
  baseExceptions: base("čl. 4. st. 1. i 2.", "Izuzeća za konkretnu cijenu"),
  baseIntermediary: base("čl. 4. st. 3.", "Tuđe cijene na posredničkom kanalu"),
  baseGoods: base("čl. 5. st. 1.–3.", "Prikaz bazne cijene robe"),
  baseService: base("čl. 6. st. 1.–4.", "Prikaz bazne cijene usluge"),
  baseMandatoryAd: base("čl. 7. st. 1.", "Tiskani i televizijski oglasi s cijenom"),
  baseOptionalAd: base("čl. 7. st. 2.", "Dobrovoljan istak u ostalim oglasima s cijenom"),
  baseOldPrint: base("čl. 8.", "Prijelaz za ranije izrađene tiskane oglase"),
  listRule: list("čl. 3.–6.", "Sadržaj, izuzeća i način objave"),
  listGoods: list("čl. 3. st. 1., 2. i 4.", "Objava i redoslijed podataka za robu"),
  listService: list("čl. 3. st. 1., 3. i 4.", "Objava i redoslijed podataka za usluge"),
  listLocations: list("čl. 3. st. 5.–7.", "Rok do 11:00, arhiva 15 dana i prodajna mjesta"),
  listExceptions: list("čl. 4. st. 1. i 2.", "Izuzeća za konkretnu cijenu"),
  listIntermediary: list("čl. 4. st. 3.", "Posredničke platforme i kanali"),
  listAccess: list("čl. 5. i 6.", "Strojno dohvaćanje, isti URL i format datoteke"),
};
export type SourceId = keyof typeof sources;
export const mainSources = ["consumer", "article7", "baseRule", "listRule", "unit", "discount", "discountChange", "euDiscount"] as const;

export const questions = {
  buyers: ["Tko kod vas kupuje?", { consumer: "Građani koji kupuju za sebe", company: "Poslovni kupci (tvrtke i obrti)", institution: "Ustanove", buyer: "Otkupljivači", unknown: "Ne znam", other: "Drugo" }],
  roles: ["Koja je vaša uloga u prodaji?", { own: "Ja prodajem izravno", platform: "Ja prodajem preko tuđe stranice ili posrednika", display: "Samo prikazujem tuđe ponude ili povezujem kupca s prodavateljem", fee: "Kupcu naplaćujem svoju naknadu", unknown: "Ne znam", other: "Drugo" }],
  kinds: ["Što nudite?", { goods: "Roba", service: "Usluga", rent: "Najam", stay: "Smještaj", travel: "Prijevoz", ticket: "Ulaznice", digital: "Digitalni sadržaj", subscription: "Pretplata", bundle: "Paket robe i usluga", voucher: "Vaučer ili poklon bon", unknown: "Ne znam", other: "Drugo" }],
  goods: ["Kakvu robu prodajete i kako je pakirana?", { new: "Nova", used: "Rabljena", packed: "Pakirana", loose: "Rasuta roba (npr. jabuke na kilogram)", pieces: "Na komad, bez pakiranja", custom: "Po mjeri ili u više varijanti", defect: "Roba s greškom", expiry: "Lako kvarljiva ili pred istekom roka", auction: "Javna dražba, umjetnička djela ili antikviteti", standard: "Ništa od navedenoga", unknown: "Ne znam", other: "Drugo" }],
  activity: ["Koju djelatnost obavljate za ovu ponudu?", { retail: "Registrirana trgovina na malo", opg: "Upisani OPG koji prodaje izravno", service: "Pružam usluge", other: "Druga djelatnost", unknown: "Ne znam" }],
  legacy: ["Pripada li roba koju provjeravate ovom popisu?", { yes: "Da, roba je iz popisa", no: "Ne, druga roba", mixed: "Imam robu iz popisa i drugu robu", unknown: "Ne znam" }],
  unit: ["Je li vaša roba na ovom popisu?", { yes: "Da, na popisu je", no: "Ne, nije na popisu", unknown: "Ne znam" }],
  unitException: ["Odnosi li se nešto od ovoga na vašu robu?", { same: "Cijena po kg, l ili drugoj jedinici jednaka je prodajnoj cijeni", small: "Manje od 50 g ili 50 ml", gift: "Poklon paket ili komplet", special: "Roba na akciji, sniženju ili u drugom posebnom obliku prodaje", treats: "Poslastice za kućne ljubimce ili kolači", limits: "Alkohol do 100 ml ili smrznuti desert do 500 ml", pieces: "Voće ili povrće na komad ili u svežnju", free: "Besplatna roba", none: "Nijedno", unknown: "Ne znam", other: "Drugo" }],
  pricing: ["Kako određujete cijenu kupcu?", { fixed: "Fiksna cijena (npr. 30 € za komad)", hour: "Satnica", measure: "Po količini (npr. €/kg ili €/m²)", fee: "Fiksna doplata ili izlazak", quote: "Zasebna ponuda za svakog kupca nakon procjene", dynamic: "Cijena se mijenja s terminom ili potražnjom", unknown: "Ne znam", other: "Drugo" }],
  regulation: ["Uređuje li cijenu poseban propis ili drugi pravni akt?", { market: "Ne, cijenu određujem samostalno", regulated: "Da, cijenu uređuje poseban propis ili drugi pravni akt", unknown: "Ne znam", other: "Drugo" }],
  priceException: ["Vrijedi li nešto od ovoga za ovu cijenu?", {
    group: "Popust samo za određenu skupinu kupaca", payment: "Popust samo za određeni način plaćanja",
    personal: "Cijena je samo za jednog kupca i ne može se objektivno usporediti",
    dynamic: "Cijena se mijenja i nema unaprijed usporedivih elemenata za povijesni datum",
    none: "Ništa od navedenoga", unknown: "Ne znam",
  }],
  sales: ["Gdje kupac može kupiti?", { shop: "Fizička poslovnica", outlet: "Outlet", stand: "Štand ili tržnica", fair: "Sajam", door: "Kod kupca ili na kućnom pragu", webshop: "Vlastiti webshop", booking: "Stranica za rezervacije", market: "Tuđa platforma za prodaju (marketplace)", social: "Društvena mreža (npr. Instagram)", messages: "Poruke, telefon ili e-pošta", vending: "Prodajni automat", none: "Još nema prodaje", unknown: "Ne znam", other: "Drugo" }],
  website: ["Imate li svoj web?", { shop: "Vlastiti webshop", info: "Vlastiti web bez košarice", none: "Nemam vlastiti web", unknown: "Ne znam", other: "Drugo" }],
  ads: ["Gdje oglašavate ovu ponudu s cijenom?", { web: "Vlastiti web ili webshop", market: "Tuđa stranica za prodaju ili rezervacije", social: "Javne objave na društvenim mrežama", paid: "Plaćeni oglasi na internetu", mail: "Newsletter s ponudom za sve primatelje", print: "Letci, katalozi ili plakati", tv: "Televizija (TV)", radio: "Radio", none: "Nigdje ne oglašavam cijenu", unknown: "Ne znam", other: "Drugo" }],
  printTiming: ["Kada su izrađeni tiskani oglasi?", { new: "Na dan početka primjene ili kasnije", old: "Prije 17. 11. 2026.", unknown: "Ne znam" }],
  territory: ["U kojim državama nudite ovu ponudu?", { hr: "Hrvatska", foreign: "Druge države", unknown: "Ne znam", other: "Drugo" }],
  locations: ["Imate li isti cjenik na svim prodajnim mjestima?", { one: "Prodajem samo na jednom mjestu", same: "Isti cjenik na svim prodajnim mjestima", different: "Cjenici se razlikuju među prodajnim mjestima", sellers: "Više prodavatelja, svaki sa svojim cjenikom", unknown: "Ne znam", other: "Drugo" }],
  history: ["Je li ista roba ili usluga tada već bila u ponudi?", { existing: "Da, već je bila u ponudi", stock: "Da, ali taj dan nije bilo zalihe", new: "Ne, prvi put je ponuđena poslije tog dana", renamed: "Da, poslije je promijenjen samo naziv ili šifra", changed: "Izmijenjeni proizvod ili usluga prvi put su ponuđeni poslije tog dana", unknown: "Ne znam" }],
  referenceDiscount: ["Je li na taj dan za tu robu ili uslugu vrijedio popust za sve kupce?", { regular: "Ne, vrijedila je redovna cijena", promo: "Da, vrijedila je akcijska cijena ili drugi popust za tu robu ili uslugu", unknown: "Ne znam" }],
  proof: ["Imate li podatke za utvrđivanje bazne cijene?", { yes: "Da, imam cjenik ili evidenciju cijena", no: "Nemam podatke", unknown: "Ne znam gdje provjeriti" }],
  discount: ["Nudite li sada popust?", { public: "Javno sniženje, akcija ili rasprodaja", coupon: "Kupon ili kod dostupan svima", personal: "Popust dogovoren s jednim kupcem", targeted: "Popust samo za skupinu kupaca ili način plaćanja", expiry: "Sniženje jer se roba brzo kvari ili joj istječe rok", none: "Nema sniženja", unknown: "Ne znam", other: "Drugo" }],
  discountProof: ["Imate li cijene za svih 30 dana prije početka sniženja?", { full: "Da, imam cijelu evidenciju", partial: "Imam samo dio cijena", first: "Ovo je prva prodaja, ranije cijene nema", unknown: "Ne znam" }],
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
