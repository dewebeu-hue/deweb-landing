import type { Metadata } from "next";

export const SITE_ORIGIN = "https://deweb.hr";

export function deploymentRobots(vercelEnv?: string): Metadata["robots"] {
  return vercelEnv === "preview" || vercelEnv === "development"
    ? { index: false, follow: false }
    : undefined;
}
