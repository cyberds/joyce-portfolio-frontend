type IconProps = { className?: string };

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function ArrowRightIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" className={className} {...base}>
      <path d="M3.5 10h13M11.5 5l5 5-5 5" />
    </svg>
  );
}

export function ArrowDownIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" className={className} {...base}>
      <path d="M10 3.5v13M5 11.5l5 5 5-5" />
    </svg>
  );
}

export function QuoteIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" className={className} fill="currentColor">
      <path d="M9.6 6.2c-3.2 1.4-5 3.9-5 7.2 0 2.6 1.5 4.4 3.7 4.4 1.9 0 3.3-1.4 3.3-3.2 0-1.7-1.2-3-2.9-3-.3 0-.6 0-.8.1.4-1.5 1.6-2.8 3.3-3.6l-1.6-1.9Zm9 0c-3.2 1.4-5 3.9-5 7.2 0 2.6 1.5 4.4 3.7 4.4 1.9 0 3.3-1.4 3.3-3.2 0-1.7-1.2-3-2.9-3-.3 0-.6 0-.8.1.4-1.5 1.6-2.8 3.3-3.6l-1.6-1.9Z" />
    </svg>
  );
}

export function MenuIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" className={className} {...base}>
      <path d="M3 6.5h14M3 13.5h14" />
    </svg>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" className={className} {...base}>
      <path d="M5 5l10 10M15 5L5 15" />
    </svg>
  );
}

/* --- The three service marks. Line-drawn, same weight, same grid. ------- */

export function CompassIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" width="34" height="34" className={className} {...base}>
      <circle cx="20" cy="20" r="14" />
      <path d="m25.5 14.5-3 8-8 3 3-8 8-3Z" />
      <circle cx="20" cy="20" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function PeopleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" width="34" height="34" className={className} {...base}>
      <circle cx="16" cy="15" r="5" />
      <path d="M6.5 31c0-4.7 4.3-8 9.5-8s9.5 3.3 9.5 8" />
      <path d="M27 11.5a5 5 0 0 1 0 9.5M29 23.5c2.7 1.1 4.5 3.6 4.5 6.6" />
    </svg>
  );
}

export function BuildIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" width="34" height="34" className={className} {...base}>
      <path d="M14.5 13.5 8 20l6.5 6.5M25.5 13.5 32 20l-6.5 6.5" />
      <path d="M22.5 9.5 17.5 30.5" />
    </svg>
  );
}
