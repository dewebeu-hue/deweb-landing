import { ASSESSMENT_PERIOD, GENERAL_REFERENCE, LEGACY_REFERENCE, label, offerName, questions, selected, selects, sources, websiteDomain, websiteTypes, type Answers, type Offer, type QuestionId, type SourceId, type WebsiteType } from "./sidrene-cijene-podaci.ts";

export const obligations = { base: "Bazna (sidrena) cijena", unit: "Cijena po kg, litri ili drugoj jedinici", discount: "Najniža cijena prije sniženja", list: "Cjenik na webu" } as const;
export const statusLabels = { applies: "Obveza vrijedi", outside: "Ova obveza ne vrijedi", check: "Potrebna provjera" } as const;
type Obligation = keyof typeof obligations;
type Status = keyof typeof statusLabels;
export type Guidance = {
  status: Status; reason: string; action: string; refs: SourceId[];
  amountNeedsCheck?: boolean; example?: string; question?: QuestionId; shortAction?: string; priceLabel?: string;
};
export const amountCheckLabel = "Iznos treba provjeriti";
type Channel = { type: "sale" | "ad"; key: string; name: string };
export type ResultRow = Guidance & { obligation: Obligation };
type Group = { title: string; items: ResultRow[]; website?: WebsiteType; placement?: { channel: Channel; scope: string } };
const result = (status: Status, reason: string, action: string, refs: SourceId[], extra?: Pick<Guidance, "amountNeedsCheck" | "example" | "question" | "shortAction" | "priceLabel">): Guidance => ({ status, reason, action, refs, ...extra });
const isUnknown = (a: Answers, k: QuestionId) => !selected(a, k).length || selected(a, k).every(v => v === "unknown" || v === "other");
const has = (a: Answers, k: QuestionId, ...values: string[]) => selected(a, k).some(v => values.includes(v));
const withoutUncertain = (a: Answers, k: QuestionId) => selected(a, k).filter(v => !["unknown", "other"].includes(v));
const either = (a: Answers, k: QuestionId, ...values: string[]) => values.filter(v => has(a, k, v)).length > 1;
const direct = (a: Answers) => selects(a, "roles", "own", "platform");
const fee = (a: Answers) => selects(a, "roles", "fee");
const ambiguousKind = (kind: string) => ["bundle", "voucher", "digital", "subscription", "unknown", "other"].includes(kind);
const inPremises = ["shop", "outlet"];
const blank = "______ €";
const evidence = "Potražite iznos u starom cjeniku, blagajni, webshopu ili računima za to prodajno mjesto.";
const scopeAction = "Dodajte zasebnu ponudu ako se razlikuju kupci, cijene, prodavatelji ili pravila.";
const toCheck = (question: QuestionId, action: string, refs: SourceId[], shortAction?: string) => result("check", questions[question][0], action, refs, { question, shortAction });
const general = (a: Answers, territory: string): Guidance | undefined => {
  if (isUnknown(a, "buyers") || (!selects(a, "buyers", "consumer") && has(a, "buyers", "unknown", "other"))) return toCheck("buyers", "Provjerite kupuje li itko kao fizička osoba za osobnu uporabu.", ["consumer"]);
  if (!selects(a, "buyers", "consumer")) return result("outside", "Ovu ponudu imaju samo poslovni kupci, ustanove ili otkupljivači.", "Provjerite ovu ponudu ponovno ako je počnete nuditi građanima za osobnu kupnju.", ["consumer"]);
  if (territory === "foreign") return result("check", "Ovaj pregled obrađuje hrvatsko tržište.", "Zabilježite države u kojima ciljate potrošače i za svaku provjerite mjerodavne propise prije objave.", ["consumer"]);
  if (territory !== "hr") return toCheck("territory", "Provjerite države dostave, uvjete ugovora i publiku oglasa.", ["consumer"]);
  if (isUnknown(a, "roles")) return toCheck("roles", "Na računu i u uvjetima provjerite tko je ugovorni prodavatelj i tko potrošaču naplaćuje naknadu.", ["consumer"]);
};

function priceExemption(a: Answers, price: string, rule: "base" | "list"): Guidance | undefined {
  const refs: SourceId[] = [rule === "base" ? "baseExceptions" : "listExceptions"];
  const applicability = rule === "base" ? "bazna cijena" : "objava u cjeniku";
  if (either(a, "regulation", "market", "regulated")) return toCheck("regulation", `Provjerite koji iznos uređuje propis ili pravni akt. ${scopeAction}`, refs);
  if (selects(a, "regulation", "regulated")) return result("outside", "Određivanje ove cijene uređeno je posebnim propisom ili drugim pravnim aktom.", "Za tu cijenu slijedite poseban akt. Ostale cijene procijenite zasebno.", refs);
  const pricing = selected(a, "pricing");
  const exception = selected(a, "priceException").filter(value =>
    pricing.length < 2 || (value !== "personal" || !pricing.includes("quote") || price === "quote")
      && (value !== "dynamic" || !pricing.includes("dynamic") || price === "dynamic"));
  const qualifying = exception.filter(value => value !== "none" && value !== "unknown");
  if (qualifying.length && exception.includes("none")) return toCheck("priceException", `Provjerite koje izuzeće vrijedi za ovaj iznos. ${scopeAction}`, refs);
  if (qualifying.length) return result("outside", `Za ovaj iznos označeno je izuzeće. ${qualifying.map(value => label("priceException", value)).join(". ")}.`, `Za tu cijenu nije obvezna ${applicability}. Zasebno procijenite cijenu dostupnu svim kupcima.`, refs);
  if (!selects(a, "regulation", "market")) return toCheck("regulation", "Provjerite uređuje li ovu cijenu poseban propis ili drugi pravni akt.", refs);
  if (isUnknown(a, "priceException")) return toCheck("priceException", "Provjerite je li ta cijena namijenjena grupi ili načinu plaćanja, osobno određena ili dinamička bez usporedive osnove.", refs);
}

