import type { Metadata } from "next";
import { Reveal } from "@/components/ui/Reveal";
import { StudyCta } from "@/components/casestudies/StudyCta";
import {
  BuiltWith,
  StudyHeader,
  StudyShell,
} from "@/components/casestudies/StudyShell";

const ACCENT = "#c07a11";
const TITLE = "Content scheduling that keeps every brand visible";
const SUMMARY =
  "Myleen manages several brands at once. Posting by hand across Instagram and Facebook was slow and inconsistent, so we built the system that keeps the rhythm without sacrificing brand quality.";

export const metadata: Metadata = {
  title: `${TITLE} — Myleen | Joyce Wadawasina`,
  description: SUMMARY,
  openGraph: {
    title: `${TITLE} — Myleen`,
    description: SUMMARY,
    type: "article",
  },
};

const STEPS = [
  {
    title: "Copy variations, generated not typed",
    body: "HelloWoofy's smart content tools generate copy variations, so one idea becomes a week of posts instead of one.",
  },
  {
    title: "Scheduled well ahead",
    body: "Posts are scheduled across multiple social channels in advance, so a busy week never becomes a silent one.",
  },
  {
    title: "A board the team can see",
    body: "Trello content planning boards were integrated so her team stays aligned on what is going out and when.",
  },
  {
    title: "A rhythm that builds presence",
    body: "A consistent posting cadence was established to build her clients' online presence over time rather than in bursts.",
  },
];

const BENEFITS = [
  "Hours of repetitive work saved each week.",
  "Brand visibility stayed consistent across every client.",
  "Myleen's time was freed for higher-value strategic work.",
];

/** The problem set large, the fix as a four-up grid, the benefits as a strip. */
export default function SocialMediaMarketingAutomation() {
  return (
    <StudyShell slug="social-media-marketing-automation">
      <StudyHeader
        client="Myleen"
        title={TITLE}
        summary={SUMMARY}
        accent={ACCENT}
        className="max-w-[46rem]"
      />

      <Reveal>
        <section className="mt-16 border-l-2 pl-6 md:pl-10" style={{ borderColor: ACCENT }}>
          <h2 className="eyebrow text-ink-faint">The problem</h2>
          <p className="display mt-5 max-w-[52rem] text-[clamp(1.3rem,2.6vw,1.9rem)] leading-[1.4] text-ink">
            Myleen manages multiple brands and clients as an Online Business
            Manager. Posting content manually across Instagram, Facebook, and
            other channels was time-consuming and inconsistent.
          </p>
          <p className="mt-5 max-w-[46rem] text-[1.05rem] leading-[1.8] text-ink-muted">
            She needed a way to simplify content creation and scheduling
            without sacrificing brand quality.
          </p>
        </section>
      </Reveal>

      <Reveal>
        <h2 className="display mt-20 text-[clamp(1.7rem,3.2vw,2.3rem)] text-ink">
          How it was fixed
        </h2>
      </Reveal>
      <ol className="mt-8 grid gap-5 sm:grid-cols-2">
        {STEPS.map((step, i) => (
          <Reveal as="li" key={step.title} delay={(i % 2) * 0.06}>
            <div className="h-full rounded-[var(--r-lg)] border border-hairline bg-surface p-7">
              <span className="font-mono text-[0.78rem]" style={{ color: ACCENT }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="display mt-4 text-[1.25rem] leading-tight text-ink">
                {step.title}
              </h3>
              <p className="mt-2.5 text-[1rem] leading-[1.75] text-ink-muted">
                {step.body}
              </p>
            </div>
          </Reveal>
        ))}
      </ol>

      <Reveal>
        <h2 className="display mt-20 text-[clamp(1.7rem,3.2vw,2.3rem)] text-ink">
          The benefits
        </h2>
      </Reveal>
      <ul className="mt-8 grid gap-x-8 gap-y-6 md:grid-cols-3">
        {BENEFITS.map((benefit, i) => (
          <Reveal as="li" key={benefit} delay={i * 0.06}>
            <p
              className="border-t-2 pt-5 text-[1.1rem] leading-[1.6] text-ink"
              style={{ borderColor: ACCENT }}
            >
              {benefit}
            </p>
          </Reveal>
        ))}
      </ul>

      <BuiltWith
        className="mt-16"
        tools={["HelloWoofy", "Trello", "Instagram", "Facebook"]}
      />

      <Reveal>
        <StudyCta accent={ACCENT} />
      </Reveal>
    </StudyShell>
  );
}
