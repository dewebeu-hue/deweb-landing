import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

const legalPages = [
  join(root, "app", "privatnost", "page.tsx"),
  join(root, "app", "uvjeti", "page.tsx"),
  join(root, "app", "pravna-obavijest", "page.tsx"),
];

test("legal pages exist and are the only place for the legal operator display", () => {
  for (const page of legalPages) {
    assert.equal(existsSync(page), true);

    const contents = readFileSync(page, "utf8");

    assert.match(contents, /Operator: deweb j\.d\.o\.o\./);
    assert.match(contents, /TODO: Final legal review before production\./);
    assert.doesNotMatch(contents, /Deweb/);
    assert.doesNotMatch(contents, /deweb\.eu@gmail\.com/);
    assert.doesNotMatch(contents, /mailto:/);
  }

  const marketingPage = readFileSync(join(root, "app", "page.tsx"), "utf8");
  assert.doesNotMatch(marketingPage, /Operator: deweb j\.d\.o\.o\./);
  assert.doesNotMatch(marketingPage, /deweb j\.d\.o\.o\./);
});

test("privacy page states the v1 privacy posture", () => {
  const privacy = readFileSync(join(root, "app", "privatnost", "page.tsx"), "utf8");

  assert.match(privacy, /rana landing stranica za deweb/);
  assert.match(privacy, /ne koristimo analitičke ni marketinške kolačiće/i);
  assert.doesNotMatch(privacy, /kontakt forma još nije spojena/i);
  assert.match(privacy, /podaci poslani kroz kontakt formu koriste se za obradu upita i komunikaciju s\s+pošiljateljem/i);
  assert.match(privacy, /koriste se samo za odgovor na upit i pripremu prijedloga rješenja/i);
});

test("production app does not include tracking or cookie-banner behavior", () => {
  const productionFiles = [
    join(root, "app", "layout.tsx"),
    join(root, "app", "page.tsx"),
    join(root, "app", "problem-form.tsx"),
    ...legalPages,
  ];

  for (const file of productionFiles) {
    const contents = readFileSync(file, "utf8");

    assert.doesNotMatch(contents, /<Script|<script|googletagmanager|google-analytics|gtag\(|fbq\(|hj\(/i);
    assert.doesNotMatch(contents, /document\.cookie|cookies\(|setCookie|Accept|Reject/);
  }
});
