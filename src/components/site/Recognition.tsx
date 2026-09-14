"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { QuoteIcon } from "@/components/ui/icons";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const moments = [
  {
    said: "I'll reply to that later…",
    then: "Then three days pass and the potential client still hasn't had a follow-up.",
  },
  {
    said: "Where did they send that form?",
    then: "Important information is somewhere between your inbox, WhatsApp, spreadsheets and folders.",
  },
  {
    said: "What time works for you?",
    then: "Six emails later, you're still trying to arrange one meeting.",
  },
  {
    said: "I need to send that again.",
    then: "The same emails, forms, reminders and documents are being created manually every week.",
  },
  {
    said: "I haven't posted all week.",
    then: "Serving clients took priority again and marketing disappeared from the list.",
  },
  {
    said: "Surely there's an easier way to do this?",
    then: "There probably is.",
    answer: true,
  },
];

/** Where each card flies in from (and back out to), one distinct angle each. */
const angles = [
  { x: -420, y: -160, rotate: -28 },
  { x: 0, y: -380, rotate: 14 },
  { x: 420, y: -160, rotate: 26 },
  { x: -420, y: 220, rotate: 20 },
  { x: 0, y: 420, rotate: -16 },
  { x: 420, y: 220, rotate: -24 },
];

export function Recognition() {
  const reduced = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || reduced) return;

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(section);
      const heading = q(".rc-heading");
      const rule = q(".rc-rule");
      const cards = q(".rc-card");
      const closing = q(".rc-close");
      const mm = gsap.matchMedia();

      // Desktop: the section pins and the whole sequence is tied to the
      // scrollbar — heading blurs in, cards arrive one by one from their own
      // angles, a beat to read, then everything leaves the way it came.
      mm.add("(min-width: 1024px)", () => {
        const tl = gsap.timeline({
          defaults: { ease: "power2.out" },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=220%",
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
          },
        });

        tl.fromTo(heading, { autoAlpha: 0, y: 50, filter: "blur(20px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 1 })
          .fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 0.6 }, 0.5);

        cards.forEach((card, i) => {
          tl.fromTo(
            card,
            { autoAlpha: 0, ...angles[i], scale: 0.7, filter: "blur(10px)" },
            { autoAlpha: 1, x: 0, y: 0, rotate: 0, scale: 1, filter: "blur(0px)", duration: 1, ease: "back.out(1.2)" },
            0.8 + i * 0.45,
          );
        });

        tl.fromTo(closing, { autoAlpha: 0, y: 40, filter: "blur(12px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 1 }, ">-0.3")
          .to({}, { duration: 1.4 }) // hold, so it can be read
          .to(closing, { autoAlpha: 0, y: 40, filter: "blur(12px)", duration: 0.8, ease: "power2.in" });

        cards.forEach((card, i) => {
          tl.to(
            card,
            { autoAlpha: 0, ...angles[i], scale: 0.7, filter: "blur(10px)", duration: 1, ease: "power2.in" },
            `>-${i === 0 ? 0.4 : 0.75}`,
          );
        });

        tl.to(heading, { autoAlpha: 0, y: -50, filter: "blur(20px)", duration: 1, ease: "power2.in" }, ">-0.6")
          .to(rule, { scaleX: 0, duration: 0.6, ease: "power2.in" }, "<");
      });

      // Smaller screens: no pin (the cards stack too tall), but the same
      // choreography plays in on entry and reverses on exit.
      mm.add("(max-width: 1023px)", () => {
        const tl = gsap.timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: {
            trigger: section,
            start: "top 70%",
            end: "bottom 30%",
            toggleActions: "play reverse play reverse",
          },
        });
        tl.fromTo(heading, { autoAlpha: 0, y: 40, filter: "blur(18px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 1 });
        cards.forEach((card, i) => {
          tl.fromTo(
            card,
            { autoAlpha: 0, x: angles[i].x / 3, y: angles[i].y / 3, rotate: angles[i].rotate, filter: "blur(8px)" },
            { autoAlpha: 1, x: 0, y: 0, rotate: 0, filter: "blur(0px)", duration: 0.8, ease: "back.out(1.2)" },
            0.3 + i * 0.15,
          );
        });
        tl.fromTo(closing, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.8 }, ">-0.2");
      });
    }, section);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      ref={sectionRef}
      id="familiar"
      className="relative z-10 mx-auto flex shell flex-col justify-center py-24 lg:min-h-[100svh] lg:py-16"
    >
      <div className="mx-auto max-w-[40rem] text-center">
        <h2 className="rc-heading display text-[clamp(2rem,min(4vw,6.4svh),3.1rem)] text-ink">
          Does any of this sound like{" "}
          <em className="italic text-accent">a normal week</em> for you?
        </h2>
        <span aria-hidden className="rc-rule mx-auto mt-6 block h-px w-24 origin-center bg-ink/30" />
      </div>

      <ul className="mx-auto mt-[clamp(2rem,5svh,3.5rem)] grid w-full max-w-[56rem] gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {moments.map((moment) => (
          <li
            key={moment.said}
            className={`rc-card relative flex flex-col rounded-[var(--r-md)] border px-5 py-4 transition-[translate,border-color,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-[0_18px_40px_-24px_rgba(0,0,0,0.35)] ${
              moment.answer ? "border-transparent bg-black text-white" : "border-black/10 bg-white hover:border-black/25"
            }`}
          >
            <QuoteIcon className={`size-4 ${moment.answer ? "text-white/40" : "text-accent/50"}`} />
            <p className={`display mt-2 text-[1.12rem] leading-[1.25] ${moment.answer ? "text-white" : "text-ink"}`}>
              {moment.said}
            </p>
            <p className={`mt-2 text-[0.84rem] leading-[1.55] ${moment.answer ? "text-white/65" : "text-ink-muted"}`}>
              {moment.then}
            </p>
          </li>
        ))}
      </ul>

      <p className="rc-close mx-auto mt-[clamp(2rem,6svh,4rem)] max-w-[42rem] text-center text-[clamp(1.1rem,2vw,1.45rem)] leading-[1.5] text-ink">
        You don&rsquo;t necessarily need more people or more software.
        Sometimes you just need a better way of{" "}
        <em className="display italic">connecting what you already have</em>.
      </p>
    </section>
  );
}
