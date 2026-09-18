# Cjenik HR secure delivery

## Artefakt

Isporučuje se samo privatno pohranjen, unaprijed provjeren ZIP:

- proizvod: Cjenik HR 1.0.0
- schema: 7
- source checkpoint: `194783813ee3ae647939ddf5d093b9baffdcec15`
- SHA-256: `8ae3b6ad3834a5bb2bb5c7defb3c63477f5788936e66bdfd1d735a9a267a0898`

ZIP se ne kopira u `public/`, repo ni build output. Registracija `storageId` i hasha je internal operacija. Ova faza ne rebuilda niti mijenja plugin.

## Token

Delivery token je kriptografski slučajan. U tablici se čuva samo hash, uz order binding, expiry, maksimalan broj preuzimanja, broj korištenja, revoked flag i vremena. Consume je atomska operacija: nevažeći, istekli, opozvani ili potrošeni token ne vraća storage URL.

Download endpoint mora vratiti ZIP s privatnim headerima: `Content-Type: application/zip`, siguran `Content-Disposition`, `Cache-Control: private, no-store` i `X-Content-Type-Options: nosniff`.

## Poslovna pravila

- Token se izdaje tek nakon `invoice_sent` i samo uz `deliveryEnabled=true`.
- Plugin-only narudžba može prijeći `delivery_ready → completed` nakon kontrolirane isporuke.
- Paket s postavljanjem prelazi u `setup_pending`; download sam ne završava narudžbu.
- Refund/cancel opoziva aktivne tokene.
- Email ne sadrži trajni storage URL.

## Status

Delivery je implementacijski modeliran, ali je code gate zadano `false`; stvarni ZIP nije uploadan niti dostavljen kupcu.
