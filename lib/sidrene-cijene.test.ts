import test from "node:test";
import assert from "node:assert/strict";
import { assessOffer, formatResults } from "./sidrene-cijene.ts";
import { CHANGE, VERIFIED, sources, type Answers, type AssessmentDate } from "./sidrene-cijene-podaci.ts";

const good: Answers = {
  buyers: ["consumer"], roles: ["own"], territory: ["hr"], kinds: ["goods"], activity: ["retail"], goods: ["new", "packed"],
  pricing: ["fixed"], regulation: ["market"], sales: ["shop"], ads: ["none"], website: ["none"], locations: ["one"], legacy: ["yes"],
  storeType: ["no"], unit: ["yes"], unitException: ["none"], history: ["existing"], proof: ["yes"], discount: ["none"],
};
const service: Answers = { kinds: ["service"], activity: ["service"] };
const check = (patch: Answers, date: AssessmentDate = VERIFIED) => assessOffer({ id: 1, name: "Ponuda", answers: { ...good, ...patch } }, date);
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
  assert.equal(channel(check(farm), "Štand", "base").status, "outside");
  assert.equal(channel(check(farm), "Štand", "unit").status, "applies");
  assert.ok(rows(check({ ...farm, buyers: ["buyer"] }, CHANGE)).every(row => row.status === "outside"));
  assert.equal(channel(check(farm, CHANGE), "Štand", "base").pending, true);
});

test("Instagram bez vlastitog weba ne uklanja pravila prodaje i oglašavanja", () => {
  const result = check({ sales: ["social", "messages"], ads: ["social"], discount: ["coupon"], discountProof: ["full"] }, CHANGE);
  assert.equal(channel(result, "Nemam vlastiti web", "list").status, "outside");
  assert.equal(channel(result, "Društvena mreža", "unit").status, "applies");
  assert.equal(channel(result, "Javne objave", "discount").status, "applies");
  assert.equal(channel(result, "Poruke", "base").pending, true);
  assert.equal(result.showCta, false);
});

test("prezentacijski web bez košarice: zakon potvrđuje obvezu, tehnički detalji ostaju otvoreni", () => {
  const answers: Answers = { ...service, website: ["info"], sales: ["door"], ads: ["web"] };
  assert.equal(channel(check(answers), "Prezentacijski web", "list").status, "outside");
  const after = check(answers, CHANGE);
  const list = channel(after, "Prezentacijski web", "list");
  assert.equal(list.status, "applies");
  assert.equal(list.pending, true);
  assert.doesNotMatch(list.action, /do 8:00|CSV ili XML/);
  assert.equal(after.showCta, true);
  assert.equal(channel(after, "Oglašavanje", "discount").status, "outside");
});

test("webshop i outlet: zasebni iznosi, dokazi i upute bez ukidanja outlet obveze", () => {
  const channels: Answers = { sales: ["webshop", "outlet"], ads: ["web", "print"], website: ["shop"], locations: ["different"], discount: ["public"], discountProof: ["full"] };
  const a = check(channels);
  assert.equal(channel(a, "Prodaja: Outlet", "base").status, "applies");
  assert.equal(channel(a, "Prodaja: Vlastiti webshop", "base").status, "check");
  assert.equal(channel(a, "Oglašavanje: Letci", "base").status, "applies");
  assert.equal(channel(a, "Prodaja: Outlet", "discount").status, "applies");
  assert.equal(channel(a, "Prodaja: Vlastiti webshop", "discount").status, "applies");
  assert.match(a.notes.join(), /zasebno po mjestu, kanalu i prodavatelju/);
});

test("prodavatelja na marketplaceu pravila ne tretiraju kao posrednika koji prikazuje tuđe cijene", () => {
  const seller: Answers = { roles: ["platform"], sales: ["market"], ads: ["market"], discount: ["public"], discountProof: ["full"] };
  const a = check(seller, CHANGE);
  assert.equal(channel(a, "Prodaja: Marketplace", "base").pending, true);
  assert.equal(channel(a, "Prodaja: Marketplace", "discount").status, "applies");
  assert.equal(channel(check({ ...seller, roles: ["display"] }, CHANGE), "Prodaja: Marketplace", "base").pending, undefined);
});

test("posrednik s vlastitom naknadom dobiva uputu za naknadu odvojeno od tuđe cijene", () => {
  const a = check({ ...service, roles: ["display", "fee"], website: ["info"], sales: ["booking"], ads: ["market"] }, CHANGE);
  assert.equal(channel(a, "Vlastita naknada", "base").pending, true);
  assert.match(a.notes.join(), /tuđe cijene/i);
  assert.equal(channel(a, "Posredovanje · prikaz tuđih cijena", "base").pending, undefined);
  assert.match(channel(a, "Posredovanje · prikaz tuđih cijena", "base").action, /tko prodaje/);
  assert.equal(channel(a, "Prezentacijski web", "list").status, "applies");
});

