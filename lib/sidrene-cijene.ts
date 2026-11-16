import { ASSESSMENT_PERIOD, label, offerName, questions, selected, selects, sources, websiteDomain, websiteTypes, type Answers, type Offer, type QuestionId, type SourceId, type WebsiteType } from "./sidrene-cijene-podaci.ts";

export const obligations = { base: "Bazna (sidrena) cijena", unit: "Cijena po kg, litri ili drugoj jedinici", discount: "Najniža cijena prije sniženja", list: "Cjenik na webu" } as const;
export const statusLabels = { applies: "Obveza vrijedi", outside: "Ova obveza ne vrijedi", check: "Treba provjeriti" } as const;
type Obligation = keyof typeof obligations;
type Status = keyof typeof statusLabels;
export type Guidance = {
  status: Status; reason: string; action: string; refs: SourceId[];
  pending?: boolean; amountNeedsCheck?: boolean; example?: string; question?: QuestionId;
};
export const amountCheckLabel = "Iznos treba provjeriti";
type Channel = { type: "sale" | "ad"; key: string; name: string };
export type ResultRow = Guidance & { obligation: Obligation };
type Group = { title: string; items: ResultRow[]; website?: WebsiteType };
const result = (status: Status, reason: string, action: string, refs: SourceId[], extra?: Pick<Guidance, "pending" | "amountNeedsCheck" | "example" | "question">): Guidance => ({ status, reason, action, refs, ...extra });
const isUnknown = (a: Answers, k: QuestionId) => !selected(a, k).length || selected(a, k).every(v => v === "unknown" || v === "other");
const has = (a: Answers, k: QuestionId, ...values: string[]) => selected(a, k).some(v => values.includes(v));
const withoutUncertain = (a: Answers, k: QuestionId) => selected(a, k).filter(v => !["unknown", "other"].includes(v));
const either = (a: Answers, k: QuestionId, ...values: string[]) => values.filter(v => has(a, k, v)).length > 1;
const direct = (a: Answers) => selects(a, "roles", "own", "platform");
const fee = (a: Answers) => selects(a, "roles", "fee");
const onlyThird = (a: Answers) => !direct(a) && !fee(a) && selects(a, "roles", "display") && !has(a, "roles", "unknown", "other");
const ambiguousKind = (kind: string) => ["bundle", "voucher", "digital", "subscription", "unknown", "other"].includes(kind);
const inPremises = ["shop", "outlet"];
const blank = "______ €";
const evidence = "Potražite iznos u starom cjeniku, blagajni, webshopu ili računima za to prodajno mjesto.";
const scopeAction = "Dodajte zasebnu ponudu ako se razlikuju kupci, cijene, prodavatelji ili pravila.";
const toCheck = (question: QuestionId, action: string, refs: SourceId[]) => result("check", questions[question][0], action, refs, { question });
const general = (obligation: Obligation, a: Answers, territory: string): Guidance | undefined => {
  if (isUnknown(a, "buyers") || (!selects(a, "buyers", "consumer") && has(a, "buyers", "unknown", "other"))) return toCheck("buyers", "Provjerite kupuje li itko kao fizička osoba za osobnu uporabu.", ["consumer"]);
  if (!selects(a, "buyers", "consumer")) return result("outside", "Ovu ponudu imaju samo poslovni kupci, ustanove ili otkupljivači.", "Provjerite ovu ponudu ponovno ako je počnete nuditi građanima za osobnu kupnju.", ["consumer"]);
  if (territory === "foreign") return result("check", "Ovaj pregled obrađuje hrvatsko tržište.", "Zabilježite države u kojima ciljate potrošače i za svaku provjerite mjerodavne propise prije objave.", ["consumer"]);
  if (territory !== "hr") return toCheck("territory", "Provjerite države dostave, uvjete ugovora i publiku oglasa.", ["consumer"]);
  if (isUnknown(a, "roles")) return toCheck("roles", "Na računu i u uvjetima provjerite tko je ugovorni prodavatelj i tko potrošaču naplaćuje naknadu.", ["consumer"]);
  if (onlyThird(a)) return result("check", "Prikazujete tuđu ponudu. Ugovorni prodavatelj i posrednik mogu imati različite obveze.", `Utvrdite tko prodaje i tko ističe cijenu u ovom kanalu.${obligation === "base" ? " Pojašnjenje za ranije odluke razlikuje tuđe cijene od vlastitih naknada." : ""}`, obligation === "base" ? ["consumer", "ministry"] : ["consumer"]);
};

