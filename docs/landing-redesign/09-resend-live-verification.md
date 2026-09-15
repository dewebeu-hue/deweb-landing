# Kontaktni obrazac — Resend integracijska provjera

## Aktualizacija 15. rujna 2026. — stvarni TEST A/B/C

**Rezultat: tri TEST poruke prihvaćene od Resenda i potvrđene u odobrenom Gmail Inboxu, točno po jedna za A, B i C.** Dinko je potvrdio VERIFIED status domene `deweb.hr`, namjenski Sending API key te adrese `Deweb web <noreply@deweb.hr>` → `deweb.eu@gmail.com`, s TEST Reply-To `dinko@deweb.hr`. Lokalna `.env.local` konfiguracija je prisutna i Gitom ignorirana; provjerena je samo neprazna prisutnost ključa i podudaranje odobrenih adresa, bez ispisa ili pohrane vrijednosti ključa u ovaj dokument.

| Slučaj | Stvarni TEST subject | Resend prihvat / ID | Gmail Inbox poruka / ID | Provjereni sadržaj |
| --- | --- | --- | --- | --- |
| A | `[TEST] Novi Deweb upit — Jednostavni web 790 €` | Prihvaćen; `ceacdb7b-2493-4f2c-8228-4677ec5317e4` | Jedna; `1a0a2542c9098010` | From, To, Reply-To, Jednostavni web 790 €, Č/ć/ž/š/đ: PASS |
| B | `[TEST] Novi Deweb upit — Poslovni web 1.290 €` | Prihvaćen; `61d7d317-bee9-46c0-b0f5-344864224f64` | Jedna; `1a0a2542dc62d96b` | From, To, Reply-To, Poslovni web 1.290 €, Č/ć/ž/š/đ: PASS |
| C | `[TEST] Novi Deweb upit — Poslovni alat` | Prihvaćen; `8faa3e00-30ca-4334-9383-edf739cc07de` | Jedna; `1a0a2542fe9b4796` | From, To, Reply-To, ručni proces i korisnici rješenja, Č/ć/ž/š/đ; bez web-paketa i cijene: PASS |

Stvarni TEST put bio je postojeći `sendContactEmail(..., { test: true })` pozvan lokalno jednom po slučaju. Ta opcija nije dostupna javnom korisniku. Resend je za svaki `POST /emails` vratio ID. Pokušaj čitanja `GET /emails/{id}` s namjenskim ključem vratio je HTTP 401 za sva tri ID-a; zato zasebni Resend `last_event` **nije potvrđen**. Neovisna provjera putem Gmail priključka povezanog s `deweb.eu@gmail.com` našla je u `INBOX` tri poruke, a pretraga `in:anywhere` za istog pošiljatelja, primatelja i dan dala je točno tri. Zaglavlja svake potvrđuju From, To, Reply-To i TEST subject; tijela potvrđuju relevantni paket ili alat i hrvatske znakove. Gmail primitak je potvrđen, bez tvrdnje o Resendovom nedostupnom eventu.

Javna forma i produkcijska ruta nisu korištene za **stvarno** TEST slanje jer ruta namjerno ne prihvaća `test: true` i poslala bi dodatne poruke bez TEST prefiksa. Njihov tok je provjeren zasebno bez vanjskog POST-a: raniji browser mock potvrđuje A/B/C preodabir i predaju, a sadašnji lokalni in-process poziv `POST /api/contact` s potpuno presretnutim Resend fetchom za svaki A/B/C vraća HTTP 200 i točno jedan transportni poziv. Mock ruta ostavlja produkcijski subject bez TEST prefiksa i postavlja Reply-To na validirani email iz zahtjeva. Ovo nije dokaz da je javna ruta u produkciji slala mail.

Regresija nakon live testa: `npm test` **33/33 PASS**, `npm run typecheck` **PASS**, `npm run build` **PASS** (Next.js 16.2.7); lint **NOT RUN** jer nema lint skripte. Nije mijenjan aplikacijski kod, ovisnosti, lockfile, produkcija ni vanjski sustavi osim tri izričito odobrena TEST slanja. Nema commita, pusha ni deploya.

## Povijesni zapis prije konfiguracije

Datum: 14. rujna 2026. **STATUS: BLOCKED — inbox receipt not confirmed.** Nijedna stvarna TEST A/B/C poruka nije poslana: lokalno nema mail konfiguracije niti je potvrđena verificirana sending domena i dopuštena From adresa. Ovaj izvještaj zamjenjuje samo raniji status neodobrenih testnih adresa iz `06-prelaunch-verification.md`: Dinko je sada izričito odobrio primatelja i TEST Reply-To, ali time nisu potvrđeni sender, dostava ni primitak.

## Odobreni tok i stvarno zatečeno stanje

