# Cjenik HR order engine

## Granica sustava

Standardni paketi `plugin` i `setup` prolaze kroz trajni Convex zapis. `other_system` ostaje ručni lead: nema automatske ponude, podataka za uplatu, računa ni downloada. Cijena se uvijek određuje na serveru u centima (`3900` ili `7900`); vrijednost iz preglednika nije izvor istine.

## Identitet i numeracija

- `orders._id` je interni identitet.
- Javni token je 256-bitna slučajna vrijednost; u bazi se čuva samo SHA-256 hash.
- `requestId` je idempotency ključ jednog slanja obrasca.
- Čitljivi broj narudžbe koristi zasebni transakcijski sequence, primjer `CHR-2026-000001`. Ne koristi se `MAX + 1`.
- Ponude i računi imaju zasebne sekvence. Produkcijsku numeraciju računa mora odrediti računovodstvena/provider politika.

## Kupac i snapshot

Podržana je samo Hrvatska. Poslovni kupac daje tvrtku/obrt, OIB, adresu, poštanski broj, grad, kontakt osobu i email. Potrošač daje ime, adresu, poštanski broj, grad i email. OIB se validira kao 11 znamenki i ISO 7064 MOD 11,10 kontrola. Ne zapisuje se u javne tokene, URL ili strukturirane logove.

Izdani dokumenti koriste nepromjenjivi snapshot kupca, proizvoda, iznosa i poreznog teksta. Izmjena customer zapisa zato ne mijenja već izrađenu ponudu ili račun.

## Stanja

Centralni state machine pokriva `lead`, `quote_pending`, `quote_created`, `quote_sent`, `awaiting_payment`, `payment_detected`, `payment_review_required`, `payment_verified`, `invoice_pending`, `invoice_review_required`, `invoice_processing`, `invoice_fiscalized`, `invoice_failed`, `invoice_sent`, `delivery_ready`, `setup_pending`, `completed`, `expired`, `cancelled`, `refund_pending`, `refunded` i `failed`.

Svaki prijelaz stvara audit zapis s prethodnim i novim stanjem, vremenom, razlogom, actorom i provider referencom kada postoji. Nedopušten preskok stanja se odbija.

## Idempotency i kvarovi

- Ponovljeni `requestId` vraća postojeću narudžbu.
- Provider transaction ID deduplicira AIS događaje.
- Ponuda, račun i email imaju vlastiti idempotency ključ.
- Timeout pri izdavanju računa ne ponavlja slijepo zahtjev: prvo se mora provjeriti postojeći provider status.
- Neuspjeh invoice providera ostavlja uplatu u `payment_verified`/`invoice_failed`; ne stvara lažni račun ni delivery.
- `setup` nikada ne prelazi u `completed` samo zato što je ZIP preuzet.

## Abuse i privatnost

API ograničava body na 32 kB, koristi honeypot, stroge allowliste i hashirani fingerprint za rate limit. Logovi sadrže event, siguran razlog i nesenzitivni broj narudžbe; ne sadrže adresu, OIB, email, provider tajne ni cijeli payload.

Glavne prijetnje su ponovljeno slanje, enumeracija javnih tokena, lažna provider ponavljanja, amount-only uparivanje, ZIP hotlink, provider timeout i slučajno uključivanje produkcije. Kontrole su idempotency, 256-bitni tokeni, exact matching, hash/token expiry, private storage, provider status check i code gateovi.

## Operativne komande

Ručna potvrda uplate dopuštena je samo internal mutationom iz Convex dashboarda/dev alata. Obvezni su actor i razlog; zapisuje se `manual: true`. Otkazivanje, povrat i sporni iznos ostaju ručni poslovni postupci.
