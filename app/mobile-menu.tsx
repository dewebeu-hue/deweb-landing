"use client";

import { useRef } from "react";

export function MobileMenu({ links }: { links: readonly (readonly [string, string])[] }) {
  const menuRef = useRef<HTMLDetailsElement>(null);
  return <details ref={menuRef} className="mobile-menu relative lg:hidden">
    <summary className="flex min-h-11 cursor-pointer list-none items-center rounded-lg border border-line bg-white px-4 text-sm font-extrabold text-ink focus-visible:outline focus-visible:outline-4 focus-visible:outline-orange-dark">Izbornik <span aria-hidden="true" className="ml-2">☰</span></summary>
    <nav aria-label="Mobilna navigacija" className="absolute right-0 top-12 z-40 grid w-[min(82vw,260px)] gap-1 rounded-lg border border-line bg-white p-3 shadow-soft">
      {links.map(([label, href]) => <a key={href} href={href} onClick={() => { if (menuRef.current) menuRef.current.open = false; }} className="rounded-md px-3 py-3 text-sm font-bold text-ink hover:bg-teal-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-dark">{label}</a>)}
    </nav>
  </details>;
}
