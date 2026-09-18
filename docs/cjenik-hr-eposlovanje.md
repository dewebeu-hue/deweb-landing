# Cjenik HR i ePoslovanje

## Provjereni službeni izvori

- [ePoslovanje informacije za developere](https://eposlovanje.hr/za-developere/)
- [API v2 dokumentacija](https://doc.eposlovanje.hr/)
- [AIS dokumentacija](https://eposlovanje.hr/AIS-dokumentacija.pdf)
- [AIS metode](https://eposlovanje.hr/AIS-metode.pdf)
- [ePoslovanje/pondi dodatni servisi Swagger](https://services.pondi.hr/swagger/index.html)
- [HUB PDF417 EUR specifikacija](https://hub.hr/sites/default/files/inline-files/2DBK_EUR_Uputa_1.pdf)

Stranica za developere preporučuje API v2 za nove integracije i označava ga beta statusom. AIS PDF javno daje točan ugovor za račune i transakcije. Dodatni servis navodi generiranje PDF417/HRVHUB30, ali iz ovog okruženja nije dobiven strojno provjerljiv puni Swagger ugovor. Zato adapter za live PDF417 ne smije izmišljati endpoint ili payload.

## Provider granice

`PaymentCodeProvider`, `BankTransactionsProvider` i `InvoiceProvider` imaju mock/sandbox i live granicu. Mock dokument je vidljivo označen `TEST / NIJE ZA PLAĆANJE`. Live adapteri primaju credentials isključivo iz server environmenta.

Invoice API v2 poziv ostaje blokiran dok nisu potvrđeni aktualni endpoint/payload, UBL/Fiskalizacija 2.0 profil, tip kupca, porezni status, certifikati gdje su potrebni, numbering policy i računovodstveni tok. Neuspjeh ili timeout nije dokaz izdavanja računa.

## Status ove grane

- `EPOSLOVANJE_SANDBOX`: `NOT_TESTED / CREDENTIALS_MISSING`
- `AIS`: `NOT_TESTED / CREDENTIALS_MISSING`
- `PRODUCTION_BILLING`: `DISABLED`

Nije izvršen poziv prema testnom ili produkcijskom ePoslovanje okružju, nije izdana fiskalna isprava i nije čitan stvarni PBZ račun.
