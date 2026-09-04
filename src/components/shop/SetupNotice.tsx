/**
 * The screen a commerce page shows when its integrations have no keys yet.
 *
 * The alternative — a stack trace, or a blank page — tells whoever is doing the
 * setup nothing. This names the exact variables that are still empty and where
 * to put them, so the gap between "code is finished" and "shop is live" is a
 * checklist rather than a debugging session.
 */

import Link from "next/link";

export function SetupNotice({
  title = "The shop is nearly ready",
  missing,
  children,
}: {
  title?: string;
  missing: string[];
  children?: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-2xl rounded-[var(--r-lg)] border border-hairline bg-surface p-8 sm:p-10">
      <p className="eyebrow text-accent">Setup required</p>
      <h2 className="display mt-3 text-[clamp(1.6rem,3vw,2.1rem)]">{title}</h2>

      <p className="mt-4 text-[0.95rem] leading-relaxed text-ink-muted">
        Everything is built and wired up. These values still need to go into{" "}
        <code className="rounded bg-canvas-deep px-1.5 py-0.5 text-[0.85em]">
          .env.local
        </code>{" "}
        before this page can do its job:
      </p>

      <ul className="mt-5 grid gap-2">
        {missing.map((name) => (
          <li
            key={name}
            className="flex items-center gap-3 rounded-[var(--r-sm)] border border-hairline bg-canvas px-4 py-2.5"
          >
            <span className="size-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
            <code className="font-mono text-[0.82rem]">{name}</code>
          </li>
        ))}
      </ul>

      {children ? (
        <div className="mt-6 text-[0.9rem] leading-relaxed text-ink-muted">
          {children}
        </div>
      ) : null}

      <p className="mt-7 text-[0.85rem] text-ink-faint">
        See{" "}
        <code className="rounded bg-canvas-deep px-1.5 py-0.5 text-[0.9em]">
          SHOP-SETUP.md
        </code>{" "}
        for where each value comes from.{" "}
        <Link href="/" className="text-accent underline underline-offset-4">
          Back to the site
        </Link>
      </p>
    </div>
  );
}
