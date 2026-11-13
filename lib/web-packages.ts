export const webPackages = [
  {
    id: "simple",
    name: "Jednostavni web",
    price: 790,
    scope: "Jedna stranica do šest sadržajnih sekcija",
    bestFor: "Najbolje za: manje poslovanje s nekoliko usluga koje se mogu jasno predstaviti na jednoj stranici.",
    features: [
      "Jedan jezik, prilagodba postojećeg dizajna i uređivanje vaših materijala",
      "Kontaktni obrazac, poziv i WhatsApp prema potrebi",
      "Prikaz na mobitelu i računalu, optimizacija slika i osnovni tehnički SEO",
      "Jedan krug dorada, provjera i objava",
    ],
  },
  {
    id: "business",
    name: "Poslovni web",
    price: 1290,
    scope: "Do pet stranica ukupno, uključujući naslovnu",
    bestFor: "Najbolje za: tvrtke koje žele zasebno predstaviti usluge, radove, tvrtku i kontakt te imati više prostora za buduće proširenje sadržaja.",
    features: [
      "Jedan jezik, dizajn prilagođen brendu i uređivanje vaših tekstova",
      "Kontaktni obrazac, poziv i WhatsApp prema potrebi",
      "Prikaz na mobitelu i računalu, optimizacija slika i osnovni tehnički SEO",
      "Dva kruga dorada, provjera i objava",
    ],
  },
] as const;

export type WebPackageId = (typeof webPackages)[number]["id"];

export const webOfferTerms = {
  tax: "deweb nije u sustavu PDV-a. Prikazane cijene ne uvećavaju se za PDV.",
  exclusions: "Webshop, plaćanja, rezervacijski sustav, korisnički računi, posebne integracije i višejezičnost nisu uključeni. Dorade su ograničene ugovorenim krugovima.",
  external: "Domena, hosting i dodatne licence nisu uključeni u cijenu izrade. Mogu postojati troškovi domene, hostinga ili dodatnih licenci, ovisno o rješenju. Sve takve troškove navodimo prije početka izrade.",
  delivery: "Plaćanje: 50% prije početka, 50% nakon prihvata i prije objave. Rok definiramo ponudom nakon utvrđivanja opsega.",
  editing: "Ako želite samostalno uređivanje sadržaja, to dogovaramo prije početka i uključujemo odgovarajuće rješenje u ponudu. U suprotnom, naknadne izmjene možemo odraditi po dogovoru.",
  maintenance: "Ne morate ugovoriti mjesečno održavanje. Ako vam je potrebna redovita tehnička podrška ili izmjene sadržaja, održavanje dogovaramo zasebno.",
  ownership: "Domena je standardno u vašem vlasništvu, a domena i produkcijski hosting na vašim računima i pod vašom kontrolom. Hosting plaćate izravno pružatelju usluge, a deweb dobiva samo potreban tehnički pristup. Nakon primopredaje imate ili zadržavate pristup domeni, DNS-u, hostingu i produkcijskom projektu.",
  managedHosting: "Hosting kojim upravlja deweb moguć je uz zaseban dogovor u ponudi i nije uključen u web-pakete od 790 € i 1.290 €.",
} as const;
