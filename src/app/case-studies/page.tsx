import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowRightIcon } from "@/components/ui/icons";
import { CaseStudyCard } from "@/components/casestudies/CaseStudyCard";
import { caseStudies } from "@/lib/caseStudies";

export const metadata: Metadata = {
  title: "Our Projects — Joyce Wadawasina",
  description:
    "Automations built for real businesses: what the problem was, what we connected, and what actually changed.",
};

export default function CaseStudiesIndex() {
  return (
    <main className="relative overflow-x-clip">
      <Nav />

      <div className="paper">
        <section className="relative z-10 mx-auto shell pt-36 md:pt-44">
          <Reveal>
            <p className="eyebrow flex items-center gap-3 text-ink-faint">
              <span className="h-px w-8 bg-ink-faint/60" aria-hidden />
              Our Projects
            </p>
          </Reveal>
          <Reveal delay={0.06}>
            <h1 className="display mt-6 max-w-[24ch] text-[clamp(2.3rem,5.2vw,4rem)] text-ink">
              Work we&rsquo;ve done, <em className="italic">running</em>.
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-7 max-w-[38rem] text-[1.08rem] leading-[1.75] text-ink-muted">
              Each one starts the same way — somebody describing a Monday they
              were tired of. What follows is what we connected, and what changed.
            </p>
          </Reveal>

          <ul className="mt-16 grid gap-6 md:grid-cols-2">
            {caseStudies.map((study, i) => (
              <Reveal as="li" key={study.slug} delay={(i % 2) * 0.08}>
                <CaseStudyCard study={study} headingLevel="h2" />
              </Reveal>
            ))}
          </ul>

          <Reveal>
            <div className="mt-24 flex flex-col gap-5 border-t border-hairline py-10 sm:flex-row sm:items-center sm:justify-between">
              <p className="display max-w-[26rem] text-[clamp(1.4rem,2.8vw,2rem)] leading-tight text-ink">
                Yours would start with a sentence, not a brief.
              </p>
              <Link
                href="/#talk"
                className="inline-flex w-fit items-center gap-2 rounded-[var(--r-pill)] bg-ink px-6 py-3.5 text-[0.9rem] font-medium text-surface transition-transform duration-300 hover:-translate-y-0.5"
              >
                Talk to Joyce
                <ArrowRightIcon />
              </Link>
            </div>
          </Reveal>
        </section>

        <Footer />
      </div>
    </main>
  );
}
