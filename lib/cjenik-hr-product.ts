export const CJENIK_HR_PACKAGES = ["plugin", "setup", "other"] as const;

export type CjenikHrPackage = (typeof CJENIK_HR_PACKAGES)[number];

export const cjenikHrProduct = {
  name: "Cjenik HR",
  status: "prelaunch",
  currency: "EUR",
  pluginPrice: 39,
  setupPrice: 79,
  pluginVersion: "0.6.0",
  schemaVersion: 7,
  checkpoint: "f0c3abb60f3701daef0f4e8ddb72decf8a185a53",
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
