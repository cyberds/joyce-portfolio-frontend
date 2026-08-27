"use client";

import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";

const prompts = [
  "what’s frustrating you",
  "what’s taking too long",
  "what your team keeps doing manually",
  "what you wish would simply happen without someone having to remember it",
];

const grounding = [
  { value: "10+", label: "years across business operations" },
  { value: "5", label: "disciplines: ops, procurement, projects, service, marketing" },
  { value: "1", label: "person you speak to, start to finish" },
];

export function MeetJoyce() {
  return (
    <section
      id="joyce"
      className="relative z-10 mx-auto w-[min(1200px,94vw)] py-28 md:py-36"
    >
      <div className="grid items-center gap-14 lg:grid-cols-[0.92fr_1.08fr] lg:gap-20">
        <Reveal className="relative">
          <div className="relative">
            <div
              aria-hidden
              className="absolute inset-[-6%] rounded-[var(--r-xl)] bg-[radial-gradient(60%_60%_at_50%_45%,rgba(193,48,28,0.12),transparent_72%)]"
            />
            <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--r-xl)] border border-hairline bg-[linear-gradient(180deg,#ffffff,var(--c-canvas-deep))]">
              <Image
                src="/images/joyce-thinking.png"
                alt="Joyce Wadawasina"
                fill
                sizes="(max-width: 1024px) 90vw, 30rem"
                className="object-cover object-top"
              />
            </div>
            <div className="glass glass-strong absolute -bottom-7 -right-4 max-w-[13rem] rounded-[var(--r-lg)] px-5 py-4 md:-right-10">
              <p className="eyebrow text-ink-faint">Hi, I&rsquo;m Joyce</p>
              <p className="mt-1.5 text-[0.9rem] leading-[1.5] text-ink">
                Usually the person you&rsquo;ll speak to first.
              </p>
            </div>
          </div>
        </Reveal>

        <div className="max-w-[36rem]">
          <Reveal>
            <p className="eyebrow flex items-center gap-3 text-ink-faint">
              <span className="h-px w-8 bg-ink-faint/60" aria-hidden />
              About
            </p>
          </Reveal>

          <Reveal delay={0.06}>
            <h2 className="display mt-6 text-[clamp(2.1rem,4.4vw,3.3rem)] text-ink">
              You don&rsquo;t need to arrive knowing{" "}
              <em className="italic">what should be automated</em>.
            </h2>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="mt-7 text-[1.02rem] leading-[1.75] text-ink-muted">
              Not which AI tool you need, not exactly what&rsquo;s wrong with
              your process. Just tell me:
            </p>
          </Reveal>

          <ul className="mt-6 space-y-3">
            {prompts.map((prompt, i) => (
              <Reveal as="li" key={prompt} delay={0.16 + i * 0.07}>
                <span className="flex gap-3 text-[1.02rem] leading-[1.6] text-ink">
                  <span
                    aria-hidden
                    className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                  />
                  {prompt}
                </span>
              </Reveal>
            ))}
          </ul>

          <Reveal delay={0.42}>
            <p className="mt-7 text-[1.02rem] leading-[1.75] text-ink-muted">
              That&rsquo;s where we start. With over ten years across business
              operations, procurement and supply chain, project coordination,
              customer service and marketing, I understand that the technology
              is only one part of the picture. My role is to understand what
              you&rsquo;re trying to achieve, make the technology feel less
              complicated, and coordinate the right solution with my team.
            </p>
          </Reveal>

          <Reveal delay={0.48}>
            <p className="mt-7 text-[1.15rem] leading-[1.6] text-ink">
              <span className="marked">You bring the business problem.</span>{" "}
              We&rsquo;ll help you work out the rest.
            </p>
          </Reveal>

          <Reveal delay={0.54}>
            <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-hairline pt-7">
              {grounding.map((item) => (
                <div key={item.label}>
                  <dt className="display text-[2rem] leading-none text-ink">
                    {item.value}
                  </dt>
                  <dd className="mt-2 text-[0.78rem] leading-[1.45] text-ink-faint">
                    {item.label}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