| Polje | Odobreno / implementirano | Potvrda konfiguracije |
| --- | --- | --- |
| FROM | `CONTACT_FROM_EMAIL`: verificirana Deweb sending adresa; `Deweb web <noreply@deweb.hr>` samo ako odgovara stvarno verificiranoj domeni i odabranoj konfiguraciji. Korisnikov email nikada nije From. | **BLOCKED** — lokalna vrijednost i status sending domene nisu dostupni; adresa nije izmišljena ni postavljena. |
| TO | `CONTACT_TO_EMAIL` mora biti `deweb.eu@gmail.com` za TEST A/B/C i buduće leadove. | **Odobreno, ali lokalno nije konfigurirano.** Primatelj iz README primjera sada je izričito potvrđen korisnikovom uputom. |
| TEST Reply-To | `dinko@deweb.hr` za točno tri odobrena testa. | **Odobreno, nije korišteno za stvarno slanje.** |
| Produkcijski Reply-To | Validirani email koji korisnik upiše u obrazac. | **PASS u kodu i mock testu.** |
| API key | Postojeći `RESEND_API_KEY`, samo na serveru. | **MISSING** lokalno; vrijednost nije čitana, ispisana ni zapisana. |

U projektu nema `.env*` datoteka i proces nema nijednu od varijabli `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` (provjerena je samo prisutnost naziva). Produkcijski env, Resend račun i inbox nisu pregledani. Zato nije dopušteno pretpostaviti da je `noreply@deweb.hr` verificiran. [Resend navodi](https://resend.com/docs/knowledge-base/how-do-I-create-an-email-address-or-sender-in-resend) da se nakon verifikacije domene može slati s adresa na toj domeni; to nije dokaz verifikacije Dewebove domene. Nije promijenjen DNS ni Resend račun.

Put ostaje obrazac → `POST /api/contact` → serverska validacija i honeypot → `sendContactEmail` → Resend `POST /emails`. Endpoint čita From/To/API key iz postojećih env naziva. User email se nakon validacije stavlja u `reply_to`; nije korišten kao `from`. Nevaljan JSON/payload vraća 400, provider neuspjeh vraća generički 502, a uspjeh endpointa znači samo prihvat zahtjeva za slanje. Resendov [send odgovor](https://resend.com/docs/api-reference/emails/send-email) može vratiti message ID; kod ga sada preuzima i bilježi samo u serverskom logu, bez izlaganja API ključa, cijelog requesta ili ID-a korisniku. `HTTP 200`, Resend prihvat, delivery status i inbox receipt zasebne su tvrdnje.

## Predmet i sadržaj

Mock nacrti daju točno:

| Slučaj | TEST subject | Produkcijski subject |
| --- | --- | --- |
| A | `[TEST] Novi Deweb upit — Jednostavni web 790 €` | `Novi Deweb upit — Jednostavni web 790 €` |
| B | `[TEST] Novi Deweb upit — Poslovni web 1.290 €` | `Novi Deweb upit — Poslovni web 1.290 €` |
| C | `[TEST] Novi Deweb upit — Poslovni alat` | `Novi Deweb upit — Poslovni alat` |

Produkcijska ruta uvijek koristi subject bez TEST prefiksa. U `buildContactEmailPayload` postoji eksplicitna `test: true` opcija za izolirani QA nacrt ili kontrolirano slanje, ali **nije** korisničko polje ni dio javnog API zahtjeva. Nijedan TEST subject nije poslan Resendu u ovom zadatku. Prije budućeg stvarnog A/B/C testa treba izabrati kontrolirani lokalni put koji istodobno provjerava formu/API i primjenjuje TEST prefiks; ne predstavljati današnje zasebne mock nacrte kao end-to-end delivery.

Tekst maila sada uključuje ime, email, vrstu projekta i poruku; tvrtku/obrt, telefon, postojeći web i odabrani web-paket samo kad postoje; kontekst ručnog procesa i korisnika rješenja samo za alat/SaaS kad je upisan. C nema web-paket ni web-cijenu. Ne dodaju se prazne oznake, `Nije navedeno`, timestamp, environment podaci, request dump ni stack trace. Hrvatski znakovi Č/ć/ž/š/đ provjereni su u testnim nacrtima. Validacija odbija kontrolne znakove i oblik adrese pogodan za header injection prije stvaranja Reply-To.

## A/B/C matrica — stvarno izvršeno nasuprot nedostupnom

`PASS (mock)` znači browser ili unit provjeru bez vanjskog POST-a. **Nije** Resend ili inbox dokaz. Svaka browser sesija najprije je blokirala `**/api/contact`; `window.fetch` je potom presretao samo lokalni kontaktni poziv. Mrežni zapis pokazao je **0 stvarnih browser POST-ova**.

| Slučaj | FORM SUBMISSION | API ACCEPTANCE | RESEND ACCEPTANCE / ID | DELIVERY | INBOX RECEIPT |
| --- | --- | --- | --- | --- | --- |
| TEST A — `web/simple`, 790 € | **PASS (mock)** — preodabir bez i s JS-om, validan sintetički payload; 502 mock čuva unos, retry 200 mock daje jedan pokušaj. | **BLOCKED za stvarni valjani zahtjev** — lokalni env nedostaje. Server validator za A prolazi u unit testu; nevaljan lokalni API payload vraća 400. | **BLOCKED** — 0 stvarnih slanja, nema provider ID-a. | **BLOCKED** | **BLOCKED — awaiting human confirmation** |
| TEST B — `web/business`, 1.290 € | **PASS (mock)** — preodabir bez i s JS-om, validan sintetički payload; timeout mock čuva unos i otključava gumb. | **BLOCKED za stvarni valjani zahtjev** — lokalni env nedostaje; server validator za B prolazi u unit testu. | **BLOCKED** — 0 stvarnih slanja, nema provider ID-a. | **BLOCKED** | **BLOCKED — awaiting human confirmation** |
| TEST C — `tool`, bez web-paketa | **PASS (mock)** — bez JS-a i nakon hidratacije nema web-paketa; mock predaja nosi `selectedPackage: ""` i opis procesa. | **BLOCKED za stvarni valjani zahtjev** — lokalni env nedostaje; server validator za C prolazi u unit testu. | **BLOCKED** — 0 stvarnih slanja, nema provider ID-a. | **BLOCKED** | **BLOCKED — awaiting human confirmation** |

Nijedan provider ID nije zabilježen jer nije bilo stvarnog prihvaćenog zahtjeva. Prema [Resendovom retrieve API-ju](https://resend.com/docs/api-reference/emails/retrieve-email), nakon budućeg slanja poznati ID omogućuje provjeru `last_event`; ni `delivered` događaj sam po sebi ne dokazuje da je poruka vidljiva u Gmail inboxu. Ovlaštena potvrda inboxa i broja primjeraka potrebna je zasebno. Nije rađen Gmail login ni pregled tuđih podataka.

## Negativni i regresijski QA

| Provjera | Rezultat |
| --- | --- |
| `npm test` | **PASS — 33/33.** Provjerava A/B/C subject, TO, Reply-To, relevantni sadržaj, server validator, hrvatske znakove, jedan provider poziv, vraćeni ID i prihvaćeni odgovor bez ID-a, provider odbijanje te header injection. Mock fetch ne šalje mail. |
| `npm run typecheck` | **PASS**. |
| `npm run build` | **PASS**, Next.js 16.2.7. |
| Lint | **NOT RUN** — projekt nema lint skriptu. |
| Prazna polja u browseru | **PASS** — `fullName`, `email`, `problem` označeni; 0 POST-ova. |
| Nevaljan lokalni API payload | **PASS** — 400 s poljima `email`, `problem`, bez provider poziva. |
| Provider 502 mock | **PASS** — bez lažnog uspjeha, unos ostaje, gumb se otključava. |
| Retry i dvostruki klik | **PASS** — odgođeni 200 mock nakon 502; jedan poziv, obrazac se tek nakon mock uspjeha prazni i zaključava. |
| 12 s timeout mock | **PASS** — točno jedan pokušaj, tekst ostaje, poruka kaže da ishod nije moguće potvrditi; gumb se otključava. Ovo ne dokazuje stvarni provider timeout. |
| CTA A/B/C prije hidratacije | **PASS** — blokirani `/_next/static/**` resursi; 0 učitanih JS resursa; serverski odabiri `web/simple`, `web/business`, `tool` bez web-paketa. |
| Hidratizirani CTA, ručna promjena, Back/Forward | **PASS** — B → Back A, ručno alat bez paketa, Forward B. |
| Mobile / browser greške | **PASS** — na 390 px nema horizontalnog prelijevanja; hidratizirani browser nije prijavio JS pogreške. |
| Stvarni A/B/C Resend / delivery / inbox | **BLOCKED** — nisu izvedeni, nema lokalne mail konfiguracije ni potvrđenog From sendera. |

## Najmanji korak za završetak stvarne integracije

Lokalno, bez slanja vrijednosti u chat ili repo, postaviti postojeće `RESEND_API_KEY`, `CONTACT_TO_EMAIL=deweb.eu@gmail.com` i `CONTACT_FROM_EMAIL` na odabranu adresu stvarno verificirane sending domene. Potvrditi koja je From adresa i verificirani status te postoji li bilo kakva dodatna automatizacija koja bi slala poruke dalje. Zatim u kontroliranom lokalnom A/B/C postupku poslati najviše po jedan TEST slučaj s Reply-To `dinko@deweb.hr`; za svaki zasebno zapisati form payload, lokalni API status, Resend odgovor/ID, `last_event`, predmet i sadržaj, te neovisnu potvrdu da je točno jedna poruka u odobrenom Gmail inboxu. Ne ponavljati slanje nakon timeouta dok ishod nije utvrđen. Odobrenje adresa već postoji; ovdje se traži nedostajuća konfiguracija i dokaz primitka, ne nova dozvola za iste tri poruke.

## Datoteke i granice

U ovom zadatku izmijenjeni su `lib/problem-email.ts`, `lib/problem-email.test.ts`, `lib/brand-copy.test.ts`, `app/api/contact/route.ts` i ovaj `docs/landing-redesign/09-resend-live-verification.md`. Zatečene radne promjene iz prethodnih zadataka sačuvane su; nije mijenjan dizajn, SEO, cijene, paketi, dependency, lockfile, `.env`, produkcija ni vanjski sustavi. Nije bilo commita, pusha ni deploya.
