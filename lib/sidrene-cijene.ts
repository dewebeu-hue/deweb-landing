import { CHANGE, DATES, label, questions, selected, selects, sources, type Answers, type AssessmentDate, type Offer, type QuestionId, type SourceId } from "./sidrene-cijene-podaci.ts";

export const obligations = { base: "Bazna (sidrena) cijena", unit: "Jedinična cijena", discount: "Najniža cijena prije sniženja", list: "Mrežni cjenik" } as const;
export const statusLabels = { applies: "Primjenjuje se", outside: "Izvan opsega ove obveze", check: "Potrebna provjera" } as const;
type Obligation = keyof typeof obligations;
type Status = keyof typeof statusLabels;
export type Guidance = {
  status: Status; reason: string; action: string; refs: SourceId[];
  pending?: boolean; example?: string; question?: QuestionId;
};
type Channel = { type: "sale" | "ad"; key: string; name: string };
type Group = { title: string; items: (Guidance & { obligation: Obligation })[] };
const result = (status: Status, reason: string, action: string, refs: SourceId[], extra?: Pick<Guidance, "pending" | "example" | "question">): Guidance => ({ status, reason, action, refs, ...extra });
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
const evidence = "Provjerite datirane cjenike, izvoz iz blagajne ili webshopa, arhivu kataloga i račune za istu ponudu na istom mjestu. Polje ostavite prazno dok nemate dokaz.";
const scopeAction = "Odvojite ponude ili mjesta u kojima se kupac, prodavatelj, cijena ili propis razlikuju.";
const appliesDate = (date: AssessmentDate) => date >= CHANGE;
const article7 = (date: AssessmentDate): SourceId => appliesDate(date) ? "article7" : "retail";
const toCheck = (question: QuestionId, action: string, refs: SourceId[]) => result("check", questions[question][0], action, refs, { question });
const general = (obligation: Obligation, a: Answers, territory: string): Guidance | undefined => {
  if (isUnknown(a, "buyers") || (!selects(a, "buyers", "consumer") && has(a, "buyers", "unknown", "other"))) return toCheck("buyers", "Provjerite kupuje li itko kao fizička osoba za osobnu uporabu.", ["consumer"]);
  if (!selects(a, "buyers", "consumer")) return result("outside", "Ova ponuda ide isključivo poslovnim kupcima, ustanovama ili otkupljivačima.", "Ako istu ponudu otvorite građanima za osobnu uporabu, dodajte potrošačku ponudu.", ["consumer"]);
  if (territory === "foreign") return result("check", "Ovaj pregled obrađuje hrvatsko tržište.", "Zabilježite države u kojima ciljate potrošače i za svaku provjerite mjerodavne propise prije objave.", ["consumer"]);
  if (territory !== "hr") return toCheck("territory", "Provjerite države dostave, uvjete ugovora i publiku oglasa.", ["consumer"]);
  if (isUnknown(a, "roles")) return toCheck("roles", "Na računu i u uvjetima provjerite tko je ugovorni prodavatelj i tko potrošaču naplaćuje naknadu.", ["consumer"]);
  if (onlyThird(a)) return result("check", "Prikazujete tuđu ponudu. Ugovorni prodavatelj i posrednik mogu imati različite obveze.", `Utvrdite tko prodaje i tko ističe cijenu u ovom kanalu.${obligation === "base" ? " Pojašnjenje za ranije odluke razlikuje tuđe cijene od vlastitih naknada." : ""}`, obligation === "base" ? ["consumer", "ministry"] : ["consumer"]);
};

