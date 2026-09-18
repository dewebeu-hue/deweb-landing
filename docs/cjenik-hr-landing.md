# Cjenik HR landing

## Opseg

- Javna ruta: `/cjenik-hr`
- Stranica potvrde: `/cjenik-hr/hvala?paket=plugin|setup|other`
- API za upit/narudžbu: `POST /api/cjenik-hr`
- Stripe Checkout API za standardni paket: `POST /api/cjenik-hr/checkout`
- Stripe webhook: `POST /api/cjenik-hr/stripe/webhook`
- Sigurna status ruta: `/cjenik-hr/narudzba/{public-token}`
- Status proizvoda: `release_candidate_ready`
- Prodajni način: `quote`
- Billing način: `sandbox` uz fail-closed code gateove
- Cijena plugina: 39 EUR jednokratno
- Cijena plugina s postavljanjem: 79 EUR jednokratno

Vrijednosti statusa, verzije i cijena vode se u `lib/cjenik-hr-product.ts`. Stranica i email naslovi ih ne dupliciraju.

## Izvor tvrdnji o proizvodu

Javne tvrdnje i slike izvedene su isključivo iz Git checkpointa Cjenik HR repozitorija:

`194783813ee3ae647939ddf5d093b9baffdcec15`

Checkpoint označava release candidate 1.0.0, schema 7. Finalni distribucijski ZIP ima SHA-256 `8ae3b6ad3834a5bb2bb5c7defb3c63477f5788936e66bdfd1d735a9a267a0898`. Plugin repo čitan je read-only kroz Git objekt; nije mijenjan, rebuildan ni isporučen.

Kopirane slike i izvorni blobovi checkpointa:

| Javna datoteka | Izvor u checkpointu | Git blob |
| --- | --- | --- |
| `public/cjenik-hr/import.png` | `docs/evidence/phase2-import-ui.png` | `11f2160c015f7362e53ad109e933e04b28b7516a` |
| `public/cjenik-hr/naljepnice.png` | `docs/evidence/phase3-labels-desktop.png` | `02b6015068af401b8bdb1a17d32b82830377f315` |
| `public/cjenik-hr/objave.png` | `docs/evidence/phase4-publications-admin-desktop.png` | `286abe82e08ea78fe138bd206b84d6692585b1ca` |
| `public/cjenik-hr/woocommerce.png` | `docs/evidence/phase6/storefront-variable-1440.png` | `603ee66f99dfe7bd0379d31cf27bd6b4023152fc` |

## Regulatorni izvori

Sažeci su provjereni prema službenim tekstovima Narodnih novina:

- [Odluka o isticanju dodatne cijene, NN 101/2026, br. 1212](https://narodne-novine.nn.hr/clanci/sluzbeni/2026_09_101_1212.html)
- [Odluka o objavi cjenika proizvoda i usluga, NN 101/2026, br. 1213](https://narodne-novine.nn.hr/clanci/sluzbeni/full/2026_09_101_1213.html)

Landing navodi datum stupanja na snagu 1. listopada 2026., opisuje tehničke obveze sažeto i sadrži vidljivu napomenu da proizvod nije pravni savjet niti samostalno jamstvo usklađenosti.

## Obrazac, narudžba i email

Obrazac je dvokoračni. Standardni paketi stvaraju idempotentan trajni Convex order pa u Previewu otvaraju Stripe Test Checkout, a `other_system` ostaje postojeći ručni email lead. Postojeći `/api/contact` nije promijenjen. Produkcijski CTA tekst ostaje ponuda dok live, billing i ePoslovanje gateovi nisu odobreni.

- Plugin i postavljanje dopušteni su samo uz WordPress `yes` ili `unsure` i hrvatsku adresu kupca.
- Poslovni kupac daje validan OIB; potrošač ne mora davati OIB.
- Server ponovno određuje cijenu u centima i ne vjeruje vrijednosti preglednika.
- Postavljanje traži domenu.
- Svi odabiri prolaze kroz serverske allowliste.
- Skriveno `website` polje je honeypot.
- Email je isključivo plain text; korisnički sadržaj ne ulazi u HTML.
- Status URL sadrži HMAC-bazirani javni token i nema osobnih podataka. Success redirect nije dokaz uplate; status potvrđuje samo webhook.
- Kartične podatke obrađuje Stripe; aplikacija ne prima niti sprema puni broj kartice ili CVC.
- Prvi upit izričito ne traži lozinke, kartične podatke ni poslovne dokumente.

## SEO

- Kanonski URL: `https://deweb.hr/cjenik-hr`
- Landing se nalazi u sitemapu.
- Stranica potvrde nije u sitemapu i ima `noindex, nofollow`.
- Preview i development koriste postojeću `deploymentRobots` politiku.
- Nema Product availability, review ili rating strukturiranih tvrdnji.

## Launch checklist

- [x] Status je usklađen na `release_candidate_ready`; nije `available`.
- [ ] Ponovno potvrditi cijene 39 EUR i 79 EUR.
- [ ] Provjeriti WordPress/PHP preduvjete na ciljnom sustavu.
- [ ] Potvrditi raspored i vanjski cron na stvarnom hostingu.
- [ ] Provesti fizički test naljepnica na konkretnom papiru i pisaču.
- [ ] Provjeriti korisnikov izvor podataka na neosjetljivom uzorku.
- [ ] Provjeriti aktualnost regulatornih poveznica i teksta prije javne kampanje.
- [ ] Napraviti jedan kontrolirani email test nakon odobrenja; automatizirani QA ga namjerno ne šalje.
- [ ] Nakon odobrenja spojiti feature granu kroz uobičajeni review i Vercel production workflow.
