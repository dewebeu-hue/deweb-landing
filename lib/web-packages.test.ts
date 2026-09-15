import test from "node:test";
import assert from "node:assert/strict";
import { webOfferTerms, webPackages } from "./web-packages.ts";

test("owner-approved web prices and package boundaries stay explicit", () => {
  assert.deepEqual(webPackages.map(item => [item.id, item.price]), [["simple", 790], ["business", 1290]]);
  assert.match(webPackages[0].scope, /Jedna stranica do šest/);
  assert.match(webPackages[1].scope, /Do pet stranica ukupno/);
  assert.match(webPackages[0].bestFor, /Najbolje za: manje poslovanje/);
  assert.match(webPackages[1].bestFor, /više prostora za buduće proširenje sadržaja/);
  assert.match(webOfferTerms.tax, /deweb nije u sustavu PDV-a\. Prikazane cijene ne uvećavaju se za PDV\./);
  assert.match(webOfferTerms.external, /troškovi domene, hostinga ili dodatnih licenci/);
  assert.match(webOfferTerms.external, /nisu uključeni u cijenu izrade/);
  assert.match(webOfferTerms.maintenance, /Ne morate ugovoriti mjesečno održavanje/);
  assert.match(webOfferTerms.ownership, /na vašim računima i pod vašom kontrolom/);
  assert.match(webOfferTerms.ownership, /samo potreban tehnički pristup/);
  assert.match(webOfferTerms.managedHosting, /nije uključen u web-pakete od 790 € i 1\.290 €/);
  assert.match(webOfferTerms.delivery, /50% prije početka, 50% nakon prihvata i prije objave/);
});
