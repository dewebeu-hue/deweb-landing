# deweb landing

Minimalna Next.js landing stranica za deweb.

## Kontakt forma

Kontakt forma šalje upite kroz server-side API route `app/api/contact/route.ts`.
Za slanje emaila koristi se Resend HTTP API na serveru, bez izlaganja API ključa u frontend kodu.

Primjer environment varijabli:

```env
RESEND_API_KEY=
CONTACT_TO_EMAIL=deweb.eu@gmail.com
CONTACT_FROM_EMAIL=
```

## Cjenik HR order engine

Standardni Cjenik HR zahtjevi spremaju se u Convex i pokreću trajni quote/payment/invoice/delivery state machine. Konfiguracija je dokumentirana u `.env.example`; stvarne tajne ostaju samo u Vercel/Convex server environmentu.

```powershell
npx convex dev
npm run dev
```

Trenutačni `billingMode` je `sandbox`, a svi produkcijski poslovni gateovi su zadano `false`. Prisutnost IBAN-a ili provider ključa sama ne uključuje produkcijsku naplatu, AIS, fiskalizaciju ili isporuku. Detalji su u `docs/cjenik-hr-billing-gate.md`.
