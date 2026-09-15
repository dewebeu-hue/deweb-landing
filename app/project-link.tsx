"use client";

import type { MouseEvent, ReactNode } from "react";
import { projectSelectionHref } from "../lib/project-selection";
import type { WebPackageId } from "../lib/web-packages";

export type ProjectType = "web" | "tool" | "saas" | "unsure";

export const projectSelectionEvent = "deweb:project-selection";

export function ProjectLink({
  type,
  packageId,
  className,
  children,
}: {
  type: ProjectType;
  packageId?: WebPackageId;
  className: string;
  children: ReactNode;
}) {
  const href = projectSelectionHref(type, packageId);

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    window.history.pushState(null, "", href);
    window.dispatchEvent(new CustomEvent(projectSelectionEvent, { detail: { type, packageId: packageId ?? "" } }));
    document.getElementById("kontakt")?.scrollIntoView();
  }

  return <a className={className} href={href} onClick={handleClick}>{children}</a>;
}
