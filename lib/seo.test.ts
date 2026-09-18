import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { deploymentRobots, SITE_ORIGIN } from "./seo-policy.ts";
import sitemap from "../app/sitemap.ts";
import robots from "../app/robots.ts";

const root = process.cwd();

test("landing metadata describes both web and business tools", () => {
  const page = readFileSync(join(root, "app", "page.tsx"), "utf8");

  assert.match(page, /title: "Izrada web-stranica i poslovnih aplikacija \| deweb"/);
  assert.match(page, /description: "deweb izrađuje i redizajnira poslovne web-stranice te razvija interne alate i poslovne aplikacije po mjeri\./);
  assert.match(page, /<link rel="canonical" href=\{`\$\{SITE_ORIGIN\}\/`\} \/>/);
  assert.match(page, /url: "\/og-deweb\.png"/);
});

test("production is indexable and Vercel preview/development are not", () => {
  assert.equal(deploymentRobots("production"), undefined);
  assert.deepEqual(deploymentRobots("preview"), { index: false, follow: false });
  assert.deepEqual(deploymentRobots("development"), { index: false, follow: false });
  assert.equal(deploymentRobots(), undefined);
});

test("sitemap contains the public homepage and Cjenik HR canonical URLs", () => {
  assert.equal(SITE_ORIGIN, "https://deweb.hr");
  assert.deepEqual(sitemap(), [
    { url: "https://deweb.hr/" },
    { url: "https://deweb.hr/cjenik-hr" },
  ]);
});

test("robots allows crawlers to see noindex on draft pages", () => {
  const rules = robots();
  assert.deepEqual(rules.rules, { userAgent: "*", allow: "/", disallow: "/api/" });
  assert.equal(rules.sitemap, "https://deweb.hr/sitemap.xml");
});
