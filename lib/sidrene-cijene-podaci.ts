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
  repeal: source("Vlada RH · 225. sjednica", "https://vlada.gov.hr/225-sjednica-vlade-republike-hrvatske-47600/47600", "Dnevni red, prijedlozi a)–c) o prestanku važenja", "Prestanak važenja odluka NN 75/2025 i NN 101/2026", "sjednica 14. 11. 2026.; konačna objava nije potvrđena", "Nacrt ili najava"),
};
export type SourceId = keyof typeof sources;

export const consultationReports: Record<"draftBase" | "draftList", string | null> = { draftBase: null, draftList: null };

export const questions = {
  buyers: ["Tko kod vas kupuje?", { consumer: "Građani koji kupuju za sebe", company: "Poslovni kupci (tvrtke i obrti)", institution: "Ustanove", buyer: "Otkupljivači", unknown: "Ne znam", other: "Drugo" }],
  roles: ["Koja je vaša uloga u prodaji?", { own: "Ja prodajem izravno", platform: "Ja prodajem preko tuđe stranice ili posrednika", display: "Samo prikazujem tuđe ponude ili povezujem kupca s prodavateljem", fee: "Kupcu naplaćujem svoju naknadu", unknown: "Ne znam", other: "Drugo" }],
  kinds: ["Što nudite?", { goods: "Roba", service: "Usluga", rent: "Najam", stay: "Smještaj", travel: "Prijevoz", ticket: "Ulaznice", digital: "Digitalni sadržaj", subscription: "Pretplata", bundle: "Paket robe i usluga", voucher: "Vaučer ili poklon bon", unknown: "Ne znam", other: "Drugo" }],
  goods: ["Kakvu robu prodajete i kako je pakirana?", { new: "Nova", used: "Rabljena", packed: "Pakirana", loose: "Rasuta roba (npr. jabuke na kilogram)", pieces: "Na komad, bez pakiranja", custom: "Po mjeri ili u više varijanti", defect: "Roba s greškom", expiry: "Lako kvarljiva ili pred istekom roka", auction: "Javna dražba, umjetnička djela ili antikviteti", standard: "Ništa od navedenoga", unknown: "Ne znam", other: "Drugo" }],
  activity: ["Koju djelatnost obavljate za ovu ponudu?", { retail: "Registrirana trgovina na malo", opg: "Upisani OPG koji prodaje izravno", service: "Pružam usluge", other: "Druga djelatnost", unknown: "Ne znam" }],
  legacy: ["Prodajete li nešto iz ovih skupina?", { yes: "Da, iz popisa iznad", no: "Ne, druga roba", unknown: "Ne znam" }],
  unit: ["Je li vaša roba na ovom popisu?", { yes: "Da, na popisu je", no: "Ne, nije na popisu", unknown: "Ne znam" }],
  unitException: ["Odnosi li se nešto od ovoga na vašu robu?", { same: "Cijena po kg, l ili drugoj jedinici jednaka je prodajnoj cijeni", small: "Manje od 50 g ili 50 ml", gift: "Poklon paket ili komplet", special: "Roba na akciji, sniženju ili u drugom posebnom obliku prodaje", treats: "Poslastice za kućne ljubimce ili kolači", limits: "Alkohol do 100 ml ili smrznuti desert do 500 ml", pieces: "Voće ili povrće na komad ili u svežnju", free: "Besplatna roba", none: "Nijedno", unknown: "Ne znam", other: "Drugo" }],
  pricing: ["Kako određujete cijenu kupcu?", { fixed: "Fiksna cijena (npr. 30 € za komad)", hour: "Satnica", measure: "Po količini (npr. €/kg ili €/m²)", fee: "Fiksna doplata ili izlazak", quote: "Zasebna ponuda za svakog kupca nakon procjene", dynamic: "Cijena se mijenja s terminom ili potražnjom", unknown: "Ne znam", other: "Drugo" }],
  regulation: ["Određuje li poseban propis koliko smijete naplatiti?", { market: "Ne, cijenu određujem samostalno", regulated: "Da, cijenu uređuje poseban propis", unknown: "Ne znam", other: "Drugo" }],
  sales: ["Gdje kupac može kupiti?", { shop: "Fizička poslovnica", outlet: "Outlet", stand: "Štand ili tržnica", fair: "Sajam", door: "Kod kupca ili na kućnom pragu", webshop: "Vlastiti webshop", booking: "Stranica za rezervacije", market: "Tuđa platforma za prodaju (marketplace)", social: "Društvena mreža (npr. Instagram)", messages: "Poruke, telefon ili e-pošta", none: "Još nema prodaje", unknown: "Ne znam", other: "Drugo" }],
  website: ["Imate li svoj web?", { shop: "Vlastiti webshop", info: "Vlastiti web bez košarice", none: "Nemam vlastiti web", unknown: "Ne znam", other: "Drugo" }],
  ads: ["Gdje objavljujete cijene za ovu ponudu?", { web: "Vlastiti web ili webshop", market: "Tuđa stranica za prodaju ili rezervacije", social: "Javne objave na društvenim mrežama", paid: "Plaćeni oglasi na internetu", mail: "Newsletter s ponudom za sve primatelje", print: "Letci, katalozi ili plakati", broadcast: "TV ili radio", none: "Nigdje ne oglašavam cijenu", unknown: "Ne znam", other: "Drugo" }],
  territory: ["U kojim državama nudite ovu ponudu?", { hr: "Hrvatska", foreign: "Druge države", unknown: "Ne znam", other: "Drugo" }],
  locations: ["Vrijedi li ista cijena na svim mjestima prodaje?", { one: "Prodajem samo na jednom mjestu", same: "Ista cijena na više mjesta", different: "Cijena ovisi o mjestu prodaje", sellers: "Više prodavatelja, svaki sa svojom cijenom", unknown: "Ne znam", other: "Drugo" }],
  prior: ["Jeste li za isti artikl već morali prikazivati dodatnu (baznu) cijenu?", { yes: "Da", no: "Ne", unknown: "Ne znam" }],
  history: ["Što je vrijedilo za ovu ponudu na navedeni datum?", { existing: "Već sam je nudio po redovnoj cijeni", stock: "Već sam je nudio, ali je bila rasprodana", new: "Počeo sam je nuditi nakon tog datuma", renamed: "Ista ponuda, promijenjen je samo naziv ili šifra", changed: "Proizvod ili sadržaj ponude se promijenio", promo: "Na taj je datum bila na akciji", unknown: "Ne znam", other: "Drugo" }],
  proof: ["Imate li zapis o redovnoj ili prvoj cijeni?", { yes: "Da, imam cjenik ili drugi zapis s datumom", no: "Nemam zapis", unknown: "Ne znam gdje provjeriti" }],
  discount: ["Nudite li popust?", { public: "Javno sniženje, akcija ili rasprodaja", coupon: "Kupon ili kod dostupan svima", personal: "Popust dogovoren s jednim kupcem", expiry: "Sniženje jer se roba brzo kvari ili joj istječe rok", none: "Nema sniženja", unknown: "Ne znam", other: "Drugo" }],
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
