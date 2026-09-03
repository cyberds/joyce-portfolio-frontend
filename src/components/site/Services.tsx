"use client";

import { Reveal } from "@/components/ui/Reveal";
import {
  ArrowRightIcon,
  BuildIcon,
  CompassIcon,
  PeopleIcon,
} from "@/components/ui/icons";

const areas = [
  {
    id: "consultancy",
    kicker: "Find a better way",
    title: "Automation consultancy",
    icon: CompassIcon,
    body: "You may know your business could work more efficiently but have no idea where to begin. We look at what’s happening now, talk through the frustrating or repetitive parts, and identify where automation or AI could genuinely make things easier — one process, or opportunities across the whole business.",
    goodFor: "I know we could work smarter. I just don’t know where to start.",
    cta: "See how we help",
  },
  {
    id: "training",
    kicker: "Help your people feel ready",
    title: "AI team training",
    icon: PeopleIcon,
    body: "Introducing AI isn’t just handing everyone a new tool. People need to understand it, trust themselves using it, and see how it relates to their actual job. We deliver practical, human-friendly training: AI mindset, everyday workplace use, prompting, productivity and responsible use.",
    goodFor: "I’m not sure about all this AI stuff… → Okay. I can actually use this.",
    cta: "See what training covers",
  },
  {
    id: "build",
    kicker: "Build it properly",
    title: "Software engineering & branding",
    icon: BuildIcon,
    body: "Sometimes the better way needs building: the website that answers for you, the internal tool that replaces the spreadsheet, the integration between the systems you already pay for — and the brand that makes all of it look like it belongs to one business.",
    goodFor: "We’ve outgrown the workaround. We need the real thing.",
    cta: "See what we build",
  },
];

export function Services() {
  return (
    <section
      id="help"
      className="relative z-10 mx-auto shell pb-28 md:pb-36"
    >
      <div className="max-w-[44rem]">
        <Reveal>
          <p className="eyebrow flex items-center gap-3 text-ink-faint">
            <span className="h-px w-8 bg-ink-faint/60" aria-hidden />
            What we actually help with
          </p>
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="display mt-6 text-[clamp(2.1rem,4.4vw,3.4rem)] text-ink">
            Sometimes you don&rsquo;t know what you need. You just know{" "}
            <em className="italic">the current way isn&rsquo;t working</em>.
          </h2>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mt-6 text-[1.02rem] leading-[1.75] text-ink-muted">
            That&rsquo;s completely fine. Our work generally falls into three
            areas.
          </p>
        </Reveal>
      </div>

      <ul className="mt-16 grid gap-px overflow-hidden rounded-[var(--r-lg)] border border-hairline bg-hairline lg:grid-cols-3">
        {areas.map((area, i) => {
          const Icon = area.icon;
          return (
            <Reveal
              as="li"
              key={area.id}
              delay={i * 0.09}
              className="group flex flex-col bg-surface p-8 transition-colors duration-500 hover:bg-[var(--c-canvas)] md:p-10"
            >
              <Icon className="text-accent" />
              <p className="eyebrow mt-8 text-ink-faint">{area.kicker}</p>
              <h3 className="display mt-3 text-[1.8rem] leading-[1.15] text-ink">
                {area.title}
              </h3>
              <p className="mt-5 flex-1 text-[0.95rem] leading-[1.7] text-ink-muted">
                {area.body}
              </p>

              <p className="mt-7 border-l-2 border-accent/40 pl-4 text-[0.92rem] leading-[1.55] text-ink italic">
                &ldquo;{area.goodFor}&rdquo;
              </p>

              <a
                href="#talk"
                className="mt-auto flex items-center gap-2 pt-9 text-[0.88rem] font-medium text-ink"
              >
                {area.cta}
                <ArrowRightIcon className="text-accent transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </Reveal>
          );
        })}
      </ul>
    </section>
  );
}
