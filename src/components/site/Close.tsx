"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRightIcon } from "@/components/ui/icons";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const openers = [
  "“Our bookings are a mess.”",
  "“We keep losing enquiries.”",
  "“I do the same admin every Monday.”",
];

/**
 * A line split into per-word masks. Each word sits in its own overflow-hidden
 * box so it can be swung up from below rather than merely faded.
 */
function Words({ text, className = "" }: { text: string; className?: string }) {
  return (
    <>
      {text.split(" ").map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="inline-block overflow-hidden pb-[0.14em] align-bottom"
        >
          <span className={`close-word inline-block ${className}`}>
            {word}
            {" "}
          </span>
        </span>
      ))}
    </>
  );
}

export function Close() {
  const reduced = usePrefersReducedMotion();

  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);
  const floatRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);
  const standRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced) return;
    const section = sectionRef.current;
    const card = cardRef.current;
    const copy = copyRef.current;
    const reveal = revealRef.current;
    if (!section || !card || !copy || !reveal) return;

    const cleanups: (() => void)[] = [];

    const ctx = gsap.context(() => {
      const words = gsap.utils.toArray<HTMLElement>(".close-word", copy);
      const para = copy.querySelector(".close-para");
      const pills = gsap.utils.toArray<HTMLElement>(".close-pill", copy);
      const actions = gsap.utils.toArray<HTMLElement>(".close-action", copy);

      // Everything starts hidden so nothing flashes before the entrance runs.
      gsap.set(card, { autoAlpha: 0, y: 44, scale: 0.97 });
      gsap.set(words, { yPercent: 115 });
      gsap.set([para, ...pills, ...actions], { autoAlpha: 0, y: 18 });
      // She is clipped to the card's top edge, then grows past it — that rise
      // above the line is the whole trick, so it has to be the last beat.
      gsap.set(reveal, { clipPath: "inset(22% 0% 0% 0%)", yPercent: 8 });
      gsap.set([haloRef.current, standRef.current], { autoAlpha: 0 });

      // The entrance runs off an IntersectionObserver rather than a scroll
      // position. This is the page's call to action: if the trigger were ever
      // missed the whole panel would stay invisible, and an observer fires from
      // layout rather than from scroll events, so it cannot be missed.
      const tl = gsap.timeline({ defaults: { ease: "power3.out" }, paused: true });

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            observer.disconnect();
            tl.play();
          }
        },
        { threshold: 0.15 },
      );
      observer.observe(section);
      cleanups.push(() => observer.disconnect());

      tl.to(card, {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.9,
        ease: "power2.out",
      })
        .to(
          words,
          { yPercent: 0, duration: 0.85, stagger: 0.055, ease: "power3.out" },
          0.15,
        )
        .to(para, { autoAlpha: 1, y: 0, duration: 0.7 }, 0.5)
        .to(
          pills,
          { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.08, ease: "back.out(1.7)" },
          0.62,
        )
        .to(
          actions,
          { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "back.out(1.5)" },
          0.78,
        )
        .to(haloRef.current, { autoAlpha: 1, duration: 1.1 }, 0.5)
        .to(
          reveal,
          {
            clipPath: "inset(0% 0% 0% 0%)",
            yPercent: 0,
            duration: 1.15,
            ease: "power3.out",
          },
          0.45,
        )
        .to(standRef.current, { autoAlpha: 1, duration: 0.7 }, 0.9);

      // Idle float, started once she has arrived so the two never fight.
      tl.add(() => {
        gsap.to(floatRef.current, {
          y: -10,
          duration: 3.4,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
        gsap.to(glowRef.current, {
          opacity: 0.75,
          scale: 1.06,
          duration: 5,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      });

      // Gentle parallax as the section passes, on its own wrapper so it never
      // overwrites the entrance transform.
      gsap.fromTo(
        parallaxRef.current,
        { y: 26 },
        {
          y: -26,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.8,
          },
        },
      );
    }, sectionRef);

    return () => {
      cleanups.forEach((fn) => fn());
      ctx.revert();
    };
  }, [reduced]);

  return (
    <section
      ref={sectionRef}
      id="talk"
      className="relative z-10 mx-auto shell pb-24 md:pb-32"
    >
      {/* Headroom for the part of her that stands above the card. */}
      <div className="pt-1 xl:pt-[8rem]">
        <div
          ref={cardRef}
          className="dark-zone relative rounded-[var(--r-xl)] bg-deep text-deep-ink lg:min-h-[33rem]"
        >
          {/* Decoration is clipped to the card; the card itself is not, so she
              can hang over the top edge. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
          >
            <div
              ref={glowRef}
              className="absolute inset-0 opacity-100 [background:radial-gradient(70%_90%_at_82%_75%,rgba(193,48,28,0.30),transparent_65%)]"
            />
            <div className="absolute inset-0 opacity-[0.16] [background-image:linear-gradient(to_right,rgba(243,239,233,0.5)_1px,transparent_1px),linear-gradient(to_bottom,rgba(243,239,233,0.5)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(80%_70%_at_30%_40%,#000,transparent_75%)]" />
          </div>

          <div
            ref={gridRef}
            className="relative p-9 md:p-14 lg:p-16 lg:pr-[47%] xl:pr-[46%]"
          >
            <div ref={copyRef} className="max-w-[34rem]">
              <h2 className="display text-[clamp(1.9rem,3.6vw,2.9rem)] leading-[1.1]">
                <Words text="Start with a sentence." />
                <br />
                <Words text="Not a brief." className="italic text-accent" />
              </h2>

              <p className="close-para mt-5 max-w-[30rem] text-[0.95rem] leading-[1.7] text-deep-muted">
                You don&rsquo;t need a plan, or the right vocabulary.
                Tell me what&rsquo;s taking too long and we&rsquo;ll work out
                together whether there&rsquo;s a simpler way. If there
                isn&rsquo;t, I&rsquo;ll tell you that too.
              </p>

              <ul className="mt-6 flex flex-wrap gap-2">
                {openers.map((opener) => (
                  <li
                    key={opener}
                    /* Colours only: GSAP owns transform and opacity here, and a
                       CSS transition on those would fight the entrance. */
                    className="close-pill rounded-[var(--r-pill)] border border-deep-ink/15 px-4 py-2 text-[0.82rem] text-deep-muted transition-colors duration-300 hover:border-deep-ink/40 hover:text-deep-ink"
                  >
                    {opener}
                  </li>
                ))}
              </ul>

              {/* Each button is wrapped: GSAP animates the wrapper, so the
                  anchor's own hover lift keeps its transform to itself. */}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <span className="close-action inline-block">
                  <a
                    href="mailto:hello@joycewadawasina.com?subject=Something%20is%20taking%20too%20long"
                    className="group flex items-center gap-2 rounded-[var(--r-pill)] bg-deep-ink px-6 py-3.5 text-[0.92rem] font-medium text-deep transition-transform duration-300 hover:-translate-y-0.5"
                  >
                    Send Joyce a sentence
                    <ArrowRightIcon className="transition-transform duration-300 group-hover:translate-x-1" />
                  </a>
                </span>
                <span className="close-action inline-block">
                  <a
                    href="https://wa.me/447436836888"
                    className="block rounded-[var(--r-pill)] border border-deep-ink/20 px-6 py-3.5 text-[0.92rem] font-medium text-deep-ink transition-colors duration-300 hover:border-deep-ink/50"
                  >
                    Book a 30-minute call
                  </a>
                </span>
              </div>
            </div>

            {/* Joyce, in three steps. Stacked under the copy on a phone or a
                portrait tablet. From lg she moves beside the copy, filling the
                card's height. From xl — the first width with room for both —
                she grows a fixed 8.5rem past the card's top edge so head and
                shoulders stand clear of it. The overhang is a fixed length
                rather than a percentage so it cannot drift when the copy
                reflows and the card gets taller. Nothing above her clips. */}
            <div className="hidden md:block relative mx-auto mt-12 aspect-[381/584] w-[min(16rem,76%)] lg:absolute lg:bottom-0 lg:right-[3%] lg:mx-0 lg:mt-0 lg:h-full lg:w-auto lg:max-w-[42%] xl:h-[calc(100%+8.5rem)] xl:max-w-[46%]">
              <div ref={parallaxRef} className="relative h-full w-[400px] md:w-full">
                <div className="relative h-full w-full">
                  {/* Halo behind her head, sold as depth rather than a glow. */}
                  <div
                    ref={haloRef}
                    aria-hidden
                    className="hidden pointer-events-none absolute inset-x-[8%] top-[-4%] h-[62%] rounded-full opacity-0 blur-3xl [background:radial-gradient(50%_50%_at_50%_50%,rgba(223,15,87,0.34),transparent_70%)]"
                  />
                  <div
                    ref={revealRef}
                    className="relative h-full w-full md:w-[600px] [mask-image:linear-gradient(to_bottom,#000_92%,transparent_100%)]"
                  >
                    <Image
                      src="/images/joyce-native-full.png"
                      alt="Joyce Wadawasina"
                      fill
                      sizes="(max-width: 1023px) 78vw, 44vw"
                      className="object-contain object-bottom"
                      priority={false}
                    />
                  </div>
                  {/* Shadow where she meets the card, so she reads as standing
                      in front of it rather than pasted onto it. */}
                  <div
                    ref={standRef}
                    aria-hidden
                    className="hidden pointer-events-none absolute inset-x-[12%] bottom-[-1%] h-10 rounded-[50%] opacity-0 blur-md [background:radial-gradient(50%_50%_at_50%_50%,rgba(0,0,0,0.55),transparent_72%)]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
