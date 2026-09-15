import type { CatalogSize, ContentSupport, MoneyRange, PriceConfig, ProjectType } from "./webshop-price-config";

export const projectLabels: Record<ProjectType, string> = { new: "Novi webshop", redesign: "Redizajn postojećeg webshopa" };
export const catalogLabels: Record<CatalogSize, string> = {
  upTo50: "Do 50 proizvoda",
  from51To500: "51–500 proizvoda",
  over500: "Više od 500 proizvoda",
  unknown: "Još ne znam",
};
export const contentLabels: Record<ContentSupport, string> = {
  self: "Proizvode i sadržaj unosim samostalno",
  help: "Treba mi pomoć s unosom ili prijenosom",
  unknown: "Još nije jasno",
};
export const specialLabels = {
  integration: "Povezivanje s ERP/POS ili drugim sustavom",
  b2b: "B2B pravila",
  subscriptions: "Pretplate",
  languages: "Više jezika ili valuta",
  delivery: "Posebna dostava ili naplata",
} as const;
export type SpecialNeed = keyof typeof specialLabels;
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
};

const allowed = <T extends string>(value: unknown, values: readonly T[]): value is T => typeof value === "string" && values.includes(value as T);
const projectTypes: ProjectType[] = ["new", "redesign"];
const catalogSizes: CatalogSize[] = ["upTo50", "from51To500", "over500", "unknown"];
const contentSupports: ContentSupport[] = ["self", "help", "unknown"];
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

function approvedConfig(config: PriceConfig): boolean {
  return config.approval === "approved" && Boolean(config.version.trim()) && Boolean(config.approvedAt?.trim()) && Boolean(config.approvedBy?.trim()) && config.currency === "EUR" && Boolean(config.taxDisplay?.trim()) && (config.rounding === "none" || config.rounding === "nearestEuro");
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

  const reasons: string[] = [];
  if (answers.catalogSize === "unknown") reasons.push("Broj proizvoda još nije poznat.");
  if (answers.contentSupport === "unknown") reasons.push("Opseg unosa ili prijenosa sadržaja još nije poznat.");
  if (answers.specialMode === "unknown") reasons.push("Poseban način prodaje još nije razjašnjen.");
  if (answers.specialMode === "custom") reasons.push(...answers.specialNeeds.map(need => specialLabels[need]));
  if (reasons.length) return { status: "manual", errors: {}, summary, reasons };

  if (!approvedConfig(config)) return { status: "pricing_unavailable", errors: {}, summary, reasons: [], priceCause: "pending" };
  const project = config.base[answers.projectType as ProjectType];
  const catalog = config.catalog[answers.catalogSize as Exclude<CatalogSize, "unknown">];
  const content = config.content[answers.contentSupport as Exclude<ContentSupport, "unknown">];
  if (![project, catalog, content].every(validRange)) return { status: "pricing_unavailable", errors: {}, summary, reasons: [], priceCause: "incomplete" };
  const lower = project!.min + catalog!.min + content!.min;
  const upper = project!.max + catalog!.max + content!.max;
  if (!Number.isSafeInteger(lower) || !Number.isSafeInteger(upper) || lower > upper) return { status: "pricing_unavailable", errors: {}, summary, reasons: [], priceCause: "incomplete" };
  const round = (amount: number) => config.rounding === "nearestEuro" ? Math.round(amount / 100) * 100 : amount;
  return { status: "priced", errors: {}, summary, reasons: [], range: { min: round(lower), max: round(upper) }, currency: "EUR", taxDisplay: config.taxDisplay! };
}

export function requirementsSummary(estimate: Estimate): string {
  return ["Zahtjevi za webshop", ...estimate.summary, ...(estimate.reasons.length ? ["Za razgovor: " + estimate.reasons.join("; ")] : []), "Okvirna cijena nije potvrđena; molim ponudu nakon pregleda zahtjeva."].join("\n");
}
