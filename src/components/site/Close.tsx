"use client";

import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowRightIcon } from "@/components/ui/icons";

const openers = [
  "“Our bookings are a mess.”",
  "“We keep losing enquiries.”",
  "“I do the same admin every Monday.”",
];

export function Close() {
  return (
    <section
      id="talk"
      className="relative z-10 mx-auto w-[min(1200px,94vw)] pb-24 md:pb-32"
    >
      <Reveal>
        <div className="dark-zone relative overflow-hidden rounded-[var(--r-xl)] bg-deep text-deep-ink">
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(70%_90%_at_82%_75%,rgba(193,48,28,0.28),transparent_65%)]"
          />
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.16] [background-image:linear-gradient(to_right,rgba(243,239,233,0.5)_1px,transparent_1px),linear-gradient(to_bottom,rgba(243,239,233,0.5)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(80%_70%_at_30%_40%,#000,transparent_75%)]"
          />

          <div className="relative grid items-end gap-10 p-9 md:grid-cols-[1.15fr_0.85fr] md:p-14 lg:p-16">
            <div className="max-w-[32rem] pb-4">

              <h2 className="display mt-6 text-[clamp(2.2rem,4.6vw,3.5rem)]">
                Start with a sentence.
                <br />
                <em className="italic text-accent">Not a brief.</em>
              </h2>

              <p className="mt-6 text-[1.02rem] leading-[1.75] text-deep-muted">
                You don&rsquo;t need a plan, a budget or the right vocabulary.
                Tell me what&rsquo;s taking too long and we&rsquo;ll work out
                together whether there&rsquo;s a simpler way. If there
                isn&rsquo;t, I&rsquo;ll tell you that too.
              </p>

              <ul className="mt-7 flex flex-wrap gap-2">
                {openers.map((opener) => (
                  <li
                    key={opener}
                    className="rounded-[var(--r-pill)] border border-deep-ink/15 px-4 py-2 text-[0.85rem] text-deep-muted"
                  >
                    {opener}
                  </li>
                ))}
              </ul>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <a
                  href="mailto:hello@joycewadawasina.com?subject=Something%20is%20taking%20too%20long"
                  className="group flex items-center gap-2 rounded-[var(--r-pill)] bg-deep-ink px-6 py-3.5 text-[0.92rem] font-medium text-deep transition-transform duration-300 hover:-translate-y-0.5"
                >
                  Send Joyce a sentence
                  <ArrowRightIcon className="transition-transform duration-300 group-hover:translate-x-1" />
                </a>
                <a
                  href="mailto:hello@joycewadawasina.com?subject=Book%20a%20call"
                  className="rounded-[var(--r-pill)] border border-deep-ink/20 px-6 py-3.5 text-[0.92rem] font-medium text-deep-ink transition-colors duration-300 hover:border-deep-ink/50"
                >
                  Book a 20-minute call
                </a>
              </div>
            </div>

            <div className="relative mx-auto w-[min(22rem,80%)] md:mr-0 md:w-full">
              <div className="relative aspect-[4/5] [mask-image:linear-gradient(to_bottom,#000_88%,transparent_100%)]">
                <Image
                  src="/images/joyce-native-sitting.png"
                  alt="Joyce Wadawasina"
                  fill
                  sizes="(max-width: 768px) 80vw, 24rem"
                  className="object-contain object-bottom"
                />
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
