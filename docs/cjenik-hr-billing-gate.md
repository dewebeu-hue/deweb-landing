# Cjenik HR billing gate

## Fail-closed pravilo

`lib/cjenik-hr-commercial.ts` sadrži poslovne gateove, odvojene od providera i plugina:

| Gate | Zadano |
| --- | --- |
| `commercialTermsConfirmed` | `false` |
| `billingPolicyConfirmed` | `false` |
| `eposlovanjeProductionEnabled` | `false` |
| `aisProductionEnabled` | `false` |
| `deliveryEnabled` | `false` |

Produkciona tajna, IBAN ili API ključ sami po sebi ne mogu uključiti produkciju. Potrebni su code gate, `billingMode=production` i svi odgovarajući runtime preduvjeti. Trenutačni način je `salesMode=quote`, `billingMode=sandbox`.

Ako `billingPolicyConfirmed=false`, `payment_verified` vodi u `invoice_review_required`. Nema `invoice_fiscalized`, računa kupcu ni isporuke.

## Dokumenti u sandboxu

Svaka sandbox ponuda/slip nosi `TEST / NIJE ZA PLAĆANJE` i `Ponuda nije račun.` Ne koristi se stvarni IBAN. Porezni tekst ne pretpostavlja PDV status.

## Production launch checklist

- [ ] Potvrđeni komercijalni uvjeti, podrška, nadogradnje, odustanak/povrat i rok ponude.
- [ ] Računovođa je potvrdio B2B/B2C tok, porezni tekst, fiskalizaciju i arhivu.
- [ ] Potvrđena pravila numeracije ponuda i računa; provider je autoritet gdje je primjenjivo.
- [ ] ePoslovanje production račun, ugovor, API v2 contract i potrebni certifikati su potvrđeni.
- [ ] AIS autorizacija za stvarni PBZ račun i postupak obnove autorizacije su potvrđeni.
- [ ] Testno okružje prolazi submit → quote → payment event → invoice status bez produkcijskih poziva.
- [ ] Timeout/retry/status-check i provider outage scenariji prolaze.
- [ ] Stvarni seller podatci i IBAN su postavljeni samo u server env.
- [ ] Privatni ZIP hash odgovara `8ae3b6ad3834a5bb2bb5c7defb3c63477f5788936e66bdfd1d735a9a267a0898`.
- [ ] Delivery token expiry, download limit, revocation i setup state prolaze.
- [ ] Privacy/retention/DPA evidencija i korisničke obavijesti su pregledane.
- [ ] Svih pet code gateova namjerno je promijenjeno i pregledano u zasebnom PR-u.
- [ ] Produkcijski smoke odobren je zasebno; ova grana ga ne izvodi.
