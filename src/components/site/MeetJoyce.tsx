"use client";

import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";

const promptCards = [
  {
    text: "what’s frustrating you",
    rotate: "-rotate-2",
    glow: "hover:shadow-[0_6px_20px_-2px_rgba(223,15,87,0.25)] hover:border-[#df0f57]/60",
    color: "#df0f57",
  },
  {
    text: "what’s taking too long",
    rotate: "rotate-[1.8deg]",
    glow: "hover:shadow-[0_6px_20px_-2px_rgba(245,158,11,0.28)] hover:border-amber-400/70",
    color: "#f59e0b",
  },
  {
    text: "what your team keeps doing manually",
    rotate: "-rotate-[1.5deg]",
    glow: "hover:shadow-[0_6px_20px_-2px_rgba(168,85,247,0.25)] hover:border-purple-400/70",
    color: "#a855f7",
  },
  {
    text: "what you wish would simply happen without someone having to remember it",
    rotate: "rotate-1 mt-1",
    glow: "hover:shadow-[0_6px_20px_-2px_rgba(16,185,129,0.25)] hover:border-emerald-400/70",
    color: "#10b981",
  },
];

const grounding = [
  { value: "10+", label: "years across business operations" },
  { value: "300+", label: "businesses served" },
  { value: "12k", label: "hours of business time saved" },
];

export function MeetJoyce() {
  return (
    <section
      id="joyce"
      className="relative z-10 mx-auto w-[min(1200px,94vw)] py-20 md:py-28"
    >
      <div className="grid items-stretch gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
        {/* Left Side: Joyce Photo */}
        <Reveal className="relative flex flex-col justify-center">
          <div className="relative h-full min-h-[460px] lg:min-h-[580px] w-full">
            <div
              aria-hidden
              className="absolute inset-[-6%] rounded-[var(--r-xl)] bg-[radial-gradient(60%_60%_at_50%_45%,rgba(193,48,28,0.12),transparent_72%)]"
            />
            <div className="relative h-full w-full overflow-hidden rounded-[var(--r-xl)] border border-hairline bg-[linear-gradient(180deg,#ffffff,var(--c-canvas-deep))] shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
              <Image
                src="/images/joyce-thinking.png"
                alt="Joyce Wadawasina"
                fill
                sizes="(max-width: 1024px) 90vw, 30rem"
                className="object-cover object-top"
                priority
              />
            </div>
            <div className="glass glass-strong absolute -bottom-5 -right-3 max-w-[13rem] rounded-[var(--r-lg)] px-5 py-4 md:-right-8 shadow-sm">
              <p className="eyebrow text-ink-faint">Hi, I&rsquo;m Joyce</p>
              <p className="mt-1 text-[0.88rem] leading-[1.45] text-ink">
                Usually the person you&rsquo;ll speak to first.
              </p>
            </div>
          </div>
        </Reveal>

        {/* Right Side: Header + Scrollable Middle Content + Stats (Balanced Height) */}
        <div className="flex flex-col justify-between lg:h-[580px]">
          {/* 1. Fixed Header (Non-scrollable) */}
          <div className="shrink-0 pb-3">

            <Reveal delay={0.06}>
              <h2 className="display mt-3 text-[clamp(1.9rem,3.6vw,2.7rem)] text-ink leading-tight">
                You don&rsquo;t need to arrive knowing{" "}
                <em className="italic">what should be automated</em>.
              </h2>
            </Reveal>
          </div>

          {/* 2. Scrollable Middle Section (Scrollable without visible scrollbar) */}
          <div className="flex-1 overflow-y-auto pr-1 py-2 my-2 space-y-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <Reveal delay={0.12}>
              <p className="text-[0.98rem] leading-[1.65] text-ink-muted">
                Not which AI tool you need, not exactly what&rsquo;s wrong with
                your process. Just tell me:
              </p>
            </Reveal>

            {/* Interactive WhatsApp Callout Cards */}
            <div className="flex flex-wrap gap-2.5 pt-1 pb-2">
              {promptCards.map((card, i) => (
                <Reveal key={card.text} delay={0.16 + i * 0.05}>
                  <a
                    href="https://wa.me/447436836888"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group relative inline-flex items-center gap-2 rounded-2xl border border-stone-200/90 bg-white/95 px-3.5 py-2 text-[0.88rem] leading-snug text-ink shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] transition-all duration-300 ease-out hover:rotate-0 hover:scale-[1.03] cursor-pointer ${card.rotate} ${card.glow}`}
                  >
                    {/* Callout Dot / Indicator */}
                    <span
                      className="size-1.5 shrink-0 rounded-full transition-transform duration-300 group-hover:scale-125"
                      style={{ backgroundColor: card.color }}
                    />
                    <span className="font-normal text-stone-800 transition-colors group-hover:text-stone-950">
                      {card.text}
                    </span>
                    {/* Tiny WhatsApp Hint Glyph on Hover */}
                    <svg
                      className="size-3.5 shrink-0 text-stone-300 opacity-0 -ml-1 transition-all duration-300 group-hover:opacity-100 group-hover:ml-0"
                      style={{ color: card.color }}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M7 17L17 7" />
                      <path d="M7 7h10v10" />
                    </svg>
                  </a>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.34}>
              <p className="text-[0.96rem] leading-[1.65] text-ink-muted">
                That&rsquo;s where we start. With over ten years across business
                operations, procurement and supply chain, project coordination,
                customer service and marketing, I understand that the technology
                is only one part of the picture. My role is to understand what
                you&rsquo;re trying to achieve, make the technology feel less
                complicated, and coordinate the right solution with my team.
              </p>
            </Reveal>

            <Reveal delay={0.4}>
              <p className="text-[1.02rem] leading-[1.55] text-ink">
                <span className="marked">You bring the business problem.</span>{" "}
                We&rsquo;ll help you work out the rest.
              </p>
            </Reveal>
          </div>

          {/* 3. Fixed Stats (Non-scrollable) */}
          <div className="shrink-0 pt-4 border-t border-hairline mt-2">
            <Reveal delay={0.46}>
              <dl className="grid grid-cols-3 gap-4 sm:gap-6">
                {grounding.map((item) => (
                  <div key={item.label}>
                    <dt className="display text-[1.85rem] sm:text-[2.1rem] leading-none text-ink font-medium">
                      {item.value}
                    </dt>
                    <dd className="mt-1.5 text-[0.76rem] sm:text-[0.8rem] leading-[1.4] text-ink-faint">
                      {item.label}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
