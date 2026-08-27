"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { easeCurve } from "@/design/tokens";

/**
 * The single entrance used site-wide: a short rise, once, when the element is
 * genuinely on screen. One motion signature everywhere is what stops a page
 * feeling assembled from parts.
 */
export function Reveal({
  children,
  delay = 0,
  y = 18,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "li" | "span" | "p";
}) {
  const Tag = motion[as];
  return (
    <Tag
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.75, delay, ease: easeCurve }}
      className={className}
    >
      {children}
    </Tag>
  );
}
