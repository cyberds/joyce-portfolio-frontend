import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowRightIcon } from "@/components/ui/icons";
import { AboutHero } from "@/components/about/AboutHero";
import { AboutGoal } from "@/components/about/AboutGoal";

export const metadata: Metadata = {
  title: "About Joyce Wadawasina — automation & AI consultant",
  description:
    "MSc in Logistics and Supply Chain Management, ten years in business operations, four years of executive support to CEOs and coaches — and now an automation and AI consultant helping businesses work more efficiently.",
};

/** The three chapters, in the order they actually happened. */
const chapters = [
  {
    period: "The ground floor",
    title: "Operations first, technology second",
    body: [
      "I came to automation the long way round — through the work itself. A BSc in Business Administration, then an MSc in Logistics and Supply Chain Management, then more than ten years inside real operations: procurement and supply chain, project coordination, customer service, marketing.",
      "That order matters. I spent a decade watching where businesses actually lose time, long before I was in a position to automate any of it. It is why I don't start a conversation with a tool.",
    ],
  },
  {
    period: "The last four years",
    title: "Inside other people’s calendars",
    body: [
      "For four years I provided high-level executive support to CEOs, coaches and professionals. Managing executive calendars. Getting inboxes under control. Keeping operations moving on days when nothing wanted to.",
      "You learn something doing that job well: almost none of it needed a person. It needed judgement in a handful of places and a reliable process everywhere else — and the process was the part being done by hand, every day, by someone expensive.",
    ],
  },
  {
    period: "Now",
    title: "Helping businesses run better",
    body: [
      "Today I work as an automation and AI consultant, with a team behind me. We help companies and business owners see where their time, money and labour are going, then find better ways to run the business — cutting repetitive work, lowering overhead and getting more from the people they already have.",
      "More and more, that means helping businesses move into AI safely: deciding where it genuinely belongs, integrating it into the way the team already works, training people to use it with confidence and building the systems that keep everything efficient.",
      "Every engagement is tailored. I'm not selling a platform, and I have no interest in adding to the pile of subscriptions you're already paying for. Often the best answer is a better process, or connecting things you already own.",
    ],
  },
];

/** The specifics, so nobody has to guess what "consulting" means here. */
const capabilities = [
  {
    title: "Operations & efficiency reviews",
    body: "A clear look at how work moves through your business, where it stalls, and what it’s really costing you in time and labour.",
  },
  {
    title: "AI adoption roadmaps",
    body: "Where AI genuinely fits, which tools to use, and the guardrails for data and responsible use — before anyone signs up for anything.",
  },
  {
    title: "Team AI training",
    body: "Practical sessions built around your team’s real work, so people use the new tools with confidence rather than avoiding them.",
  },
  {
    title: "AI-driven inbox filtering",
    body: "Mail sorted, triaged and drafted with your own tone, so what reaches you is what actually needs you.",
  },
  {
    title: "CRM integrations",
    body: "The systems you already pay for, finally writing to each other instead of to a spreadsheet in the middle.",
  },
  {
    title: "Automated invoicing",
    body: "Raised, sent and chased on a schedule, with the follow-up stopping the moment someone pays.",
  },
  {
    title: "Workflow tracking",
    body: "One place that knows the state of every job, so the answer to “where is that?” isn’t a person’s memory.",
  },
  {
    title: "Calendar & scheduling",
    body: "Meetings that arrange themselves around a live diary, in both calendars, without the six-email negotiation.",
  },
  {
    title: "Administrative workflows",
    body: "Onboarding, handovers, reporting — the sequences that run the same way every time, running themselves.",
  },
];

