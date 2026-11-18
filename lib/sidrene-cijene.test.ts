import test from "node:test";
import assert from "node:assert/strict";
import { assessOffer, assessResults, formatResults } from "./sidrene-cijene.ts";
import { sources, websiteDomain, type Answers, type Offer } from "./sidrene-cijene-podaci.ts";

const good: Answers = {
  buyers: ["consumer"], roles: ["own"], territory: ["hr"], kinds: ["goods"], activity: ["retail"], goods: ["new", "packed"],
  pricing: ["fixed"], regulation: ["market"], priceException: ["none"], sales: ["shop"], ads: ["none"], website: ["none"], locations: ["one"], legacy: ["yes"],
  unit: ["yes"], unitException: ["none"], history: ["existing"], referenceDiscount: ["regular"], proof: ["yes"], discount: ["none"],
};
const service: Answers = { kinds: ["service"], activity: ["service"] };
const check = (patch: Answers) => assessOffer({ id: 1, name: "Ponuda", answers: { ...good, ...patch } });
const rows = (assessment: ReturnType<typeof check>) => assessment.groups.flatMap(group => group.items);
const channel = (assessment: ReturnType<typeof check>, title: string, obligation: keyof typeof import("./sidrene-cijene.ts").obligations) => {
  const found = assessment.groups.find(group => group.title.includes(title))?.items.find(row => row.obligation === obligation);
  assert.ok(found, `${title} / ${obligation}`);
  return found;
};

test("isključivi B2B zahtijeva poznate kupce; mješovita prodaja zadržava B2C upute", () => {
  assert.equal(rows(check({ buyers: ["company", "institution", "buyer"] })).length, 4);
  assert.ok(rows(check({ buyers: ["company", "institution", "buyer"] })).every(row => row.status === "outside"));
  assert.ok(rows(check({ buyers: ["company", "other"] })).every(row => row.status === "check"));
  const mixed = check({ buyers: ["consumer", "company"] });
  assert.equal(channel(mixed, "Fizička poslovnica", "base").status, "applies");
  assert.equal(channel(mixed, "Fizička poslovnica", "unit").status, "applies");
  assert.match(mixed.notes.join(), /poslovne kupce/);
});

test("upisani OPG na štandu zadržava jediničnu cijenu; prodaja otkupljivaču odvojena", () => {
  const farm: Answers = { activity: ["opg"], sales: ["stand"], goods: ["loose"], pricing: ["measure"], buyers: ["consumer", "buyer"] };
  assert.equal(channel(check(farm), "Štand", "unit").status, "applies");
  assert.ok(rows(check({ ...farm, buyers: ["buyer"] })).every(row => row.status === "outside"));
  assert.deepEqual(channel(check(farm), "Štand", "base").refs, ["baseLegacy", "baseGoods"]);
});

test("Instagram bez vlastitog weba ne uklanja pravila prodaje i oglašavanja", () => {
  const result = check({ sales: ["social"], ads: ["social"], discount: ["coupon"], discountProof: ["full"] });
  assert.equal(channel(result, "Nemam vlastiti web", "list").status, "outside");
  assert.equal(channel(result, "Društvena mreža", "unit").status, "applies");
  assert.equal(channel(result, "Javne objave", "discount").status, "applies");
  assert.equal(channel(result, "Prodaja: Društvena mreža", "base").status, "applies");
  const ad = channel(result, "Oglašavanje: Javne objave", "base");
  assert.equal(ad.status, "outside");
  assert.equal(ad.refs[0], "baseOptionalAd");
  assert.equal(channel(result, "Oglašavanje: Javne objave", "discount").refs[0], "discountAd");
  assert.equal(result.showCta, false);
});

