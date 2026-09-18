# Cjenik HR payment matching

## Izvor transakcija

PBZ je temeljni bankovni račun, ali integracijski sloj je isključivo ePoslovanje AIS. Nema izravne PBZ XS2A integracije. Službeni AIS ugovor opisuje `POST /api/banking/accounts` i `POST /api/banking/transactions` za testno i produkcijsko okružje:

- [AIS dokumentacija](https://eposlovanje.hr/AIS-dokumentacija.pdf)
- [AIS metode](https://eposlovanje.hr/AIS-metode.pdf)

Provider normalizira samo potrebna polja: ePoslovanje ID, eventualni bank transaction ID, tip, iznos u centima, valuta, structured/unstructured remittance, booking/value vrijeme i hash sirovog događaja. Provider payload se ne logira cijeli.

## Pravilo automatskog matcha

Automatski match zahtijeva istodobno:

1. incoming transaction (`Type = 0` prema AIS dokumentaciji);
2. valuta `EUR`;
3. točan iznos u centima;
4. točan jedinstveni poziv na broj;
5. samo jednu aktivnu narudžbu s tom referencom;
6. neisteklu ponudu.

Iznos bez reference nikada nije dovoljan. Nedostajuća/pogrešna referenca, više kandidata, preplata, nedoplata, druga valuta, izlazna ili istekla uplata vode u `payment_review_required`.

`payment_detected` znači da je provider događaj zaprimljen. `payment_verified` znači da su sva automatska pravila prošla ili je ovlaštena osoba izvršila dokumentiranu ručnu potvrdu.

## Polling

Convex cron pokreće poll svakih 60 minuta. Provider sync state čuva lock/lease, cursor, zadnji uspjeh, sljedeći pokušaj, broj pogrešaka i kanonski kod greške. Preklapanje se preskače, provider ID deduplicira događaj, a outage ne mijenja narudžbe. Ritam nije obećanje trenutne detekcije; ePoslovanje navodi bankovne cikluse i potrebu periodične ponovne AIS autorizacije.

Polling je zadano isključen. Testno okružje traži `AIS_POLLING_ENABLED=true`, testne credentials i autorizirani testni račun. Produkcija dodatno traži code gate `aisProductionEnabled=true`; sama env varijabla ne može uključiti produkciju.

## Test matrica

Testirati: exact match, ponovljeni provider ID, iznos bez reference, pogrešna referenca, preplata/nedoplata, više kandidata, istekla ponuda, outgoing transaction, druga valuta, outage, overlap i ručnu potvrdu s auditom.
