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
