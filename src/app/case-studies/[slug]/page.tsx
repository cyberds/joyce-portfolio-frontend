import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowRightIcon, QuoteIcon } from "@/components/ui/icons";
import { VideoEmbed } from "@/components/casestudies/VideoEmbed";
import {
  ScreenshotStack,
  ScreenshotStrip,
} from "@/components/casestudies/ScreenshotRail";
import {
  InlineCta,
  MobileCtaBar,
  RailCta,
} from "@/components/casestudies/StudyCta";
import {
  caseStudies,
  getCaseStudy,
  type ApproachStep,
  type CaseStudy,
} from "@/lib/caseStudies";

type Params = { params: Promise<{ slug: string }> };

const CTA_ID = "study-cta";

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
      images: study.poster ? [study.poster] : undefined,
    },
  };
}

/** A section heading, at the one size the whole write-up uses. */
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="display mt-16 text-[clamp(1.7rem,3.2vw,2.3rem)] text-ink">
      {children}
    </h2>
  );
}

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-6 text-[1.05rem] leading-[1.8] text-ink-muted">{children}</p>
  );
}

/** The numbered steps — the one piece of the old page worth keeping intact. */
function Steps({ steps, accent }: { steps: ApproachStep[]; accent: string }) {
  return (
    <ol className="mt-10 space-y-9">
      {steps.map((step, i) => (
        <Reveal as="li" key={step.title} delay={Math.min(i, 4) * 0.05}>
          <div className="flex gap-5">
            <span className="mt-1 font-mono text-[0.78rem]" style={{ color: accent }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <h3 className="display text-[1.25rem] leading-tight text-ink">
                {step.title}
              </h3>
              <p className="mt-2.5 text-[1rem] leading-[1.75] text-ink-muted">
                {step.body}
              </p>
            </div>
          </div>
        </Reveal>
      ))}
    </ol>
  );
}

/** Client / type / delivered / built with — the same block in rail or strip. */
function Facts({ study, stacked }: { study: CaseStudy; stacked: boolean }) {
  return (
    <dl
      className={
        stacked
          ? "space-y-5 text-[0.88rem]"
          : "grid grid-cols-2 gap-x-6 gap-y-5 text-[0.88rem] sm:grid-cols-4"
      }
    >
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
      <div className={stacked ? "" : "col-span-2 sm:col-span-1"}>
        <dt className="text-ink-faint">Built with</dt>
        <dd className="mt-2 flex flex-wrap gap-1.5">
          {study.stack.map((tool) => (
            <span
              key={tool}
              className="rounded-[var(--r-sm)] border border-hairline bg-surface px-2.5 py-1 text-[0.76rem] text-ink-muted"
            >
              {tool}
            </span>
          ))}
        </dd>
      </div>
    </dl>
  );
}

export default async function CaseStudyPage({ params }: Params) {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) notFound();

  const index = caseStudies.findIndex((s) => s.slug === slug);
  const next = caseStudies[(index + 1) % caseStudies.length];

  const hasRail = study.screenshots.length > 0;
  const hasSubProjects = study.subProjects.length > 0;

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

          {/*
            One grid for the whole page: the write-up on the left, the
            screenshots and the facts riding along on the right. When a study
            has no screenshots the rail is dropped entirely and the column
            centres itself — which is the common case, not the exception.
          */}
          <div
            className={
              hasRail
                ? "mt-10 grid gap-x-14 gap-y-14 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)] lg:items-start"
                : "mt-10"
            }
          >
            {/* ---------------- Left: the whole write-up ---------------- */}
            <div className={hasRail ? "min-w-0" : "mx-auto max-w-[46rem]"}>
              <Reveal delay={0.05}>
                <p className="eyebrow flex flex-wrap items-center gap-x-3 gap-y-1 text-ink-faint">
                  <span style={{ color: study.accent }}>{study.client}</span>
                  <span aria-hidden className="text-hairline">/</span>
                  {study.industry}
                  <span aria-hidden className="text-hairline">/</span>
                  {study.year}
                </p>
              </Reveal>

              <Reveal delay={0.1}>
                <h1 className="display mt-5 text-[clamp(2rem,5vw,3.6rem)] text-ink">
                  {study.title}
                </h1>
              </Reveal>

              <Reveal delay={0.16}>
                <p className="mt-7 text-[1.1rem] leading-[1.75] text-ink-muted">
                  {study.summary}
                </p>
              </Reveal>

              <Reveal delay={0.2}>
                <ul className="mt-7 flex flex-wrap gap-2">
                  {study.services.map((service) => (
                    <li
                      key={service}
                      className="rounded-[var(--r-pill)] border border-hairline bg-surface px-4 py-1.5 text-[0.8rem] text-ink-muted"
                    >
                      {service}
                    </li>
                  ))}
                </ul>
              </Reveal>

              {/* No rail below lg, so the screenshots come inline and early. */}
              {hasRail ? (
                <div className="mt-10 lg:hidden">
                  <ScreenshotStrip shots={study.screenshots} />
                </div>
              ) : null}

              {/* Facts sit in the rail on desktop; here when there is none. */}
              {!hasRail ? (
                <Reveal delay={0.24}>
                  <div className="mt-10 border-y border-hairline py-7">
                    <Facts study={study} stacked={false} />
                  </div>
                </Reveal>
              ) : null}

              {/* ---- The demo ---- */}
              <Reveal delay={0.1}>
                <div className="mt-12">
                  <VideoEmbed
                    url={study.demoVideo}
                    poster={study.poster}
                    accent={study.accent}
                    duration={study.duration}
                    label="Watch the walkthrough"
                    pendingLabel="Demo video coming shortly"
                  />
                </div>
              </Reveal>

              {/* ---- Numbers: a row, not a card grid ---- */}
              <ul className="mt-12 grid grid-cols-3 gap-x-4 border-y border-hairline py-8 sm:gap-x-8">
                {study.metrics.map((metric, i) => (
                  <Reveal as="li" key={metric.label} delay={i * 0.06}>
                    <p
                      className="display text-[clamp(1.5rem,4.5vw,2.6rem)] leading-none"
                      style={{ color: study.accent }}
                    >
                      {metric.value}
                    </p>
                    <p className="mt-3 text-[0.82rem] leading-snug text-ink-muted sm:text-[0.88rem]">
                      {metric.label}
                    </p>
                  </Reveal>
                ))}
              </ul>

              {/*
                The mobile bar arms from here — past the numbers, so the reader
                has seen what the work was worth before being asked anything.
                It stands down again when the inline CTA reaches the screen.
              */}
              <MobileCtaBar hideWhenVisibleId={CTA_ID} />

              {study.intro ? (
                <Reveal>
                  <p
                    className="mt-14 border-l-2 pl-6 text-[1.08rem] leading-[1.8] text-ink-muted"
                    style={{ borderColor: `${study.accent}55` }}
                  >
                    {study.intro}
                  </p>
                </Reveal>
              ) : null}

              {/* ---- Challenge / solution / outcome ---- */}
              {study.challenge ? (
                <>
                  <Reveal>
                    <SectionHeading>The challenge</SectionHeading>
                  </Reveal>
                  <Reveal delay={0.06}>
                    <Prose>{study.challenge}</Prose>
                  </Reveal>
                </>
              ) : null}

              {study.approach.length > 0 ? (
                <>
                  <Reveal>
                    <SectionHeading>What we built</SectionHeading>
                  </Reveal>
                  <Steps steps={study.approach} accent={study.accent} />
                </>
              ) : null}

              {study.outcome ? (
                <>
                  <Reveal>
                    <SectionHeading>Where it landed</SectionHeading>
                  </Reveal>
                  <Reveal delay={0.06}>
                    <Prose>{study.outcome}</Prose>
                  </Reveal>
                </>
              ) : null}

              {/*
                Some engagements were two builds under one theme. They keep
                their own challenge, steps and outcome rather than being
                flattened into one confusing list.
              */}
              {hasSubProjects
                ? study.subProjects.map((sub) => (
                    <section key={sub.title} className="mt-20">
                      <Reveal>
                        <div className="border-t border-hairline pt-8">
                          <p
                            className="eyebrow"
                            style={{ color: study.accent }}
                          >
                            {sub.label}
                          </p>
                          <h2 className="display mt-4 text-[clamp(1.7rem,3.2vw,2.3rem)] text-ink">
                            {sub.title}
                          </h2>
                          <p className="mt-3 text-[0.9rem] text-ink-faint">
                            {sub.client}
                          </p>
                        </div>
                      </Reveal>
                      <Reveal delay={0.06}>
                        <Prose>{sub.challenge}</Prose>
                      </Reveal>
                      <Steps steps={sub.approach} accent={study.accent} />
                      <Reveal>
                        <p
                          className="mt-10 rounded-[var(--r-md)] px-6 py-5 text-[1rem] leading-[1.75] text-ink-muted"
                          style={{ backgroundColor: `${study.accent}0d` }}
                        >
                          {sub.outcome}
                        </p>
                      </Reveal>
                    </section>
                  ))
                : null}

              {/* ---- Testimonial: video when there is one, words otherwise ---- */}
              {study.testimonialVideo ? (
                <>
                  <Reveal>
                    <SectionHeading>In their words</SectionHeading>
                  </Reveal>
                  <Reveal delay={0.06}>
                    <div className="mt-8">
                      <VideoEmbed
                        url={study.testimonialVideo}
                        accent={study.accent}
                        label={`Hear from ${study.client}`}
                        pendingLabel="Testimonial video coming shortly"
                      />
                    </div>
                  </Reveal>
                </>
              ) : null}

              {study.quote ? (
                <Reveal delay={0.06}>
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
                    <blockquote className="display mt-5 text-[clamp(1.2rem,2.2vw,1.6rem)] leading-[1.35] text-ink">
                      {study.quote.text}
                    </blockquote>
                    <figcaption className="mt-6 text-[0.88rem] text-ink-muted">
                      <span className="text-ink">{study.quote.name}</span> —{" "}
                      {study.quote.role}
                    </figcaption>
                  </figure>
                </Reveal>
              ) : null}

              {/* ---- Why it matters, then the ask ---- */}
              {study.whyItMatters ? (
                <>
                  <Reveal>
                    <SectionHeading>Why this matters for you</SectionHeading>
                  </Reveal>
                  <Reveal delay={0.06}>
                    <Prose>{study.whyItMatters}</Prose>
                  </Reveal>
                </>
              ) : null}

              <Reveal delay={0.08}>
                <InlineCta accent={study.accent} id={CTA_ID} />
              </Reveal>
            </div>

            {/* ---------------- Right: sticky screenshots ---------------- */}
            {hasRail ? (
              <aside className="hidden lg:block">
                <div className="lg:sticky lg:top-28 lg:space-y-8">
                  <ScreenshotStack shots={study.screenshots} />
                  <div className="border-t border-hairline pt-7">
                    <Facts study={study} stacked />
                  </div>
                  <RailCta accent={study.accent} />
                </div>
              </aside>
            ) : null}
          </div>

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