test("majstor: fiksni izlazak ostaje uz individualni izračun; satnica nije jedinična cijena robe", () => {
  const a = check({ ...service, sales: ["door", "shop"], pricing: ["fee", "quote", "hour"], website: ["info"] }, CHANGE);
  const bases = a.groups.find(group => group.title.includes("Kućni prag"))?.items.filter(row => row.obligation === "base") ?? [];
  assert.equal(bases.length, 3);
  assert.ok(bases.some(row => row.reason.includes("Fiksna doplata")));
  assert.ok(bases.some(row => row.action.includes("Odvojite individualni izračun")));
  assert.equal(channel(a, "Kućni prag", "unit").status, "outside");
  assert.match(channel(a, "Prezentacijski web", "list").action, /satnice/);
});

test("regulirana i tržišna usluga mogu se procijeniti odvojeno", () => {
  const a = check({ ...service, regulation: ["regulated"], website: ["info"] }, CHANGE);
  const b = check({ ...service, regulation: ["market"], website: ["info"] }, CHANGE);
  assert.equal(channel(a, "Fizička poslovnica", "base").status, "outside");
  assert.equal(channel(b, "Fizička poslovnica", "base").pending, true);
  assert.equal(channel(a, "Prezentacijski web", "list").status, "check");
  assert.equal(channel(b, "Prezentacijski web", "list").status, "applies");
  assert.equal(channel(check({ ...service, regulation: ["regulated", "market"] }, CHANGE), "Fizička poslovnica", "base").question, "regulation");
});

test("rasuta roba, mjerljiva pakiranja i izuzeće daju različite upute", () => {
  assert.match(channel(check({ goods: ["loose"], pricing: ["measure"], unit: ["no"] }), "Fizička", "unit").example ?? "", /1 kg/);
  assert.match(channel(check({}), "Fizička", "unit").example ?? "", /6,00 €/);
  assert.equal(channel(check({ unitException: ["small"] }), "Fizička", "unit").status, "outside");
  assert.equal(channel(check({ unitException: ["small"] }), "Fizička", "base").status, "applies");
  assert.equal(channel(check({ goods: ["used"], unit: ["no"] }), "Fizička", "unit").question, "goods");
});

test("novo izdanje nije isto što i preimenovani artikl; nedostatak zalihe i akcija se provjeravaju", () => {
  assert.equal(channel(check({ history: ["new", "changed"] }), "Fizička", "base").status, "check");
  assert.equal(channel(check({ history: ["stock"] }), "Fizička", "base").status, "check");
  const renamed = channel(check({ history: ["renamed", "promo"] }), "Fizička", "base");
  assert.equal(renamed.status, "applies");
  assert.match(renamed.action, /staru i novu šifru.*bez akcije/);
});

test("sniženje bez potpune povijesti traži dokaz i ostavlja iznos prazan", () => {
  const a = check({ ads: ["social"], discount: ["public"], discountProof: ["partial"], proof: ["no"] });
  const d = channel(a, "Javne objave", "discount");
  assert.equal(d.status, "check");
  assert.equal(d.question, "discountProof");
  assert.match(d.example ?? "", /prije akcije: ______ €/);
  assert.equal(channel(a, "Fizička", "base").question, "proof");
  assert.equal(channel(a, "Fizička", "unit").status, "applies");
});

test("nepoznato, proturječno ili dodatno označeno ne briše valjanu uputu iz drugog kanala", () => {
  const a = check({ activity: ["unknown"], sales: ["shop", "none"], website: ["shop", "none"], goods: ["packed"], unitException: ["none", "small"] }, CHANGE);
  assert.equal(channel(a, "Proturječan odabir prodaje", "base").question, "sales");
  assert.equal(channel(a, "Fizička poslovnica", "base").question, "activity");
  assert.equal(channel(a, "Fizička poslovnica", "unit").question, "unitException");
  assert.equal(channel(a, "Vlastiti web", "list").question, "website");
  assert.ok(rows(assessOffer({ id: 2, name: "", answers: {} }, VERIFIED)).every(row => row.status === "check"));
  const extra = check({ ads: ["web", "social", "other"] });
  assert.equal(channel(extra, "Vlastiti web ili webshop", "base").status, "applies");
  assert.equal(channel(extra, "Oglašavanje: Drugo", "base").status, "check");
});

test("prelazak 16. → 17. studenoga mijenja samo obveze pogođene prijelazom", () => {
  const a = check({ storeType: ["yes"], website: ["shop"] });
  const b = check({ storeType: ["yes"], website: ["shop"] }, CHANGE);
  assert.equal(channel(a, "Fizička", "base").status, "applies");
  assert.equal(channel(b, "Fizička", "base").status, "check");
  assert.ok(channel(b, "Fizička", "base").pending);
  assert.equal(channel(b, "Fizička", "unit").status, "applies");
  assert.equal(channel(b, "Fizička", "discount").status, "outside");
  assert.match(channel(a, "Vlastiti webshop", "list").action, /30 dana/);
  assert.ok(channel(b, "Vlastiti webshop", "list").pending);
});

test("kopirani rezultat sadrži ponude, upute, stanje nacrta i poveznice", () => {
  const text = formatResults([{ id: 7, name: "Moj webshop", answers: { ...good, website: ["shop"] } }], CHANGE);
  assert.match(text, /Moj webshop/);
  assert.match(text, /Čeka objavu pravilnika/);
  assert.match(text, /Pripremite stranicu/);
  assert.ok(text.includes(sources.draftList.url));
});
