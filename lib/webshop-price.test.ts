import test from "node:test";
import assert from "node:assert/strict";
import { emptyAnswers, estimateWebshop, formatWebshopRange, requirementsSummary, validateWebshopAnswers, type Answers } from "./webshop-price.ts";
import { webshopPriceConfig, webshopPreviewPriceConfig, webshopPricingForEnvironment, type PriceConfig, type PricedCatalogSize, type PricedContentSupport, type PricedSpecialNeed, type ProjectType } from "./webshop-price-config.ts";

const standard: Answers = { projectType: "new", catalogSize: "upTo20", contentSupport: "self", specialMode: "standard", specialNeeds: [] };
const config = webshopPreviewPriceConfig;
const amounts = (min: number, max: number) => ({ min: min * 100, max: max * 100 });

test("empty and partially answered states stay incomplete", () => {
  assert.equal(estimateWebshop(emptyAnswers(), config).status, "incomplete");
  assert.equal(estimateWebshop({ ...standard, catalogSize: "" }, config).status, "incomplete");
  assert.equal(estimateWebshop({ ...standard, specialMode: "custom", specialNeeds: [] }, config).status, "incomplete");
});

test("untrusted values and inconsistent choices are invalid", () => {
  for (const answers of [
    { ...standard, catalogSize: -1 },
    { ...standard, projectType: "other" },
    { ...standard, specialNeeds: ["b2b"] },
    { ...standard, specialMode: "custom", specialNeeds: ["b2b", "b2b"] },
  ]) assert.equal(estimateWebshop(answers, config).status, "invalid");
  assert.ok(validateWebshopAnswers({ ...standard, specialMode: "custom", specialNeeds: ["unknown"] }).errors.specialNeeds);
});

test("production uses the reviewed estimates and a draft refuses injected prices", () => {
  assert.equal(webshopPricingForEnvironment("preview"), config);
  const production = webshopPricingForEnvironment("production");
  assert.equal(production.approval, "approved");
  const example = { ...standard, catalogSize: "from51To200", contentSupport: "import" };
  const estimate = estimateWebshop(example, production);
  assert.equal(estimate.status, "priced");
  assert.deepEqual(estimate.range, amounts(1330, 2030));
  for (const environment of ["development", undefined]) {
    const draft = webshopPricingForEnvironment(environment);
    assert.equal(draft, webshopPriceConfig);
    assert.equal(estimateWebshop(standard, draft).status, "pricing_unavailable");
  }
  const injected: PriceConfig = { ...config, approval: "draft" };
  assert.equal(estimateWebshop(standard, injected).priceCause, "pending");
  assert.equal(estimateWebshop(standard, injected).range, undefined);
});

test("approved pricing requires attribution and both modes require valid money metadata", () => {
  const approved: PriceConfig = { ...config, approval: "approved", approvedAt: "2000-01-01", approvedBy: "Test" };
  assert.equal(estimateWebshop(standard, approved).status, "priced");
  for (const candidate of [
    { ...approved, approvedAt: null }, { ...approved, approvedBy: null },
    { ...config, currency: null }, { ...config, taxDisplay: null }, { ...config, rounding: null },
  ] satisfies PriceConfig[]) assert.equal(estimateWebshop(standard, candidate).status, "pricing_unavailable");
});

test("all compatible project, catalog, content and standard-add-on choices have a price", () => {
  for (const projectType of Object.keys(config.base) as ProjectType[]) {
    for (const catalogSize of Object.keys(config.catalog) as PricedCatalogSize[]) {
      for (const contentSupport of Object.keys(config.content) as PricedContentSupport[]) {
        if (projectType === "migration" && contentSupport !== "import") continue;
        const base = { ...standard, projectType, catalogSize, contentSupport };
        assert.equal(estimateWebshop(base, config).status, "priced");
        for (const specialNeed of Object.keys(config.special) as PricedSpecialNeed[]) {
          const result = estimateWebshop({ ...base, specialMode: "custom", specialNeeds: [specialNeed] }, config);
          assert.equal(result.status, "priced");
          assert.ok(result.range && result.range.min > 0 && result.range.max >= result.range.min);
        }
      }
    }
  }
});

test("prices match the offer and selected extras are summed exactly once", () => {
  assert.deepEqual(estimateWebshop(standard, config).range, amounts(990, 1290));
  assert.deepEqual(estimateWebshop({ ...standard, projectType: "redesign" }, config).range, amounts(890, 1190));
  assert.deepEqual(estimateWebshop({ ...standard, projectType: "migration", contentSupport: "import" }, config).range, amounts(1540, 2280));
  const growth = { ...standard, catalogSize: "from51To200", contentSupport: "import", specialMode: "custom", specialNeeds: ["languages", "invoicing"] };
  const estimate = estimateWebshop(growth, config);
  assert.deepEqual(estimate.range, amounts(1730, 2810));
  assert.deepEqual(estimate.items?.map(item => item.range), [
    amounts(990, 1290), amounts(190, 350), amounts(150, 390), amounts(200, 390), amounts(200, 390),
  ]);
  assert.deepEqual(estimateWebshop({ ...growth, specialMode: "standard", specialNeeds: [] }, config).range, amounts(1330, 2030));
});

test("negative, inverted, fractional, missing, and overflowing money rules fail closed", () => {
  for (const range of [{ min: -1, max: 500 }, { min: 200, max: 100 }, { min: 2.5, max: 10 }, undefined, { min: Number.MAX_SAFE_INTEGER, max: Number.MAX_SAFE_INTEGER }]) {
    const result = estimateWebshop({ ...standard, catalogSize: "from21To50" }, { ...config, base: { ...config.base, new: range } });
    assert.equal(result.status, "pricing_unavailable");
    assert.equal(result.range, undefined);
  }
  const missingSpecial = estimateWebshop({ ...standard, specialMode: "custom", specialNeeds: ["b2b"] }, { ...config, special: {} });
  assert.equal(missingSpecial.priceCause, "incomplete");
  assert.equal(missingSpecial.range, undefined);
});

test("unknown or bespoke scope explains why a complete price needs review", () => {
  for (const [answers, reason] of [
    [{ ...standard, catalogSize: "unknown" }, /Broj proizvoda/],
    [{ ...standard, catalogSize: "over1000" }, /1\.000 proizvoda/],
    [{ ...standard, contentSupport: "extensive" }, /prema uzorku/],
    [{ ...standard, contentSupport: "unknown" }, /Način unosa/],
    [{ ...standard, specialMode: "unknown" }, /Dodatne funkcije/],
    [{ ...standard, projectType: "migration" }, /preseljenje/],
    [{ ...standard, projectType: "migration", contentSupport: "help" }, /preseljenje/],
    [{ ...standard, specialMode: "custom", specialNeeds: ["integration", "bespoke"] }, /integraciju po mjeri/],
  ] as const) {
    const estimate = estimateWebshop(answers, config);
    assert.equal(estimate.status, "manual");
    assert.match(estimate.reasons[0], reason);
    assert.equal(estimate.range, undefined);
  }
});

test("only a priced result includes a numeric estimate in the inquiry summary", () => {
  const draftSummary = requirementsSummary(estimateWebshop(standard, webshopPriceConfig));
  assert.match(draftSummary, /Novi webshop/);
  assert.match(draftSummary, /Do 20 proizvoda/);
  assert.doesNotMatch(draftSummary, /€/);
  const estimate = estimateWebshop(standard, config);
  assert.ok(estimate.range);
  assert.ok(requirementsSummary(estimate).includes(formatWebshopRange(estimate.range)));
});
