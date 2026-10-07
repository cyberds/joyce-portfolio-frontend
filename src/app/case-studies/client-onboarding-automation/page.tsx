import type { Metadata } from "next";
import { Reveal } from "@/components/ui/Reveal";
import { VideoEmbed } from "@/components/casestudies/VideoEmbed";
import { StudyCta } from "@/components/casestudies/StudyCta";
import {
  BuiltWith,
  StudyHeader,
  StudyShell,
} from "@/components/casestudies/StudyShell";

const ACCENT = "#df0f57";
const TITLE = "Client onboarding that runs in the background";
const SUMMARY =
  "Contracts chased by hand, the same emails retyped, forms going missing. We designed an onboarding flow that runs quietly in the background, so every new client feels supported from the very first hello.";

export const metadata: Metadata = {
  title: `${TITLE} — Management Consultancy Firm | Joyce Wadawasina`,
  description: SUMMARY,
  openGraph: {
    title: `${TITLE} — Management Consultancy Firm`,
    description: SUMMARY,
    type: "article",
    images: ["/images/projects/onboarding-and-operations.avif"],
  },
};

const STEPS = [
  {
    title: "One form, every detail captured",
    body: "A HubSpot form collects client details instantly, so nothing has to be asked for twice and nothing arrives half-filled.",
  },
  {
    title: "A folder waiting before anyone asks",
    body: "A Google Drive folder is created automatically for each new client, structured the same way every time.",
  },
  {
    title: "A board that already knows the steps",
    body: "Trello boards are duplicated from a template so the onboarding sequence is laid out and assigned before the kickoff call.",
  },
  {
    title: "Contracts drafted, ready for review",
    body: "BoldSign contracts are drafted automatically from the intake details and held for a human to check and send. The tool removes the typing, not the judgement.",
  },
  {
    title: "A welcome that sounds personal",
    body: "A personalised Gmail welcome email goes out with no staff effort, carrying the right next step for that client.",
  },
];

const BENEFITS = [
  "Manual onboarding tasks dropped by 80%.",
  "The team recovered more than ten hours a week.",
  "No more lost emails or missing documents.",
  "Clients were onboarded faster, with a noticeably smoother experience.",
];

/** A single reading column: watch it run, then read how it works. */
export default function ClientOnboardingAutomation() {
  return (
    <StudyShell slug="client-onboarding-automation">
      <div className="mx-auto max-w-[46rem]">
        <StudyHeader
          client="Management Consultancy Firm"
          title={TITLE}
          summary={SUMMARY}
          accent={ACCENT}
        />

        <Reveal delay={0.1}>
          <div className="mt-12">
            <VideoEmbed
              url="https://www.loom.com/share/db7d4d8029384e93909be4ae785911d8?sid=6b68ed23-1285-4f84-985f-ac814f144bed"
              poster="/images/projects/onboarding-and-operations.avif"
              accent={ACCENT}
              duration="3:12"
              label="Watch the walkthrough"
            />
          </div>
        </Reveal>

        <Reveal>
          <h2 className="display mt-16 text-[clamp(1.7rem,3.2vw,2.3rem)] text-ink">
            The problem
          </h2>
          <p className="mt-6 text-[1.05rem] leading-[1.8] text-ink-muted">
            Onboarding new clients was messy: manual contracts, emails back and
            forth, missing forms, and wasted staff hours. It slowed down growth
            and frustrated both staff and clients.
          </p>
        </Reveal>

        <Reveal>
          <h2 className="display mt-16 text-[clamp(1.7rem,3.2vw,2.3rem)] text-ink">
            How it was fixed
          </h2>
        </Reveal>
        <ol className="mt-10 space-y-9">
          {STEPS.map((step, i) => (
            <Reveal as="li" key={step.title} delay={Math.min(i, 4) * 0.05}>
              <div className="flex gap-5">
                <span
                  className="mt-1 font-mono text-[0.78rem]"
                  style={{ color: ACCENT }}
                >
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

        <Reveal>
          <h2 className="display mt-16 text-[clamp(1.7rem,3.2vw,2.3rem)] text-ink">
            The benefits
          </h2>
          <ul className="mt-6 divide-y divide-hairline border-y border-hairline">
            {BENEFITS.map((benefit) => (
              <li
                key={benefit}
                className="flex gap-4 py-4 text-[1.05rem] leading-[1.7] text-ink"
              >
                <span
                  aria-hidden
                  className="mt-[0.7em] size-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: ACCENT }}
                />
                {benefit}
              </li>
            ))}
          </ul>
        </Reveal>

        <BuiltWith
          className="mt-14"
          tools={["HubSpot", "Google Drive", "Trello", "BoldSign", "Gmail", "Zapier"]}
        />

        <Reveal>
          <StudyCta accent={ACCENT} />
        </Reveal>
      </div>
    </StudyShell>
  );
}
