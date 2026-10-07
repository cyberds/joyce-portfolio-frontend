"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import {
  ArrowRightIcon,
  BuildIcon,
  PeopleIcon,
} from "@/components/ui/icons";
import { Reveal } from "@/components/ui/Reveal";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";

const services = [
  {
    id: "workflow-automation",
    kicker: "Service 01 — Workflow automation",
    title: "Make the everyday work easier.",
    icon: BuildIcon,
    body: [
      "If you or your team are spending too much time sending the same emails, chasing information, updating spreadsheets, managing bookings or moving information from one system to another, we look at what’s happening and find a better way to do it.",
      "Then my team and I build the workflows that connect the moving pieces and take repetitive work off your plate.",
    ],
    outcome: "Less manual work. Fewer things to remember. More time for the work that actually needs you.",
    cta: "See what we can automate",
    href: "#solutions",
  },
  {
    id: "ai-training",
    kicker: "Service 02 — AI team training & adoption",
    title: "Help your team actually feel comfortable with AI.",
    icon: PeopleIcon,
    body: [
      "You may know AI could help your business, but introducing it to a team is another matter. Where do you start? What should people use it for? What shouldn’t they use it for? And how do you make sure it actually makes their work easier rather than becoming another tool nobody uses?",
      "We make AI practical and relevant to the work your people already do — helping teams understand it, build confidence and learn useful ways to work smarter with it.",
    ],
    outcome: "Less confusion. More confidence. AI that makes sense in the real working day.",
    cta: "Explore AI team training",
    href: "#talk",
  },
];

/** How an engagement runs, so "consultant" means something specific. */
const approach = [
  {
    step: "01",
    title: "Understand",
    body: "We learn how your business runs today and where time, money and energy are going.",
  },
  {
    step: "02",
    title: "Recommend",
    body: "You get a clear, prioritised plan: what to change, what to automate, where AI fits and what it will save.",
  },
  {
    step: "03",
    title: "Implement",
    body: "We build and integrate the systems, alongside your team rather than around them.",
  },
  {
    step: "04",
    title: "Embed",
    body: "We train your people, measure the results and refine until the new way is simply the way.",
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
          <span className="sv-eyebrow">How we help</span>
        </p>
        <h2 className="display mt-6 text-[clamp(2.1rem,4.4vw,3.4rem)] text-ink">
          <Words text="How we help you" />{" "}
          <em className="italic">
            <Words text="work smarter" />
          </em>
        </h2>
        <p className="sv-intro mt-6 text-[1.02rem] leading-[1.75] text-ink-muted">
          You don&rsquo;t need to know which automation tool you need or where
          AI fits into your business. Start with what&rsquo;s taking too much
          time, what keeps being repeated, or what you wish worked a little
          better.
        </p>
        <p className="hidden sv-intro mt-4 text-[1.02rem] leading-[1.75] text-ink">
          We help in two ways.
        </p>
      </div>

      <ul className="mt-14 grid gap-4 md:grid-cols-2">
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <li
              key={service.id}
              id={service.id}
              className="sv-card h-fit group flex flex-col rounded-[var(--r-lg)] border border-black/5 bg-white p-8 transition-shadow duration-500 hover:shadow-[0_30px_60px_-36px_rgba(0,0,0,0.35)] md:p-10"
            >
              <span className="sv-icon inline-block w-fit">
                <Icon className="text-accent" />
              </span>
              <p className="sv-inner eyebrow mt-8 text-ink-faint">{service.kicker}</p>
              <h3 className="sv-inner display mt-3 text-[1.8rem] leading-[1.15] text-ink">
                {service.title}
              </h3>
              <div className="flex-1">
                {service.body.map((para) => (
                  <p
                    key={para}
                    className="sv-inner mt-5 text-[0.95rem] leading-[1.7] text-ink-muted"
                  >
                    {para}
                  </p>
                ))}
              </div>

              <p className="sv-inner mt-7 border-l-2 border-accent/40 pl-4 text-[0.92rem] leading-[1.55] text-ink italic">
                {service.outcome}
              </p>

              <span className="sv-inner mt-auto inline-block pt-9">
                <a
                  href={service.href}
                  className="inline-flex items-center gap-2 rounded-[var(--r-pill)] bg-ink px-6 py-3.5 text-[0.9rem] font-medium text-white transition-transform duration-300 hover:-translate-y-0.5"
                >
                  {service.cta}
                  <ArrowRightIcon className="transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </span>
            </li>
          );
        })}
      </ul>

      <div className="mt-20 md:mt-28">
        <Reveal>
          <p className="eyebrow flex items-center gap-3 text-ink-faint">
            <span className="h-px w-8 bg-ink-faint/60" aria-hidden />
            How we work
          </p>
        </Reveal>
        <Reveal delay={0.06}>
          <h3 className="display mt-5 max-w-[40rem] text-[clamp(1.6rem,3vw,2.3rem)] leading-tight text-ink">
            We listen first. Then we stay to make it{" "}
            <em className="italic">actually work</em>.
          </h3>
        </Reveal>
        <ol className="mt-10 grid gap-px overflow-hidden rounded-[var(--r-lg)] border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-4">
          {approach.map((item, i) => (
            <Reveal
              as="li"
              key={item.step}
              delay={i * 0.07}
              className="bg-white p-7"
            >
              <p className="eyebrow text-accent">{item.step}</p>
              <p className="display mt-3 text-[1.35rem] leading-tight text-ink">
                {item.title}
              </p>
              <p className="mt-3 text-[0.92rem] leading-[1.65] text-ink-muted">
                {item.body}
              </p>
            </Reveal>
          ))}
        </ol>
        <Reveal delay={0.1}>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="https://wa.me/447436836888"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-[var(--r-pill)] bg-ink px-6 py-3.5 text-[0.9rem] font-medium text-white transition-transform duration-300 hover:-translate-y-0.5"
            >
              Talk to Joyce
              <ArrowRightIcon />
            </a>
            <a
              href="/journey"
              className="inline-flex items-center gap-2 rounded-[var(--r-pill)] border border-hairline px-6 py-3.5 text-[0.9rem] font-medium text-ink transition-transform duration-300 hover:-translate-y-0.5"
            >
              See a demo automation journey
              <ArrowRightIcon />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