test("vlastiti web bez košarice objavljuje cjenik prema čl. 3., 5. i 6.", () => {
  const answers: Answers = { ...service, website: ["info"], sales: ["door"], ads: ["web"] };
  const after = check(answers);
  const list = channel(after, "Vlastiti web bez košarice", "list");
  assert.equal(list.status, "applies");
  assert.deepEqual(list.refs, ["listLocations", "listService", "listAccess"]);
  assert.match(list.action, /javnom URL-u.*CSV ili XML.*isti URL do 11:00 na dan izmjene.*15 dana od zamjene/);
  assert.match(list.example ?? "", /naziv usluge.*maloprodajna cijena.*bazna cijena/);
  assert.match(list.example ?? "", /automatizirano dohvaćanje.*UTF-8.*točku sa zarezom.*ZIP ili GZ/);
  assert.match(list.example ?? "", /ZA_SVA_PRODAJNA_MJESTA/);
  assert.equal(after.showCta, true);
  assert.equal(channel(after, "Oglašavanje", "discount").status, "outside");
});

test("webshop i outlet: zasebni iznosi, dokazi i upute bez ukidanja outlet obveze", () => {
  const channels: Answers = { sales: ["webshop", "outlet"], ads: ["web", "print", "tv", "radio"], printTiming: ["new"], website: ["shop"], locations: ["different"], discount: ["public"], discountProof: ["full"] };
  const a = check(channels);
  assert.equal(channel(a, "Prodaja: Outlet", "base").status, "applies");
  assert.match(channel(a, "Prodaja: Vlastiti webshop", "base").action, /Na webshopu/);
  for (const medium of ["Letci", "Televizija"]) {
    const ad = channel(a, `Oglašavanje: ${medium}`, "base");
    assert.equal(ad.status, "applies");
    assert.ok(ad.refs.includes("baseMandatoryAd"));
  }
  assert.equal(channel(a, "Oglašavanje: Radio", "base").refs[0], "baseOptionalAd");
  assert.equal(channel(a, "Oglašavanje: Vlastiti web", "base").status, "outside");
  assert.equal(channel(a, "Prodaja: Outlet", "discount").status, "applies");
  assert.equal(channel(a, "Prodaja: Vlastiti webshop", "discount").status, "applies");
  assert.match(a.notes.join(), /zasebno po mjestu, kanalu i prodavatelju/);
  const { websites } = assessResults([{ id: 1, name: "Odjeća", answers: { ...good, ...channels }, websiteDomains: { shop: "trgovina.hr" } }]);
  assert.equal(websites.length, 1);
  assert.match(websites[0].row.action, /zasebne cjenike za prodajna mjesta s različitim cjenicima/);
  assert.match(websites[0].row.example ?? "", /neto količina.*barkod.*, EAN barkod.*bazna cijena/);
});

test("samo tiskani oglas može koristiti prijelaz i samo on traži datum izrade", () => {
  const cases = check({ ads: ["print", "tv"], printTiming: ["unknown"] });
  assert.equal(channel(cases, "Letci", "base").question, "printTiming");
  assert.equal(channel(cases, "Televizija", "base").status, "applies");
  assert.equal(channel(cases, "Fizička poslovnica", "base").status, "applies");
  const old = channel(check({ ads: ["print"], printTiming: ["old"] }), "Letci", "base");
  assert.equal(old.status, "outside");
  assert.equal(old.refs[0], "baseOldPrint");
  assert.match(old.action, /najdulje 30 dana od 17\. 11\. 2026\./);
});

test("prodavatelja na marketplaceu pravila ne tretiraju kao posrednika koji prikazuje tuđe cijene", () => {
  const seller: Answers = { roles: ["platform"], sales: ["market"], ads: ["market"], discount: ["public"], discountProof: ["full"] };
  const a = check(seller);
  assert.equal(channel(a, "Prodaja: Tuđa platforma", "base").status, "applies");
  assert.equal(channel(a, "Prodaja: Tuđa platforma", "discount").status, "applies");
  assert.equal(channel(check({ ...seller, roles: ["display"] }), "Prodaja: Tuđa platforma", "base").refs[0], "baseIntermediary");
});

