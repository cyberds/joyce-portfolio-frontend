import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowRightIcon, QuoteIcon } from "@/components/ui/icons";
import { CaseStudyPlayer } from "@/components/casestudies/CaseStudyPlayer";
import { caseStudies, getCaseStudy } from "@/lib/caseStudies";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return caseStudies.map((study) => ({ slug: study.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) return { title: "Case study not found" };

  return {
    title: `${study.title} — ${study.client} | Joyce Wadawasina`,
    description: study.summary,
    openGraph: {
      title: `${study.title} — ${study.client}`,
      description: study.summary,
      type: "article",
    },
  };
}

export default async function CaseStudyPage({ params }: Params) {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) notFound();

  const index = caseStudies.findIndex((s) => s.slug === slug);
  const next = caseStudies[(index + 1) % caseStudies.length];

  return (
    <main className="relative overflow-x-clip">
      <Nav />

      <div className="paper">
        <article className="relative z-10 mx-auto shell pt-36 md:pt-44">
          {/* ---- Title block ---- */}
          <Reveal>
            <Link
              href="/case-studies"
              className="eyebrow inline-flex items-center gap-2 text-ink-faint transition-colors hover:text-ink"
            >
              <ArrowRightIcon className="rotate-180" />
              All case studies
            </Link>
          </Reveal>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1.4fr_0.6fr] lg:items-end">
            <div>
              <Reveal delay={0.05}>
                <p className="eyebrow flex flex-wrap items-center gap-x-3 gap-y-1 text-ink-faint">
                  <span style={{ color: study.accent }}>{study.client}</span>
                  <span aria-hidden className="text-hairline">
                    /
                  </span>
                  {study.industry}
                  <span aria-hidden className="text-hairline">
                    /
                  </span>
                  {study.year}
                </p>
              </Reveal>
              <Reveal delay={0.1}>
                <h1 className="display mt-5 text-[clamp(2.3rem,5.2vw,4rem)] text-ink">
                  {study.title}
                </h1>
              </Reveal>
              <Reveal delay={0.16}>
                <p className="mt-7 max-w-[38rem] text-[1.08rem] leading-[1.75] text-ink-muted">
                  {study.summary}
                </p>
              </Reveal>
            </div>

            <Reveal delay={0.22}>
              <ul className="flex flex-wrap gap-2 lg:justify-end">
                {study.services.map((service) => (
                  <li
                    key={service}
                    className="rounded-[var(--r-pill)] border border-hairline bg-surface px-4 py-2 text-[0.82rem] text-ink-muted"
                  >
                    {service}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          {/* ---- The demo ---- */}
          <Reveal delay={0.1}>
            <div className="mt-14">
              <CaseStudyPlayer study={study} />
            </div>
          </Reveal>

          {/* ---- Numbers ---- */}
          <ul className="mt-16 grid gap-px overflow-hidden rounded-[var(--r-lg)] border border-hairline bg-hairline sm:grid-cols-3">
            {study.metrics.map((metric, i) => (
              <Reveal as="li" key={metric.label} delay={i * 0.07} className="bg-surface p-8">
                <p
                  className="display text-[clamp(2.2rem,4vw,3rem)] leading-none"
                  style={{ color: study.accent }}
                >
                  {metric.value}
                </p>
                <p className="mt-3 text-[0.9rem] leading-relaxed text-ink-muted">
                  {metric.label}
                </p>
              </Reveal>
            ))}
          </ul>

          {/* ---- Write-up ---- */}
          <div className="mt-24 grid gap-14 lg:grid-cols-[0.28fr_0.72fr]">
            <Reveal>
              <div className="lg:sticky lg:top-28">
                <h2 className="eyebrow text-ink-faint">The situation</h2>
                <dl className="mt-8 space-y-5 text-[0.9rem]">
                  <div>
                    <dt className="text-ink-faint">Client</dt>
                    <dd className="mt-1 text-ink">{study.client}</dd>
                  </div>
                  <div>
                    <dt className="text-ink-faint">Type</dt>
                    <dd className="mt-1 text-ink">{study.clientType}</dd>
                  </div>
                  <div>
                    <dt className="text-ink-faint">Delivered</dt>
                    <dd className="mt-1 text-ink">{study.year}</dd>
                  </div>
                  <div>
                    <dt className="text-ink-faint">Built with</dt>
                    <dd className="mt-2 flex flex-wrap gap-1.5">
                      {study.stack.map((tool) => (
                        <span
                          key={tool}
                          className="rounded-[var(--r-sm)] border border-hairline bg-surface px-2.5 py-1 text-[0.78rem] text-ink-muted"
                        >
                          {tool}
                        </span>
                      ))}
                    </dd>
                  </div>
                </dl>
              </div>
            </Reveal>

            <div className="max-w-[42rem]">
              <Reveal>
                <p className="text-[1.08rem] leading-[1.8] text-ink-muted">
                  {study.challenge}
                </p>
              </Reveal>

              <Reveal delay={0.06}>
                <h2 className="display mt-16 text-[clamp(1.8rem,3.4vw,2.5rem)] text-ink">
                  What we did
                </h2>
              </Reveal>

              <ol className="mt-10 space-y-10">
                {study.approach.map((step, i) => (
                  <Reveal as="li" key={step.title} delay={i * 0.06}>
                    <div className="flex gap-5">
                      <span
                        className="mt-1 font-mono text-[0.78rem]"
                        style={{ color: study.accent }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <h3 className="display text-[1.35rem] leading-tight text-ink">
                          {step.title}
                        </h3>
                        <p className="mt-3 text-[1rem] leading-[1.75] text-ink-muted">
                          {step.body}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </ol>

              <Reveal delay={0.06}>
                <h2 className="display mt-16 text-[clamp(1.8rem,3.4vw,2.5rem)] text-ink">
                  Where it landed
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="mt-6 text-[1.08rem] leading-[1.8] text-ink-muted">
                  {study.outcome}
                </p>
              </Reveal>

              <Reveal delay={0.14}>
                <figure
                  className="mt-14 rounded-[var(--r-lg)] border p-8 md:p-10"
                  style={{
                    borderColor: `${study.accent}33`,
                    backgroundColor: `${study.accent}0d`,
                  }}
                >
                  <span style={{ color: study.accent }}>
                    <QuoteIcon />
                  </span>
                  <blockquote className="display mt-5 text-[clamp(1.3rem,2.4vw,1.75rem)] leading-[1.35] text-ink">
                    {study.quote.text}
                  </blockquote>
                  <figcaption className="mt-6 text-[0.88rem] text-ink-muted">
                    <span className="text-ink">{study.quote.name}</span> —{" "}
                    {study.quote.role}
                  </figcaption>
                </figure>
              </Reveal>
            </div>
          </div>

          {/* ---- Onward ---- */}
          <Reveal>
            <div className="mt-28 flex flex-col gap-6 border-t border-hairline py-10 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow text-ink-faint">Next case study</p>
                <Link
                  href={`/case-studies/${next.slug}`}
                  className="display mt-3 block max-w-[26rem] text-[clamp(1.5rem,3vw,2.1rem)] leading-tight text-ink transition-colors hover:text-accent"
                >
                  {next.cardHeading}
                </Link>
              </div>
              <Link
                href="/#talk"
                className="inline-flex w-fit items-center gap-2 rounded-[var(--r-pill)] bg-ink px-6 py-3.5 text-[0.9rem] font-medium text-surface transition-transform duration-300 hover:-translate-y-0.5"
              >
                Talk about yours
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
