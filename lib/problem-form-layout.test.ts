import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

test("contact form uses shared wrappers and control sizing for aligned fields", () => {
  const form = readFileSync(join(root, "app", "problem-form.tsx"), "utf8");

  assert.match(form, /const fieldWrapperClass =/);
  assert.match(form, /const labelClass =/);
  assert.match(form, /const controlClass =/);
  assert.match(form, /items-start/);
  assert.match(form, /<Field name="phone" label="Telefon" type="tel" optionalText="opcionalno" \/>/);
  assert.doesNotMatch(form, /<div className="grid gap-2">\s*<label[^>]+htmlFor="phone"/);
  assert.doesNotMatch(form, /<input className="min-h-12[^"]+" id="phone"/);
});
