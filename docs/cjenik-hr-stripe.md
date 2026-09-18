# Cjenik HR Stripe Checkout

## Arhitektura

Primarni payment provider za standardne pakete je Stripe Checkout. Next.js server validira kupca i paket, Convex najprije trajno zapisuje narudžbu, a zatim server stvara Stripe-hosted Checkout Session. Browser dobiva samo Checkout URL. `other_system` ostaje ručni lead bez Checkouta.

Tok je:

`order create → awaiting_payment → Checkout Session → checkout.session.completed webhook → payment_detected → payment_verified → invoice_review_required`

`invoice_review_required` je očekivani završetak Preview faze. Stripe potvrda plaćanja nije račun. ePoslovanje račun/fiskalizacija i delivery ostaju zasebno isključeni.

## Cijene i Checkout

Checkout koristi `line_items.price_data`. Kanonski iznosi dolaze iz serverske Cjenik HR konfiguracije: `plugin = 3900` i `setup = 7900` centi, `EUR`. Browser amount se ne koristi. Omogućena je samo jednokratna kartična naplata (`mode=payment`, `card`), bez pretplate, Stripe Taxa i Stripe invoice creationa.

`client_reference_id` nosi HMAC-bazirani provider-safe identifikator. Metadata sadrži samo `orderRef`, `orderNumber` i `package`. Email dolazi iz validiranog customer snapshota. OIB, adresa, javni token, delivery tokeni i tajne ne šalju se u metadata.

## Test/live zaštita

Ova faza zahtijeva `STRIPE_MODE=test` i testni secret key. Live ključ se odbija u Previewu i developmentu, a live tok nije implementiran ni ako bi produkcijski env gateovi bili postavljeni. `STRIPE_PRODUCTION_ENABLED=false` ostaje zadano. Checkout rezultat dodatno mora imati `livemode=false` i `cs_test_` session ID.

Obvezne Preview varijable su `STRIPE_MODE=test`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRODUCTION_ENABLED=false` i po potrebi `CJENIK_HR_CHECKOUT_ORIGIN`. Tajne su isključivo server-side.

## Webhook

Endpoint je `POST /api/cjenik-hr/stripe/webhook`. Potpis se provjerava službenim Stripe Node SDK-om nad neizmijenjenim raw bodyjem prije handoffa. Browser nema bridge tajnu. Next.js nakon provjere šalje samo kanonska polja Convex mutationu.

Kanonski događaj za v1 kartični tok je `checkout.session.completed`. Prije verifikacije provjeravaju se test `livemode`, spremljena session ID vrijednost, provider, `payment_status=paid`, valuta, iznos, package, metadata i `client_reference_id`. Svako odstupanje ide u `payment_review_required` ili provider event review, bez isporuke.

`charge.refunded` i `charge.dispute.created` samo se evidentiraju i označavaju za ručni pregled. Nema automatskog povrata, storna ni povlačenja isporuke.

## Idempotency i retry

Svaka narudžba ima auditabilne `paymentAttempts`. Aktivna otvorena sesija ponovno se koristi. Istekla sesija dopušta novi pokušaj iste narudžbe. Stripe create dobiva deterministički idempotency key `checkout:<provider-safe-id>:<attempt-number>`, pa mrežni timeout ne stvara nekontrolirane sesije.

Stripe event ID sprema se u `paymentProviderEvents`; ponovljeni event je 2xx idempotent no-op. Samo jedna očekivana Stripe uplata može potvrditi narudžbu. Kasniji uspješan pokušaj ide u ručni review i ne ponavlja invoice/delivery prijelaze.

## Operativni status

- PRIMARY: Stripe Checkout + potpisani webhook.
- FUTURE/OPTIONAL: bank transfer + ePoslovanje AIS; kod i testovi ostaju, polling je zadan kao disabled.
- QUOTE: zadržan za budući bank transfer, custom/manual sales i ručnu intervenciju; standardni Stripe paketi ga ne generiraju.
- INVOICE: ePoslovanje, zaseban sljedeći gate.
- RECEIPT: Stripe potvrda naplate nije ePoslovanje račun.
