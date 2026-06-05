import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

test("contact API route exists and keeps provider secrets server-side", () => {
  const routePath = join(root, "app", "api", "contact", "route.ts");

  assert.equal(existsSync(routePath), true);

  const route = readFileSync(routePath, "utf8");

  assert.match(route, /export async function POST/);
  assert.match(route, /CONTACT_TO_EMAIL/);
  assert.match(route, /RESEND_API_KEY/);
  assert.match(route, /CONTACT_FROM_EMAIL/);
  assert.match(route, /isHoneypotSubmission/);
  assert.doesNotMatch(route, /deweb\.eu@gmail\.com/);
  assert.doesNotMatch(route, /mailto:/);
});

test("README documents required email environment variables", () => {
  const readme = readFileSync(join(root, "README.md"), "utf8");

  assert.match(readme, /RESEND_API_KEY=/);
  assert.match(readme, /CONTACT_TO_EMAIL=deweb\.eu@gmail\.com/);
  assert.match(readme, /CONTACT_FROM_EMAIL=/);
});
