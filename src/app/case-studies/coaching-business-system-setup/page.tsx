import type { Metadata } from "next";
import { Reveal } from "@/components/ui/Reveal";
import { VideoEmbed } from "@/components/casestudies/VideoEmbed";
import { StudyCta } from "@/components/casestudies/StudyCta";
import {
  BuiltWith,
  StudyHeader,
  StudyShell,
} from "@/components/casestudies/StudyShell";

const ACCENT = "#2f7d5c";
const TITLE = "One system for the courses, the list and the admin";
const SUMMARY =
  "Admin was piling up and the digital coaching programmes were scattered across tools. We centralised the lot and built the email list from zero.";

export const metadata: Metadata = {
  title: `${TITLE} — Abi | Joyce Wadawasina`,
  description: SUMMARY,
  openGraph: {
    title: `${TITLE} — Abi`,
    description: SUMMARY,
    type: "article",
  },
};

const PIECES = [
  {
    tool: "Kajabi",
    title: "Courses in one place",
    body: "Kajabi was implemented to centralise course management, so every digital programme lives in one structure instead of several.",
  },
  {
    tool: "GetResponse",
    title: "A list built from zero",
    body: "GetResponse was set up and the email list built from nothing, ready to nurture clients rather than just collect addresses.",
  },
  {
    tool: "Zapier",
    title: "Workflows behind the offers",
    body: "Zapier automations connect the pieces so the coaching offers are supported by workflows rather than by memory.",
  },
];

/** Before and after, with the three pieces that got Abi from one to the other. */
export default function CoachingBusinessSystemSetup() {
  return (
    <StudyShell slug="coaching-business-system-setup">
      <StudyHeader
        client="Abi"
        title={TITLE}
        summary={SUMMARY}
        accent={ACCENT}
        className="mx-auto max-w-[46rem] text-center"
      />

      <div className="mt-16 grid gap-6 md:grid-cols-2">
        <Reveal>
          <section className="h-full rounded-[var(--r-lg)] border border-hairline bg-surface p-8 md:p-10">
            <p className="eyebrow text-ink-faint">Before</p>
            <h2 className="display mt-4 text-[clamp(1.6rem,2.8vw,2.1rem)] text-ink">
              The problem
            </h2>
            <p className="mt-5 text-[1.05rem] leading-[1.8] text-ink-muted">
              Admin tasks were piling up, and the digital coaching programmes
              were not organised under one system. A growing business needed
              scalable foundations rather than another tool.
            </p>
          </section>
        </Reveal>

        <Reveal delay={0.08}>
          <section
            className="h-full rounded-[var(--r-lg)] border p-8 md:p-10"
            style={{ borderColor: `${ACCENT}33`, backgroundColor: `${ACCENT}0d` }}
          >
            <p className="eyebrow" style={{ color: ACCENT }}>
              After
            </p>
            <h2 className="display mt-4 text-[clamp(1.6rem,2.8vw,2.1rem)] text-ink">
              The benefits
            </h2>
            <ul className="mt-5 space-y-3 text-[1.05rem] leading-[1.7] text-ink">
              <li>Digital programmes structured for growth.</li>
              <li>A new email list, set up and ready to nurture clients.</li>
              <li>Considerably more time for coaching instead of admin.</li>
            </ul>
          </section>
        </Reveal>
      </div>

      <Reveal>
        <h2 className="display mt-20 text-center text-[clamp(1.7rem,3.2vw,2.3rem)] text-ink">
          How it was fixed
        </h2>
      </Reveal>
      <ol className="mt-10 grid gap-x-8 gap-y-10 md:grid-cols-3">
        {PIECES.map((piece, i) => (
          <Reveal as="li" key={piece.tool} delay={i * 0.06}>
            <div className="border-t-2 pt-5" style={{ borderColor: ACCENT }}>
              <p className="font-mono text-[0.78rem]" style={{ color: ACCENT }}>
                {piece.tool}
              </p>
              <h3 className="display mt-3 text-[1.25rem] leading-tight text-ink">
                {piece.title}
              </h3>
              <p className="mt-2.5 text-[1rem] leading-[1.75] text-ink-muted">
                {piece.body}
              </p>
            </div>
          </Reveal>
        ))}
      </ol>

      <div className="mx-auto mt-20 max-w-[46rem]">
        <Reveal>
          <VideoEmbed
            url="https://drive.google.com/file/d/1Thcp5ASMbityv3kU2QsHnSjbcnbUTNHH/view"
            accent={ACCENT}
            label="Hear from Abi"
          />
        </Reveal>

        <BuiltWith className="mt-14" tools={["GetResponse", "Kajabi", "Zapier"]} />

        <Reveal>
          <StudyCta accent={ACCENT} />
        </Reveal>
      </div>
    </StudyShell>
  );
}