function basePrice(a: Answers, kind: string, ch: Channel, price: string): Guidance {
  const formatRef: SourceId = kind === "goods" ? "baseGoods" : "baseService";
  if (ch.key === "none") return result("outside", ch.type === "ad" ? "U ovom kanalu ne oglašavate cijenu." : "Još nema prodajnog mjesta za ovu ponudu.", "Ponovno provjerite prije prodaje ili oglašavanja cijene.", [ch.type === "ad" ? "baseMandatoryAd" : formatRef]);
  if (ch.key === "vending") return result("outside", "Cijena je istaknuta na prodajnom automatu.", "Na automatu istaknite maloprodajnu cijenu. Primjenu na drugom mjestu provjerite zasebno.", ["baseExceptions", "article7"], { shortAction: "Na automatu istaknite maloprodajnu cijenu." });
  const excluded = priceExemption(a, price, "base");
  if (excluded?.status === "outside") return excluded;
  if (kind === "goods" && selects(a, "goods", "auction") && !selects(a, "goods", "standard")) return result("outside", "Zakon izuzima javnu dražbu te umjetnička djela i antikvitete od obveze isticanja cijena iz čl. 7. st. 1.", "Provjerite ostala pravila za način prodaje koji primjenjujete.", ["article7"]);
  if (ch.type === "ad" && !["print", "tv"].includes(ch.key)) return result("outside", "U ovom oglasu s cijenom prikaz bazne cijene je dobrovoljan.", "Ako je prikažete, označite je jasno prema pravilima za robu ili usluge. Zasebno provjerite aktualno sniženje.", ["baseOptionalAd", formatRef], { shortAction: "U ovom oglasu baznu cijenu možete prikazati dobrovoljno." });
  const adRefs: SourceId[] = ch.type === "ad" ? ["baseMandatoryAd"] : [];
  if (ch.key === "print") {
    if (selects(a, "printTiming", "old") && !selects(a, "printTiming", "new")) return result("outside", "Tiskani materijal izrađen prije početka primjene ima prijelazni rok.", "Stari materijal koristite najdulje 30 dana od 17. 11. 2026. U novom materijalu s maloprodajnom cijenom istaknite i baznu cijenu.", ["baseOldPrint", ...adRefs], { shortAction: "Stari tiskani oglas koristite najdulje 30 dana od 17. 11. 2026." });
    if (!selects(a, "printTiming", "new") || selects(a, "printTiming", "old")) return toCheck("printTiming", "Provjerite je li tiskani materijal izrađen prije 17. 11. 2026. Za stari materijal vrijedi prijelaz od najviše 30 dana.", ["baseOldPrint", ...adRefs]);
  }
  if (excluded) return excluded;
  if (isUnknown(a, "activity")) return toCheck("activity", "Provjerite nudite li ovu cijenu kao trgovac u okviru djelatnosti.", ["consumer", "baseRule"]);
  if (ambiguousKind(kind)) return toCheck("kinds", "Utvrditi radi li se o robi ili usluzi. Ako cijene robe i usluge nudite zasebno, unesite ih odvojeno.", ["baseRule", formatRef]);
  if (kind === "goods" && (selected(a, "legacy").length !== 1 || selects(a, "legacy", "mixed", "unknown"))) return toCheck("legacy", "Provjerite pripada li artikl jednoj od šest skupina s datumom 2. 5. 2025. Robu iz tih i ostalih skupina unesite zasebno.", ["baseLegacy", "baseGeneral", ...adRefs]);

  const olderGroup = kind === "goods" && selects(a, "legacy", "yes");
  const reference = olderGroup ? LEGACY_REFERENCE : GENERAL_REFERENCE;
  const firstPrice = selects(a, "history", "new", "changed");
  const existing = selects(a, "history", "existing", "stock", "renamed");
  const datedRef = olderGroup ? "baseLegacy" : "baseGeneral";
  const firstRef = olderGroup ? "baseLegacyNew" : "baseGeneralNew";
  if (existing === firstPrice || selects(a, "history", "unknown")) return toCheck("history", `Provjerite je li ista roba ili usluga bila u ponudi na dan ${reference} Ako je uvedena kasnije, pronađite datum prvog uvrštenja.`, [datedRef, firstRef, ...adRefs]);

  const sourceRef = firstPrice ? firstRef : datedRef;
  const promoRef = olderGroup ? (firstPrice ? "baseLegacyNewDiscount" : "baseLegacyDiscount") : (firstPrice ? "baseGeneralNewDiscount" : "baseGeneralDiscount");
  const day = firstPrice ? "na dan prvog uvrštenja u ponudu" : `na dan ${reference}`;
  if (selected(a, "referenceDiscount").length !== 1 || selects(a, "referenceDiscount", "unknown")) return toCheck("referenceDiscount", `Provjerite je li za tu robu ili uslugu ${day} vrijedio popust.`, [sourceRef, promoRef, ...adRefs]);
  const promo = selects(a, "referenceDiscount", "promo");
  const basis = !promo ? `maloprodajnu cijenu koja je vrijedila ${day}`
    : olderGroup ? "najnižu maloprodajnu cijenu iste robe u 30 dana prije početka tadašnjeg popusta"
    : "maloprodajnu cijenu koja je vrijedila prije tadašnjeg popusta";
  const where = ch.type === "ad" ? "U oglasu prikažite baznu cijenu uz maloprodajnu."
    : kind !== "goods" ? "Na istom mjestu prikažite baznu i maloprodajnu cijenu usluge. Ako zbog broja i raznovrsnosti ne možete navesti sve usluge u cjeniku, navedite obje cijene u katalogu, brošuri ili prospektu na prodajnom mjestu."
    : ch.key === "webshop" ? "Na webshopu jasno označite baznu cijenu uz maloprodajnu i, gdje je potrebna, jediničnu cijenu istog artikla."
    : ["social", "market", "booking", "messages"].includes(ch.key) ? "U prikazu preko kojeg kupac može kupiti robu jasno označite baznu i maloprodajnu cijenu istog artikla te jediničnu cijenu ako je obvezna."
    : "Na robi ili uz nju na istoj oznaci istaknite baznu i maloprodajnu cijenu te jediničnu cijenu ako je obvezna.";
  const amountNeedsCheck = selected(a, "proof").length !== 1 || !selects(a, "proof", "yes");
  const action = amountNeedsCheck ? `Utvrdite ${basis.replace(/\.$/, "")}. ${evidence} ${where}` : `${where} Za baznu uzmite ${basis.replace(/\.$/, "")}.`;
  return result("applies", promo ? `Na odgovarajući dan (${day}) vrijedio je popust.` : "Za baznu cijenu uzima se maloprodajna cijena s odgovarajućeg dana.", action, [promo ? promoRef : sourceRef, ...adRefs, formatRef], {
    amountNeedsCheck,
    question: amountNeedsCheck ? "proof" : undefined,
    shortAction: `${amountNeedsCheck ? "Utvrdite" : "Istaknite"} baznu cijenu uz aktualnu. Kao baznu uzmite ${basis.replace(/\.$/, "")}.`,
  });
}

