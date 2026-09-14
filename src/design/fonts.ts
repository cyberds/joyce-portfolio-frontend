import { Playfair_Display, Fraunces } from "next/font/google";

/**
 * Two serif voices for a quieter, more luxurious feel: Playfair Display for
 * headings and Fraunces for running text. next/font needs literal options, so
 * the loaders live here and globals.css maps them onto Tailwind's font
 * utilities.
 */
export const displayFont = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

export const bodyFont = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-body",
  display: "swap",
});

export const fontClassNames = `${displayFont.variable} ${bodyFont.variable}`;
