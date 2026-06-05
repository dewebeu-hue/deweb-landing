import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

test("public landing page does not display public email addresses or store submissions", () => {
  const publicUiFiles = [
    join(root, "app", "page.tsx"),
    join(root, "app", "problem-form.tsx"),
    join(root, "app", "layout.tsx"),
  ];

  for (const file of publicUiFiles) {
    const contents = readFileSync(file, "utf8");

    assert.doesNotMatch(contents, /deweb\.eu@gmail\.com/);
    assert.doesNotMatch(contents, /kontakt@deweb\.hr/);
    assert.doesNotMatch(contents, /mailto:/);
    assert.doesNotMatch(contents, /localStorage/);
  }
});

test("marketing footer uses only the approved brand, domain, and legal links", () => {
  const page = readFileSync(join(root, "app", "page.tsx"), "utf8");

  assert.doesNotMatch(page, /deweb j\.d\.o\.o\./);
  assert.match(page, />\s*deweb\s*</);
  assert.match(page, /deweb\.hr/);
  assert.match(page, /Privatnost/);
  assert.match(page, /Uvjeti korištenja/);
  assert.match(page, /Pravna obavijest/);
  assert.match(
    readFileSync(join(root, "app", "problem-form.tsx"), "utf8"),
    /U ovoj verziji forma još nije spojena na sustav za zaprimanje upita\. Podaci se neće slati dok ne aktiviramo zaprimanje\./,
  );
  assert.doesNotMatch(page, /Digitalna rješenja za probleme malih poduzetnika\./);
});
