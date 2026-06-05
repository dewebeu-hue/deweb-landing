import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

test('user-facing production copy uses "deweb" lowercase brand style', () => {
  const productionFiles = [
    join(root, "app", "layout.tsx"),
    join(root, "app", "page.tsx"),
    join(root, "app", "problem-form.tsx"),
    join(root, "lib", "problem-email.ts"),
  ];

  for (const file of productionFiles) {
    const contents = readFileSync(file, "utf8");

    assert.doesNotMatch(contents, /Deweb/);
  }

  const page = readFileSync(join(root, "app", "page.tsx"), "utf8");
  assert.doesNotMatch(page, /deweb j\.d\.o\.o\./);
});
