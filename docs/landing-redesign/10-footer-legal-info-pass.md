# Footer, pravne stranice i završni privacy transfer pass

Datum: 16. rujna 2026.

## Opseg i potvrde

- Zajednički footer prikazuje naziv društva, opis usluge, javni kontakt, tri pravne/informativne poveznice i copyright. OIB, MBS i IBAN ostaju na stranici Podaci o društvu.
- Sve tri postojeće rute ostaju: `/pravna-obavijest`, `/privatnost`, `/uvjeti`. Svaka ima vlastiti canonical i zadržani `noindex, follow`.
- Politika privatnosti sadrži korisnikov točan tekst pod naslovom „Prijenosi podataka izvan Europskog gospodarskog prostora”, bez dodatnih pravnih tvrdnji.
- Korisnik je potvrdio Vercel Pro i primjenu Vercel DPA, Resend DPA te Google/Gmail obradu. Ne koristi se Google Workspace i ne tvrdi se postojanje Workspace DPA.
- Tekst ne jamči obradu isključivo u EU, ne pripisuje svaki transfer mehanizam svakom provideru i ne tvrdi potpunu GDPR usklađenost.
- Napomena uz obrazac vodi na Politiku privatnosti. Nije dodan consent checkbox.
- Kontaktni API i email flow nisu mijenjani: verificirani Resend sender → postojeći Gmail inbox, Reply-To ostaje email korisnika. Stvarni kontaktni email nije poslan tijekom ovog QA-a.

## Git pregled

- Raniji trust pass već je u commitu `5ac9e2eed459da088f46b678f12659758406668a` (paketi, dokaz rada, izravni kontakt i klijentova kontrola domene/hostinga).
- Gornja hero kartica još nije bila commitana: HEAD je imao apstraktne blokove, a radna verzija naslov „Vaš posao, jasno.” i Usluge/Radovi/Kontakt. Korisnik je izričito odobrio uključivanje te dorade u završni commit.
- Preostali diff pregledan je za footer, tri pravne stranice, napomenu obrasca, zajedničke komponente i pripadne postojeće testove.
- `.env.local` je ignoriran. Tajne, screenshotovi, privremeni testni artefakti i debug kod nisu dio završnog commita.

## QA prije commita

| Provjera | Rezultat |
| --- | --- |
| Postojeći testovi | PASS — 33/33 |
| Typecheck | PASS |
| Production build | PASS — Next.js 16.2.7 |
| Lint | NOT RUN — skripta ne postoji |
| Browser 390 / 768 / 1440 px | PASS — lokalni production build na `http://127.0.0.1:3022` |
| Hero | PASS — uređena kartica na desktopu/tabletu, skrivena dekorativna kartica na mobitelu |
| Footer i tri poveznice | PASS |
| Podaci o društvu | PASS |
| Politika privatnosti i međunarodni transfer tekst | PASS |
| Uvjeti korištenja | PASS |
| Privacy notice i poveznica iz obrasca | PASS |
| Horizontalni overflow | Nema na landingu i sve tri pravne stranice na provjerenim širinama |
| Tipkovnica | PASS — footer linkovi imaju vidljiv fokus |
| Console errors / warnings | Nema u lokalnom browser QA tabu |
| Email slanje | NOT SENT |

Produkcijska provjera nakon pusha izvještava se u završnom statusu zadatka. Ovaj izvještaj dokumentira stanje prije commita i ne predstavlja tvrdnju o završenom deployu.

## Datoteke završnog commita

- `app/page.tsx`
- `app/site-footer.tsx`
- `app/legal-page.tsx`
- `app/problem-form.tsx`
- `app/pravna-obavijest/page.tsx`
- `app/privatnost/page.tsx`
- `app/uvjeti/page.tsx`
- `lib/contact-visibility.test.ts`
- `lib/legal-pages.test.ts`
- `docs/landing-redesign/10-footer-legal-info-pass.md`
