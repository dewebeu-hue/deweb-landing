import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

test("landing page includes lightweight motion hooks", () => {
  const page = readFileSync(join(root, "app", "page.tsx"), "utf8");
  const globals = readFileSync(join(root, "app", "globals.css"), "utf8");

  assert.match(page, /<ScrollReveal \/>/);
  assert.match(page, /data-reveal/);
  assert.match(page, /hero-source-card/);
  assert.match(page, /process-progress/);
  assert.match(globals, /\.reveal-on-scroll/);
  assert.match(globals, /@keyframes hero-card-drift/);
  assert.match(globals, /@keyframes process-progress-fill/);
  assert.match(globals, /prefers-reduced-motion: reduce/);
});
