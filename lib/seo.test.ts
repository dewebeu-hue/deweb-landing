import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

test("landing metadata uses the approved SEO title and description", () => {
  const layout = readFileSync(join(root, "app", "layout.tsx"), "utf8");

  assert.match(layout, /title: "deweb — Digitalna rješenja za male poduzetnike"/);
  assert.match(
    layout,
    /description:\s*"Opišite poslovni problem\. deweb predlaže izvediva digitalna rješenja i izrađuje MVP, interni alat ili custom rješenje za male poduzetnike\."/,
  );
});