function unit(a: Answers, kind: string, ch: Channel): Guidance {
  const refs: SourceId[] = ["article7", "unit"];
  if (ch.key === "none") return result("outside", ch.type === "ad" ? "Nema oglašenog iznosa u ovom kanalu." : "Još nema prodajnog mjesta.", "Ponovno provjerite kad istaknete cijenu.", refs);
  if (ambiguousKind(kind)) return toCheck("kinds", "Odredite sastav ponude i nudi li se pojedina roba odvojeno.", refs);
  if (kind !== "goods") return result("outside", "Pravilnikova obveza označavanja jedinične cijene po čl. 7.–8. odnosi se na robu.", "U cjeniku usluge na prodajnom mjestu navedite fiksne iznose ili jasnu osnovu obračuna (npr. €/sat). Za cijene uređene posebnim propisom slijedite taj propis.", refs);
  if (selects(a, "goods", "auction") && !selects(a, "goods", "standard")) return result("outside", "Javna dražba, umjetnička djela i antikviteti izuzeti su čl. 7. st. 6. ZZP-a.", "Provjerite pravila za način prodaje koji primjenjujete.", refs);
  if (selects(a, "goods", "loose") && selects(a, "goods", "packed", "pieces")) return toCheck("goods", "Odvojite rasutu robu od pakirane ili komadne robe; pravilo nije isto za svaku stavku.", refs);
  if (selects(a, "goods", "loose")) return result("applies", "Rasuta roba ima izravnu obvezu isticanja jedinične cijene (čl. 7. st. 4. ZZP-a).", ch.type === "ad" ? "Navedite jasnu cijenu po odgovarajućoj jedinici uz oglašenu robu." : "Na prodajnom mjestu jasno navedite cijenu po odgovarajućoj jedinici.", refs, { example: `Rasuta roba\nCijena za 1 kg: ${blank}` });
  if (!selects(a, "goods", "packed", "pieces", "standard")) return toCheck("goods", "Utvrdite prodaje li se roba rasuto, pakirano ili na komad. Status nove ili rabljene robe sam po sebi nije dovoljan.", refs);
  if (either(a, "unit", "yes", "no") || isUnknown(a, "unit")) return toCheck("unit", "Provjerite popis iz čl. 8. st. 1. za konkretan artikl. Razdvojite skupine ako je potrebno.", refs);
  if (selects(a, "unit", "no")) return result("outside", "Ova roba nije rasuta i nije na popisu robe za koju treba prikazati cijenu po jedinici.", "Istaknite cijenu koju kupac plaća za artikl.", refs, {
    shortAction: "Istaknite aktualnu cijenu uz artikl.",
  });
  const exceptions = withoutUncertain(a, "unitException").filter(v => v !== "none");
  if ((exceptions.length && selects(a, "unitException", "none")) || isUnknown(a, "unitException")) return toCheck("unitException", "Provjerite neto količinu, način pakiranja i vrstu prodaje za isti artikl.", refs);
  if (exceptions.length) return result("outside", `Označeno izuzeće: ${exceptions.map(v => label("unitException", v)).join("; ")}.`, "To izuzeće primijenite samo na odgovarajuću robu. Zasebno provjerite druge cijene.", refs);
  return result("applies", "Roba pripada popisu iz čl. 8. st. 1. i nije označeno izuzeće.", "Uz maloprodajnu cijenu navedite cijenu po odgovarajućoj jedinici. Za hranu u tekućini koristite ocijeđenu masu, a za glaziranu hranu neto masu bez glazure.", refs, { example: `Primjer za pakiranje od 500 g\nMaloprodajna cijena: 3,00 €\nCijena za 1 kg: 6,00 €` });
}