test("posrednik s vlastitom naknadom dobiva uputu za naknadu odvojeno od tuđe cijene", () => {
  const a = check({ ...service, roles: ["display", "fee"], website: ["info"], sales: ["booking"], ads: ["market"] });
  assert.deepEqual(channel(a, "Vlastita naknada", "base").refs, ["baseGeneral", "baseService"]);
  assert.match(a.notes.join(), /tuđe cijene/i);
  assert.equal(channel(a, "Posredovanje · prikaz tuđih cijena", "base").status, "outside");
  assert.match(channel(a, "Posredovanje · prikaz tuđih cijena", "base").action, /tko je prodavatelj/);
  assert.equal(channel(a, "Posredovanje · prikaz tuđih cijena · Cjenik", "list").refs[0], "listIntermediary");
  assert.equal(channel(a, "Vlastiti web bez košarice", "list").status, "applies");
});

test("majstor: fiksni izlazak ostaje uz individualni izračun; satnica nije jedinična cijena robe", () => {
  const a = check({ ...service, sales: ["door", "shop"], pricing: ["fee", "quote", "hour"], priceException: ["personal"], website: ["info"] });
  const bases = a.groups.find(group => group.title.includes("Kod kupca"))?.items.filter(row => row.obligation === "base") ?? [];
  assert.equal(bases.length, 3);
  assert.ok(bases.some(row => row.priceLabel?.includes("Fiksna doplata") && row.status === "applies"));
  assert.ok(bases.some(row => row.priceLabel?.includes("nakon procjene") && row.status === "outside" && row.refs[0] === "baseExceptions"));
  assert.equal(channel(a, "Kod kupca", "unit").status, "outside");
  const lists = rows(a).filter(row => row.obligation === "list");
  assert.equal(lists.find(row => row.priceLabel === "Satnica")?.status, "applies");
  assert.equal(lists.find(row => row.priceLabel?.includes("nakon procjene"))?.status, "outside");
});

test("regulirana i tržišna usluga mogu se procijeniti odvojeno", () => {
  const a = check({ ...service, regulation: ["regulated"], website: ["info"] });
  const b = check({ ...service, regulation: ["market"], website: ["info"] });
  assert.equal(channel(a, "Fizička poslovnica", "base").status, "outside");
  assert.equal(channel(b, "Fizička poslovnica", "base").status, "applies");
  assert.equal(channel(a, "Vlastiti web bez košarice", "list").status, "outside");
  assert.equal(channel(a, "Vlastiti web bez košarice", "list").refs[0], "listExceptions");
  assert.equal(channel(b, "Vlastiti web bez košarice", "list").status, "applies");
  assert.equal(channel(check({ ...service, regulation: ["regulated", "market"] }), "Fizička poslovnica", "base").question, "regulation");
});

test("rasuta roba, mjerljiva pakiranja i izuzeće daju različite upute", () => {
  assert.match(channel(check({ goods: ["loose"], pricing: ["measure"], unit: ["no"] }), "Fizička", "unit").example ?? "", /1 kg/);
  assert.match(channel(check({}), "Fizička", "unit").example ?? "", /6,00 €/);
  assert.equal(channel(check({ unitException: ["small"] }), "Fizička", "unit").status, "outside");
  assert.equal(channel(check({ unitException: ["small"] }), "Fizička", "base").status, "applies");
  assert.equal(channel(check({ goods: ["used"], unit: ["no"] }), "Fizička", "unit").question, "goods");
});

test("bazna cijena prati oba referentna datuma i prvo uvrštenje bez popusta", () => {
  const cases = [
    [{ history: ["renamed"] }, "baseLegacy", /2\. 5\. 2025\./],
    [{ history: ["changed"] }, "baseLegacyNew", /dan prvog uvrštenja u ponudu/],
    [{ legacy: ["no"], history: ["existing"] }, "baseGeneral", /10\. 9\. 2026\./],
    [{ ...service, history: ["new"] }, "baseGeneralNew", /dan prvog uvrštenja u ponudu/],
  ] as const;
  for (const [answers, ref, expected] of cases) {
    const base = channel(check(answers), "Fizička", "base");
    assert.equal(base.status, "applies");
    assert.equal(base.refs[0], ref);
    assert.match(base.action, expected);
  }
  const stock = channel(check({ history: ["stock"], proof: ["no"] }), "Fizička", "base");
  assert.equal(stock.status, "applies");
  assert.equal(stock.amountNeedsCheck, true);
});

