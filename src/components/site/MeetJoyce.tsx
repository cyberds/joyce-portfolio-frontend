"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/*
 * The bento is drawn, not bordered. Everything lives in one 407 × 373 SVG
 * coordinate space with a fixed 13-unit gutter between shapes:
 *
 *   P  purple stat tile      x 0–136    y 0–155
 *   A  photo, top-right      x 149–407  y 0–203  ┐ merged into one shape,
 *   B  photo, bottom-left    x 0–257    y 168–373┘ concave fillets at the joins
 *   C  lime tile             x 270–407  y 216–373
 *
 * The cut-out photograph is clipped to A∪B and, separately, to C — two copies
 * of the same image in the same place — so the photo shape and the lime tile
 * can race in independently yet line up perfectly once they land.
 */
const R = 22;
const photoShape = [
  `M ${149 + R} 0`,
  `H ${407 - R} A ${R} ${R} 0 0 1 407 ${R}`,
  `V ${203 - R} A ${R} ${R} 0 0 1 ${407 - R} 203`,
  `H ${257 + R} A ${R} ${R} 0 0 0 257 ${203 + R}`,
  `V ${373 - R} A ${R} ${R} 0 0 1 ${257 - R} 373`,
  `H ${R} A ${R} ${R} 0 0 1 0 ${373 - R}`,
  `V ${168 + R} A ${R} ${R} 0 0 1 ${R} 168`,
  `H ${149 - R} A ${R} ${R} 0 0 0 149 ${168 - R}`,
  `V ${R} A ${R} ${R} 0 0 1 ${149 + R} 0`,
  "Z",
].join(" ");

const photo = {
  href: "/images/Joyce%20standing.png",
  x: 100,
  y: 12,
  width: 262,
  height: 498,
  preserveAspectRatio: "xMidYMin meet",
};

export function MeetJoyce() {
  const reduced = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || reduced) return;

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(section);

      // Plays on the way in, reverses on the way out (in either direction).
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 65%",
          end: "bottom 35%",
          toggleActions: "play reverse play reverse",
        },
      });

      tl.fromTo(
        q(".mj-top"),
        { autoAlpha: 0, y: -16 },
        { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" },
        0,
      )
        .fromTo(
          q(".mj-copy"),
          { autoAlpha: 0, y: 30, filter: "blur(10px)" },
          { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.9, stagger: 0.12, ease: "power3.out" },
          0.1,
        )
        // The race: same distance, same curve, staggered starts — purple
        // crosses the line first, the photo second, lime last.
        .fromTo(
          q(".mj-tile"),
          { x: 520, skewX: -8, autoAlpha: 0 },
          {
            x: 0,
            skewX: 0,
            autoAlpha: 1,
            duration: 1.15,
            stagger: 0.2,
            ease: "expo.out",
          },
          0.15,
        );
    }, section);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      ref={sectionRef}
      id="joyce"
      className="relative z-10 mx-auto shell scroll-mt-0 py-16 lg:flex lg:min-h-[100svh] lg:items-center lg:pb-4 lg:pt-[5.25rem]"
    >
      {/* Card fits the viewport below the fixed navbar (~5.75rem incl. its offset). */}
      <div className="w-full rounded-[14px] bg-white p-6 sm:px-18 sm:py-8">
        {/* Top row: badge left, category right. */}
        <div className="mj-top flex items-center justify-between gap-4">
          <div className="flex items-center gap-1">
            <span className="flex size-7 items-center justify-center rounded-full bg-black text-[0.7rem] font-medium text-white">
              01
            </span>
            <span className="rounded-full bg-black px-3.5 py-1.5 text-[0.78rem] font-medium text-white">
              Meet Joyce
            </span>
          </div>
          <p className="text-[0.78rem] font-semibold uppercase tracking-[0.02em] text-black">
            Automation &amp; AI Consulting
          </p>
        </div>

        {/* The bento column is sized from the height left under the navbar
            (~30% larger than before); the copy takes only what remains. */}
        <div className="mt-5 grid gap-10 lg:grid-cols-[minmax(22rem,1fr)_minmax(0,calc((100svh-13.5rem)*407/373))] lg:gap-10">
          {/* Copy */}
          <div className="flex flex-col">
            <h2 className="mj-copy display text-[clamp(2.1rem,min(3.6vw,7svh),3.5rem)] font-bold leading-[1.02] tracking-[-0.02em] text-black">
              Not Sure Where
              <br />
              To Start?
            </h2>

            <p className="mj-copy mt-[clamp(1rem,3svh,2rem)] max-w-[34rem] text-[clamp(0.9rem,1.9svh,0.98rem)] leading-[1.5] text-black/85">
              You don&rsquo;t need to know which AI tool you need or what&rsquo;s
              wrong with your process. Tell me what&rsquo;s frustrating you,
              what&rsquo;s taking too long, or what your team keeps doing
              manually — I&rsquo;ll help you see where the real gains are.
              <br />
              <br />
              I bring more than ten years of running operations to the
              conversation. From there, my team and I design the right
              solution, bring AI in safely where it belongs, train your people
              and stay until it&rsquo;s working.
            </p>

            <div className="mj-copy mt-10 lg:mt-auto">
              <a
                href="https://wa.me/447436836888"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex w-fit items-center gap-2.5 rounded-full bg-black px-5 py-2.5 text-[0.92rem] font-medium text-white transition-transform duration-300 hover:-translate-y-0.5"
              >
                Start Conversation
                <svg
                  className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M7 17L17 7" />
                  <path d="M7 7h10v10" />
                </svg>
              </a>
            </div>
          </div>

          {/* Bento: fills its column; the column width keeps it on screen. */}
          <div className="ml-auto w-full">
            <svg
              viewBox="0 0 407 373"
              className="block h-auto w-full overflow-visible"
              role="img"
              aria-label="Joyce Wadawasina"
            >
              <defs>
                <clipPath id="meet-joyce-photo">
                  <path d={photoShape} />
                </clipPath>
                <clipPath id="meet-joyce-lime">
                  <rect x="270" y="216" width="137" height="157" rx={R} />
                </clipPath>
              </defs>

              {/* 1st: purple stat tile, copy inside so it travels with it. */}
              <g className="mj-tile">
                <rect x="0" y="0" width="136" height="155" rx={R} fill="#7b6cf6" />
                <foreignObject x="0" y="0" width="136" height="155">
                  <div className="flex h-full flex-col justify-center px-[18px] text-white">
                    <p className="text-[37px] font-medium leading-none tracking-[-0.02em]">10+</p>
                    <p className="mt-[10px] text-[12px] leading-[1.3] text-white/90">
                      Years across operations, procurement and customer service
                    </p>
                  </div>
                </foreignObject>
              </g>

              {/* 2nd: the photo shape. */}
              <g className="mj-tile">
                <path d={photoShape} fill="#e9e8ee" />
                <image {...photo} clipPath="url(#meet-joyce-photo)" />
              </g>

              {/* 3rd: lime tile, showing the part of her that falls inside it. */}
              <g className="mj-tile">
                <rect x="270" y="216" width="137" height="157" rx={R} fill="#cdf56b" />
                <image {...photo} clipPath="url(#meet-joyce-lime)" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