function discount(a: Answers, kind: string, ch: Channel): Guidance {
  const refs: SourceId[] = [kind !== "goods" ? "discountService" : ch.type === "ad" ? "discountAd" : "discountSale", "discount"];
  if (ch.key === "none") return result("outside", ch.type === "ad" ? "U ovom kanalu ne oglašavate iznos." : "Nema prodaje u ovom kanalu.", "Ponovno procijenite kada počnete oglašavati ili prodavati po sniženoj cijeni.", refs);
  if (ambiguousKind(kind)) return toCheck("kinds", "Odvojite robu od usluge kako biste mogli utvrditi pravila za prikaz sniženja.", refs);
  if (kind !== "goods" && (ch.type === "ad" || ["door", "webshop", "booking", "market", "social", "messages"].includes(ch.key))) return result("outside", "Čl. 19. st. 7.–8. izuzima oglašavanje usluge i ugovore o usluzi na daljinu ili izvan poslovnih prostorija.", "Jasno navedite cijenu i uvjete. Posebno provjerite eventualnu akciju iste usluge unutar poslovnih prostorija.", refs);
  const promotion = selects(a, "discount", "public", "coupon", "expiry");
  if ((promotion && selects(a, "discount", "none")) || isUnknown(a, "discount")) return toCheck("discount", "Provjerite nudite li ovdje javnu akciju ili kod dostupan svima. Ako akcija vrijedi samo na jednom mjestu, unesite je kao zasebnu ponudu.", [...refs, "euDiscount"], "Provjerite nudite li javnu akciju ili kupon dostupan svima.");
  if (!promotion && selects(a, "discount", "personal") && !has(a, "discount", "other", "unknown")) return result("outside", "Označen je stvarno individualni popust, bez javne najave sniženja.", "Opće dostupan kod ili široko oglašen popust procijenite kao javno sniženje.", [...refs, "euDiscount"]);
  if (!promotion && selects(a, "discount", "targeted") && !has(a, "discount", "other", "unknown")) return result("outside", "Označen je popust vezan samo uz skupinu kupaca ili način plaćanja.", "Ako je akcija na artikl zapravo dostupna svim kupcima, provjerite je kao javno sniženje.", ["discountConditions", ...refs, "euDiscount"]);
  if (!promotion && selects(a, "discount", "none") && !has(a, "discount", "other", "unknown")) return result("outside", "Za ovaj kanal nije označeno sniženje.", "Sačuvajte povijest cijena za eventualnu buduću akciju.", refs);
  if (!promotion) return toCheck("discount", "Pregledajte oglas i uvjete popusta za ovaj kanal.", refs);
  if (kind !== "goods" && !inPremises.includes(ch.key)) return toCheck("sales", "Utvrdite je li prodaja usluge sklopljena unutar poslovnih prostorija ili izvan njih.", refs);
  if (kind === "goods" && selects(a, "discount", "expiry")) {
    if (selects(a, "discount", "public", "coupon")) return toCheck("discount", "Odvojite običnu javnu akciju od posebne prodaje koja je određena baš zbog kvarljivosti ili isteka.", refs);
    if (ch.type === "ad") return result("check", "Izuzeće u čl. 19. st. 5. odnosi se na st. 4. Oglašavanje uređuje st. 6.", "Prije objave provjerite može li se ovaj iznos oglašavati kao sniženje i imate li primjenjivu povijest cijena. Na prodajnom mjestu istaknite krajnji rok uporabe.", [...refs, "discountExpiry"]);
    return result("outside", "Poseban oblik prodaje određen je zbog kvarljivosti ili skorog isteka (čl. 19. st. 5.).", "Istaknite krajnji rok uporabe. Kod postupnog snižavanja unutar poslovnih prostorija koristite neposredno prethodnu cijenu i sniženu cijenu po čl. 24. Postupno snižavanje iz čl. 24. ne primjenjuje se u prodaji na daljinu ni izvan poslovnih prostorija.", ["discountExpiry", ...refs]);
  }
  const example = `Cijena na akciji: ${blank}\nNajniža cijena u 30 dana prije akcije: ${blank}`;
  const ads = ch.type === "ad" ? "U oglasu" : "Na prodajnom mjestu";
  const qualified = "Kod javnog sniženja i koda dostupnog svima gledaju se ranije cijene iste ponude na mjestu gdje vrijedi popust.";
  const defect = kind === "goods" && selects(a, "goods", "defect") ? " Jasno označite grešku i opišite kupcu u čemu se sastoji (čl. 23.)." : "";
  if (selects(a, "discountProof", "first")) return result("check", "Za prvu prodaju nije utvrđena prethodna cijena koja bi potkrijepila oglašeno sniženje.", `Prikažite početnu cijenu bez oznake sniženja dok ne utvrdite valjanu prethodnu cijenu.${defect}`, [...refs, "euDiscount"], { question: "discountProof", example });
  if (!selects(a, "discountProof", "full") || has(a, "discountProof", "partial", "unknown")) return result("applies", `${qualified} ${evidence}`, `Pronađite najnižu cijenu po kojoj ste nudili artikl u 30 dana prije akcije. Prikažite je uz sniženu cijenu. Objavite sniženje tek kad potvrdite oba iznosa.${defect}`, [...refs, "euDiscount"], {
    amountNeedsCheck: true, question: "discountProof", example,
    shortAction: "Prije objave sniženja utvrdite najnižu cijenu iz 30 dana prije akcije pa je prikažite uz sniženu cijenu.",
  });
  return result("applies", qualified, `${ads} prikažite sniženu cijenu i najnižu cijenu u 30 dana prije akcije. Uračunajte ranije akcijske cijene. Postotak popusta računajte od te najniže cijene.${defect}`, [...refs, "euDiscount"], {
    example, shortAction: "Prikažite sniženu cijenu i najnižu cijenu u 30 dana prije akcije.",
  });
}

