export const webPackages = [
  {
    id: "simple",
    name: "Jednostavni web",
    price: 790,
    scope: "Jedna stranica do šest sadržajnih sekcija",
    features: [
      "Jedan jezik i prilagodba provjerenog dizajnerskog sustava vašem brendu",
      "Uređivanje i raspored materijala koje dostavite",
      "Jedan kontaktni obrazac; poziv i WhatsApp kada koristite te kanale",
      "Prilagodba mobitelu i desktopu, optimizacija slika i osnovna tehnička SEO priprema",
      "Jedan objedinjeni krug dorada te provjera i objava na dogovorenom hostingu",
    ],
  },
  {
    id: "business",
    name: "Poslovni web",
    price: 1290,
    scope: "Do pet stranica ukupno, uključujući naslovnu",
    features: [
      "Jedan jezik; usluge, radovi, o tvrtki i kontakt prema dogovorenoj strukturi",
      "Kratki razgovor i uređivanje tekstova iz vaših informacija i materijala",
      "Jedan dogovoreni vizualni smjer prilagođen brendu",
      "Jedan kontaktni obrazac; poziv i WhatsApp kada su relevantni",
      "Prilagodba mobitelu i desktopu, optimizacija slika i osnovna tehnička SEO priprema",
      "Dva objedinjena kruga dorada te provjera i objava na dogovorenom hostingu",
    ],
  },
] as const;

export type WebPackageId = (typeof webPackages)[number]["id"];

export const webOfferTerms = {
  tax: "deweb nije u sustavu PDV-a. Prikazane cijene ne uvećavaju se za PDV.",
  exclusions: "Webshop, plaćanja, rezervacijski sustav, korisnički računi, posebne integracije i višejezičnost nisu uključeni. Dorade su ograničene ugovorenim krugovima.",
  external: "Domena, hosting i dodatne licence nisu uključeni u cijenu izrade; troškove navodimo prije ugovaranja. Održavanje se dogovara zasebno.",
  delivery: "Plaćanje: 50% prije početka, 50% nakon prihvata i prije objave. Rok definiramo ponudom nakon utvrđivanja opsega.",
  editing: "Mogućnost samostalnog uređivanja sadržaja ovisi o dogovorenom rješenju.",
} as const;
