export type MoneyRange = { min: number; max: number };
export type ProjectType = "new" | "redesign";
export type CatalogSize = "upTo50" | "from51To500" | "over500" | "unknown";
export type ContentSupport = "self" | "help" | "unknown";

export type PriceConfig = {
  version: string;
  approval: "draft" | "approved";
  approvedAt: string | null;
  approvedBy: string | null;
  currency: "EUR" | null;
  taxDisplay: string | null;
  rounding: "none" | "nearestEuro" | null;
  base: Partial<Record<ProjectType, MoneyRange>>;
  catalog: Partial<Record<Exclude<CatalogSize, "unknown">, MoneyRange>>;
  content: Partial<Record<Exclude<ContentSupport, "unknown">, MoneyRange>>;
};

// No approved webshop pricing exists. This is deliberately incapable of returning a number.
export const webshopPriceConfig: PriceConfig = {
  version: "1a-draft",
  approval: "draft",
  approvedAt: null,
  approvedBy: null,
  currency: null,
  taxDisplay: null,
  rounding: null,
  base: {},
  catalog: {},
  content: {},
};