function priceList(a: Answers, kind: string, site: string, price: string): Guidance {
  const ownWeb: SourceId[] = ["listRule", "article7"];
  const excluded = priceExemption(a, price, "list");
  if (excluded?.status === "outside") return excluded;
  const sales = selected(a, "sales");
  if (sales.length === 1 && sales[0] === "vending") return result("outside", "U ponudi je označena samo cijena istaknuta na prodajnom automatu.", "Cijene drugih prodajnih mjesta procijenite zasebno.", ["listExceptions"]);
  if (site === "conflict") return toCheck("website", "Provjerite imate li vlastiti web. Označili ste i vlastiti web i da ga nemate.", ownWeb);
  if (["unknown", "other"].includes(site)) return toCheck("website", "Provjerite imate li vlastitu mrežnu stranicu ili samo profil na tuđoj platformi.", ownWeb);
  if (site === "none" && selects(a, "sales", "webshop")) return toCheck("website", "Provjerite je li webshop vaš ili je stranica na tuđoj platformi.", ownWeb);
  if (site === "none") return result("outside", "Nemate vlastitu mrežnu stranicu na kojoj biste objavili cjenik.", "Ako otvorite vlastiti web, provjerite obvezu ponovno. Cjenik na prodajnom mjestu provjerava se zasebno.", ownWeb);
  if (excluded) return excluded;
  if (isUnknown(a, "activity")) return toCheck("activity", "Provjerite nudite li ovu cijenu kao trgovac u okviru djelatnosti.", ["consumer", "listRule"]);
  if (ambiguousKind(kind)) return toCheck("kinds", "Provjerite radi li se o robi ili usluzi kako biste koristili odgovarajuća polja cjenika.", ["listGoods", "listService"]);
  const listings = selects(a, "locations", "different")
    ? "Objavite zasebne cjenike za prodajna mjesta s različitim cjenicima."
    : "Objavite zaseban cjenik za svako prodajno mjesto, osim ako isti cjenik vrijedi na svim mjestima.";
  const fields = kind === "goods"
    ? "Stupci redom: naziv, šifra*, marka*, neto količina ako je obvezna cijena po jedinici mjere, jedinica mjere*, maloprodajna cijena uz podatak je li u posebnom obliku prodaje, jedinična cijena*, barkod*, EAN barkod*, bazna cijena. Zvjezdica označava podatak koji se navodi ako je primjenjiv."
    : "Stupci redom: naziv usluge, maloprodajna cijena uz podatak je li u posebnom obliku prodaje, bazna cijena.";
  return result("applies", "Važeći cjenik objavljujete na vlastitom webu, uključujući web bez košarice.", `Na javnom URL-u objavite strojno čitljiv CSV ili XML. Izmijenjenu datoteku stavite na isti URL do 11:00 na dan izmjene. Zamijenjeni cjenik ostavite javno dostupan 15 dana od zamjene. ${listings}`, ["listLocations", kind === "goods" ? "listGoods" : "listService", "listAccess"], {
    example: `${fields}\nOmogućite automatizirano dohvaćanje. Koristite UTF-8, točku sa zarezom za razdvajanje stupaca i jedinstvenu strukturu kroz prodajna mjesta. Dopušten je ZIP ili GZ.\nNaziv datoteke sadrži OIB pravne osobe ili matični broj trgovca fizičke osobe, vrstu, adresu i oznaku prodajnog mjesta, vrstu cjenika (roba ili usluge), broj pohrane te vrijeme objave GGGGMMDD_SSMM. Kod zajedničkog cjenika podatke o mjestu zamijenite oznakom ZA_SVA_PRODAJNA_MJESTA.`,
    shortAction: `Objavite CSV ili XML. Izmjenu stavite na isti URL do 11:00 isti dan, a arhivu čuvajte dostupnom 15 dana. ${listings}`,
  });
}

