"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { stations } from "./journeyStations";
import { StationCardWide } from "./StationCard";
import { JourneyHeading, JourneyOutro } from "./JourneyCopy";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Vertical distance each card's top edge is offset from the one before it, so
 * the rail of a covered card still shows above the card that landed on it.
 * The stack of six has to clear a laptop viewport, hence the small number.
 */
const STEP_REM = 1.15;
const STEP_REM_NARROW = 0.5;

/** Where the first card comes to rest, clear of the floating nav. */
const BASE_REM = 6;
const BASE_REM_NARROW = 5;

/** How much a card shrinks once the next one has landed on top of it. */
const COVERED_SCALE = 0.965;

/**
 * The journey as a deck that deals itself.
 *
 * Variant B of the A/B test. Every card is `position: sticky` inside one tall
 * list, so each comes to rest a little below the last and the next scrolls up
 * over it — the pile builds as the reader descends and the whole story stays
 * on screen at once, which the pinned roadmap deliberately does not do.
 *
 * The scroll room between arrivals is the margin under each card, so this
 * section costs exactly as much page height as its content asks for; there is
 * no pin and no scrubbed camera to keep in sync.
 */
export function JourneyStack() {
  const reduced = usePrefersReducedMotion();

  const sectionRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const list = listRef.current;
    if (!list) return;

    const observers: IntersectionObserver[] = [];

    const ctx = gsap.context(() => {
      itemRefs.current.forEach((item, i) => {
        if (!item) return;
        const card = item.querySelector<HTMLElement>(".stack-card");
        if (!card) return;

        // Arrival: the card rises into the pile as it first comes into view.
        // Driven by an observer rather than a scroll position because the card
        // starts hidden: an observer fires from layout, so a stale ScrollTrigger
        // measurement can never leave the section looking empty.
        gsap.set(card, { y: 56, autoAlpha: 0 });
        const reveal = new IntersectionObserver(
          (entries) => {
            if (!entries.some((e) => e.isIntersecting)) return;
            reveal.disconnect();
            gsap.to(card, {
              y: 0,
              autoAlpha: 1,
              duration: 0.7,
              ease: "power3.out",
            });
          },
          { threshold: 0.12 },
        );
        reveal.observe(item);
        observers.push(reveal);

        // Which card the reader is on. Read off the item's own resting
        // position rather than a shared timeline, so it stays right however
        // the cards reflow.
        ScrollTrigger.create({
          trigger: item,
          start: "top 55%",
          end: "bottom 25%",
          onToggle: (self) => {
            if (self.isActive) setActive(i);
          },
        });

        // Covered cards give way: a small shrink, and a wash that darkens them
        // just enough to push them behind the card that landed on top.
        const next = itemRefs.current[i + 1];
        if (!next) return;

        const shade = card.querySelector<HTMLElement>(".stack-shade");

        gsap.to(card, {
          scale: COVERED_SCALE,
          ease: "none",
          scrollTrigger: {
            trigger: next,
            start: "top bottom",
            end: "top center",
            scrub: 0.4,
          },
        });

        if (shade) {
          gsap.to(shade, {
            opacity: 0.5,
            ease: "none",
            scrollTrigger: {
              trigger: next,
              start: "top bottom",
              end: "top center",
              scrub: 0.4,
            },
          });
        }
      });
    }, sectionRef);

    return () => {
      observers.forEach((o) => o.disconnect());
      ctx.revert();
    };
  }, [reduced]);

  const tint = stations[active]?.color ?? stations[0].color;

  return (
    <section
      ref={sectionRef}
      id="journey"
      className="relative border-y border-stone-200/80 bg-white text-stone-900"
    >
      {/* Same three background layers as the roadmap variant, so the two arms
          of the test differ in behaviour rather than in brand. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#ffffff_0%,#ffffff_38%,var(--c-canvas)_100%)]" />
        <div
          className="absolute inset-0 transition-[background] duration-700"
          style={{
            opacity: 0.085,
            background: `radial-gradient(120% 60% at 50% 40%, ${tint} 0%, transparent 62%)`,
          }}
        />
        <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,var(--c-grid)_1px,transparent_1px),linear-gradient(to_bottom,var(--c-grid)_1px,transparent_1px)] [background-size:88px_88px] [mask-image:radial-gradient(110%_75%_at_50%_45%,#000_5%,transparent_78%)]" />
      </div>

      <div className="relative mx-auto w-[min(62rem,92vw)] py-24 md:py-32">
        <div className="text-center">
          <JourneyHeading />
        </div>

        {/* Progress rail. Sticky beside the pile on wide screens, where there
            is margin to spare; folded away on narrow ones, where the cards
            already use the full width. */}
        <div className="pointer-events-none absolute left-[-2.75rem] top-0 hidden h-full xl:block">
          <div className="sticky top-[50svh] flex flex-col gap-2">
            {stations.map((s, i) => (
              <span
                key={s.id}
                className="block h-1.5 w-1.5 rounded-full transition-all duration-500"
                style={{
                  backgroundColor: i <= active ? s.color : "var(--c-hairline)",
                  transform: i === active ? "scale(1.9)" : "scale(1)",
                }}
              />
            ))}
          </div>
        </div>

        <ol ref={listRef} className="relative mt-14 md:mt-20">
          {stations.map((s, i) => (
            <li
              key={s.id}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              /* Sticky against the list, not against its own box: the list runs
                 to the bottom of the section, so a card that has come to rest
                 stays put and the pile survives to the end. Reduced motion
                 gets the same six cards as a plain, spaced list. */
              className={
                reduced ? "mb-6 last:mb-0" : "sticky mb-[18vh] last:mb-0"
              }
              style={
                reduced
                  ? undefined
                  : {
                      top: `calc(var(--stack-base) + ${i} * var(--stack-step))`,
                      zIndex: i + 1,
                    }
              }
            >
              <div className="stack-card relative will-change-transform">
                <StationCardWide station={s} />
                {/* Sits over the card, not under it, so a covered card recedes
                    without every colour inside it needing its own tween. */}
                <div
                  aria-hidden
                  className="stack-shade pointer-events-none absolute inset-0 rounded-[var(--r-lg)] bg-[var(--c-canvas)] opacity-0"
                />
              </div>
            </li>
          ))}
        </ol>

        <JourneyOutro className="mt-20 md:mt-24" />
      </div>

      <style>{`
        #journey ol { --stack-base: ${BASE_REM_NARROW}rem; --stack-step: ${STEP_REM_NARROW}rem; }
        @media (min-width: 768px) {
          #journey ol { --stack-base: ${BASE_REM}rem; --stack-step: ${STEP_REM}rem; }
        }
      `}</style>
    </section>
  );
}