function legacyBase(a: Answers, kind: string, channel: Channel): Guidance {
  const refs: SourceId[] = ["legacyBase"];
  const outside = (reason: string, extra: SourceId[] = []) => result("outside", reason, "Provjerite zasebno jediničnu cijenu i eventualno sniženje.", [...refs, ...extra]);
  if (kind !== "goods" && !ambiguousKind(kind)) return outside("Ranija dodatna cijena iz NN 75/2025 obuhvaća odabrane skupine robe, bez usluga.");
  if (selects(a, "activity", "opg") && !selects(a, "activity", "retail") && !has(a, "activity", "unknown", "other")) return outside("Označili ste upisani OPG koji prodaje izravno. Službeno pojašnjenje isključuje taj OPG iz Odluke NN 75/2025.", ["opg"]);
  if (ambiguousKind(kind)) return toCheck("kinds", "Razdvojite robu od usluge i provjerite pripada li roba jednoj od šest skupina.", refs);
  if (either(a, "legacy", "yes", "no") || isUnknown(a, "legacy")) return toCheck("legacy", "Provjerite kategoriju konkretnog artikla u katalogu. Razdvojite artikle iz različitih skupina.", refs);
  if (selects(a, "legacy", "no")) return outside("Roba je izvan šest skupina koje navodi točka VI. Odluke NN 75/2025.");
  if (!selects(a, "activity", "retail") || selects(a, "activity", "opg")) return toCheck("activity", "Provjerite upis u odgovarajući registar i izdvojite prodaju u svojstvu maloprodajnog trgovca.", [...refs, "opg"]);
  if (channel.key === "none") return outside(channel.type === "ad" ? "U ovom kanalu ne oglašavate iznos." : "Niste odabrali mjesto na kojem se ponuda prodaje.");
  if (channel.type === "ad" && channel.key === "broadcast") return result("check", "Točka VI. nabraja letke, plakate, digitalno oglašavanje i mrežne stranice; TV i radio nisu izrijekom navedeni.", "Provjerite konkretan format oglasa prije objave.", refs);
  if ((channel.type === "sale" && !inPremises.includes(channel.key)) || (channel.type === "ad" && !["web", "print"].includes(channel.key))) return result("check", "Točka VI. ne razrješava izrijekom ovaj oblik prodaje ili oglašavanja.", "Provjerite s Ministarstvom gospodarstva ili Državnim inspektoratom smatra li se ovaj konkretan prikaz prodajnim mjestom ili oglasom obuhvaćenim Odlukom.", refs);
  const reference = "2. 5. 2025.";
  const example = `${channel.type === "ad" ? "Tekst oglasa" : "Oznaka uz robu"}\nAktualna cijena: ${blank}\nDodatna cijena (${reference}): ${blank}`;
  const next = legacyHistory(a, refs, example);
  return next ?? result("applies", `Registrirana maloprodaja obuhvaćene robe. Referenca je redovna cijena primijenjena ${reference}`, `Uz aktualnu cijenu istaknite redovnu cijenu s tog dana.${selects(a, "history", "renamed") ? " Povežite staru i novu šifru istog artikla." : ""}${selects(a, "history", "promo") ? " Iz evidencije uzmite redovnu cijenu bez akcije." : ""} Koristite evidenciju istog mjesta prodaje.`, refs, { example });
}

function legacyHistory(a: Answers, refs: SourceId[], example: string): Guidance | undefined {
  const conflict = selects(a, "history", "new") && selects(a, "history", "existing", "stock", "promo", "renamed");
  if (conflict || isUnknown(a, "history")) return result("check", conflict ? "Označeni su i prva ponuda nakon referentnog dana i prethodna povijest iste ponude." : "Nije utvrđeno je li ista ponuda postojala 2. 5. 2025.", `${scopeAction} ${evidence}`, refs, { question: "history", example });
  if (selects(a, "history", "new", "changed", "stock")) return result("check", "Treba utvrditi je li i po kojoj cijeni ista roba bila ponuđena na referentni dan. Odluka ne propisuje izričito zamjenski datum.", `${evidence} Ne upisujte današnju ili početnu cijenu kao cijenu od 2. 5. 2025. bez potvrde.`, refs, { question: "history", example });
  if (!selects(a, "proof", "yes") || has(a, "proof", "no", "unknown")) return result("check", "Obveza je utvrđena, ali nedostaje dokaz o povijesnom iznosu.", evidence, refs, { question: "proof", example });
}

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
  const history = isUnknown(a, "history") || !selects(a, "proof", "yes") ? ` ${evidence}` : " Sačuvajte dokaz za ovaj kanal i istu ponudu.";
  return result("check", `Zakon uvodi baznu cijenu. Konačni tekst određuje dan, obuhvat i prikaz${issues.length ? `; otvoreno: ${issues.join(", ")}` : ""}.`, `Pripremite evidenciju${reference ? ` za ${reference} prema najavi` : " prema skupini robe"}.${split}${history} Prije objave provjerite konačni tekst i prestanak prijelaznih odluka.`, refs, { pending: true });
}

