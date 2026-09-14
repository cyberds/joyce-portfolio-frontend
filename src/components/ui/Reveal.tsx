"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { easeCurve } from "@/design/tokens";

/**
 * The single entrance used site-wide, matching the landing page's motion:
 * a rise out of a soft blur as the element arrives, and the same blur back
 * out as it leaves the screen in either direction, so exits mirror entrances.
 */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "li" | "span" | "p";
}) {
  const reduced = useReducedMotion();
  const Tag = motion[as];

  if (reduced) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }

  return (
    <Tag
      initial={{ opacity: 0, y, filter: "blur(12px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: false, amount: 0.2, margin: "0px 0px -6% 0px" }}
      transition={{ duration: 0.9, delay, ease: easeCurve }}
      className={className}
    >
      {children}
    </Tag>
  );
}