// The transition is deliberately centralized here. Replace these two decision branches
// with verified clauses when their final texts and the cessation decisions are published.
function nextBase(a: Answers, kind: string, ch: Channel, price: string): Guidance {
  const refs: SourceId[] = ["article7", "draftBase", "consultation", "repeal"];
  if (kind === "goods" && selects(a, "goods", "auction") && !selects(a, "goods", "standard")) return result("outside", "Čl. 7. st. 6. izuzima javnu dražbu, umjetnička djela i antikvitete od cijena iz st. 1.", "Provjerite druga pravila za svoju vrstu prodaje.", ["article7"]);
  if (kind !== "goods" && selects(a, "regulation", "regulated") && !has(a, "regulation", "market", "unknown", "other")) return result("outside", "Cijena ove usluge uređena je posebnim propisom (čl. 7. st. 6.).", "Za ovu uslugu slijedite poseban propis. Tržišne stavke procijenite zasebno.", ["article7"]);
  if (ch.key === "none") return result("outside", ch.type === "ad" ? "U ovom kanalu ne oglašavate iznos." : "Još nema prodajnog mjesta za ovu ponudu.", "Ponovno provjerite kada počnete prikazivati cijenu.", ["article7"]);
  if (kind !== "goods" && either(a, "regulation", "market", "regulated")) return toCheck("regulation", `Za reguliranu cijenu usluge vrijedi izuzeće iz čl. 7. st. 6. ${scopeAction}`, ["article7"]);
  if (isUnknown(a, "regulation")) return toCheck("regulation", "Utvrditi uređuje li sektorski propis točno ovaj iznos. Zatražite naziv i članak propisa.", ["article7"]);
  if (isUnknown(a, "activity")) return toCheck("activity", "U registru i uvjetima prodaje provjerite u kojem svojstvu nastupate prema kupcu.", ["consumer", "article7"]);
  const reference = kind === "goods" && selects(a, "legacy", "yes") && !selects(a, "legacy", "no") ? "2. 5. 2025." : kind !== "goods" || (selects(a, "legacy", "no") && !selects(a, "legacy", "yes")) ? "10. 9. 2026." : undefined;
  const issues = [];
  if (!reference) issues.push("koji je referentni dan za ovu skupinu");
  if (kind === "goods" && selects(a, "legacy", "yes")) issues.push(selects(a, "prior", "yes") ? "nastavak korištenja ranije dokumentirane dodatne cijene" : "primjena datuma na robu bez potvrđene ranije obveze");
  if (selects(a, "history", "new", "changed") || isUnknown(a, "history")) issues.push("postupanje s ponudom koja nije postojala na referentni dan");
  if (selects(a, "history", "stock", "renamed", "promo")) issues.push("odabir dokazivog iznosa kod zalihe, promjene šifre ili akcije");
  if (price === "quote" || price === "dynamic") issues.push("obuhvat pojedinačne ili dinamičke cijene");
  if (["booking", "market", "social", "messages", "broadcast", "paid", "mail", "door"].includes(ch.key)) issues.push("primjena na ovaj kanal i ulogu prodavatelja ili posrednika");
  if (selects(a, "locations", "different", "sellers")) issues.push("pravilo za različita mjesta i prodavatelje");
  if (kind === "goods" && selects(a, "regulation", "regulated")) issues.push("izuzeće za reguliranu cijenu robe");
  const split = price === "quote" ? " Odvojite individualni izračun od fiksnih stavki poput izlaska, satnice i materijala." : "";
  const history = isUnknown(a, "history") || !selects(a, "proof", "yes") ? evidence : "Sačuvajte zapis o cijeni za ovo prodajno mjesto.";
  const prepare = selects(a, "history", "new", "changed")
    ? "Zapišite prvu cijenu i datum kada ste ovu ponudu prvi put uvrstili u prodaju."
    : reference ? `Pronađite cijenu koja je vrijedila ${reference}` : "Pronađite raniju cijenu za ovu ponudu.";
  return result("check", `Zakon uvodi baznu cijenu. Konačni pravilnik određuje datum i način prikaza.${issues.length ? ` Još treba provjeriti ${issues.join(", ")}.` : ""}`, `${prepare} ${history}${split} U konačnom pravilniku provjerite koji iznos trebate prikazati.`, refs, { pending: true });
}

