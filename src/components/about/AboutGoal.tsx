"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const DIM = "rgba(143,174,161,0.32)";
const WHITE = "#f5faf7";
const ACCENT = "#df0f57";

const lines: { text: string; accent?: boolean }[] = [
  { text: "Free up the schedule. Kill the repetitive work. Put the hours back into" },
  { text: "what actually moves the needle", accent: true },
  { text: "." },
];

/** Letters in their own spans, grouped per word so lines still wrap on words. */
function Lyric() {
  return (
    <>
      {lines.map((line, li) => (
        <span key={li} className={line.accent ? "italic" : undefined}>
          {line.text.split(" ").map((word, wi, words) => (
            <span key={wi} className="inline-block whitespace-nowrap">
              {[...word].map((ch, ci) => (
                <span
                  key={ci}
                  className="goal-char"
                  data-to={line.accent ? ACCENT : WHITE}
                  style={{ color: DIM }}
                >
                  {ch}
                </span>
              ))}
              {wi < words.length - 1 || li === 0 ? " " : ""}
            </span>
          ))}
        </span>
      ))}
    </>
  );
}

const rows = [
  { label: "New enquiry — Harper & Co.", status: "Replied", tone: "bg-emerald-400" },
  { label: "Invoice #1042 overdue", status: "Chased", tone: "bg-amber-400" },
  { label: "Discovery call request", status: "Booked", tone: "bg-sky-400" },
  { label: "Weekly ops report", status: "Sent", tone: "bg-fuchsia-400" },
];

/** A small, believable automation dashboard — decoration, not a screenshot. */
function Mockup() {
  return (
    <div className="w-[28rem] h-[27rem] overflow-hidden rounded-[14px] border border-white/15 bg-[#0f1714]/95 text-left shadow-[0_40px_80px_-30px_rgba(0,0,0,0.7)] backdrop-blur-xl">
      <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-3">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-3 text-[0.7rem] text-white/45">Automations · Today</span>
      </div>
      <div className="grid grid-cols-3 gap-2 px-4 pt-4">
        {[
          ["38", "Tasks run"],
          ["6.5h", "Saved"],
          ["0", "Missed"],
        ].map(([v, l]) => (
          <div key={l} className="rounded-[10px] bg-white/[0.06] px-3 py-2.5">
            <p className="text-[1.05rem] font-medium leading-none text-white">{v}</p>
            <p className="mt-1 text-[0.62rem] text-white/45">{l}</p>
          </div>
        ))}
      </div>
      <ul className="space-y-1.5 p-4">
        {rows.map((row) => (
          <li key={row.label} className="flex items-center gap-3 rounded-[10px] bg-white/[0.04] px-3 py-2.5">
            <span className={`size-1.5 shrink-0 rounded-full ${row.tone}`} />
            <span className="flex-1 truncate text-[0.74rem] text-white/80">{row.label}</span>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[0.62rem] text-white/70">{row.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AboutGoal() {
  const reduced = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const chars = gsap.utils.toArray<HTMLElement>(".goal-char", section);

    if (reduced) {
      chars.forEach((c) => (c.style.color = c.dataset.to ?? WHITE));
      return;
    }

    const ctx = gsap.context(() => {
      // Karaoke: each letter lights up in turn, tied to the scrollbar.
      gsap.to(chars, {
        color: (_i: number, el: HTMLElement) => el.dataset.to ?? WHITE,
        ease: "none",
        stagger: 0.05,
        scrollTrigger: {
          trigger: section.querySelector(".goal-lyric"),
          start: "top 80%",
          end: "bottom 35%",
          scrub: 0.4,
        },
      });

      gsap.fromTo(
        section.querySelector(".goal-mockup"),
        { y: 80, rotate: 10, autoAlpha: 0 },
        {
          y: 0,
          rotate: 4,
          autoAlpha: 1,
          ease: "none",
          scrollTrigger: { trigger: section, start: "top 90%", end: "top 35%", scrub: 0.6 },
        },
      );
    }, section);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={sectionRef} className="relative z-10 mx-auto mt-28 shell md:mt-40">
      <div className="relative rounded-[var(--r-xl)] bg-deep text-deep-ink">
        {/* Decoration clipped to the card; the mockup is not. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
          <div className="absolute inset-0 bg-[radial-gradient(70%_90%_at_80%_20%,rgba(223,15,87,0.26),transparent_62%)]" />
          <div className="absolute inset-0 opacity-[0.14] [background-image:linear-gradient(to_right,rgba(243,239,233,0.5)_1px,transparent_1px),linear-gradient(to_bottom,rgba(243,239,233,0.5)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(80%_70%_at_30%_40%,#000,transparent_75%)]" />
        </div>

        <div className="relative grid gap-12 p-9 md:grid-cols-[1.15fr_0.85fr] md:p-14 lg:p-16">
          <div className="max-w-[34rem]">
            <p className="eyebrow text-deep-muted">The goal</p>
            <p className="goal-lyric display mt-6 text-[clamp(1.7rem,3.4vw,2.6rem)] leading-[1.25]">
              <Lyric />
            </p>
          </div>

          {/* The mockup breaks out past the card's top and right edges. */}
          <div className="relative hidden md:block">
            <div className="goal-mockup absolute -right-10 -top-32 lg:-right-16 lg:-top-40">
              <Mockup />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