function unit(a: Answers, kind: string, ch: Channel, date: AssessmentDate): Guidance {
  const refs: SourceId[] = [article7(date), "unit"];
  if (ambiguousKind(kind)) return toCheck("kinds", "Odredite sastav ponude i nudi li se pojedina roba odvojeno.", refs);
  if (kind !== "goods") return result("outside", "Pravilnikova obveza označavanja jedinične cijene po čl. 7.–8. odnosi se na robu.", "U cjeniku usluge na prodajnom mjestu navedite fiksne iznose ili jasnu osnovu obračuna (npr. €/sat). Za cijene uređene posebnim propisom slijedite taj propis.", refs);
  if (ch.key === "none") return result("outside", ch.type === "ad" ? "Nema oglašenog iznosa u ovom kanalu." : "Još nema prodajnog mjesta.", "Ponovno provjerite kad istaknete cijenu.", refs);
  if (selects(a, "goods", "auction") && !selects(a, "goods", "standard")) return result("outside", "Javna dražba, umjetnička djela i antikviteti izuzeti su čl. 7. st. 6. ZZP-a.", "Provjerite pravila za način prodaje koji primjenjujete.", refs);
  if (selects(a, "goods", "loose") && selects(a, "goods", "packed", "pieces")) return toCheck("goods", "Odvojite rasutu robu od pakirane ili komadne robe; pravilo nije isto za svaku stavku.", refs);
  if (selects(a, "goods", "loose")) return result("applies", "Rasuta roba ima izravnu obvezu isticanja jedinične cijene (čl. 7. st. 4. ZZP-a).", ch.type === "ad" ? "Navedite jasnu cijenu po odgovarajućoj jedinici uz oglašenu robu." : "Na prodajnom mjestu jasno navedite cijenu po odgovarajućoj jedinici.", refs, { example: `Rasuta roba\nCijena za 1 kg: ${blank}` });
  if (!selects(a, "goods", "packed", "pieces", "standard")) return toCheck("goods", "Utvrdite prodaje li se roba rasuto, pakirano ili na komad. Status nove ili rabljene robe sam po sebi nije dovoljan.", refs);
  if (either(a, "unit", "yes", "no") || isUnknown(a, "unit")) return toCheck("unit", "Provjerite popis iz čl. 8. st. 1. za konkretan artikl. Razdvojite skupine ako je potrebno.", refs);
  if (selects(a, "unit", "no")) return result("outside", "Označili ste da roba nije rasuta i da nije na popisu iz čl. 8. st. 1.", "Redovno istaknite maloprodajnu cijenu i provjerite primjenjuje li se poseban propis.", refs);
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
  if ((promotion && selects(a, "discount", "none")) || isUnknown(a, "discount")) return toCheck("discount", "Provjerite je li niža cijena javno ponuđena i kome je kupon dostupan. Razdvojite redovnu i akcijsku ponudu ako se razlikuju po kanalima.", [...refs, "euDiscount"]);
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
  const qualified = "Javno sniženje ili javno dostupan kupon. Najniža cijena se utvrđuje za istu ponudu na tom mjestu ili kanalu.";
  const defect = kind === "goods" && selects(a, "goods", "defect") ? " Jasno označite grešku i opišite kupcu u čemu se sastoji (čl. 23.)." : "";
  if (!selects(a, "discountProof", "full") || has(a, "discountProof", "partial", "first", "unknown")) return result("check", `${qualified} Prethodni iznos nije potvrđen.`, `Prije objave usporednog iznosa obnovite evidenciju za 30 dana. ${evidence}${selects(a, "discountProof", "first") ? " Ako prethodna cijena ne postoji, nemojte predstavljati početnu cijenu kao sniženje bez provjere." : ""}${defect}`, [...refs, "euDiscount"], { question: "discountProof", example });
  return result("applies", qualified, `${ads} prikažite sniženu cijenu i najnižu stvarno primijenjenu cijenu u 30 dana prije početka sniženja. Uključite ranije akcijske cijene; postotak računajte od te najniže cijene.${defect}`, [...refs, "euDiscount"], { example });
}

