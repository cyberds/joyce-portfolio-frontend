import { Poiret_One, Montserrat } from "next/font/google";

/**
 * Two voices, deliberately: a thin art-deco geometric display face for the
 * things Joyce would actually say out loud, and Montserrat for everything
 * structural. next/font needs literal options, so the loaders live here and
 * globals.css maps them onto Tailwind's font utilities.
 *
 * Poiret One ships a single 400 weight with no true italic — `.display.italic`
 * renders as a synthetic oblique, which is the intended treatment here.
 */
export const displayFont = Poiret_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

export const bodyFont = Montserrat({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const fontClassNames = `${displayFont.variable} ${bodyFont.variable}`;
