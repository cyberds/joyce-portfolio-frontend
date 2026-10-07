import type { Metadata } from "next";
import { Reveal } from "@/components/ui/Reveal";
import { StudyCta } from "@/components/casestudies/StudyCta";
import {
  BuiltWith,
  StudyHeader,
  StudyShell,
} from "@/components/casestudies/StudyShell";

const ACCENT = "#ef8000";
const TITLE = "Calendars that work for you, not against you";
const SUMMARY =
  "Two clients, one problem: calendars running the person instead of the other way around. We built booking and sync systems that removed the back-and-forth entirely.";

export const metadata: Metadata = {
  title: `${TITLE} — Ms. M and a renewable energy consultant | Joyce Wadawasina`,
  description: SUMMARY,
  openGraph: {
    title: `${TITLE} — Ms. M and a renewable energy consultant`,
    description: SUMMARY,
    type: "article",
    images: ["/images/projects/meeting-booking.avif"],
  },
};

const BUILDS = [
  {
    title: "Meeting bookings",
    client: "Ms. M",
    problem:
      "Booking client meetings was painful: too many emails back and forth, wasted time, and unnecessary steps.",
    fix: [
      "A HubSpot booking page connected straight to her live availability, so clients only ever see slots she can actually take.",
      "Zoom is integrated into the flow, so the meeting link exists the moment the slot is taken.",
      "Zapier sends the confirmation and the reminders, so nobody has to remember to nudge.",
    ],
    benefit:
      "Booking dropped from eight steps to two. Clients booked instantly with no email chase, and meetings were scheduled with reminders attached.",
  },
  {
    title: "Calendar sync and automation",
    client: "Renewable energy consultant",
    problem:
      "Managing multiple projects meant juggling several calendars. Important tasks slipped through, double bookings happened, and stress levels ran high.",
    fix: [
      "Outlook and Gmail calendars were integrated into a single unified planner using Reclaim.ai.",
      "Priorities were synced and reminders automated so clashes are prevented rather than discovered.",
      "Zapier connects the planner to the rest of the stack, so a change in one place is a change everywhere.",
    ],
    benefit:
      "No more double bookings or missed meetings, clearer focus on high-priority deliverables, and far greater peace of mind.",
  },
];

/** Two separate builds, so the page is two columns read side by side. */
export default function CalendarAndBookingsAutomation() {
  return (
    <StudyShell slug="calendar-and-bookings-automation">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-end lg:gap-14">
        <StudyHeader
          client="Ms. M and a renewable energy consultant"
          title={TITLE}
          summary={SUMMARY}
          accent={ACCENT}
        />
        <Reveal delay={0.1}>
          <div className="overflow-hidden rounded-[var(--r-lg)] border border-hairline bg-surface">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/projects/meeting-booking.avif"
              alt="The meeting booking page connected to a live calendar"
              className="block w-full"
            />
          </div>
        </Reveal>
      </div>

      <div className="mt-16 grid gap-6 lg:grid-cols-2">
        {BUILDS.map((build, i) => (
          <Reveal key={build.title} delay={i * 0.08}>
            <section className="h-full rounded-[var(--r-lg)] border border-hairline bg-surface p-7 md:p-9">
              <p className="eyebrow" style={{ color: ACCENT }}>
                {build.client}
              </p>
              <h2 className="display mt-4 text-[clamp(1.6rem,2.8vw,2.1rem)] leading-tight text-ink">
                {build.title}
              </h2>

              <h3 className="mt-9 text-[0.88rem] text-ink-faint">The problem</h3>
              <p className="mt-2 text-[1rem] leading-[1.75] text-ink-muted">
                {build.problem}
              </p>

              <h3 className="mt-8 text-[0.88rem] text-ink-faint">
                How it was fixed
              </h3>
              <ul className="mt-3 space-y-3">
                {build.fix.map((item) => (
                  <li
                    key={item}
                    className="flex gap-3.5 text-[1rem] leading-[1.7] text-ink-muted"
                  >
                    <span
                      aria-hidden
                      className="mt-[0.7em] size-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: ACCENT }}
                    />
                    {item}
                  </li>
                ))}
              </ul>

              <h3 className="mt-8 text-[0.88rem] text-ink-faint">The benefits</h3>
              <p
                className="mt-3 rounded-[var(--r-md)] px-5 py-4 text-[1rem] leading-[1.7] text-ink"
                style={{ backgroundColor: `${ACCENT}12` }}
              >
                {build.benefit}
              </p>
            </section>
          </Reveal>
        ))}
      </div>

      <BuiltWith
        className="mt-14"
        tools={["HubSpot", "Zoom", "Reclaim.ai", "Outlook", "Gmail", "Zapier"]}
      />

      <Reveal>
        <StudyCta accent={ACCENT} />
      </Reveal>
    </StudyShell>
  );
}
