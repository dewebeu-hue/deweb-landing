type IconName = "right" | "up-right" | "left" | "down" | "web" | "bag" | "tool" | "check" | "plus" | "menu" | "close";

const paths: Record<IconName, React.ReactNode> = {
  right: <path d="M4 12h15m-6-6 6 6-6 6" />,
  left: <path d="M20 12H5m6 6-6-6 6-6" />,
  "up-right": <path d="M6 18 18 6M6.5 6H18v11.5" />,
  down: <path d="M12 4v15m-6-6 6 6 6-6" />,
  web: <><rect x="2.5" y="4" width="19" height="15.5" rx="2.5" /><path d="M3 9h18M6 6.5h.1m2.8 0H9" /></>,
  bag: <><path d="M5 8h14l1.2 12H3.8L5 8Z" /><path d="M8.5 9V6a3.5 3.5 0 0 1 7 0v3" /></>,
  tool: <>
    <g className="tool-check"><rect x="3" y="3" width="18" height="18" rx="4" /><path d="m7.5 12 3 3 6-6" /></g>
    <g className="tool-grid" display="none">
      <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
    </g>
  </>,
  check: <path d="m5 12 4.5 4.5L19 7" />,
  plus: <path d="M12 5v14M5 12h14" />,
  menu: <>
    <path className="menu-two-lines" d="M3 8h18M3 16h18" />
    <path className="menu-three-lines" display="none" d="M3 5h18M3 12h18M3 19h18" />
  </>,
  close: <path d="m5 5 14 14M19 5 5 19" />,
};

export function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {paths[name]}
    </svg>
  );
}
