import test from "node:test";
import assert from "node:assert/strict";
import { emptyAnswers, estimateWebshop, requirementsSummary, validateWebshopAnswers, type Answers } from "./webshop-price.ts";
import { webshopPriceConfig, type PriceConfig } from "./webshop-price-config.ts";

const standard: Answers = { projectType: "new", catalogSize: "upTo50", contentSupport: "self", specialMode: "standard", specialNeeds: [] };

// SYNTHETIC TEST DATA ONLY. Never import this configuration into the application.
const syntheticApproved: PriceConfig = {
  version: "synthetic-test-only", approval: "approved", approvedAt: "2000-01-01", approvedBy: "TEST ONLY",
  currency: "EUR", taxDisplay: "TESTNI porezni tekst", rounding: "none",
  base: { new: { min: 10000, max: 15000 }, redesign: { min: 20000, max: 25000 } },
  catalog: { upTo50: { min: 1000, max: 2000 }, from51To500: { min: 3000, max: 5000 }, over500: { min: 7000, max: 9000 } },
  content: { self: { min: 0, max: 0 }, help: { min: 2000, max: 4000 } },
};

test("empty and partially answered states stay incomplete", () => {
  assert.equal(estimateWebshop(emptyAnswers(), webshopPriceConfig).status, "incomplete");
  assert.equal(estimateWebshop({ ...standard, catalogSize: "" }, webshopPriceConfig).status, "incomplete");
  assert.equal(estimateWebshop({ ...standard, specialMode: "custom", specialNeeds: [] }, webshopPriceConfig).status, "incomplete");
});

test("untrusted values, inconsistent choices, and negative numeric answers are invalid", () => {
  assert.equal(estimateWebshop({ ...standard, catalogSize: -1 }, syntheticApproved).status, "invalid");
  assert.equal(estimateWebshop({ ...standard, projectType: "other" }, syntheticApproved).status, "invalid");
  assert.equal(estimateWebshop({ ...standard, specialNeeds: ["b2b"] }, syntheticApproved).status, "invalid");
  assert.equal(estimateWebshop({ ...standard, specialMode: "custom", specialNeeds: ["b2b", "b2b"] }, syntheticApproved).status, "invalid");
  assert.ok(validateWebshopAnswers({ ...standard, specialMode: "custom", specialNeeds: ["unknown"] }).errors.specialNeeds);
});

test("real draft refuses every numeric price even if amounts are injected", () => {
  const injected: PriceConfig = { ...webshopPriceConfig, base: syntheticApproved.base, catalog: syntheticApproved.catalog, content: syntheticApproved.content };
  const result = estimateWebshop(standard, injected);
  assert.equal(result.status, "pricing_unavailable");
  assert.equal(result.priceCause, "pending");
  assert.equal(result.range, undefined);
  assert.equal(estimateWebshop(standard, webshopPriceConfig).range, undefined);
});

test("synthetic approval requires identity, tax display, currency, rounding, and each relevant rule", () => {
  for (const config of [
    { ...syntheticApproved, approvedAt: null },
    { ...syntheticApproved, approvedBy: null },
    { ...syntheticApproved, currency: null },
    { ...syntheticApproved, taxDisplay: null },
    { ...syntheticApproved, rounding: null },
  ] satisfies PriceConfig[]) assert.equal(estimateWebshop(standard, config).status, "pricing_unavailable");
  assert.equal(estimateWebshop(standard, { ...syntheticApproved, catalog: {} }).priceCause, "incomplete");
  assert.equal(estimateWebshop(standard, { ...syntheticApproved, content: {} }).range, undefined);
});

test("synthetic cent arithmetic honors proposed catalog bands without making them real pricing", () => {
  assert.deepEqual(estimateWebshop(standard, syntheticApproved).range, { min: 11000, max: 17000 });
  assert.deepEqual(estimateWebshop({ ...standard, catalogSize: "from51To500", contentSupport: "help" }, syntheticApproved).range, { min: 15000, max: 24000 });
  assert.deepEqual(estimateWebshop({ ...standard, catalogSize: "over500" }, syntheticApproved).range, { min: 17000, max: 24000 });
  assert.deepEqual(estimateWebshop({ ...standard, projectType: "redesign" }, syntheticApproved).range, { min: 21000, max: 27000 });
});

test("negative, inverted, fractional, missing, and overflowing money rules fail closed", () => {
  for (const range of [{ min: -1, max: 500 }, { min: 200, max: 100 }, { min: 2.5, max: 10 }, undefined, { min: Number.MAX_SAFE_INTEGER, max: Number.MAX_SAFE_INTEGER }]) {
    const config: PriceConfig = { ...syntheticApproved, base: { ...syntheticApproved.base, new: range } };
    const result = estimateWebshop(standard, config);
    assert.equal(result.status, "pricing_unavailable");
    assert.equal(result.range, undefined);
  }
});

test("manual reasons are specific; unknown scope is not labelled intrinsically complex", () => {
  const custom = estimateWebshop({ ...standard, specialMode: "custom", specialNeeds: ["integration", "b2b"] }, webshopPriceConfig);
  assert.equal(custom.status, "manual");
  assert.deepEqual(custom.reasons, ["Povezivanje s ERP/POS ili drugim sustavom", "B2B pravila"]);
  assert.equal(custom.range, undefined);
  const unknown = estimateWebshop({ ...standard, contentSupport: "unknown" }, webshopPriceConfig);
  assert.equal(unknown.status, "manual");
  assert.match(unknown.reasons[0], /još nije poznat/);
  assert.equal(estimateWebshop({ ...standard, contentSupport: "self" }, webshopPriceConfig).status, "pricing_unavailable");
});

test("summary carries only requirements and no synthetic prices", () => {
  const result = estimateWebshop(standard, webshopPriceConfig);
  const summary = requirementsSummary(result);
  assert.match(summary, /Novi webshop/);
  assert.match(summary, /Do 50 proizvoda/);
  assert.doesNotMatch(summary, /\d+[.,]\d{2}\s*€/);
});