test("povijesna akcija slijedi četiri zasebne grane čl. 3. st. 2.–5.", () => {
  const cases = [
    [{ legacy: ["yes"], history: ["existing"] }, "baseLegacyDiscount", /najnižu maloprodajnu cijenu.*30 dana prije početka/, "čl. 3. st. 2."],
    [{ legacy: ["yes"], history: ["new"] }, "baseLegacyNewDiscount", /najnižu maloprodajnu cijenu.*30 dana prije početka/, "čl. 3. st. 3."],
    [{ legacy: ["no"], history: ["existing"] }, "baseGeneralDiscount", /cijenu koja je vrijedila prije tadašnjeg popusta/, "čl. 3. st. 4."],
    [{ ...service, history: ["new"] }, "baseGeneralNewDiscount", /cijenu koja je vrijedila prije tadašnjeg popusta/, "čl. 3. st. 5."],
  ] as const;
  for (const [answers, ref, expected, article] of cases) {
    const assessment = check({ ...answers, referenceDiscount: ["promo"], discount: ["public"], discountProof: ["full"] });
    const base = channel(assessment, "Fizička", "base");
    assert.equal(base.status, "applies");
    assert.equal(base.refs[0], ref);
    assert.equal(sources[ref].section, article);
    assert.match(base.action, expected);
    assert.match(channel(assessment, "Fizička", "discount").action, /najnižu cijenu u 30 dana prije akcije/);
  }
});

test("sniženje bez potpune povijesti traži dokaz i ostavlja iznos prazan", () => {
  const a = check({ ads: ["social"], discount: ["public"], discountProof: ["partial"], proof: ["no"] });
  const d = channel(a, "Javne objave", "discount");
  assert.equal(d.status, "applies");
  assert.equal(d.amountNeedsCheck, true);
  assert.equal(d.question, "discountProof");
  assert.match(d.example ?? "", /prije akcije: ______ €/);
  assert.equal(channel(a, "Fizička", "base").amountNeedsCheck, true);
  assert.equal(channel(a, "Fizička", "unit").status, "applies");
});

test("provjera iznosa razlikuje se od nejasnog statusa sniženja", () => {
  const forOutlet = (answers: Answers) => channel(check({ sales: ["outlet"], ...answers }), "Outlet", "discount");
  assert.equal(forOutlet({ discount: ["unknown"] }).status, "check");
  assert.equal(forOutlet({ discount: ["none"] }).status, "outside");
  const first = forOutlet({ discount: ["public"], discountProof: ["first"] });
  assert.equal(first.amountNeedsCheck, undefined);
  assert.match(first.action, /bez oznake sniženja/);
  const coupon = forOutlet({ discount: ["coupon"], discountProof: ["full"] });
  assert.equal(coupon.status, "applies");
  assert.equal(coupon.amountNeedsCheck, undefined);
});

test("izuzeća čl. 4. oba pravilnika vrijede za konkretnu cijenu", () => {
  const cases: Answers[] = [
    { regulation: ["regulated"] },
    { priceException: ["group"] },
    { priceException: ["payment"] },
    { pricing: ["quote"], priceException: ["personal"] },
    { pricing: ["dynamic"], priceException: ["dynamic"] },
  ];
  for (const answers of cases) {
    const a = check({ website: ["shop"], ...answers });
    const base = channel(a, "Fizička", "base");
    const list = channel(a, "Vlastiti webshop", "list");
    assert.equal(base.status, "outside");
    assert.equal(base.refs[0], "baseExceptions");
    assert.equal(list.status, "outside");
    assert.equal(list.refs[0], "listExceptions");
  }
  const comparable = check({ ...service, website: ["info"], pricing: ["dynamic"], priceException: ["none"] });
  assert.equal(channel(comparable, "Fizička", "base").status, "applies");
  assert.equal(channel(comparable, "bez košarice", "list").status, "applies");

  const vending = check({ sales: ["vending"], website: ["shop"] });
  assert.equal(channel(vending, "Prodajni automat", "base").refs[0], "baseExceptions");
  assert.equal(channel(vending, "Vlastiti webshop", "list").refs[0], "listExceptions");
  const mixed = check({ sales: ["vending", "shop"], website: ["shop"] });
  assert.equal(channel(mixed, "Fizička", "base").status, "applies");
  assert.equal(channel(mixed, "Vlastiti webshop", "list").status, "applies");
});

