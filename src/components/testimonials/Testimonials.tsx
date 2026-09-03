"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Reveal } from "@/components/ui/Reveal";
import { testimonials } from "@/lib/testimonials";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { TestimonialCard } from "./TestimonialCard";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * A wall of voices rather than another carousel — the section above this one
 * already rotates, and social proof reads stronger when all of it is on screen
 * at once instead of arriving one at a time.
 *
 * Layout is CSS multi-column so the quotes, which vary from one line to a full
 * paragraph, balance themselves and reflow three → two → one.
 */
export function Testimonials() {
  const reduced = usePrefersReducedMotion();
  const wallRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced) return;
    const wall = wallRef.current;
    if (!wall) return;

    const ctx = gsap.context(() => {
      // Each card drifts a little as the section passes, by an amount tied to
      // its position, so the columns never move as one slab.
      gsap.utils.toArray<HTMLElement>(".tm-drift", wall).forEach((el, i) => {
        const distance = 10 + (i % 3) * 9;
        gsap.fromTo(
          el,
          { y: distance },
          {
            y: -distance,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.9,
            },
          },
        );
      });
    }, wallRef);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      id="testimonials"
      className="relative z-10 mx-auto shell pb-24 md:pb-32"
    >
      <div className="max-w-[44rem]">
        <Reveal>
          <p className="eyebrow flex items-center gap-3 text-ink-faint">
            <span className="h-px w-8 bg-ink-faint/60" aria-hidden />
            In their words
          </p>
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="display mt-6 text-[clamp(2.1rem,4.4vw,3.4rem)] text-ink">
            The People I&rsquo;ve{" "}
            <em className="italic">Worked With</em>.
          </h2>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mt-6 text-[1.02rem] leading-[1.75] text-ink-muted">
            Project managers, coaches, operations leads — people who have had to
            rely on the work actually landing.
          </p>
        </Reveal>
      </div>

      <div ref={wallRef} className="mt-14 columns-1 gap-5 md:columns-2 lg:columns-3">
        {testimonials.map((item, i) => (
          <Reveal
            key={item.id}
            delay={(i % 3) * 0.08}
            className="mb-5 break-inside-avoid"
          >
            {/* Framer owns the entrance transform on the Reveal wrapper, GSAP
                owns the drift on this one — separate elements, no fight. */}
            <div className="tm-drift">
              <TestimonialCard item={item} />
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
