import Link from "next/link";

/**
 * One number, named. The value is the loudest thing in the card and the label
 * is the quietest — the opposite of the marketing pages, where the words lead.
 */
export function StatCard({
  label,
  value,
  hint,
  href,
  tone = "neutral",
}: {
  label: string;
  value: string;
  hint?: string;
  href?: string;
  tone?: "neutral" | "accent" | "warn";
}) {
  const body = (
    <>
      <p className="eyebrow text-ink-faint">{label}</p>
      <p
        className={`mt-3 text-[1.9rem] leading-none tracking-tight ${
          tone === "accent" ? "text-accent" : tone === "warn" ? "text-tangerine" : ""
        }`}
      >
        {value}
      </p>
      {hint ? <p className="mt-2.5 text-[0.78rem] text-ink-faint">{hint}</p> : null}
    </>
  );

  const className =
    "block rounded-[var(--r-md)] border border-hairline bg-surface p-5 transition-colors";

  return href ? (
    <Link href={href} className={`${className} hover:border-ink-faint`}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}
