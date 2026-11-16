import test from "node:test";
import assert from "node:assert/strict";
import { assessOffer, assessResults, formatResults } from "./sidrene-cijene.ts";
import { sources, websiteDomain, type Answers, type Offer } from "./sidrene-cijene-podaci.ts";

const good: Answers = {
  buyers: ["consumer"], roles: ["own"], territory: ["hr"], kinds: ["goods"], activity: ["retail"], goods: ["new", "packed"],
  pricing: ["fixed"], regulation: ["market"], sales: ["shop"], ads: ["none"], website: ["none"], locations: ["one"], legacy: ["yes"],
  unit: ["yes"], unitException: ["none"], history: ["existing"], proof: ["yes"], discount: ["none"],
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
  assert.equal(channel(mixed, "Fizička poslovnica", "base").pending, true);
  assert.equal(channel(mixed, "Fizička poslovnica", "unit").status, "applies");
  assert.match(mixed.notes.join(), /poslovne kupce/);
});

test("upisani OPG na štandu zadržava jediničnu cijenu; prodaja otkupljivaču odvojena", () => {
  const farm: Answers = { activity: ["opg"], sales: ["stand"], goods: ["loose"], pricing: ["measure"], buyers: ["consumer", "buyer"] };
  assert.equal(channel(check(farm), "Štand", "unit").status, "applies");
  assert.ok(rows(check({ ...farm, buyers: ["buyer"] })).every(row => row.status === "outside"));
  assert.equal(channel(check(farm), "Štand", "base").pending, true);
});

test("Instagram bez vlastitog weba ne uklanja pravila prodaje i oglašavanja", () => {
  const result = check({ sales: ["social", "messages"], ads: ["social"], discount: ["coupon"], discountProof: ["full"] });
  assert.equal(channel(result, "Nemam vlastiti web", "list").status, "outside");
  assert.equal(channel(result, "Društvena mreža", "unit").status, "applies");
  assert.equal(channel(result, "Javne objave", "discount").status, "applies");
  assert.equal(channel(result, "Poruke", "base").pending, true);
  assert.equal(result.showCta, false);
});

test("prezentacijski web bez košarice: zakon potvrđuje obvezu, tehnički detalji ostaju otvoreni", () => {
  const answers: Answers = { ...service, website: ["info"], sales: ["door"], ads: ["web"] };
  const after = check(answers);
  const list = channel(after, "Vlastiti web bez košarice", "list");
  assert.equal(list.status, "applies");
  assert.equal(list.pending, true);
  assert.doesNotMatch(list.action, /do 8:00|CSV ili XML/);
  assert.equal(after.showCta, true);
  assert.equal(channel(after, "Oglašavanje", "discount").status, "outside");
});

test("webshop i outlet: zasebni iznosi, dokazi i upute bez ukidanja outlet obveze", () => {
  const channels: Answers = { sales: ["webshop", "outlet"], ads: ["web", "print"], website: ["shop"], locations: ["different"], discount: ["public"], discountProof: ["full"] };
  const a = check(channels);
  assert.equal(channel(a, "Prodaja: Outlet", "base").pending, true);
  assert.equal(channel(a, "Prodaja: Vlastiti webshop", "base").status, "check");
  assert.equal(channel(a, "Oglašavanje: Letci", "base").pending, true);
  assert.equal(channel(a, "Prodaja: Outlet", "discount").status, "applies");
  assert.equal(channel(a, "Prodaja: Vlastiti webshop", "discount").status, "applies");
  assert.match(a.notes.join(), /zasebno po mjestu, kanalu i prodavatelju/);
});

test("prodavatelja na marketplaceu pravila ne tretiraju kao posrednika koji prikazuje tuđe cijene", () => {
  const seller: Answers = { roles: ["platform"], sales: ["market"], ads: ["market"], discount: ["public"], discountProof: ["full"] };
  const a = check(seller);
  assert.equal(channel(a, "Prodaja: Tuđa platforma", "base").pending, true);
  assert.equal(channel(a, "Prodaja: Tuđa platforma", "discount").status, "applies");
  assert.equal(channel(check({ ...seller, roles: ["display"] }), "Prodaja: Tuđa platforma", "base").pending, undefined);
});

