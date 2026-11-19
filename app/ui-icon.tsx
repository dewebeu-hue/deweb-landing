type IconName = "right" | "up-right" | "left" | "down" | "check" | "plus" | "menu" | "close";

const paths: Record<IconName, React.ReactNode> = {
  right: <path d="M4 12h15m-6-6 6 6-6 6" />,
  left: <path d="M20 12H5m6 6-6-6 6-6" />,
  "up-right": <path d="M6 18 18 6M6.5 6H18v11.5" />,
  down: <path d="M12 4v15m-6-6 6 6 6-6" />,
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