test("nepoznata povijesna akcija zaustavlja samo izračun bazne cijene", () => {
  const a = check({ referenceDiscount: ["unknown"], discount: ["public"], discountProof: ["full"], website: ["shop"] });
  assert.equal(channel(a, "Fizička", "base").question, "referenceDiscount");
  assert.equal(channel(a, "Fizička", "base").status, "check");
  assert.equal(channel(a, "Fizička", "unit").status, "applies");
  assert.equal(channel(a, "Fizička", "discount").status, "applies");
  assert.equal(channel(a, "Vlastiti webshop", "list").status, "applies");
});

test("nepoznato, proturječno ili dodatno označeno ne briše valjanu uputu iz drugog kanala", () => {
  const a = check({ activity: ["unknown"], sales: ["shop", "none"], website: ["shop", "none"], goods: ["packed"], unitException: ["none", "small"] });
  assert.equal(channel(a, "Proturječan odabir prodaje", "base").question, "sales");
  assert.equal(channel(a, "Fizička poslovnica", "base").question, "activity");
  assert.equal(channel(a, "Fizička poslovnica", "unit").question, "unitException");
  assert.equal(channel(a, "Vlastiti web", "list").question, "website");
  assert.ok(rows(assessOffer({ id: 2, name: "", answers: {} })).every(row => row.status === "check"));
  const extra = check({ ads: ["web", "social", "other"] });
  assert.equal(channel(extra, "Vlastiti web ili webshop", "base").status, "outside");
  assert.equal(channel(extra, "Oglašavanje: Drugo", "base").status, "check");
});

test("kopirani rezultat sadrži ponude, upute i članke objavljenih pravilnika", () => {
  const text = formatResults([{ id: 7, name: "Moj webshop", answers: { ...good, website: ["shop"] } }]);
  assert.match(text, /Moj webshop/);
  assert.match(text, /isti URL do 11:00/);
  assert.ok(text.includes(sources.baseLegacy.url));
  assert.ok(text.includes(sources.listAccess.url));
  assert.doesNotMatch(text, /Nacrt|Čeka objavu/);
});

