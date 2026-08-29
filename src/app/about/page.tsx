import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowRightIcon, LocationIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "About Joyce Wadawasina — workflow automation specialist",
  description:
    "MSc in Logistics and Supply Chain Management, ten years in business operations, four years of executive support to CEOs and coaches — and now the person who automates the work she used to do by hand.",
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
    title: "Automating the work I used to do by hand",
    body: [
      "So that's what I build. As a workflow automation specialist I take email management, administrative workflows and project coordination and put smart systems underneath them — the same jobs I used to do manually, running on their own.",
      "Every build is tailored. I'm not selling a platform, and I have no interest in adding to the pile of subscriptions you're already paying for. Most of the time the answer is connecting things you already own.",
    ],
  },
];

/** The specifics, so nobody has to guess what "automation" means here. */
const capabilities = [
  {
    title: "AI-driven inbox filtering",
    body: "Mail sorted, triaged and drafted against your own tone, so what reaches you is what actually needs you.",
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

const credentials = [
  { value: "MSc", label: "Logistics & Supply Chain Management" },
  { value: "BSc", label: "Business Administration" },
  { value: "10+", label: "years in business operations" },
  { value: "4", label: "years of executive support" },
];

const numbers = [
  { value: "300+", label: "businesses served" },
  { value: "12k", label: "hours of business time saved" },
  { value: "10+", label: "years across operations" },
];

export default function AboutPage() {
  return (
    <main className="relative overflow-x-clip">
      <Nav />

      <div className="paper">
        {/* ---- Who ---- */}
        <section className="relative z-10 mx-auto w-[min(1200px,94vw)] pt-36 md:pt-44">
          <div className="grid items-end gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <Reveal>
                <p className="eyebrow flex items-center gap-3 text-ink-faint">
                  <span className="h-px w-8 bg-ink-faint/60" aria-hidden />
                  About Joyce
                </p>
              </Reveal>
              <Reveal delay={0.06}>
                <h1 className="display mt-6 max-w-[18ch] text-balance text-[clamp(2.4rem,5.2vw,4rem)] text-ink">
                  I spent ten years doing the work.{" "}
                  <em className="italic">
                    <span className="marked">Now I automate it.</span>
                  </em>
                </h1>
              </Reveal>
              <Reveal delay={0.12}>
                <p className="mt-7 max-w-[34rem] text-[1.05rem] leading-[1.75] text-ink-muted">
                  I&rsquo;m Joyce Wadawasina — a workflow automation specialist
                  in Falkirk, Scotland. I help ambitious professionals free up
                  their schedules, get rid of the repetitive work, and put their
                  hours back into the things that actually move the business.
                </p>
              </Reveal>
              <Reveal delay={0.18}>
                <p className="mt-5 flex items-center gap-2.5 text-[0.9rem] text-ink-faint">
                  <LocationIcon className="shrink-0 text-accent" />
                  Falkirk, Scotland, United Kingdom
                </p>
              </Reveal>
            </div>

            <Reveal delay={0.1}>
              <div className="relative">
                <div
                  aria-hidden
                  className="absolute inset-[-8%] rounded-[var(--r-xl)] bg-[radial-gradient(60%_60%_at_55%_45%,rgba(223,15,87,0.14),transparent_72%)]"
                />
                <div className="relative aspect-[434/476] w-full overflow-hidden rounded-[var(--r-xl)] border border-hairline bg-[linear-gradient(180deg,#ffffff,var(--c-canvas-deep))]">
                  <Image
                    src="/images/joyce-native-sitting.png"
                    alt="Joyce Wadawasina"
                    fill
                    sizes="(max-width: 1024px) 92vw, 32rem"
                    className="object-contain object-bottom"
                    priority
                  />
                </div>
              </div>
            </Reveal>
          </div>

          {/* ---- Credentials strip ---- */}
          <ul className="mt-20 grid gap-px overflow-hidden rounded-[var(--r-lg)] border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-4">
            {credentials.map((item, i) => (
              <Reveal
                as="li"
                key={item.label}
                delay={i * 0.06}
                className="bg-surface p-7"
              >
                <p className="display text-[clamp(1.9rem,3vw,2.4rem)] leading-none text-ink">
                  {item.value}
                </p>
                <p className="mt-3 text-[0.86rem] leading-[1.5] text-ink-muted">
                  {item.label}
                </p>
              </Reveal>
            ))}
          </ul>
        </section>

        {/* ---- The story ---- */}
        <section className="relative z-10 mx-auto mt-28 w-[min(1200px,94vw)] md:mt-36">
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
        <section className="relative z-10 mx-auto mt-28 w-[min(1200px,94vw)] md:mt-36">
          <div className="max-w-[44rem]">
            <Reveal>
              <p className="eyebrow flex items-center gap-3 text-ink-faint">
                <span className="h-px w-8 bg-ink-faint/60" aria-hidden />
                In practice
              </p>
            </Reveal>
            <Reveal delay={0.06}>
              <h2 className="display mt-6 text-[clamp(2rem,4vw,3rem)] text-ink">
                What &ldquo;automation&rdquo; actually means when I say it.
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
        <section className="relative z-10 mx-auto mt-28 w-[min(1200px,94vw)] md:mt-36">
          <Reveal>
            <div className="relative overflow-hidden rounded-[var(--r-xl)] bg-deep text-deep-ink">
              <div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(70%_90%_at_80%_20%,rgba(223,15,87,0.26),transparent_62%)]"
              />
              <div
                aria-hidden
                className="absolute inset-0 opacity-[0.14] [background-image:linear-gradient(to_right,rgba(243,239,233,0.5)_1px,transparent_1px),linear-gradient(to_bottom,rgba(243,239,233,0.5)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(80%_70%_at_30%_40%,#000,transparent_75%)]"
              />

              <div className="relative grid gap-12 p-9 md:grid-cols-[1.1fr_0.9fr] md:p-14 lg:p-16">
                <div className="max-w-[32rem]">
                  <p className="eyebrow text-deep-muted">The goal</p>
                  <p className="display mt-6 text-[clamp(1.6rem,3.2vw,2.4rem)] leading-[1.25]">
                    Free up the schedule. Kill the repetitive work. Put the hours
                    back into{" "}
                    <em className="italic text-accent">
                      what actually moves the needle
                    </em>
                    .
                  </p>
                </div>

                <dl className="grid grid-cols-3 gap-6 self-end md:grid-cols-1 md:gap-8">
                  {numbers.map((item) => (
                    <div key={item.label}>
                      <dt className="display text-[clamp(1.6rem,2.6vw,2.1rem)] leading-none">
                        {item.value}
                      </dt>
                      <dd className="mt-2 text-[0.8rem] leading-[1.45] text-deep-muted">
                        {item.label}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ---- Onward ---- */}
        <section className="relative z-10 mx-auto mt-24 w-[min(1200px,94vw)] pb-24 md:pb-32">
          <Reveal>
            <div className="flex flex-col gap-6 border-t border-hairline pt-10 sm:flex-row sm:items-end sm:justify-between">
              <p className="display max-w-[26rem] text-[clamp(1.5rem,3vw,2.1rem)] leading-tight text-ink">
                Tell me what&rsquo;s taking too long. That&rsquo;s the whole
                brief.
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
