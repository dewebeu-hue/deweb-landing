"use client";

import { useEffect, useRef } from "react";
import { Icon } from "./ui-icon";

export function MobileMenu({ links }: { links: readonly (readonly [string, string])[] }) {
  const menu = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    function closeOutside(event: PointerEvent) {
      if (menu.current?.open && event.target instanceof Node && !menu.current.contains(event.target)) menu.current.open = false;
    }
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape" && menu.current?.open) {
        menu.current.open = false;
        menu.current.querySelector("summary")?.focus();
      }
    }
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", escape);
    };
  }, []);

  return (
    <details ref={menu} className="mobile-menu">
      <summary aria-label="Izbornik"><Icon name="menu" className="menu-open" /><Icon name="close" className="menu-close" /></summary>
      <nav aria-label="Mobilna navigacija">
        {links.map(([label, href]) => (
          <a key={href} href={href} onClick={() => { if (menu.current) menu.current.open = false; }}>
            {label} <Icon name="up-right" />
          </a>
        ))}
      </nav>
    </details>
  );
}
