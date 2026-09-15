import test from "node:test";
import assert from "node:assert/strict";
import { projectSelectionHref, readProjectSelection } from "./project-selection.ts";

test("A/B/C CTA URLs preserve the intended selection without JavaScript", () => {
  const cases = [
    { href: projectSelectionHref("web", "simple"), type: "web", packageId: "simple" },
    { href: projectSelectionHref("web", "business"), type: "web", packageId: "business" },
    { href: projectSelectionHref("tool"), type: "tool", packageId: "" },
  ] as const;

  for (const item of cases) {
    const url = new URL(item.href, "https://deweb.hr");
    assert.equal(url.pathname, "/");
    assert.equal(url.hash, "#kontakt");
    assert.deepEqual(readProjectSelection({
      vrsta: url.searchParams.get("vrsta") ?? undefined,
      paket: url.searchParams.get("paket") ?? undefined,
    }), { type: item.type, packageId: item.packageId });
  }
});

test("invalid and mismatched URL selections cannot attach a web package", () => {
  assert.deepEqual(readProjectSelection({ vrsta: "tool", paket: "business" }), { type: "tool", packageId: "" });
  assert.deepEqual(readProjectSelection({ vrsta: "web", paket: "unknown" }), { type: "web", packageId: "" });
  assert.deepEqual(readProjectSelection({ vrsta: "invalid", paket: "simple" }), { type: "", packageId: "" });
  assert.deepEqual(readProjectSelection({ vrsta: ["web", "tool"], paket: "simple" }), { type: "", packageId: "" });
});
