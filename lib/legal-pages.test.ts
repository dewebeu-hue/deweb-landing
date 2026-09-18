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

test("legal pages retain their routes, noindex decision and approved company information", () => {
  for (const page of legalPages) {
    assert.equal(existsSync(page), true);

    const contents = readFileSync(page, "utf8");

    assert.match(contents, /deweb j\.d\.o\.o\./);
    assert.match(contents, /robots: \{ index: false, follow: true \}/);
    assert.match(contents, /alternates: \{ canonical:/);
    assert.doesNotMatch(contents, /TODO: Final legal review before production\./);
    assert.doesNotMatch(contents, /rana landing|privremeni okvir|budućeg zaprimanja|server-side obrada|produkcijskog lansiranja/i);
    assert.doesNotMatch(contents, /Deweb/);
    assert.doesNotMatch(contents, /deweb\.eu@gmail\.com/);
  }

  const company = readFileSync(legalPages[2], "utf8");
  assert.match(company, /Podaci o društvu/);
  assert.match(company, /24631103366/);
  assert.match(company, /030310031/);
  assert.match(company, /HR9823400091111346962/);
  assert.match(company, /mailto:dinko@deweb\.hr/);
});

test("privacy page describes inquiry processing, approved providers, retention and rights", () => {
  const privacy = readFileSync(join(root, "app", "privatnost", "page.tsx"), "utf8");

  assert.match(privacy, /Voditelj obrade osobnih podataka je deweb j\.d\.o\.o\./);
  assert.match(privacy, /Vercel, Convex, Resend i Google\/Gmail/);
  assert.match(privacy, /Zahtjevi za ponudu i narudžbe Cjenik HR/);
  assert.match(privacy, /12 mjeseci, nakon čega se brišu/);
  assert.match(privacy, /prije eventualnog sklapanja ugovora/);
  assert.match(privacy, /AZOP/);
  assert.match(privacy, /Prijenosi podataka izvan Europskog gospodarskog prostora/);
  assert.match(privacy, /Kada je to primjenjivo/);
  assert.match(privacy, /EU–US Data Privacy Framework i\/ili standardne ugovorne klauzule Europske komisije, ovisno o konkretnom pružatelju i obradi/);
  assert.doesNotMatch(privacy, /GDPR compliant|Google Workspace|Workspace DPA/);
});

test("production app does not include tracking or cookie-banner behavior", () => {
  const productionFiles = [
    join(root, "app", "layout.tsx"),
    join(root, "app", "page.tsx"),
    join(root, "app", "problem-form.tsx"),
    join(root, "app", "site-footer.tsx"),
    join(root, "app", "legal-page.tsx"),
    ...legalPages,
  ];

  for (const file of productionFiles) {
    const contents = readFileSync(file, "utf8");

    assert.doesNotMatch(contents, /<Script|<script|googletagmanager|google-analytics|gtag\(|fbq\(|hj\(/i);
    assert.doesNotMatch(contents, /document\.cookie|cookies\(|setCookie|Accept|Reject/);
  }
});