function unit(a: Answers, kind: string, ch: Channel): Guidance {
  const refs: SourceId[] = ["article7", "unit"];
  if (ambiguousKind(kind)) return toCheck("kinds", "Odredite sastav ponude i nudi li se pojedina roba odvojeno.", refs);
  if (kind !== "goods") return result("outside", "Pravilnikova obveza označavanja jedinične cijene po čl. 7.–8. odnosi se na robu.", "U cjeniku usluge na prodajnom mjestu navedite fiksne iznose ili jasnu osnovu obračuna (npr. €/sat). Za cijene uređene posebnim propisom slijedite taj propis.", refs);
  if (ch.key === "none") return result("outside", ch.type === "ad" ? "Nema oglašenog iznosa u ovom kanalu." : "Još nema prodajnog mjesta.", "Ponovno provjerite kad istaknete cijenu.", refs);
  if (selects(a, "goods", "auction") && !selects(a, "goods", "standard")) return result("outside", "Javna dražba, umjetnička djela i antikviteti izuzeti su čl. 7. st. 6. ZZP-a.", "Provjerite pravila za način prodaje koji primjenjujete.", refs);
  if (selects(a, "goods", "loose") && selects(a, "goods", "packed", "pieces")) return toCheck("goods", "Odvojite rasutu robu od pakirane ili komadne robe; pravilo nije isto za svaku stavku.", refs);
  if (selects(a, "goods", "loose")) return result("applies", "Rasuta roba ima izravnu obvezu isticanja jedinične cijene (čl. 7. st. 4. ZZP-a).", ch.type === "ad" ? "Navedite jasnu cijenu po odgovarajućoj jedinici uz oglašenu robu." : "Na prodajnom mjestu jasno navedite cijenu po odgovarajućoj jedinici.", refs, { example: `Rasuta roba\nCijena za 1 kg: ${blank}` });
  if (!selects(a, "goods", "packed", "pieces", "standard")) return toCheck("goods", "Utvrdite prodaje li se roba rasuto, pakirano ili na komad. Status nove ili rabljene robe sam po sebi nije dovoljan.", refs);
  if (either(a, "unit", "yes", "no") || isUnknown(a, "unit")) return toCheck("unit", "Provjerite popis iz čl. 8. st. 1. za konkretan artikl. Razdvojite skupine ako je potrebno.", refs);
  if (selects(a, "unit", "no")) return result("outside", "Ova roba nije rasuta i nije na popisu robe za koju treba prikazati cijenu po jedinici.", "Istaknite cijenu koju kupac plaća za artikl.", refs);
  const exceptions = withoutUncertain(a, "unitException").filter(v => v !== "none");
  if ((exceptions.length && selects(a, "unitException", "none")) || isUnknown(a, "unitException")) return toCheck("unitException", "Provjerite neto količinu, način pakiranja i vrstu prodaje za isti artikl.", refs);
  if (exceptions.length) return result("outside", `Označeno izuzeće: ${exceptions.map(v => label("unitException", v)).join("; ")}.`, "To izuzeće primijenite samo na odgovarajuću robu. Zasebno provjerite druge cijene.", refs);
  return result("applies", "Roba pripada popisu iz čl. 8. st. 1. i nije označeno izuzeće.", "Uz maloprodajnu cijenu navedite cijenu po odgovarajućoj jedinici. Za hranu u tekućini koristite ocijeđenu masu, a za glaziranu hranu neto masu bez glazure.", refs, { example: `Primjer za pakiranje od 500 g\nMaloprodajna cijena: 3,00 €\nCijena za 1 kg: 6,00 €` });
}