test("posrednik s vlastitom naknadom dobiva uputu za naknadu odvojeno od tuđe cijene", () => {
  const a = check({ ...service, roles: ["display", "fee"], website: ["info"], sales: ["booking"], ads: ["market"] });
  assert.equal(channel(a, "Vlastita naknada", "base").pending, true);
  assert.match(a.notes.join(), /tuđe cijene/i);
  assert.equal(channel(a, "Posredovanje · prikaz tuđih cijena", "base").pending, undefined);
  assert.match(channel(a, "Posredovanje · prikaz tuđih cijena", "base").action, /tko prodaje/);
  assert.equal(channel(a, "Vlastiti web bez košarice", "list").status, "applies");
});

test("majstor: fiksni izlazak ostaje uz individualni izračun; satnica nije jedinična cijena robe", () => {
  const a = check({ ...service, sales: ["door", "shop"], pricing: ["fee", "quote", "hour"], website: ["info"] });
  const bases = a.groups.find(group => group.title.includes("Kod kupca"))?.items.filter(row => row.obligation === "base") ?? [];
  assert.equal(bases.length, 3);
  assert.ok(bases.some(row => row.reason.includes("Fiksna doplata")));
  assert.ok(bases.some(row => row.action.includes("Odvojite individualni izračun")));
  assert.equal(channel(a, "Kod kupca", "unit").status, "outside");
  assert.match(channel(a, "Vlastiti web bez košarice", "list").action, /satnice/);
});

test("regulirana i tržišna usluga mogu se procijeniti odvojeno", () => {
  const a = check({ ...service, regulation: ["regulated"], website: ["info"] });
  const b = check({ ...service, regulation: ["market"], website: ["info"] });
  assert.equal(channel(a, "Fizička poslovnica", "base").status, "outside");
  assert.equal(channel(b, "Fizička poslovnica", "base").pending, true);
  assert.equal(channel(a, "Vlastiti web bez košarice", "list").status, "check");
  assert.equal(channel(b, "Vlastiti web bez košarice", "list").status, "applies");
  assert.equal(channel(check({ ...service, regulation: ["regulated", "market"] }), "Fizička poslovnica", "base").question, "regulation");
});

test("rasuta roba, mjerljiva pakiranja i izuzeće daju različite upute", () => {
  assert.match(channel(check({ goods: ["loose"], pricing: ["measure"], unit: ["no"] }), "Fizička", "unit").example ?? "", /1 kg/);
  assert.match(channel(check({}), "Fizička", "unit").example ?? "", /6,00 €/);
  assert.equal(channel(check({ unitException: ["small"] }), "Fizička", "unit").status, "outside");
  assert.equal(channel(check({ unitException: ["small"] }), "Fizička", "base").pending, true);
  assert.equal(channel(check({ goods: ["used"], unit: ["no"] }), "Fizička", "unit").question, "goods");
});

test("novo izdanje nije isto što i preimenovani artikl; nedostatak zalihe i akcija se provjeravaju", () => {
  assert.equal(channel(check({ history: ["new", "changed"] }), "Fizička", "base").status, "check");
  assert.equal(channel(check({ history: ["stock"] }), "Fizička", "base").status, "check");
  const renamed = channel(check({ history: ["renamed", "promo"] }), "Fizička", "base");
  assert.equal(renamed.pending, true);
  assert.match(renamed.reason, /promjene šifre ili akcije/);
});

