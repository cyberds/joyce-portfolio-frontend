import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowRightIcon } from "@/components/ui/icons";
import { JourneyChapter } from "@/components/journey/JourneyChapter";
import { stations } from "@/components/journey/journeyStations";

export const metadata: Metadata = {
  title: "An Example Automation — Joyce Wadawasina",
  description:
    "One enquiry, followed all the way through: captured, acknowledged, booked, recorded, chased and reported — without anyone holding it in their head.",
};

/**
 * The journey on its own page: the pinned roadmap given the whole screen,
 * with a hero above it and the ask underneath.
 *
 * The chapter's own heading is switched off here because the hero directly
 * above already carries it — two copies of the same sentence a screen apart
 * would read as a mistake.
 */
export default function JourneyPage() {
  return (
    <main className="relative overflow-x-clip">
      <Nav />

      <div className="paper">
        <section className="relative z-10 mx-auto shell pb-24 pt-36 md:pt-44">
          <Reveal>
            <p className="eyebrow flex items-center gap-3 text-ink-faint">
              <span className="h-px w-8 bg-ink-faint/60" aria-hidden />
              An Example Automation
            </p>
          </Reveal>
          <Reveal delay={0.06}>
            <h1 className="display mt-6 max-w-[22ch] text-[clamp(2.3rem,5.2vw,4rem)] text-ink">
              One enquiry, <em className="italic">followed all the way</em>.
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-7 max-w-[38rem] text-[1.08rem] leading-[1.75] text-ink-muted">
              Six moments where work normally leaks — and what each one looks
              like once the tools you already pay for are talking to each other.
              Scroll, and follow it from the moment it arrives.
            </p>
          </Reveal>

          <Reveal delay={0.18}>
            <ol className="mt-12 flex flex-wrap gap-x-6 gap-y-3">
              {stations.map((s) => (
                <li
                  key={s.id}
                  className="flex items-baseline gap-2 text-[0.82rem] text-ink-muted"
                >
                  <span className="font-mono text-[0.72rem] text-ink-faint">
                    {s.index}
                  </span>
                  <span
                    className="size-1.5 translate-y-[-1px] rounded-full"
                    style={{ backgroundColor: s.color }}
                    aria-hidden
                  />
                  {s.tag}
                </li>
              ))}
            </ol>
          </Reveal>
        </section>
      </div>

      <JourneyChapter showHeading={false} />

      <div className="paper">
        <section className="relative z-10 mx-auto shell py-24 md:py-32">
          <Reveal>
            <div className="dark-zone relative overflow-hidden rounded-[var(--r-xl)] bg-deep p-9 text-deep-ink md:p-14 lg:p-16">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 [background:radial-gradient(70%_90%_at_82%_20%,rgba(223,15,87,0.28),transparent_65%)]"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.16] [background-image:linear-gradient(to_right,rgba(243,239,233,0.5)_1px,transparent_1px),linear-gradient(to_bottom,rgba(243,239,233,0.5)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(80%_70%_at_30%_40%,#000,transparent_75%)]"
              />

              <div className="relative max-w-[36rem]">
                <p className="eyebrow flex items-center gap-3 text-deep-muted">
                  <span className="h-px w-8 bg-deep-muted/60" aria-hidden />
                  Your version of this
                </p>
                <h2 className="display mt-6 text-[clamp(1.9rem,3.6vw,2.9rem)] leading-[1.1]">
                  Which of those six is costing you{" "}
                  <em className="italic text-accent">the most</em>?
                </h2>
                <p className="mt-6 text-[0.98rem] leading-[1.75] text-deep-muted">
                  You don&rsquo;t need a brief or the right vocabulary. Tell me
                  which part of that journey breaks in your business and
                  we&rsquo;ll work out whether there&rsquo;s a simpler way. If
                  there isn&rsquo;t, I&rsquo;ll tell you that too.
                </p>

                <div className="mt-9 flex flex-wrap items-center gap-3">
                  <a
                    href="mailto:hello@joycewadawasina.com?subject=My%20enquiry%20journey"
                    className="group flex items-center gap-2 rounded-[var(--r-pill)] bg-deep-ink px-6 py-3.5 text-[0.92rem] font-medium text-deep transition-transform duration-300 hover:-translate-y-0.5"
                  >
                    Map my journey
                    <ArrowRightIcon className="transition-transform duration-300 group-hover:translate-x-1" />
                  </a>
                  <a
                    href="https://wa.me/447436836888"
                    className="rounded-[var(--r-pill)] border border-deep-ink/20 px-6 py-3.5 text-[0.92rem] font-medium text-deep-ink transition-colors duration-300 hover:border-deep-ink/50"
                  >
                    Book a 30-minute call
                  </a>
                  <Link
                    href="/case-studies"
                    className="rounded-[var(--r-pill)] px-4 py-3.5 text-[0.9rem] text-deep-muted underline-offset-4 transition-colors duration-300 hover:text-deep-ink hover:underline"
                  >
                    See it running for someone else
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        <Footer />
      </div>
    </main>
  );
}