function priceList(a: Answers, kind: string, site: string, date: AssessmentDate): Guidance {
  const next = appliesDate(date);
  const refs: SourceId[] = next ? ["article7", "draftList", "repeal"] : ["legacyList"];
  if (site === "conflict") return toCheck("website", "Označeni su vlastiti web i izostanak vlastitog weba. Provjerite na kojoj domeni sami objavljujete sadržaj.", refs);
  if (!next) {
    if (selects(a, "activity", "opg") && !selects(a, "activity", "retail")) return result("outside", "Označili ste upisani OPG koji prodaje izravno. Ranija odluka prema službenom pojašnjenju ne obuhvaća taj OPG.", "Za izravnu prodaju provjerite obveze označavanja cijena na prodajnom mjestu.", [...refs, "opg"]);
    if ((kind !== "goods" && !ambiguousKind(kind)) || selects(a, "storeType", "no") && !selects(a, "storeType", "yes")) return result("outside", "Ranija mrežna obveza odnosi se na šest skupina robe u supermarketima, hipermarketima, diskontima i Cash & Carry prodavaonicama.", "Ako pružate uslugu, uredite lako dostupan cjenik na prodajnom mjestu prema čl. 9. Pravilnika NN 105/2026.", [...refs, "unit"]);
    if (ambiguousKind(kind)) return toCheck("kinds", "Provjerite nudi li se roba iz obuhvaćenih skupina zasebno, pod vlastitom maloprodajnom cijenom.", refs);
    if (selects(a, "legacy", "no") && !selects(a, "legacy", "yes")) return result("outside", "Označena roba nije u šest skupina ranije odluke.", "Zasebno provjerite druge kategorije robe u istoj prodavaonici.", refs);
    if (!selects(a, "storeType", "yes") || either(a, "storeType", "yes", "no")) return toCheck("storeType", "U registru i podacima o prodajnom objektu provjerite pripada li jednoj od četiri navedene kategorije.", refs);
    if (!selects(a, "legacy", "yes") || either(a, "legacy", "yes", "no")) return toCheck("legacy", "Provjerite pripada li roba skupinama iz t. III. ranije odluke.", refs);
    return result("applies", "Označena je obuhvaćena prodavaonica i skupina robe prema t. II.–V. ranije odluke.", "Objavite javni CSV ili XML za svaki prodajni objekt, ažuriran do 8:00 za radni dan. Ostavite cjenike javno dostupnima 30 dana i omogućite automatizirano dohvaćanje cijena u realnom vremenu.", refs, { example: "Na vlastitoj mrežnoj stranici: Cjenici → odaberite poslovnicu i datum → preuzmite CSV ili XML. Koristite datoteku s poljima iz t. III. i nazivom iz t. IV." });
  }
  if (["unknown", "other"].includes(site)) return toCheck("website", "Utvrdite imate li svoju mrežnu stranicu ili samo profil/stranicu na tuđoj platformi.", refs);
  if (site === "none" && selects(a, "sales", "webshop")) return toCheck("website", "Označen je vlastiti webshop, ali i da nema vlastitog weba. Ako prodajete na tuđoj platformi, označite marketplace.", refs);
  if (site === "none") return result("outside", "Označili ste da nemate vlastitu mrežnu stranicu. Čl. 7. st. 9. obvezu veže uz vlastite mrežne stranice.", "Ako otvorite vlastiti web, procijenite obvezu ponovno. Za usluge zasebno provjerite cjenik na prodajnom mjestu.", ["article7", "unit"]);
  if (isUnknown(a, "activity")) return toCheck("activity", "Provjerite djelatnost i ugovornog prodavatelja za ovu ponudu.", ["consumer", "article7"]);
  if (isUnknown(a, "regulation")) return toCheck("regulation", "Provjerite uređuje li sektorski propis ovaj iznos i po kojem članku.", ["article7"]);
  if (ambiguousKind(kind) || selects(a, "regulation", "regulated")) return result("check", "Čl. 7. st. 9. propisuje objavu cjenika na vlastitom webu. Za ovu vrstu ili regulaciju ponude treba potvrditi točan obuhvat.", "Pripremite odvojene popise proizvoda, tržišnih i reguliranih usluga. U konačnom pravilniku provjerite obuhvat svake stavke i način objave.", refs, { pending: true });
  const quote = selects(a, "pricing", "quote") ? " Individualni izračun držite odvojeno od standardnih stavki poput satnice, izlaska i doplata; provjerite konačan obuhvat." : "";
  return result("applies", site === "info" ? "Čl. 7. st. 9. obuhvaća vlastitu mrežnu stranicu i kada nema košarice." : "Čl. 7. st. 9. propisuje važeći cjenik na vlastitoj mrežnoj stranici.", `Pripremite stranicu „Cjenik” s lako dostupnom poveznicom i važećim cijenama.${quote} Format, polja, računalna dostupnost, rok ažuriranja i arhiva čekaju potvrdu u konačnom pravilniku.`, refs, { pending: true, example: "Vlastiti web → Cjenik → važeće ponude i cijene. Odvojite različite poslovnice i cjenike ako se iznosi razlikuju. Prije objave provjerite konačan format datoteke." });
}

