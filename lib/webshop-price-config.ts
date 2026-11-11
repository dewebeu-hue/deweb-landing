import { webOfferTerms } from "./web-packages.ts";

export type MoneyRange = { min: number; max: number };
export type ProjectType = "new" | "redesign" | "migration";
export type PricedCatalogSize = "upTo20" | "from21To50" | "from51To200" | "from201To500" | "from501To1000";
export type CatalogSize = PricedCatalogSize | "over1000" | "unknown";
export type PricedContentSupport = "self" | "import" | "help";
export type ContentSupport = PricedContentSupport | "extensive" | "unknown";
export type PricedSpecialNeed = "integration" | "b2b" | "subscriptions" | "languages" | "currency" | "delivery" | "invoicing";
export type SpecialNeed = PricedSpecialNeed | "bespoke";

export type PriceConfig = {
  version: string;
  approval: "draft" | "preview" | "approved";
  approvedAt: string | null;
  approvedBy: string | null;
  currency: "EUR" | null;
  taxDisplay: string | null;
  rounding: "none" | "nearestEuro" | null;
  base: Partial<Record<ProjectType, MoneyRange>>;
  catalog: Partial<Record<PricedCatalogSize, MoneyRange>>;
  content: Partial<Record<PricedContentSupport, MoneyRange>>;
  special: Partial<Record<PricedSpecialNeed, MoneyRange>>;
};

const euros = (min: number, max: number): MoneyRange => ({ min: min * 100, max: max * 100 });

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
  special: {},
};

export const webshopPreviewPriceConfig: PriceConfig = {
  ...webshopPriceConfig,
  version: "2026-11-11-preview",
  approval: "preview",
  currency: "EUR",
  taxDisplay: webOfferTerms.tax,
  rounding: "none",
  base: {
    new: euros(990, 1290),
    redesign: euros(890, 1190),
    migration: euros(1390, 1890),
  },
  catalog: {
    upTo20: euros(0, 0),
    from21To50: euros(90, 190),
    from51To200: euros(190, 350),
    from201To500: euros(300, 550),
    from501To1000: euros(490, 790),
  },
  content: {
    self: euros(0, 0),
    import: euros(150, 390),
    help: euros(120, 260),
  },
  special: {
    integration: euros(300, 650),
    invoicing: euros(200, 390),
    b2b: euros(250, 490),
    subscriptions: euros(300, 590),
    languages: euros(200, 390),
    currency: euros(150, 290),
    delivery: euros(180, 390),
  },
};

export function webshopPricingForEnvironment(environment: string | undefined): PriceConfig {
  return environment === "preview" ? webshopPreviewPriceConfig : webshopPriceConfig;
}