function discount(a: Answers, kind: string, ch: Channel): Guidance {
  const refs: SourceId[] = ["discount", "discountChange"];
  if (ch.key === "none") return result("outside", ch.type === "ad" ? "U ovom kanalu ne oglašavate iznos." : "Nema prodaje u ovom kanalu.", "Ponovno procijenite kada počnete oglašavati ili prodavati po sniženoj cijeni.", refs);
  if (ambiguousKind(kind)) return toCheck("kinds", "Odvojite robu od usluge kako biste mogli utvrditi pravila za prikaz sniženja.", refs);
  if (kind !== "goods" && (ch.type === "ad" || ["door", "webshop", "booking", "market", "social", "messages"].includes(ch.key))) return result("outside", "Čl. 19. st. 7.–8. izuzima oglašavanje usluge i ugovore o usluzi na daljinu ili izvan poslovnih prostorija.", "Jasno navedite cijenu i uvjete. Posebno provjerite eventualnu akciju iste usluge unutar poslovnih prostorija.", refs);
  const promotion = selects(a, "discount", "public", "coupon", "expiry");
  if ((promotion && selects(a, "discount", "none")) || isUnknown(a, "discount")) return toCheck("discount", "Provjerite nudite li ovdje javnu akciju ili kod dostupan svima. Ako akcija vrijedi samo na jednom mjestu, unesite je kao zasebnu ponudu.", [...refs, "euDiscount"]);
  if (!promotion && selects(a, "discount", "personal") && !has(a, "discount", "other", "unknown")) return result("outside", "Označen je stvarno individualni popust, bez javne najave sniženja.", "Opće dostupan kod ili široko oglašen popust procijenite kao javno sniženje.", [...refs, "euDiscount"]);
  if (!promotion && selects(a, "discount", "none") && !has(a, "discount", "other", "unknown")) return result("outside", "Za ovaj kanal nije označeno sniženje.", "Sačuvajte povijest cijena za eventualnu buduću akciju.", refs);
  if (!promotion) return toCheck("discount", "Pregledajte oglas i uvjete popusta za ovaj kanal.", refs);
  if (kind !== "goods" && !inPremises.includes(ch.key)) return toCheck("sales", "Utvrdite je li prodaja usluge sklopljena unutar poslovnih prostorija ili izvan njih.", refs);
  if (kind === "goods" && selects(a, "discount", "expiry")) {
    if (selects(a, "discount", "public", "coupon")) return toCheck("discount", "Odvojite običnu javnu akciju od posebne prodaje koja je određena baš zbog kvarljivosti ili isteka.", refs);
    if (ch.type === "ad") return result("check", "Izuzeće u čl. 19. st. 5. odnosi se na st. 4.; oglašavanje je uređeno zasebno u st. 6.", "Prije oglasa provjerite primjenu čl. 19. st. 6. i čl. 24. Istaknite krajnji rok uporabe na prodajnom mjestu.", refs);
    return result("outside", "Poseban oblik prodaje određen je zbog kvarljivosti ili skorog isteka (čl. 19. st. 5.).", "Istaknite krajnji rok uporabe. Kod postupnog snižavanja unutar poslovnih prostorija provjerite čl. 24. st. 2.–4.: neposredna prethodna cijena i snižena cijena; za prodaju na daljinu i izvan prostorija to postupno snižavanje nije dopušteno.", refs);
  }
  const example = `Cijena na akciji: ${blank}\nNajniža cijena u 30 dana prije akcije: ${blank}`;
  const ads = ch.type === "ad" ? "U oglasu" : "Na prodajnom mjestu";
  const qualified = "Kod javnog sniženja i koda dostupnog svima gledaju se ranije cijene iste ponude na mjestu gdje vrijedi popust.";
  const defect = kind === "goods" && selects(a, "goods", "defect") ? " Jasno označite grešku i opišite kupcu u čemu se sastoji (čl. 23.)." : "";
  if (selects(a, "discountProof", "first")) return result("check", "Za prvu prodaju nije utvrđena prethodna cijena koja bi potkrijepila oglašeno sniženje.", `Prikažite početnu cijenu bez oznake sniženja dok ne utvrdite valjanu prethodnu cijenu.${defect}`, [...refs, "euDiscount"], { question: "discountProof", example });
  if (!selects(a, "discountProof", "full") || has(a, "discountProof", "partial", "unknown")) return result("applies", `${qualified} ${evidence}`, `Pronađite najnižu cijenu po kojoj ste nudili artikl u 30 dana prije akcije. Prikažite je uz sniženu cijenu. Objavite sniženje tek kad potvrdite oba iznosa.${defect}`, [...refs, "euDiscount"], { amountNeedsCheck: true, question: "discountProof", example });
  return result("applies", qualified, `${ads} prikažite sniženu cijenu i najnižu cijenu u 30 dana prije akcije. Uračunajte ranije akcijske cijene. Postotak popusta računajte od te najniže cijene.${defect}`, [...refs, "euDiscount"], { example });
}

