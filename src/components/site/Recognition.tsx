"use client";

import { Reveal } from "@/components/ui/Reveal";
import { QuoteIcon } from "@/components/ui/icons";

const moments = [
  {
    said: "I'll reply to that later\u2026",
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

export function Recognition() {
  return (
    <section
      id="familiar"
      className="relative z-10 mx-auto w-[min(1200px,94vw)] py-28 md:py-40"
    >
      <div className="max-w-[42rem]">
        <Reveal>
          <p className="eyebrow flex items-center gap-3 text-ink-faint">
            <span className="h-px w-8 bg-ink-faint/60" aria-hidden />
            Sound familiar?
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="display mt-6 text-[clamp(2.1rem,4.4vw,3.4rem)] text-ink">
            Does any of this sound like{" "}
            <em className="italic">a normal week</em> for you?
          </h2>
        </Reveal>
      </div>

      <ul className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {moments.map((moment, i) => (
          <Reveal
            as="li"
            key={moment.said}
            delay={(i % 3) * 0.09}
            className={`group relative flex flex-col rounded-[var(--r-lg)] border p-7 transition-all duration-500 hover:-translate-y-1 ${
              moment.answer
                ? "border-transparent bg-ink text-surface"
                : "border-hairline bg-surface/70 hover:border-ink/15 hover:bg-surface"
            } ${i % 3 === 1 ? "lg:translate-y-8" : ""} ${
              i % 3 === 2 ? "lg:translate-y-16" : ""
            }`}
          >
            <QuoteIcon
              className={moment.answer ? "text-surface/35" : "text-accent/35"}
            />
            <p
              className={`display mt-4 text-[1.55rem] leading-[1.2] ${
                moment.answer ? "text-surface" : "text-ink"
              }`}
            >
              {moment.said}
            </p>
            <p
              className={`mt-4 text-[0.92rem] leading-[1.65] ${
                moment.answer ? "text-surface/70" : "text-ink-muted"
              }`}
            >
              {moment.then}
            </p>
          </Reveal>
        ))}
      </ul>

      <Reveal delay={0.1}>
        <p className="mx-auto mt-24 max-w-[46rem] text-center text-[clamp(1.25rem,2.4vw,1.75rem)] leading-[1.5] text-ink lg:mt-36">
          You don&rsquo;t necessarily need more people or more software.
          Sometimes you just need a better way of{" "}
          <em className="display italic">connecting what you already have</em>.
        </p>
      </Reveal>
    </section>
  );
}