function channels(a: Answers): Channel[] {
  return (["sales", "ads"] as const).flatMap(k => {
    const type: Channel["type"] = k === "sales" ? "sale" : "ad";
    const values = withoutUncertain(a, k);
    if (values.length > 1 && values.includes("none")) return [...values.filter(v => v !== "none").map(key => ({ type, key, name: label(k, key) })), { type, key: "conflict", name: k === "sales" ? "Proturječan odabir prodaje" : "Proturječan odabir oglašavanja" }];
    return (selected(a, k).length ? selected(a, k) : ["unknown"]).map(key => ({ type, key, name: label(k, key) }));
  });
}

export function assessOffer(offer: Offer, date: AssessmentDate) {
  const a = offer.answers;
  const groups: Group[] = [];
  const next = appliesDate(date);
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
      const askChannel = ["unknown", "other", "conflict"].includes(ch.key) ? toCheck(ch.type === "sale" ? "sales" : "ads", `Utvrdite gdje je ponuda dostupna i gdje se javno prikazuju cijene. ${scopeAction}`, [article7(date)]) : undefined;
      const priceParts = part.fee ? ["fee"] : selected(a, "pricing").length ? selected(a, "pricing") : ["unknown"];
      const items = priceParts.map(price => {
        const base = general("base", a, area) ?? askChannel ?? (next ? nextBase(a, part.kind, ch, price) : legacyBase(a, part.kind, ch));
        const priced = new Set(priceParts).size > 1 && next && base.pending;
        return { obligation: "base" as const, ...base, reason: priced ? `${label("pricing", price)}: ${base.reason}` : base.reason };
      }).filter((row, i, all) => all.findIndex(other => other.reason === row.reason) === i);
      const section = ch.type === "sale" ? "Prodaja" : "Oglašavanje";
      groups.push({ title: `${prefix} · ${section}: ${ch.name}`, items: [
        ...items,
        { obligation: "unit", ...(general("unit", a, area) ?? askChannel ?? unit(a, part.kind, ch, date)) },
        { obligation: "discount", ...(general("discount", a, area) ?? askChannel ?? discount(a, part.kind, ch)) },
      ] });
    }
    for (const site of website) groups.push({ title: `${prefix} · ${["unknown", "other", "conflict"].includes(site) ? "Vlastiti web" : label("website", site)}`, items: [{ obligation: "list", ...(general("list", a, area) ?? priceList(a, part.kind, site, date)) }] });
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

export function formatResults(offers: Offer[], date: AssessmentDate) {
  return ["Moram li isticati sidrenu cijenu? · deweb", DATES.find(([d]) => d === date)?.[1], ...offers.flatMap((offer, index) => {
    const { groups, notes } = assessOffer(offer, date);
    return [`\n${offer.name.trim() || `Ponuda ${index + 1}`}`, ...notes, ...groups.flatMap(group => [`\n${group.title}`, ...group.items.map(row => [
      `${obligations[row.obligation]} — ${statusLabels[row.status]}${row.pending ? " · Čeka objavu pravilnika" : ""}`,
      row.reason, row.action, row.example,
      ...row.refs.map(id => `${sources[id].title}, ${sources[id].section} (${sources[id].type}): ${sources[id].url}`),
    ].filter(Boolean).join("\n"))])];
  })].filter(Boolean).join("\n");
}
