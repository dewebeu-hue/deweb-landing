import { projectTypes, type ProjectType } from "./problem-email.ts";
import { webPackages, type WebPackageId } from "./web-packages.ts";

export type ProjectSelection = { type: ProjectType | ""; packageId: WebPackageId | "" };
export type ProjectSelectionParams = { vrsta?: string | string[]; paket?: string | string[] };

function single(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

export function readProjectSelection(params: ProjectSelectionParams): ProjectSelection {
  const type = single(params.vrsta);
  if (!projectTypes.includes(type as ProjectType)) return { type: "", packageId: "" };

  const packageId = single(params.paket);
  return {
    type: type as ProjectType,
    packageId: type === "web" && webPackages.some(item => item.id === packageId) ? packageId as WebPackageId : "",
  };
}

export function projectSelectionHref(type: ProjectType, packageId?: WebPackageId) {
  const params = new URLSearchParams({ vrsta: type });
  if (type === "web" && packageId) params.set("paket", packageId);
  return `/?${params.toString()}#kontakt`;
}
