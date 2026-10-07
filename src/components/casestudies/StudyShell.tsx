import Link from "next/link";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowRightIcon } from "@/components/ui/icons";
import { caseStudies } from "@/lib/caseStudies";

/**
 * The frame every case study page shares: nav, the way back, the way onward
 * and the footer. Everything between is the page's own — each study is laid
 * out by hand in its own `app/case-studies/<slug>/page.tsx`.
 */
export function StudyShell({
  slug,
  children,
}: {
  slug: string;
  children: React.ReactNode;
}) {
  const index = caseStudies.findIndex((s) => s.slug === slug);
  const next = caseStudies[(index + 1) % caseStudies.length];

  return (
    <main className="relative overflow-x-clip">
      <Nav />

      <div className="paper">
        <article className="relative z-10 mx-auto shell pt-36 md:pt-44">
          <Reveal>
            <Link
              href="/case-studies"
              className="eyebrow inline-flex items-center gap-2 text-ink-faint transition-colors hover:text-ink"
            >
              <ArrowRightIcon className="rotate-180" />
              All Our Projects
            </Link>
          </Reveal>

          <div className="mt-10">{children}</div>

          {/* ---- Onward: quiet, so it does not compete with the CTA ---- */}
          <Reveal>
            <div className="mt-24 flex flex-col gap-3 border-t border-hairline py-8 sm:flex-row sm:items-baseline sm:justify-between">
              <p className="eyebrow text-ink-faint">Next case study</p>
              <Link
                href={`/case-studies/${next.slug}`}
                className="inline-flex items-center gap-2 text-[1rem] text-ink transition-colors hover:text-accent"
              >
                {next.cardHeading}
                <ArrowRightIcon />
              </Link>
            </div>
          </Reveal>
        </article>

        <Footer />
      </div>
    </main>
  );
}

/** Client, title and the one-paragraph summary. */
export function StudyHeader({
  client,
  title,
  summary,
  accent,
  className = "",
}: {
  client: string;
  title: string;
  summary: string;
  accent: string;
  className?: string;
}) {
  return (
    <header className={className}>
      <Reveal>
        <p className="eyebrow" style={{ color: accent }}>
          {client}
        </p>
      </Reveal>
      <Reveal delay={0.06}>
        <h1 className="display mt-5 text-[clamp(2rem,5vw,3.6rem)] text-ink">
          {title}
        </h1>
      </Reveal>
      <Reveal delay={0.12}>
        <p className="mt-7 text-[1.1rem] leading-[1.75] text-ink-muted">
          {summary}
        </p>
      </Reveal>
    </header>
  );
}

export function BuiltWith({
  tools,
  className = "",
}: {
  tools: string[];
  className?: string;
}) {
  return (
    <div className={`border-t border-hairline pt-7 ${className}`}>
      <p className="text-[0.88rem] text-ink-faint">Built with</p>
      <ul className="mt-3 flex flex-wrap gap-1.5">
        {tools.map((tool) => (
          <li
            key={tool}
            className="rounded-[var(--r-sm)] border border-hairline bg-surface px-2.5 py-1 text-[0.76rem] text-ink-muted"
          >
            {tool}
          </li>
        ))}
      </ul>
    </div>
  );
}
