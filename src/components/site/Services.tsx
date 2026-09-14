"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import {
  ArrowRightIcon,
  BuildIcon,
  CompassIcon,
  PeopleIcon,
} from "@/components/ui/icons";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";

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

function Words({ text }: { text: string }) {
  return (
    <>
      {text.split(" ").map((word, i) => (
        <span key={`${word}-${i}`} className="inline-block overflow-hidden pb-[0.12em] align-bottom">
          <span className="sv-word inline-block">{word}&nbsp;</span>
        </span>
      ))}
    </>
  );
}

export function Services() {
  const reduced = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || reduced) return;

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(section);
      gsap.set(q(".sv-line"), { scaleX: 0 });
      gsap.set(q(".sv-eyebrow"), { autoAlpha: 0, x: -20 });
      gsap.set(q(".sv-word"), { yPercent: 120 });
      gsap.set(q(".sv-intro"), { autoAlpha: 0, y: 20 });
      gsap.set(q(".sv-card"), { clipPath: "inset(100% 0% 0% 0%)", y: 60 });
      gsap.set(q(".sv-icon"), { scale: 0, rotate: -120 });
      gsap.set(q(".sv-inner"), { autoAlpha: 0, y: 24 });

      const tl = gsap.timeline({ paused: true, defaults: { ease: "power4.out" } });
      tl.to(q(".sv-line"), { scaleX: 1, duration: 0.8, ease: "power3.inOut" })
        .to(q(".sv-eyebrow"), { autoAlpha: 1, x: 0, duration: 0.7 }, 0.2)
        .to(q(".sv-word"), { yPercent: 0, duration: 1, stagger: 0.035 }, 0.3)
        .to(q(".sv-intro"), { autoAlpha: 1, y: 0, duration: 0.9 }, 0.9)
        .to(
          q(".sv-card"),
          { clipPath: "inset(0% 0% 0% 0%)", y: 0, duration: 1.3, stagger: 0.14, ease: "expo.out" },
          0.9,
        )
        .to(q(".sv-icon"), { scale: 1, rotate: 0, duration: 0.9, stagger: 0.14, ease: "back.out(2)" }, 1.2)
        .to(q(".sv-inner"), { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.05 }, 1.25);

      const io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            io.disconnect();
            tl.play();
          }
        },
        { threshold: 0.15 },
      );
      io.observe(section);
      return () => io.disconnect();
    }, section);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      ref={sectionRef}
      id="help"
      className="relative z-10 mx-auto shell pb-28 md:pb-0"
    >
      <div className="max-w-[44rem]">
        <p className="eyebrow flex items-center gap-3 text-ink-faint">
          <span className="sv-line h-px w-8 origin-left bg-ink-faint/60" aria-hidden />
          <span className="sv-eyebrow">What we actually help with</span>
        </p>
        <h2 className="display mt-6 text-[clamp(2.1rem,4.4vw,3.4rem)] text-ink">
          <Words text="Sometimes you don’t know what you need. You just know" />{" "}
          <em className="italic">
            <Words text="the current way isn’t working." />
          </em>
        </h2>
        <p className="sv-intro mt-6 text-[1.02rem] leading-[1.75] text-ink-muted">
          That&rsquo;s completely fine. Our work generally falls into three
          areas.
        </p>
      </div>

      <ul className="mt-16 grid gap-4 lg:grid-cols-3">
        {areas.map((area) => {
          const Icon = area.icon;
          return (
            <li
              key={area.id}
              className="sv-card group flex flex-col rounded-[var(--r-lg)] border border-black/5 bg-white p-8 transition-shadow duration-500 hover:shadow-[0_30px_60px_-36px_rgba(0,0,0,0.35)] md:p-10"
            >
              <span className="sv-icon inline-block w-fit">
                <Icon className="text-accent" />
              </span>
              <p className="sv-inner eyebrow mt-8 text-ink-faint">{area.kicker}</p>
              <h3 className="sv-inner display mt-3 text-[1.8rem] leading-[1.15] text-ink">
                {area.title}
              </h3>
              <p className="sv-inner mt-5 flex-1 text-[0.95rem] leading-[1.7] text-ink-muted">
                {area.body}
              </p>

              <p className="sv-inner mt-7 border-l-2 border-accent/40 pl-4 text-[0.92rem] leading-[1.55] text-ink italic">
                &ldquo;{area.goodFor}&rdquo;
              </p>

              <a
                href="#talk"
                className="sv-inner mt-auto flex items-center gap-2 pt-9 text-[0.88rem] font-medium text-ink"
              >
                {area.cta}
                <ArrowRightIcon className="text-accent transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
