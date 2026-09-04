/**
 * Shop and dashboard glyphs, drawn on the same 20x20 grid and with the same
 * 1.5 stroke as src/components/ui/icons.tsx so the two sets are interchangeable
 * anywhere on the page.
 */

type IconProps = { className?: string };

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function Glyph({ className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" className={className} {...base}>
      {children}
    </svg>
  );
}

export function BagIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <path d="M4 6.5h12l-1 10H5l-1-10Z" />
      <path d="M7.25 6.5V5a2.75 2.75 0 0 1 5.5 0v1.5" />
    </Glyph>
  );
}

export function DownloadIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <path d="M10 3v9M6.5 8.5 10 12l3.5-3.5M3.5 15.5h13" />
    </Glyph>
  );
}

export function BoxIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <path d="M10 2.6 17 6v8l-7 3.4L3 14V6l7-3.4Z" />
      <path d="M3 6l7 3.4L17 6M10 9.4v8" />
    </Glyph>
  );
}

export function ChartIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <path d="M3 16.5h14M5.5 16.5V11M9.5 16.5V6M13.5 16.5v-4" />
    </Glyph>
  );
}

export function ReceiptIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <path d="M5 2.5h10v15l-2.5-1.5L10 17.5 7.5 16 5 17.5v-15Z" />
      <path d="M7.75 6.5h4.5M7.75 9.75h4.5" />
    </Glyph>
  );
}

export function TrashIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <path d="M3.5 5.5h13M8 5.5V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1.5" />
      <path d="M5.5 5.5 6.4 17h7.2l.9-11.5M8.5 8.5v5.5M11.5 8.5v5.5" />
    </Glyph>
  );
}

export function PlusIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <path d="M10 4.5v11M4.5 10h11" />
    </Glyph>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <path d="M4 10.5 8 14.5l8-9" />
    </Glyph>
  );
}

export function SpinnerIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      width="16"
      height="16"
      className={`animate-spin ${className ?? ""}`}
      {...base}
    >
      <circle cx="10" cy="10" r="7" opacity="0.25" />
      <path d="M17 10a7 7 0 0 0-7-7" />
    </svg>
  );
}

export function SettingsIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <circle cx="10" cy="10" r="2.6" />
      <path d="M10 2.5v2M10 15.5v2M17.5 10h-2M4.5 10h-2M15.3 4.7l-1.4 1.4M6.1 13.9l-1.4 1.4M15.3 15.3l-1.4-1.4M6.1 6.1 4.7 4.7" />
    </Glyph>
  );
}
