export const CJENIK_HR_PACKAGES = ["plugin", "setup", "other"] as const;

export type CjenikHrPackage = (typeof CJENIK_HR_PACKAGES)[number];

export const cjenikHrProduct = {
  name: "Cjenik HR",
  status: "release_candidate_ready",
  salesMode: "quote",
  billingMode: "sandbox",
  currency: "EUR",
  pluginPrice: 39,
  setupPrice: 79,
  pluginPriceCents: 3900,
  setupPriceCents: 7900,
  pluginVersion: "1.0.0",
  schemaVersion: 7,
  checkpoint: "194783813ee3ae647939ddf5d093b9baffdcec15",
  artifactSha256: "8ae3b6ad3834a5bb2bb5c7defb3c63477f5788936e66bdfd1d735a9a267a0898",
  launchDate: "1. listopada 2026.",
} as const;

export function formatCjenikHrPrice(price: number) {
  return `${price.toLocaleString("hr-HR")} €`;
}

export function readCjenikHrPackage(value: unknown): CjenikHrPackage {
  return typeof value === "string" && CJENIK_HR_PACKAGES.includes(value as CjenikHrPackage)
    ? (value as CjenikHrPackage)
    : "other";
}