export default function AboutPage() {
  return (
    <main className="relative overflow-x-clip">
      <Nav />

      {/* Full-height hero; its credentials strip hangs half over the edge. */}
      <AboutHero />

      <div className="paper">
        {/* ---- The story ---- (top padding clears the overlapping strip) */}
        <section className="relative z-10 mx-auto shell pt-36 md:pt-40">
          <div className="grid gap-14 lg:grid-cols-[0.3fr_0.7fr]">
            <Reveal>
              <div className="lg:sticky lg:top-28">
                <h2 className="display text-[clamp(1.9rem,3.6vw,2.7rem)] leading-tight text-ink">
                  How I got here
                </h2>
                <p className="mt-5 max-w-[22rem] text-[0.95rem] leading-[1.7] text-ink-muted">
                  Three stretches of work, each one making the next one obvious.
                </p>
              </div>
            </Reveal>

            <ol className="max-w-[42rem] space-y-14">
              {chapters.map((chapter, i) => (
                <Reveal as="li" key={chapter.title} delay={i * 0.05}>
                  <div className="border-l-2 border-hairline pl-7">
                    <p className="eyebrow text-accent">{chapter.period}</p>
                    <h3 className="display mt-4 text-[clamp(1.4rem,2.6vw,1.9rem)] leading-tight text-ink">
                      {chapter.title}
                    </h3>
                    {chapter.body.map((para) => (
                      <p
                        key={para.slice(0, 32)}
                        className="mt-4 text-[1rem] leading-[1.8] text-ink-muted"
                      >
                        {para}
                      </p>
                    ))}
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        {/* ---- What that looks like in practice ---- */}
        <section className="relative z-10 mx-auto mt-28 shell md:mt-36">
          <div className="max-w-[44rem]">
            <Reveal>
              <p className="eyebrow flex items-center gap-3 text-ink-faint">
                <span className="h-px w-8 bg-ink-faint/60" aria-hidden />
                In practice
              </p>
            </Reveal>
            <Reveal delay={0.06}>
              <h2 className="display mt-6 text-[clamp(2rem,4vw,3rem)] text-ink">
                What working with us actually covers.
              </h2>
            </Reveal>
          </div>

          <ul className="mt-14 grid gap-px overflow-hidden rounded-[var(--r-lg)] border border-hairline bg-hairline md:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((item, i) => (
              <Reveal
                as="li"
                key={item.title}
                delay={(i % 3) * 0.07}
                className="bg-surface p-8 transition-colors duration-500 hover:bg-canvas"
              >
                <h3 className="display text-[1.25rem] leading-tight text-ink">
                  {item.title}
                </h3>
                <p className="mt-3 text-[0.94rem] leading-[1.7] text-ink-muted">
                  {item.body}
                </p>
              </Reveal>
            ))}
          </ul>
        </section>

        {/* ---- The point of it ---- */}
        <AboutGoal />

        {/* ---- Onward ---- */}
        <section className="relative z-10 mx-auto mt-24 shell pb-24 md:pb-32">
          <Reveal>
            <div className="flex flex-col gap-6 border-t border-hairline pt-10 sm:flex-row sm:items-end sm:justify-between">
              <p className="display max-w-[26rem] text-[clamp(1.5rem,3vw,2.1rem)] leading-tight text-ink">
                Tell me what&rsquo;s taking too long. That&rsquo;s the whole
                brief — we&rsquo;ll take it from there.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/#talk"
                  className="inline-flex w-fit items-center gap-2 rounded-[var(--r-pill)] bg-ink px-6 py-3.5 text-[0.9rem] font-medium text-surface transition-transform duration-300 hover:-translate-y-0.5"
                >
                  Talk to Joyce
                  <ArrowRightIcon />
                </Link>
                <Link
                  href="/case-studies"
                  className="inline-flex w-fit items-center gap-2 rounded-[var(--r-pill)] border border-hairline px-6 py-3.5 text-[0.9rem] font-medium text-ink transition-colors duration-300 hover:bg-surface"
                >
                  See the work
                </Link>
              </div>
            </div>
          </Reveal>
        </section>

        <Footer />
      </div>
    </main>
  );
}