function priceList(a: Answers, kind: string, site: string): Guidance {
  const refs: SourceId[] = ["article7", "draftList", "repeal"];
  if (site === "conflict") return toCheck("website", "Označeni su vlastiti web i izostanak vlastitog weba. Provjerite na kojoj domeni sami objavljujete sadržaj.", refs);
  if (["unknown", "other"].includes(site)) return toCheck("website", "Utvrdite imate li svoju mrežnu stranicu ili samo profil/stranicu na tuđoj platformi.", refs);
  if (site === "none" && selects(a, "sales", "webshop")) return toCheck("website", "Označen je vlastiti webshop, ali i da nema vlastitog weba. Ako prodajete na tuđoj platformi, označite marketplace.", refs);
  if (site === "none") return result("outside", "Označili ste da nemate vlastitu mrežnu stranicu. Čl. 7. st. 9. obvezu veže uz vlastite mrežne stranice.", "Ako otvorite vlastiti web, procijenite obvezu ponovno. Za usluge zasebno provjerite cjenik na prodajnom mjestu.", ["article7", "unit"]);
  if (isUnknown(a, "activity")) return toCheck("activity", "Provjerite djelatnost i ugovornog prodavatelja za ovu ponudu.", ["consumer", "article7"]);
  if (isUnknown(a, "regulation")) return toCheck("regulation", "Provjerite uređuje li sektorski propis ovaj iznos i po kojem članku.", ["article7"]);
  if (ambiguousKind(kind) || selects(a, "regulation", "regulated")) return result("check", "Čl. 7. st. 9. propisuje objavu cjenika na vlastitom webu. Za ovu vrstu ili regulaciju ponude treba potvrditi točan obuhvat.", "Pripremite odvojene popise proizvoda, tržišnih i reguliranih usluga. U konačnom pravilniku provjerite obuhvat svake stavke i način objave.", refs, { pending: true });
  const quote = selects(a, "pricing", "quote") ? " Odvojite ponude po mjeri od fiksnih stavki poput satnice, izlaska i doplata." : "";
  return result("applies", "Zakon traži važeći cjenik na vašem webu, čak i kad na njemu nemate košaricu. U konačnom pravilniku provjerite format datoteke, podatke koje treba navesti i koliko dugo treba čuvati stare cjenike.", `Pripremite stranicu „Cjenik” s aktualnim cijenama. Ako cijene ovise o prodajnom mjestu, označite za koje mjesto vrijede.${quote} U konačnom pravilniku provjerite kako objaviti i kada ažurirati cjenik.`, refs, { pending: true, example: "Na web dodajte poveznicu „Cjenik”. Na stranici označite koji su iznosi za poslovnicu, a koji za webshop." });
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
    return { groups: [{ title: "Kupci izvan potrošačke prodaje", items: (Object.keys(obligations) as Obligation[]).map(obligation => ({ obligation, ...general(obligation, a, "hr")! })) }], notes: [] as string[], showCta: false };
  }
  const kinds = direct(a) || !fee(a) ? (selected(a, "kinds").length ? selected(a, "kinds") : ["unknown"]) : [];
  const parts = [...kinds.map(kind => ({ kind, title: label("kinds", kind), fee: false })), ...(fee(a) ? [{ kind: "service", title: "Vlastita naknada potrošaču", fee: true }] : [])];
  const sites = selected(a, "website");
  const website = sites.length > 1 && sites.includes("none") ? ["conflict", ...sites.filter(key => key === "shop" || key === "info")] : sites.length ? sites : ["unknown"];

  for (const part of parts) for (const area of territory) {
    const prefix = `${part.title}${area === "foreign" ? " · druge države" : area !== "hr" ? " · tržište nije utvrđeno" : ""}`;
    for (const ch of channels(a)) {
      const askChannel = ["unknown", "other", "conflict"].includes(ch.key) ? toCheck(ch.type === "sale" ? "sales" : "ads", `Utvrdite gdje je ponuda dostupna i gdje se javno prikazuju cijene. ${scopeAction}`, ["article7"]) : undefined;
      const priceParts = part.fee ? ["fee"] : selected(a, "pricing").length ? selected(a, "pricing") : ["unknown"];
      const items = priceParts.map(price => {
        const base = general("base", a, area) ?? askChannel ?? nextBase(a, part.kind, ch, price);
        const priced = priceParts.length > 1 && base.pending;
        return { obligation: "base" as const, ...base, reason: priced ? `${label("pricing", price)}: ${base.reason}` : base.reason };
      }).filter((row, i, all) => all.findIndex(other => other.reason === row.reason) === i);
      const section = ch.type === "sale" ? "Prodaja" : "Oglašavanje";
      groups.push({ title: `${prefix} · ${section}: ${ch.name}`, items: [
        ...items,
        { obligation: "unit", ...(general("unit", a, area) ?? askChannel ?? unit(a, part.kind, ch)) },
        { obligation: "discount", ...(general("discount", a, area) ?? askChannel ?? discount(a, part.kind, ch)) },
      ] });
    }
    for (const site of website) {
      const generalGuidance = general("list", a, area);
      groups.push({
        title: `${prefix} · ${["unknown", "other", "conflict"].includes(site) ? "Vlastiti web" : label("website", site)}`,
        website: !generalGuidance && (site === "shop" || site === "info") ? site : undefined,
        items: [{ obligation: "list", ...(generalGuidance ?? priceList(a, part.kind, site)) }],
      });
    }
  }
  const notes: string[] = [];
  if (selects(a, "buyers", "consumer") && selects(a, "buyers", "company", "institution", "buyer")) notes.push("Upute se odnose na prodaju građanima za osobnu uporabu. Dio za poslovne kupce, ustanove i otkupljivače izvan je ovih potrošačkih obveza.");
  if (selects(a, "roles", "display") && (direct(a) || fee(a))) {
    notes.push("Tuđe cijene provjerite prema ugovoru s prodavateljem. Ove upute za vlastitu ponudu ili naknadu nemojte prenijeti na stavke drugog prodavatelja.");
    const third = { ...a, roles: ["display" as const] };
    groups.push({ title: "Posredovanje · prikaz tuđih cijena", items: (Object.keys(obligations) as Obligation[]).map(obligation => ({ obligation, ...general(obligation, third, territory.includes("hr") ? "hr" : territory[0])! })) });
  }
  if (selects(a, "locations", "different", "sellers") || (withoutUncertain(a, "sales").length > 1 && !selects(a, "locations", "same"))) notes.push("Usporedne cijene i dokaze vodite zasebno po mjestu, kanalu i prodavatelju. Za više poslovnica istog tipa s različitim cijenama dodajte zasebnu ponudu za svaku poslovnicu.");
  if (selects(a, "goods", "defect")) notes.push("Uz robu s greškom jasno označite nedostatak i objasnite kupcu o kojoj je grešci riječ (čl. 23. ZZP-a).");
  if (parts.length > 1 || selects(a, "pricing", "quote") && selects(a, "pricing", "fixed", "fee", "hour", "measure")) notes.push("Odvojite standardne stavke i njihove cijene od drugih vrsta ponude i individualnih izračuna. Za različite kanale, propise ili prodavatelje dodajte zasebnu ponudu.");
  const showCta = groups.some(g => g.items.some(row => row.obligation === "list" && row.status === "applies"));
  return { groups, notes, showCta };
}