function channels(a: Answers): Channel[] {
  return (["sales", "ads"] as const).flatMap(k => {
    const type: Channel["type"] = k === "sales" ? "sale" : "ad";
    const values = withoutUncertain(a, k);
    if (values.length > 1 && values.includes("none")) return [...values.filter(v => v !== "none").map(key => ({ type, key, name: label(k, key) })), { type, key: "conflict", name: k === "sales" ? "Proturječan odabir prodaje" : "Proturječan odabir oglašavanja" }];
    return (selected(a, k).length ? selected(a, k) : ["unknown"]).map(key => ({ type, key, name: label(k, key) }));
  });
}

export function assessOffer(offer: Offer) {
  const a = offer.answers;
  const groups: Group[] = [];
  const territory = selected(a, "territory").length ? selected(a, "territory") : ["unknown"];
  if (!selects(a, "buyers", "consumer") && !isUnknown(a, "buyers") && !has(a, "buyers", "unknown", "other")) {
    return { groups: [{ title: "Kupci izvan potrošačke prodaje", items: (Object.keys(obligations) as Obligation[]).map(obligation => ({ obligation, ...general(a, "hr")! })) }], notes: [] as string[], showCta: false };
  }
  const displayed = selects(a, "roles", "display");
  const kinds = direct(a) || (!fee(a) && !displayed) ? (selected(a, "kinds").length ? selected(a, "kinds") : ["unknown"]) : [];
  const parts = [
    ...kinds.map(kind => ({ kind, title: label("kinds", kind), sharedFee: false })),
    ...(fee(a) ? [{ kind: "service", title: "Vlastita naknada potrošaču", sharedFee: direct(a) }] : []),
  ];
  const sites = selected(a, "website");
  const website = sites.length > 1 && sites.includes("none") ? ["conflict", ...sites.filter(key => key === "shop" || key === "info")] : sites.length ? sites : ["unknown"];
  const offerChannels = channels(a);

  for (const part of parts) for (const area of territory) {
    const prefix = `${part.title}${area === "foreign" ? " · druge države" : area !== "hr" ? " · tržište nije utvrđeno" : ""}`;
    const scope = general(a, area);
    const priceParts = part.sharedFee ? ["fee"] : selected(a, "pricing").length ? selected(a, "pricing") : ["unknown"];
    for (const ch of offerChannels) {
      const askChannel = ["unknown", "other", "conflict"].includes(ch.key) ? toCheck(ch.type === "sale" ? "sales" : "ads", `Utvrdite gdje je ponuda dostupna i gdje se javno prikazuju cijene. ${scopeAction}`, ["article7", "baseRule"]) : undefined;
      const items = priceParts.map(price => {
        const base = scope ?? askChannel ?? (part.sharedFee && ch.key !== "none" && (ch.type === "sale" || ["print", "tv"].includes(ch.key))
          ? toCheck("roles", "Dodajte zasebnu ponudu samo za vlastitu naknadu i provjerite njezinu cijenu i povijest.", ["baseService", "baseRule"])
          : basePrice(a, part.kind, ch, price));
        return { obligation: "base" as const, ...base, priceLabel: priceParts.length > 1 ? label("pricing", price) : undefined };
      });
      const section = ch.type === "sale" ? "Prodaja" : "Oglašavanje";
      groups.push({ title: `${prefix} · ${section}: ${ch.name}`, placement: { channel: ch, scope: prefix }, items: [
        ...items,
        { obligation: "unit", ...(scope ?? askChannel ?? unit(a, part.kind, ch)) },
        { obligation: "discount", ...(scope ?? askChannel ?? (part.sharedFee && ch.key !== "none" && ch.type === "sale" && !["door", "webshop", "booking", "market", "social", "messages"].includes(ch.key)
          ? toCheck("roles", "Provjerite postoji li zasebno sniženje vlastite naknade na ovom prodajnom mjestu.", ["discountService"])
          : discount(a, part.kind, ch))) },
      ] });
    }
    for (const site of website) for (const price of priceParts) {
      const guidance = scope ?? (part.sharedFee && (site === "shop" || site === "info")
        ? toCheck("roles", "Dodajte zasebnu ponudu samo za vlastitu naknadu i provjerite pripada li njezin iznos u cjenik.", ["listService", "listExceptions"])
        : priceList(a, part.kind, site, price));
      groups.push({
        title: `${prefix} · ${["unknown", "other", "conflict"].includes(site) ? "Vlastiti web" : label("website", site)}`,
        website: !scope && guidance.status !== "outside" && (site === "shop" || site === "info") ? site : undefined,
        items: [{ obligation: "list", ...guidance, priceLabel: priceParts.length > 1 ? label("pricing", price) : undefined }],
      });
    }
  }
  const notes: string[] = [];
  if (selects(a, "buyers", "consumer") && selects(a, "buyers", "company", "institution", "buyer")) notes.push("Upute se odnose na prodaju građanima za osobnu uporabu. Dio za poslovne kupce, ustanove i otkupljivače izvan je ovih potrošačkih obveza.");
  if (displayed) {
    const prefix = "Posredovanje · prikaz tuđih cijena";
    const channels = offerChannels.filter(ch => ch.key !== "none");
    const outside = (ref: SourceId) => result("outside", "U ovom dijelu samo posredujete za drugog trgovca.", "Za cijenu treće strane provjerite tko je prodavatelj. Vlastitu naknadu procijenite zasebno.", [ref]);
    for (const area of territory) {
      const scope = general(a, area);
      const scopeTitle = area === "hr" ? prefix : `${prefix} · ${area === "foreign" ? "druge države" : "tržište nije utvrđeno"}`;
      for (const ch of channels) {
        const section = ch.type === "sale" ? "Prodaja" : "Oglašavanje";
        groups.push({ title: `${scopeTitle} · ${section}: ${ch.name}`, placement: { channel: ch, scope: scopeTitle }, items: [
          { obligation: "base", ...(scope ?? outside("baseIntermediary")) },
          { obligation: "unit", ...(scope ?? outside("consumer")) },
          { obligation: "discount", ...(scope ?? outside("discount")) },
        ] });
      }
      groups.push({ title: `${scopeTitle} · Cjenik`, items: [{ obligation: "list", ...(scope ?? outside("listIntermediary")) }] });
    }
    if (direct(a) || fee(a)) notes.push("Tuđe cijene, vlastitu prodaju i vlastitu naknadu procijenite odvojeno.");
  }
  if (selects(a, "locations", "different", "sellers") || (withoutUncertain(a, "sales").length > 1 && !selects(a, "locations", "same"))) notes.push("Usporedne cijene i dokaze vodite zasebno po mjestu, kanalu i prodavatelju. Za više poslovnica istog tipa s različitim cijenama dodajte zasebnu ponudu za svaku poslovnicu.");
  if (selects(a, "goods", "defect")) notes.push("Uz robu s greškom jasno označite nedostatak i objasnite kupcu o kojoj je grešci riječ (čl. 23. ZZP-a).");
  if (parts.length > 1 || selects(a, "pricing", "quote") && selects(a, "pricing", "fixed", "fee", "hour", "measure")) notes.push("Odvojite standardne stavke i njihove cijene od drugih vrsta ponude i individualnih izračuna. Za različite kanale, cijene, propise ili prodavatelje dodajte zasebnu ponudu.");
  const showCta = groups.some(g => g.items.some(row => row.obligation === "list" && row.status === "applies"));
  return { groups, notes, showCta };
}

