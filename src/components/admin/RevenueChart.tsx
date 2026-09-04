import { formatMoney } from "@/lib/commerce/money";

/**
 * Thirty days of revenue as a plain SVG area chart.
 *
 * No charting library: this is one series with no interaction, and a
 * dependency to draw thirty rectangles would cost more to load than the whole
 * page. It renders on the server with the rest of the dashboard.
 */
export function RevenueChart({
  data,
  currency,
}: {
  data: { date: string; revenueMinor: number; orders: number }[];
  currency: string;
}) {
  const width = 720;
  const height = 180;
  const padding = { top: 12, right: 4, bottom: 22, left: 4 };

  const peak = Math.max(...data.map((point) => point.revenueMinor), 1);
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const x = (index: number) =>
    padding.left +
    (data.length <= 1 ? 0 : (index / (data.length - 1)) * innerWidth);
  const y = (value: number) =>
    padding.top + innerHeight - (value / peak) * innerHeight;

  const line = data
    .map((point, index) => `${index === 0 ? "M" : "L"}${x(index)},${y(point.revenueMinor)}`)
    .join(" ");

  const area = `${line} L${x(data.length - 1)},${padding.top + innerHeight} L${x(0)},${
    padding.top + innerHeight
  } Z`;

  const total = data.reduce((sum, point) => sum + point.revenueMinor, 0);
  const label = (index: number) =>
    new Date(`${data[index].date}T00:00:00`).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });

  return (
    <div className="rounded-[var(--r-md)] border border-hairline bg-surface p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="eyebrow text-ink-faint">Revenue, last 30 days</p>
          <p className="mt-2 text-[1.6rem] leading-none">
            {formatMoney(total, currency)}
          </p>
        </div>
        <p className="text-[0.78rem] text-ink-faint">
          Peak day {formatMoney(peak, currency)}
        </p>
      </div>

      {total === 0 ? (
        <p className="mt-8 pb-6 text-center text-[0.85rem] text-ink-faint">
          No paid orders in the last 30 days yet.
        </p>
      ) : (
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="mt-5 w-full"
          role="img"
          aria-label={`Daily revenue for the last 30 days, totalling ${formatMoney(
            total,
            currency
          )}`}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="revenue-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--c-accent)" stopOpacity="0.22" />
              <stop offset="100%" stopColor="var(--c-accent)" stopOpacity="0" />
            </linearGradient>
          </defs>

          <path d={area} fill="url(#revenue-fill)" />
          <path
            d={line}
            fill="none"
            stroke="var(--c-accent)"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />

          {data.map((point, index) =>
            point.revenueMinor > 0 ? (
              <circle
                key={point.date}
                cx={x(index)}
                cy={y(point.revenueMinor)}
                r="3"
                fill="var(--c-accent)"
              />
            ) : null
          )}

          {/* Only the ends and the middle are labelled — thirty dates would be
              unreadable at this width. */}
          {[0, Math.floor(data.length / 2), data.length - 1].map((index) => (
            <text
              key={index}
              x={x(index)}
              y={height - 4}
              textAnchor={index === 0 ? "start" : index === data.length - 1 ? "end" : "middle"}
              className="fill-[var(--c-ink-faint)] text-[11px]"
            >
              {label(index)}
            </text>
          ))}
        </svg>
      )}
    </div>
  );
}