test("sniženje bez potpune povijesti traži dokaz i ostavlja iznos prazan", () => {
  const a = check({ ads: ["social"], discount: ["public"], discountProof: ["partial"], proof: ["no"] });
  const d = channel(a, "Javne objave", "discount");
  assert.equal(d.status, "applies");
  assert.equal(d.amountNeedsCheck, true);
  assert.equal(d.question, "discountProof");
  assert.match(d.example ?? "", /prije akcije: ______ €/);
  assert.equal(channel(a, "Fizička", "base").pending, true);
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

test("nepoznato, proturječno ili dodatno označeno ne briše valjanu uputu iz drugog kanala", () => {
  const a = check({ activity: ["unknown"], sales: ["shop", "none"], website: ["shop", "none"], goods: ["packed"], unitException: ["none", "small"] });
  assert.equal(channel(a, "Proturječan odabir prodaje", "base").question, "sales");
  assert.equal(channel(a, "Fizička poslovnica", "base").question, "activity");
  assert.equal(channel(a, "Fizička poslovnica", "unit").question, "unitException");
  assert.equal(channel(a, "Vlastiti web", "list").question, "website");
  assert.ok(rows(assessOffer({ id: 2, name: "", answers: {} })).every(row => row.status === "check"));
  const extra = check({ ads: ["web", "social", "other"] });
  assert.equal(channel(extra, "Vlastiti web ili webshop", "base").pending, true);
  assert.equal(channel(extra, "Oglašavanje: Drugo", "base").status, "check");
});

test("kopirani rezultat sadrži ponude, upute, stanje nacrta i poveznice", () => {
  const text = formatResults([{ id: 7, name: "Moj webshop", answers: { ...good, website: ["shop"] } }]);
  assert.match(text, /Moj webshop/);
  assert.match(text, /Čeka objavu pravilnika/);
  assert.match(text, /Pripremite stranicu/);
  assert.ok(text.includes(sources.draftList.url));
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
  assert.match(outlet.groups[0].steps[0].action, /aktualnu cijenu/);
  assert.ok(outlet.groups[0].steps.some(step => step.note === "Čeka objavu pravilnika" && step.action.includes("10. 9. 2026.")));
  assert.ok(outlet.groups[0].steps.some(step => step.note === "Treba provjeriti" && step.action.includes("javnu akciju")));
  assert.equal(webshop.groups.length, 1);
  assert.equal(webshop.groups[0].title, "Vlastiti webshop / Oglasi na webu");
  assert.ok(webshop.groups[0].steps.some(step => step.note === "Obveza vrijedi · Iznos treba provjeriti" && step.action.includes("30 dana")));
  assert.equal(fair.groups[0].title, "Sajam");
  assert.equal(fair.groups[0].steps.length, 2);
  assert.deepEqual(wholesale.groups, []);
  assert.deepEqual(assessment.quickPlan.websites.map(website => website.title), ["moira-hr.com"]);
  assert.match(assessment.quickPlan.websites[0].steps[0].action, /stranicu „Cjenik”/);
  const copied = formatResults(offers);
  assert.equal((copied.match(/^Cjenik na webu — Obveza vrijedi/gm) ?? []).length, 1);
  assert.match(copied, /Najniža cijena prije sniženja — Obveza vrijedi · Iznos treba provjeriti/);
  assert.match(copied, /Pravila od 17\. 11\. 2026\. nadalje/);
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

test("zajednički cjenik zadržava iznimke uz potvrđenu obvezu", () => {
  const offers: Offer[] = [
    { id: 1, name: "Robna ponuda", answers: { ...good, website: ["shop"] }, websiteDomains: { shop: "trgovina.hr" } },
    { id: 2, name: "Regulirana usluga", answers: { ...good, ...service, website: ["info"], regulation: ["regulated"] }, websiteDomains: { info: "www.trgovina.hr" } },
  ];
  const { websites, quickPlan } = assessResults(offers);
  assert.equal(websites.length, 1);
  assert.equal(websites[0].row.status, "applies");
  assert.equal(websites[0].details[0].row.status, "check");
  assert.equal(websites[0].details[0].scopes[0].offerId, 2);
  assert.equal(quickPlan.websites.length, 1);
  assert.match(quickPlan.websites[0].details[0].title, /Regulirana usluga/);
  assert.equal(quickPlan.websites[0].details[0].steps[0].note, "Čeka objavu pravilnika");
});
