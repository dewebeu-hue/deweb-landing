import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

test("public landing page displays only the approved direct contact and does not store submissions", () => {
  const publicUiFiles = [
    join(root, "app", "page.tsx"),
    join(root, "app", "problem-form.tsx"),
    join(root, "app", "layout.tsx"),
    join(root, "app", "site-footer.tsx"),
  ];

  for (const file of publicUiFiles) {
    const contents = readFileSync(file, "utf8");

    assert.doesNotMatch(contents, /deweb\.eu@gmail\.com/);
    assert.doesNotMatch(contents, /kontakt@deweb\.hr/);
    assert.doesNotMatch(contents, /localStorage/);
    assert.doesNotMatch(contents, /RESEND_API_KEY/);
    assert.doesNotMatch(contents, /CONTACT_TO_EMAIL/);
  }

  const landing = readFileSync(join(root, "app", "page.tsx"), "utf8");
  assert.match(landing, /Dinko Vuković/);
  assert.match(landing, /mailto:dinko@deweb\.hr/);
});

test("marketing footer uses only the approved brand, domain, and legal links", () => {
  const page = readFileSync(join(root, "app", "page.tsx"), "utf8");

  assert.doesNotMatch(page, /deweb j\.d\.o\.o\./);
  assert.match(page, /deweb-logo\.svg/);
  assert.match(page, /<SiteFooter \/>/);
  const footer = readFileSync(join(root, "app", "site-footer.tsx"), "utf8");
  assert.match(footer, /Web-stranice i poslovni alati po mjeri/);
  assert.match(footer, /deweb j\.d\.o\.o\./);
  assert.match(footer, /mailto:dinko@deweb\.hr/);
  assert.match(footer, /Politika privatnosti/);
  assert.match(footer, /Uvjeti korištenja/);
  assert.match(footer, /Podaci o društvu/);
  assert.doesNotMatch(footer, /OIB|IBAN|MBS|24631103366|HR9823400091111346962/);
  assert.match(
    readFileSync(join(root, "app", "problem-form.tsx"), "utf8"),
    /Slanjem upita potvrđujete da ste upoznati s načinom obrade podataka opisanim u/,
  );
  assert.doesNotMatch(page, /Digitalna rješenja za probleme malih poduzetnika\./);
});
