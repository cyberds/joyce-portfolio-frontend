"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowDownIcon, ArrowRightIcon } from "@/components/ui/icons";
import { easeCurve } from "@/design/tokens";

const rise = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.85, delay: 0.15 + i * 0.1, ease: easeCurve },
  }),
};

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const portraitY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 90]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -40]);

  return (
    <section
      id="top"
      ref={ref}
      className="relative z-10 mx-auto flex min-h-[100svh] w-[min(1200px,94vw)] flex-col justify-end pt-28 pb-8 md:pb-10"
    >
      <div className="grid items-end gap-10 md:grid-cols-[1.02fr_0.98fr] md:gap-6">
        <motion.div style={{ y: copyY }} className="max-w-[34rem] pb-4 md:pb-16">
          <motion.p
            custom={0}
            variants={rise}
            initial="hidden"
            animate="show"
            className="eyebrow flex items-center gap-3 text-ink-faint"
          >
            <span className="h-px w-8 bg-ink-faint/60" aria-hidden />
            AI &amp; automation, explained simply
          </motion.p>

          <motion.h1
            custom={1}
            variants={rise}
            initial="hidden"
            animate="show"
            style={{ fontWeight: "bolder" }}
            className="display mt-6 max-w-[16ch] text-balance text-[clamp(2.5rem,5vw,3.9rem)] text-ink"
          >
            Your business is growing.{" "}
            Your workload{" "}
            <em className="italic">
              <span className="marked">doesn&rsquo;t have to</span>
            </em>{" "}
            grow with it.
          </motion.h1>

          <motion.p
            custom={2}
            variants={rise}
            initial="hidden"
            animate="show"
            className="mt-6 max-w-[29rem] text-[1.02rem] leading-[1.7] text-ink-muted"
          >
            If you&rsquo;re spending too much time on admin, chasing emails,
            following up with clients or doing things you know shouldn&rsquo;t
            take this much effort — there may be a simpler way.{" "}
            <span className="text-ink">I help you find it.</span>
          </motion.p>

          <motion.div
            custom={3}
            variants={rise}
            initial="hidden"
            animate="show"
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <a
              href="#help"
              className="group flex items-center gap-2 rounded-[var(--r-pill)] bg-ink px-6 py-3.5 text-[0.92rem] font-medium text-surface transition-transform duration-300 hover:-translate-y-0.5"
            >
              See what we can help with
              <ArrowRightIcon className="transition-transform duration-300 group-hover:translate-x-1" />
            </a>
            <a
              href="#talk"
              className="rounded-[var(--r-pill)] border border-ink/15 bg-surface/60 px-6 py-3.5 text-[0.92rem] font-medium text-ink transition-colors duration-300 hover:border-ink/35"
            >
              Talk to Joyce
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          style={{ y: portraitY }}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.2, ease: easeCurve }}
          className="relative mx-auto w-[min(26rem,88%)] md:mr-0"
        >
          <div
            aria-hidden
            className="absolute inset-x-[-12%] bottom-[6%] top-[4%] rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,rgba(193,48,28,0.14),transparent_70%)]"
          />
          <div className="relative aspect-[3/4] [mask-image:linear-gradient(to_bottom,#000_72%,transparent_99%)]">
            <Image
              src="/images/joyce-hero.png"
              alt="Joyce Wadawasina"
              fill
              priority
              sizes="(max-width: 768px) 88vw, 26rem"
              className="object-contain object-bottom"
            />
          </div>

          <motion.figure
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9, ease: easeCurve }}
            className="glass-strong glass absolute -left-4 bottom-[8%] max-w-[15rem] rounded-[var(--r-lg)] px-5 py-4 md:-left-20"
          >
            <figcaption className="eyebrow text-ink-faint">Usually first to reply</figcaption>
            <p className="mt-2 text-[0.9rem] leading-[1.55] text-ink">
              &ldquo;Tell me what&rsquo;s taking too long. That&rsquo;s where we
              start.&rdquo;
            </p>
          </motion.figure>
        </motion.div>
      </div>

      <motion.a
        href="#familiar"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3, duration: 0.7 }}
        className="mt-8 flex items-center gap-2.5 text-[0.8rem] text-ink-faint transition-colors hover:text-ink"
      >
        <span className="flex size-8 items-center justify-center rounded-full border border-ink/12">
          <ArrowDownIcon />
        </span>
        Does any of this sound familiar?
      </motion.a>
    </section>
  );
}
