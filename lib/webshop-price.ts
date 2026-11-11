import type { CatalogSize, ContentSupport, MoneyRange, PriceConfig, ProjectType, SpecialNeed } from "./webshop-price-config";

export const projectLabels: Record<ProjectType, string> = {
  new: "Novi webshop",
  redesign: "Redizajn postojećeg webshopa",
  migration: "Preseljenje na novu platformu",
};
export const projectScope: Record<ProjectType, string> = {
  new: "Postavljanje trgovine i prilagodba izgleda vašem brendu.",
  redesign: "Obnova izgleda i kupnje na postojećoj, kompatibilnoj platformi.",
  migration: "Postavljanje nove trgovine i preusmjeravanje starih adresa.",
};
export const catalogLabels: Record<CatalogSize, string> = {
  upTo20: "Do 20 proizvoda",
  from21To50: "21–50 proizvoda",
  from51To200: "51–200 proizvoda",
  from201To500: "201–500 proizvoda",
  from501To1000: "501–1.000 proizvoda",
  over1000: "Više od 1.000 proizvoda",
  unknown: "Još ne znam",
};
export const contentLabels: Record<ContentSupport, string> = {
  self: "Unosim samostalno ili zadržavam postojeći katalog",
  import: "Uvoz iz pripremljene tablice",
  help: "Ručni unos do 20 proizvoda",
  extensive: "Veći ručni unos ili sređivanje podataka",
  unknown: "Još ne znam kako ćemo unijeti sadržaj",
};
export const contentScope: Partial<Record<ContentSupport, string>> = {
  import: "Jedna uređena CSV tablica s podacima i poveznicama na slike.",
  help: "Dostavljate gotove opise i slike. Ostatak kataloga unosite sami.",
};
export const specialLabels: Record<SpecialNeed, string> = {
  integration: "ERP, blagajna ili drugi poslovni sustav",
  invoicing: "Računi i fiskalizacija",
  b2b: "Posebne cijene za poslovne kupce",
  subscriptions: "Pretplate",
  languages: "Dodatni jezik",
  currency: "Dodatna valuta",
  delivery: "Dodatna dostava ili naplata",
  bespoke: "Integracija po mjeri ili drugi složeniji zahtjev",
};
export const specialScope: Record<SpecialNeed, string> = {
  integration: "Jedno povezivanje putem postojećeg, kompatibilnog dodatka.",
  invoicing: "Povezivanje s jednim kompatibilnim servisom i provjera izdavanja računa.",
  b2b: "Jedna grupa kupaca s posebnim cijenama putem gotovog dodatka.",
  subscriptions: "Jedan model ponavljajuće naplate uz podržan način plaćanja.",
  languages: "Jedan dodatni jezik uz gotove prijevode.",
  currency: "Jedna dodatna valuta uz podržanu naplatu.",
  delivery: "Jedna dodatna služba ili metoda plaćanja uz gotov dodatak.",
  bespoke: "Npr. nestandardni ERP, više grupa kupaca ili prijenos narudžbi i računa kupaca.",
};
export type SpecialMode = "standard" | "custom" | "unknown";
export type Answers = {
  projectType: ProjectType | "";
  catalogSize: CatalogSize | "";
  contentSupport: ContentSupport | "";
  specialMode: SpecialMode | "";
  specialNeeds: SpecialNeed[];
};
export const emptyAnswers = (): Answers => ({ projectType: "", catalogSize: "", contentSupport: "", specialMode: "", specialNeeds: [] });
export type AnswerField = keyof Answers;
export type Estimate = {
  status: "invalid" | "incomplete" | "pricing_unavailable" | "manual" | "priced";
  errors: Partial<Record<AnswerField, string>>;
  summary: string[];
  reasons: string[];
  priceCause?: "pending" | "incomplete";
  range?: MoneyRange;
  currency?: "EUR";
  taxDisplay?: string;
  items?: { label: string; range: MoneyRange }[];
};

const allowed = <T extends string>(value: unknown, values: readonly T[]): value is T => typeof value === "string" && values.includes(value as T);
const projectTypes = Object.keys(projectLabels) as ProjectType[];
const catalogSizes = Object.keys(catalogLabels) as CatalogSize[];
const contentSupports = Object.keys(contentLabels) as ContentSupport[];
const specialModes: SpecialMode[] = ["standard", "custom", "unknown"];
const specialNeeds = Object.keys(specialLabels) as SpecialNeed[];

export function validateWebshopAnswers(raw: unknown): { answers: Answers; errors: Estimate["errors"]; incomplete: boolean } {
  const source = raw && typeof raw === "object" && !Array.isArray(raw) ? raw as Partial<Record<keyof Answers, unknown>> : {};
  const errors: Estimate["errors"] = {};
  let incomplete = false;
  function select<T extends string>(field: Exclude<AnswerField, "specialNeeds">, values: readonly T[]): T | "" {
    const value = source[field];
    if (value === "" || value === undefined || value === null) { incomplete = true; errors[field] = "Odaberite odgovor."; return ""; }
    if (!allowed(value, values)) { errors[field] = "Odaberite jedan od ponuđenih odgovora."; return ""; }
    return value;
  }
  const projectType = select("projectType", projectTypes);
  const catalogSize = select("catalogSize", catalogSizes);
  const contentSupport = select("contentSupport", contentSupports);
  const specialMode = select("specialMode", specialModes);
  const incoming = source.specialNeeds ?? [];
  let needs: SpecialNeed[] = [];
  if (!Array.isArray(incoming) || incoming.some(item => !allowed(item, specialNeeds)) || new Set(incoming).size !== incoming.length) {
    errors.specialNeeds = "Provjerite dodatne zahtjeve.";
  } else {
    needs = incoming as SpecialNeed[];
  }
  if (specialMode === "custom" && needs.length === 0 && !errors.specialNeeds) { incomplete = true; errors.specialNeeds = "Odaberite barem jedan poseban zahtjev."; }
  if ((specialMode === "standard" || specialMode === "unknown") && needs.length > 0) errors.specialNeeds = "Za ove zahtjeve odaberite „Da”.";
  return { answers: { projectType, catalogSize, contentSupport, specialMode, specialNeeds: needs }, errors, incomplete };
}

