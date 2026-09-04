import { JourneyChapter } from "./JourneyChapter";
import { JourneyStack } from "./JourneyStack";

/**
 * A/B switch for the journey section on the landing page.
 *
 * `NEXT_PUBLIC_JOURNEY_VARIANT` picks the arm:
 *   "roadmap"  (default) — the pinned pipeline the camera travels down
 *   "cascade"            — the deck of horizontal cards that stacks on scroll
 *
 * The variable is read as a literal rather than through a helper so Next can
 * inline it at build time. Anything unrecognised falls back to the roadmap, so
 * a typo in the environment degrades to the shipped experience rather than to
 * a blank section.
 */
export type JourneyVariant = "roadmap" | "cascade";

export const journeyVariant: JourneyVariant =
  process.env.NEXT_PUBLIC_JOURNEY_VARIANT === "cascade" ? "cascade" : "roadmap";

export function JourneySection() {
  return journeyVariant === "cascade" ? <JourneyStack /> : <JourneyChapter />;
}