type WebsiteScope = { offerId: number; detail: string; row: ResultRow; sales: string[]; locations: readonly string[] };

function websiteDecisionKey({ status, action, question, reason, refs }: ResultRow) {
  return status === "applies" ? JSON.stringify([status, refs]) : JSON.stringify([status, action, question, reason, refs]);
}

function quickSteps(rows: ResultRow[]) {
  const active = rows.filter(row => row.status !== "outside" || row.shortAction);
  active.sort((a, b) => Number(b.status === "outside") - Number(a.status === "outside"));
  const steps = new Map<string, { action: string; note?: string; ref: SourceId }>();
  for (const row of active) {
    const text = row.shortAction ?? row.action;
    const action = row.priceLabel ? `${row.priceLabel} · ${text}` : text;
    const note = row.amountNeedsCheck ? `${statusLabels.applies} · ${amountCheckLabel}`
      : row.status === "check" ? statusLabels.check : undefined;
    const ref = row.refs[0];
    steps.set(JSON.stringify([action, note, ref]), { action, note, ref });
  }
  return [...steps.values()];
}

function offerQuickSteps(groups: Group[]) {
  const combined = new Map<string, { titles: string[]; steps: ReturnType<typeof quickSteps> }>();
  const scopes = new Set(groups.flatMap(group => group.placement ? [group.placement.scope] : []));
  for (const { title, items, placement } of groups) {
    const steps = quickSteps(items);
    if (!steps.length) continue;
    const key = JSON.stringify([placement?.scope ?? title, steps]);
    const channel = placement?.channel;
    const name = channel && scopes.size === 1 && !placement.scope.includes(" · ")
      ? channel.type === "sale" ? channel.name : channel.key === "web" ? "Oglasi na webu" : `Oglasi (${channel.name})`
      : title;
    const entry = combined.get(key);
    if (entry) entry.titles.push(name);
    else combined.set(key, { titles: [name], steps });
  }
  return [...combined.values()].map(({ titles, steps }) => ({ title: titles.join(" / "), steps }));
}

