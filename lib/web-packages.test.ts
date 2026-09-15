import test from "node:test";
import assert from "node:assert/strict";
import { webOfferTerms, webPackages } from "./web-packages.ts";

test("owner-approved web prices and package boundaries stay explicit", () => {
  assert.deepEqual(webPackages.map(item => [item.id, item.price]), [["simple", 790], ["business", 1290]]);
  assert.match(webPackages[0].scope, /Jedna stranica do šest/);
  assert.match(webPackages[1].scope, /Do pet stranica ukupno/);
  assert.match(webOfferTerms.tax, /deweb nije u sustavu PDV-a\. Prikazane cijene ne uvećavaju se za PDV\./);
  assert.match(webOfferTerms.external, /Domena, hosting i dodatne licence nisu uključeni/);
  assert.match(webOfferTerms.delivery, /50% prije početka, 50% nakon prihvata i prije objave/);
});
