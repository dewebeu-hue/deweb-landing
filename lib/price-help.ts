export const priceHelpOptions = [
  {
    id: "webshop",
    title: "Bazne cijene na webshopu",
    description: "Dopuniti prikaz bazne cijene uz artikle i varijante te urediti prikaz najniže cijene prije akcije.",
  },
  {
    id: "cjenik",
    title: "Mrežni cjenik i arhiva",
    description: "Pripremiti CSV ili XML, objavu na stalnoj adresi te ažuriranje i arhivu cjenika.",
  },
  {
    id: "prodajna-mjesta",
    title: "Poslovnica, outlet i sajam",
    description: "Organizirati podatke po prodajnim mjestima i pripremiti predloške cjenika i oznaka za robu.",
  },
  {
    id: "povezivanje",
    title: "Povezivanje s postojećim sustavom",
    description: "Provjeriti izvoz iz blagajne, ERP-a ili webshopa i mogućnost automatskog osvježavanja cjenika.",
  },
  {
    id: "dogovor",
    title: "Nisam siguran što trebam",
    description: "Pregledati postojeći način rada i dogovoriti koje podatke i tehničke dorade treba pripremiti.",
  },
] as const;

export type PriceHelpId = typeof priceHelpOptions[number]["id"];

export function priceHelpHref(helpId?: PriceHelpId) {
  const params = new URLSearchParams({ vrsta: "prices" });
  if (helpId) params.set("pomoc", helpId);
  return `/?${params.toString()}#kontakt`;
}