export function assessResults(offers: readonly Offer[]) {
  const domainsByType = new Map(websiteTypes.map(type => [type, new Set<string>()]));
  const assessments = offers.map(offer => assessOffer(offer));

  assessments.forEach(({ groups }, index) => {
    for (const { website } of groups) {
      if (!website) continue;
      const domain = websiteDomain(offers[index].websiteDomains?.[website]);
      if (domain) domainsByType.get(website)?.add(domain);
    }
  });

  const byWebsite = new Map<string, { title: string; assignDomain: boolean; scopes: WebsiteScope[] }>();
  const offerResults = assessments.map(({ groups, notes }, index) => {
    const offer = offers[index];
    const sales = withoutUncertain(offer.answers, "sales").filter(value => value !== "none" && value !== "vending").map(value => label("sales", value));
    const locations = selected(offer.answers, "locations");
    for (const group of groups) {
      if (!group.website) continue;
      const domains = domainsByType.get(group.website)!;
      const domain = websiteDomain(offer.websiteDomains?.[group.website]) ?? (domains.size === 1 ? [...domains][0] : undefined);
      const key = domain ?? `type:${group.website}`;
      const website = byWebsite.get(key) ?? { title: domain ?? label("website", group.website), assignDomain: !domain && domains.size > 1, scopes: [] };
      const name = offerName(offer, index);
      const row = group.items[0];
      const displayName = row.status === "check" && row.priceLabel ? `${name} · ${row.priceLabel}` : name;
      website.scopes.push({ offerId: offer.id, detail: sales.length ? `${displayName} (${sales.join(", ")})` : displayName, row, sales, locations });
      byWebsite.set(key, website);
    }
    return { offer, name: offerName(offer, index), groups: groups.filter(group => !group.website), notes };
  });

  const websites = [...byWebsite].map(([key, { title, assignDomain, scopes }]) => {
    const applies = scopes.filter(scope => scope.row.status === "applies");
    const different = applies.find(scope => scope.locations.includes("different"));
    const primary = different ?? applies[0] ?? scopes[0];
    const scopeNames = [...new Set(scopes.map(scope => scope.detail))];
    if (assignDomain) return {
      key, title: `${title} bez navedene domene`, offerId: primary.offerId, scopes: scopeNames, details: [],
      row: { obligation: "list" as const, ...toCheck("website", "Upišite adresu weba na kojem ćete objaviti cijene za ove ponude.", ["listRule", "article7"]) },
    };

    const primaryKey = websiteDecisionKey(primary.row);
    const distinct = new Map<string, { key: string; row: ResultRow; scopes: WebsiteScope[] }>();
    for (const scope of scopes) {
      const key = websiteDecisionKey(scope.row);
      if (key === primaryKey) continue;
      const detail = distinct.get(key) ?? { key, row: scope.row, scopes: [] };
      if (!detail.scopes.some(previous => previous.offerId === scope.offerId && previous.detail === scope.detail)) detail.scopes.push(scope);
      distinct.set(key, detail);
    }
    const places = new Set(applies.flatMap(scope => scope.sales));
    const uncertain = applies.filter(({ sales, locations }) => locations.some(value => ["unknown", "other", "sellers"].includes(value))
      || sales.length > 1 && !locations.includes("same") && !locations.includes("different"));
    if (!different && applies.length && (
      uncertain.length > 0 || places.size > 1 && !applies.every(scope => scope.locations.includes("same") && scope.sales.length === places.size)
    )) {
      const key = "locations";
      const row: ResultRow = { obligation: "list", ...toCheck("locations", "Usporedite cjenike svih označenih prodajnih mjesta. Ako se razlikuju, objavite zaseban cjenik za svako prodajno mjesto.", ["listLocations"]) };
      const affected = uncertain.length ? uncertain : applies;
      distinct.set(key, { key, row, scopes: affected.filter((scope, index) => affected.findIndex(other => other.offerId === scope.offerId) === index) });
    }
    return { key, title, row: primary.row, offerId: primary.offerId, details: [...distinct.values()], scopes: scopeNames };
  });
  const quickPlan = {
    offers: offerResults.map(({ offer, name, groups }) => ({ id: offer.id, name, groups: offerQuickSteps(groups) })),
    websites: websites.map(({ key, title, row, details }) => ({
      key, title,
      steps: quickSteps([row]),
      details: details.map(detail => ({
        key: detail.key,
        title: detail.scopes.map(scope => scope.detail).join(", "),
        steps: quickSteps([detail.row]),
      })),
    })),
  };
  return { offerResults, websites, quickPlan, showCta: websites.some(({ row }) => row.status === "applies") };
}

function formatGuidance(row: ResultRow) {
  return [
    `${obligations[row.obligation]} — ${statusLabels[row.status]}${row.amountNeedsCheck ? ` · ${amountCheckLabel}` : ""}${row.priceLabel ? ` · ${row.priceLabel}` : ""}`,
    row.action, row.reason, row.example,
    ...row.refs.map(id => `${sources[id].title}, ${sources[id].section} (${sources[id].type}): ${sources[id].url}`),
  ].filter(Boolean).join("\n");
}

export function formatResults(offers: readonly Offer[]) {
  const { offerResults, websites } = assessResults(offers);
  return [
    "Moram li isticati sidrenu cijenu? · deweb", ASSESSMENT_PERIOD,
    ...offerResults.flatMap(({ name, notes, groups }) => [`\n${name}`, ...notes, ...groups.flatMap(group => [`\n${group.title}`, ...group.items.map(formatGuidance)])]),
    ...websites.flatMap(site => [
      `\n${site.title}`, `Ponude za koje trebate provjeriti što ulazi u cjenik: ${site.scopes.join("; ")}`,
      formatGuidance(site.row),
      ...site.details.map(({ scopes, row }) => `${scopes.map(scope => scope.detail).join("; ")}\n${formatGuidance(row)}`),
    ]),
  ].filter(Boolean).join("\n");
}
