"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LocationIcon } from "@/components/ui/icons";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const credentials = [
  { value: "MSc", label: "Logistics & Supply Chain Management" },
  { value: "BSc", label: "Business Administration" },
  { value: "10+", label: "Years in business operations" },
  { value: "4", label: "Years of executive support" },
];

function Words({ text, wordClass = "" }: { text: string; wordClass?: string }) {
  return (
    <>
      {text.split(" ").map((word, i) => (
        <span key={`${word}-${i}`} className="inline-block overflow-hidden pb-[0.12em] align-bottom">
          <span className={`ah-word inline-block ${wordClass}`}>{word}&nbsp;</span>
        </span>
      ))}
    </>
  );
}

export function AboutHero() {
  const reduced = usePrefersReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || reduced) return;

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(hero);

      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.fromTo(q(".ah-photo"), { scale: 1.12, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 2.2, ease: "power2.out" }, 0)
        .fromTo(q(".ah-word"), { yPercent: 120, rotate: 6 }, { yPercent: 0, rotate: 0, duration: 1.1, stagger: 0.06 }, 0.3)
        .fromTo(
          q(".ah-mark"),
          { backgroundSize: "0% 0.3em" },
          { backgroundSize: "100% 0.3em", duration: 0.9, ease: "power2.inOut" },
          1.1,
        )
        .fromTo(
          q(".ah-fade"),
          { autoAlpha: 0, y: 24, filter: "blur(8px)" },
          { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 1, stagger: 0.12 },
          0.9,
        )
        .fromTo(
          q(".ah-strip"),
          { autoAlpha: 0, y: 40 },
          { autoAlpha: 1, y: 0, duration: 1, ease: "expo.out" },
          1.3,
        );

      // Failsafe so a stalled frame loop can never leave the copy hidden.
      const failsafe = window.setTimeout(() => {
        if (tl.progress() < 1) tl.progress(1);
      }, 4500);

      // The light: one small point travelling the strip's border, driven by
      // scroll position across the whole page.
      gsap.fromTo(
        ringRef.current,
        { "--ring": "0deg" },
        {
          "--ring": "720deg",
          ease: "none",
          scrollTrigger: {
            trigger: document.body,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
          },
        },
      );

      return () => window.clearTimeout(failsafe);
    }, hero);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={heroRef} className="dark-zone relative h-[100svh] min-h-[34rem] bg-black text-white">
      {/* Photo + overlay, clipped to the hero; the strip below is not. */}
      <div aria-hidden className="absolute inset-0 overflow-hidden">
        <div className="ah-photo absolute inset-0 bg-[url('/images/about-hero.jfif')] bg-fixed bg-cover bg-bottom bg-no-repeat">
        </div>
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 [background:radial-gradient(60%_55%_at_50%_45%,rgba(0, 0, 0, 0.56),transparent_70%),linear-gradient(180deg,rgba(0, 0, 0, 0.7)_0%,transparent_30%,transparent_65%,rgba(0, 0, 0, 0.59)_100%)]" />
      </div>

      <div className="relative z-10 mx-auto flex h-full shell flex-col items-center justify-center pt-16 text-center">
        <h1 className="display max-w-[80%] text-balance text-[clamp(2.4rem,min(5.4vw,8svh),4.6rem)] leading-[1.05] text-white">
          <Words text="I spent ten years doing the work." />{" "}
          <em className="italic">
            <Words text="Now I help businesses do it better." wordClass="ah-mark hero-mark marked" />
          </em>
        </h1>
        <p className="ah-fade mt-7 max-w-[36rem] text-[clamp(0.95rem,2.1svh,1.08rem)] leading-[1.75] text-white/70">
          I&rsquo;m Joyce Wadawasina — an automation and AI consultant based in
          Falkirk, Scotland. With my team, I help companies and business owners
          work more efficiently, reduce repetitive workload and adopt AI safely,
          so their hours go into the things that actually move the business.
        </p>
        <p className="ah-fade mt-5 flex items-center gap-2.5 text-[0.88rem] text-white/55">
          <LocationIcon className="shrink-0 text-accent" />
          Falkirk, Scotland, United Kingdom
        </p>
      </div>

      {/* Credentials: compact, half over the hero's bottom edge. */}
      <div className="absolute bottom-0 left-1/2 z-20 w-[min(56rem,calc(100%-2*var(--shell-gutter)))] -translate-x-1/2 translate-y-1/2">
        <div className="ah-strip relative">
          {/* Travelling light: a narrow bright wedge of a conic gradient,
              masked to a 1px ring, with a blurred twin for the glow. */}
          <div
            ref={ringRef}
            aria-hidden
            className="pointer-events-none absolute -inset-px rounded-[15px] [--ring:0deg]"
          >
            <div className="absolute inset-0 rounded-[inherit] p-px [background:conic-gradient(from_var(--ring),transparent_0deg,transparent_330deg,rgba(223,15,87,0.9)_348deg,#fff_355deg,transparent_360deg)] [mask:linear-gradient(#000_0_0)_content-box_exclude,linear-gradient(#000_0_0)]" />
            <div className="absolute -inset-1 rounded-[18px] opacity-80 blur-md [background:conic-gradient(from_var(--ring),transparent_0deg,transparent_335deg,rgba(223,15,87,0.7)_350deg,transparent_360deg)] [mask:linear-gradient(#000_0_0)_content-box_exclude,linear-gradient(#000_0_0)] p-1.5" />
          </div>

          <ul className="relative grid grid-cols-2 overflow-hidden rounded-[14px] border border-black/10 bg-white text-left shadow-[0_24px_60px_-30px_rgba(0,0,0,0.45)] md:grid-cols-4">
            {credentials.map((item, i) => (
              <li
                key={item.label}
                className={`px-5 py-4 ${i > 0 ? "md:border-l md:border-black/10" : ""} ${i % 2 === 1 ? "border-l border-black/10" : ""} ${i > 1 ? "border-t border-black/10 md:border-t-0" : ""}`}
              >
                <p className="display text-[1.4rem] leading-none text-ink">{item.value}</p>
                <p className="mt-1.5 text-[0.76rem] leading-[1.35] text-ink-muted">{item.label}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