type WebsiteScope = { offerId: number; detail: string; row: ResultRow };

function websiteDecisionKey({ status, action, pending, question, reason }: ResultRow) {
  return JSON.stringify([status, action, pending, question, status === "check" ? reason : undefined]);
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
    const sales = withoutUncertain(offer.answers, "sales").filter(value => value !== "none").map(value => label("sales", value));
    for (const group of groups) {
      if (!group.website) continue;
      const domains = domainsByType.get(group.website)!;
      const domain = websiteDomain(offer.websiteDomains?.[group.website]) ?? (domains.size === 1 ? [...domains][0] : undefined);
      const key = domain ?? `type:${group.website}`;
      const website = byWebsite.get(key) ?? { title: domain ?? label("website", group.website), assignDomain: !domain && domains.size > 1, scopes: [] };
      const name = offerName(offer, index);
      website.scopes.push({ offerId: offer.id, detail: sales.length ? `${name} (${sales.join(", ")})` : name, row: group.items[0] });
      byWebsite.set(key, website);
    }
    return { offer, name: offerName(offer, index), groups: groups.filter(group => !group.website), notes };
  });

  const websites = [...byWebsite].map(([key, { title, assignDomain, scopes }]) => {
    const primary = scopes.find(scope => scope.row.status === "applies") ?? scopes[0];
    const scopeNames = [...new Set(scopes.map(scope => scope.detail))];
    if (assignDomain) return {
      key, title: `${title} bez navedene domene`, offerId: primary.offerId, scopes: scopeNames, details: [],
      row: { obligation: "list" as const, ...toCheck("website", "Upišite adresu weba na kojem ćete objaviti cijene za ove ponude.", ["article7"]) },
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
    return { key, title, row: primary.row, offerId: primary.offerId, details: [...distinct.values()], scopes: scopeNames };
  });
  return { offerResults, websites, showCta: websites.some(({ row }) => row.status === "applies") };
}

function formatGuidance(row: ResultRow) {
  return [
    `${obligations[row.obligation]} — ${statusLabels[row.status]}${row.amountNeedsCheck ? ` · ${amountCheckLabel}` : ""}${row.pending ? " · Čeka objavu pravilnika" : ""}`,
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
      ...site.details.map(({ scopes, row }) => `${scopes.map(scope => scope.detail).join("; ")} — ${statusLabels[row.status]}. ${row.reason}\n${row.action}`),
    ]),
  ].filter(Boolean).join("\n");
}
