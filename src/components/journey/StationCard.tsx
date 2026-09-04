import type { Station } from "./journeyStations";

/** Crisp vector icons, used both inside the pipeline node and on the card. */
export function StationGlyph({
  type,
  size = 15,
}: {
  type: Station["icon"];
  size?: number;
}) {
  const props = {
    viewBox: "0 0 24 24",
    width: size,
    height: size,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (type) {
    case "mail":
      return (
        <svg {...props}>
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      );
    case "send":
      return (
        <svg {...props}>
          <path d="m22 2-7 20-4-9-9-4Z" />
          <path d="M22 2 11 13" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...props}>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
          <path d="m9 16 2 2 4-4" />
        </svg>
      );
    case "database":
      return (
        <svg {...props}>
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
          <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
        </svg>
      );
    case "sync":
      return (
        <svg {...props}>
          <path d="M21 2v6h-6" />
          <path d="M3 22v-6h6" />
          <path d="M3.5 9a9 9 0 0 1 14.9-3.4L21 8M21 15a9 9 0 0 1-14.9 3.4L3 16" />
        </svg>
      );
    case "chart":
      return (
        <svg {...props}>
          <path d="M3 3v18h18" />
          <path d="m19 9-5 5-4-4-3 3" />
        </svg>
      );
    default:
      return null;
  }
}

/**
 * One station, written as what normally happens vs. what happens instead. The
 * width is capped in `vw` as well as `px` so it can never outgrow a phone.
 */
export function StationCard({
  station,
  fluid = false,
}: {
  station: Station;
  /** Fill the container instead of taking a fixed width — the phone panel. */
  fluid?: boolean;
}) {
  return (
    <div
      className={`rounded-[var(--r-md)] bg-white shadow-[0_2px_10px_-2px_rgba(36,19,25,0.07),0_18px_40px_-24px_rgba(36,19,25,0.22)] ring-1 ring-black/[0.05] ${
        fluid
          ? "w-full p-4"
          : "w-[min(320px,84vw)] p-4 sm:w-[min(340px,84vw)] sm:p-5"
      }`}
      style={{ borderTop: `3px solid ${station.color}` }}
    >
      <div className="flex items-center justify-between gap-3 border-b border-stone-100 pb-2">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider">
          <span
            className="size-2 shrink-0 rounded-full"
            style={{ backgroundColor: station.color }}
          />
          <span className="text-stone-900">{station.tag}</span>
        </div>
        <span className="shrink-0 font-mono text-[11px] text-stone-400">
          {station.index}/06
        </span>
      </div>

      <h3 className="display mt-2.5 text-[1rem] font-medium leading-snug text-stone-900">
        {station.title}
      </h3>

      <div className="mt-3 rounded-[var(--r-sm)] border border-stone-100 bg-stone-50 p-2.5 text-[11.5px] leading-relaxed text-stone-500">
        <div className="mb-0.5 flex items-center gap-1 text-[9.5px] font-semibold uppercase tracking-wider text-stone-400">
          <span className="size-1 rounded-full bg-stone-400" />
          Normally
        </div>
        {station.before}
      </div>

      <div
        className="mt-1.5 rounded-[var(--r-sm)] border p-2.5 text-[11.5px] leading-relaxed text-stone-900"
        style={{
          backgroundColor: `${station.color}0f`,
          borderColor: `${station.color}2e`,
        }}
      >
        <div
          className="mb-0.5 flex items-center gap-1 text-[9.5px] font-semibold uppercase tracking-wider"
          style={{ color: station.color }}
        >
          <span
            className="size-1 rounded-full"
            style={{ backgroundColor: station.color }}
          />
          With Automation
        </div>
        {station.after}
      </div>
    </div>
  );
}

/**
 * The same station, laid out horizontally.
 *
 * The cascading variant stacks its cards on top of one another as the page
 * scrolls, so every card has to read at a glance while only its top edge is
 * still uncovered: the index and the tag live on a coloured left rail that
 * stays visible under the card above it, and the before/after pair sits in two
 * columns rather than stacked, which keeps the card short enough that several
 * can overlap without the stack running off a laptop screen.
 */
export function StationCardWide({ station }: { station: Station }) {
  return (
    <div
      className="grid overflow-hidden rounded-[var(--r-lg)] bg-white shadow-[0_2px_10px_-2px_rgba(36,19,25,0.07),0_28px_60px_-30px_rgba(36,19,25,0.32)] ring-1 ring-black/[0.06] sm:grid-cols-[8.5rem_1fr] lg:grid-cols-[11rem_1fr]"
      style={{ borderTop: `3px solid ${station.color}` }}
    >
      {/* Left rail — the part that stays readable once the next card lands. */}
      <div
        className="flex items-center gap-3 px-5 py-4 sm:flex-col sm:items-start sm:justify-center sm:gap-4 sm:px-6 sm:py-8"
        style={{
          backgroundColor: `${station.color}0f`,
          borderRight: `1px solid ${station.color}1f`,
        }}
      >
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-[var(--r-sm)] text-white sm:size-11"
          style={{ backgroundColor: station.color }}
        >
          <StationGlyph type={station.icon} size={19} />
        </span>
        <div className="min-w-0">
          <div className="font-mono text-[0.7rem] text-stone-400">
            {station.index}/06
          </div>
          <div
            className="mt-0.5 text-[0.72rem] font-semibold uppercase leading-tight tracking-wider"
            style={{ color: station.color }}
          >
            {station.tag}
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-7 lg:p-8">
        <h3 className="display text-[clamp(1.1rem,2.1vw,1.45rem)] font-medium leading-snug text-stone-900">
          {station.title}
        </h3>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-[var(--r-sm)] border border-stone-100 bg-stone-50 p-3.5 text-[0.82rem] leading-relaxed text-stone-500">
            <div className="mb-1 flex items-center gap-1.5 text-[0.62rem] font-semibold uppercase tracking-wider text-stone-400">
              <span className="size-1 rounded-full bg-stone-400" />
              Normally
            </div>
            {station.before}
          </div>

          <div
            className="rounded-[var(--r-sm)] border p-3.5 text-[0.82rem] leading-relaxed text-stone-900"
            style={{
              backgroundColor: `${station.color}0f`,
              borderColor: `${station.color}2e`,
            }}
          >
            <div
              className="mb-1 flex items-center gap-1.5 text-[0.62rem] font-semibold uppercase tracking-wider"
              style={{ color: station.color }}
            >
              <span
                className="size-1 rounded-full"
                style={{ backgroundColor: station.color }}
              />
              With Automation
            </div>
            {station.after}
          </div>
        </div>
      </div>
    </div>
  );
}