test("MOIRA ima jedan mrežni cjenik za tri potrošačka kanala, a veleprodaja ostaje izvan opsega", () => {
  const clothes: Answers = { ...good, website: ["shop"], goods: ["new", "pieces"], legacy: ["no"], unit: ["no"] };
  const offers: Offer[] = [
    { id: 1, name: "MOIRA outlet", answers: { ...clothes, sales: ["outlet"], discount: ["unknown"] }, websiteDomains: { shop: "https://www.moira-hr.com/trgovina/" } },
    { id: 2, name: "MOIRA webshop", answers: { ...clothes, sales: ["webshop"], ads: ["web"], discount: ["public"], discountProof: ["unknown"] }, websiteDomains: { shop: "MOIRA-HR.COM" } },
    { id: 3, name: "MOIRA sajamska prodaja", answers: { ...clothes, sales: ["fair"] } },
    { id: 4, name: "MOIRA veleprodaja", answers: { buyers: ["company"] } },
  ];
  const assessment = assessResults(offers);
  assert.equal(assessment.websites.length, 1);
  const [site] = assessment.websites;
  assert.equal(site.title, "moira-hr.com");
  assert.equal(site.row.status, "applies");
  assert.deepEqual(site.scopes, ["MOIRA outlet (Outlet)", "MOIRA webshop (Vlastiti webshop)", "MOIRA sajamska prodaja (Sajam)"]);
  assert.ok(assessment.offerResults.slice(0, 3).every(({ groups }) => groups.every(group => group.items.every(row => row.obligation !== "list"))));
  assert.ok(assessment.offerResults[3].groups[0].items.every(row => row.status === "outside"));
  const [outlet, webshop, fair, wholesale] = assessment.quickPlan.offers;
  assert.equal(outlet.groups[0].title, "Outlet");
  assert.ok(outlet.groups[0].steps.some(step => step.action.includes("10. 9. 2026.") && step.ref === "baseGeneral"));
  assert.ok(outlet.groups[0].steps.some(step => step.note === "Potrebna provjera" && step.action.includes("javnu akciju")));
  assert.equal(webshop.groups.length, 2);
  assert.equal(webshop.groups[0].title, "Vlastiti webshop");
  assert.equal(webshop.groups[1].title, "Oglasi na webu");
  assert.ok(webshop.groups[0].steps.some(step => step.note === "Obveza vrijedi · Iznos treba provjeriti" && step.action.includes("30 dana")));
  assert.equal(fair.groups[0].title, "Sajam");
  assert.equal(fair.groups[0].steps.length, 2);
  assert.deepEqual(wholesale.groups, []);
  assert.deepEqual(assessment.quickPlan.websites.map(website => website.title), ["moira-hr.com"]);
  assert.match(assessment.quickPlan.websites[0].steps[0].action, /isti URL do 11:00/);
  assert.equal(assessment.websites[0].details.find(detail => detail.key === "locations")?.row.question, "locations");
  const copied = formatResults(offers);
  assert.equal((copied.match(/^Cjenik na webu — Obveza vrijedi/gm) ?? []).length, 1);
  assert.match(copied, /Najniža cijena prije sniženja — Obveza vrijedi · Iznos treba provjeriti/);
  assert.match(copied, /^Pravila od 17\. 11\. 2026\.$/m);
});

test("različite domene ostaju odvojene, a nepoznata pripadnost traži dopunu", () => {
  const answers: Answers = { ...good, website: ["shop"] };
  const offers: Offer[] = [
    { id: 1, name: "Prva trgovina", answers, websiteDomains: { shop: "prva.hr" } },
    { id: 2, name: "Druga trgovina", answers, websiteDomains: { shop: "druga.hr" } },
    { id: 3, name: "Dopuniti domenu", answers },
  ];
  const { websites } = assessResults(offers);
  assert.deepEqual(websites.filter(site => site.row.status === "applies").map(site => site.title), ["prva.hr", "druga.hr"]);
  assert.equal(websites.find(site => site.offerId === 3)?.row.question, "website");
  assert.equal(websiteDomain("https://kupac@prva.hr/"), undefined);
  assert.equal(websiteDomain("prva"), undefined);
});

test("cjenik na istoj domeni obuhvaća tržišne stavke, a regulirana cijena ima zaseban ishod", () => {
  const offers: Offer[] = [
    { id: 1, name: "Robna ponuda", answers: { ...good, website: ["shop"] }, websiteDomains: { shop: "trgovina.hr" } },
    { id: 2, name: "Regulirana usluga", answers: { ...good, ...service, website: ["info"], regulation: ["regulated"] }, websiteDomains: { info: "www.trgovina.hr" } },
  ];
  const { websites, offerResults, quickPlan } = assessResults(offers);
  assert.equal(websites.length, 1);
  assert.equal(websites[0].row.status, "applies");
  assert.equal(websites[0].details.length, 0);
  assert.equal(offerResults[1].groups.flatMap(group => group.items).find(row => row.obligation === "list")?.status, "outside");
  assert.equal(quickPlan.websites.length, 1);
  assert.equal(quickPlan.websites[0].details.length, 0);
});