function validRange(value: unknown): value is MoneyRange {
  if (!value || typeof value !== "object") return false;
  const range = value as Partial<MoneyRange>;
  return Number.isSafeInteger(range.min) && Number.isSafeInteger(range.max) && range.min! >= 0 && range.max! >= range.min!;
}

function usableConfig(config: PriceConfig): boolean {
  const approvalValid = config.approval === "preview"
    || (config.approval === "approved" && Boolean(config.approvedAt?.trim()) && Boolean(config.approvedBy?.trim()));
  return approvalValid && Boolean(config.version.trim()) && config.currency === "EUR"
    && Boolean(config.taxDisplay?.trim()) && (config.rounding === "none" || config.rounding === "nearestEuro");
}

const euroNumber = new Intl.NumberFormat("hr-HR", { maximumFractionDigits: 2 });

export function formatWebshopRange({ min, max }: MoneyRange): string {
  const lower = euroNumber.format(min / 100);
  return min === max ? `${lower} €` : `${lower}–${euroNumber.format(max / 100)} €`;
}

export function estimateWebshop(raw: unknown, config: PriceConfig): Estimate {
  const validation = validateWebshopAnswers(raw);
  const { answers, errors, incomplete } = validation;
  const summary: string[] = [];
  if (answers.projectType) summary.push(`Projekt: ${projectLabels[answers.projectType]}`);
  if (answers.catalogSize) summary.push(`Katalog: ${catalogLabels[answers.catalogSize]}`);
  if (answers.contentSupport) summary.push(`Sadržaj: ${contentLabels[answers.contentSupport]}`);
  if (answers.specialMode) summary.push(`Poseban način prodaje: ${answers.specialMode === "standard" ? "Ne, standardna kupnja" : answers.specialMode === "unknown" ? "Još nije jasno" : answers.specialNeeds.map(need => specialLabels[need]).join(", ") || "Nije odabrano"}`);
  if (Object.keys(errors).length) return { status: incomplete && Object.values(errors).every(error => error === "Odaberite odgovor." || error === "Odaberite barem jedan poseban zahtjev.") ? "incomplete" : "invalid", errors, summary, reasons: [] };

  const { projectType, catalogSize, contentSupport, specialMode, specialNeeds: needs } = answers;
  if (!projectType || !catalogSize || !contentSupport || !specialMode) return { status: "incomplete", errors, summary, reasons: [] };

  const reasons: string[] = [];
  if (catalogSize === "unknown") reasons.push("Broj proizvoda još nije poznat.");
  if (catalogSize === "over1000") reasons.push("Za katalog veći od 1.000 proizvoda potrebno je provjeriti podatke i zahtjeve trgovine.");
  if (contentSupport === "unknown") reasons.push("Način unosa proizvoda još nije poznat.");
  if (contentSupport === "extensive") reasons.push("Veći ručni unos i sređivanje podataka procjenjujemo prema uzorku.");
  if (specialMode === "unknown") reasons.push("Dodatne funkcije još nisu razjašnjene.");
  if (needs.includes("bespoke")) reasons.push("Za integraciju po mjeri ili složeniji zahtjev prvo provjeravamo opseg.");
  if (projectType === "migration" && (contentSupport === "self" || contentSupport === "help")) reasons.push("Za preseljenje treba potvrditi kako će se postojeći katalog prenijeti.");
  if (reasons.length || catalogSize === "unknown" || catalogSize === "over1000"
    || contentSupport === "unknown" || contentSupport === "extensive") {
    return { status: "manual", errors: {}, summary, reasons };
  }

  if (!usableConfig(config)) return { status: "pricing_unavailable", errors: {}, summary, reasons: [], priceCause: "pending" };
  const items = [
    { label: projectLabels[projectType], range: config.base[projectType] },
    { label: catalogLabels[catalogSize], range: config.catalog[catalogSize] },
    { label: contentLabels[contentSupport], range: config.content[contentSupport] },
    ...needs.filter(need => need !== "bespoke").map(need => ({ label: specialLabels[need], range: config.special[need] })),
  ];
  const pricedItems = items.filter((item): item is { label: string; range: MoneyRange } => validRange(item.range));
  const total = pricedItems.reduce(({ min, max }, { range }) => ({ min: min + range.min, max: max + range.max }), { min: 0, max: 0 });
  const round = (amount: number) => config.rounding === "nearestEuro" ? Math.round(amount / 100) * 100 : amount;
  const range = { min: round(total.min), max: round(total.max) };
  if (pricedItems.length !== items.length || !validRange(total) || !validRange(range)) {
    return { status: "pricing_unavailable", errors: {}, summary, reasons: [], priceCause: "incomplete" };
  }
  return {
    status: "priced", errors: {}, summary, reasons, range, currency: "EUR", taxDisplay: config.taxDisplay!,
    items: pricedItems.filter(({ range }) => range.max > 0),
  };
}

export function requirementsSummary(estimate: Estimate): string {
  return [
    "Zahtjevi za webshop",
    ...estimate.summary,
    ...estimate.reasons,
    ...(estimate.range ? [`Okvirna procjena izrade ${formatWebshopRange(estimate.range)}`] : []),
    "Molim ponudu nakon pregleda zahtjeva.",
  ].join("\n");
}
