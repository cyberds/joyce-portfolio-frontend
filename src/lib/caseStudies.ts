import data from "@/data/caseStudies.json";

/**
 * The list of case studies, for everything that links to one: the landing-page
 * carousel, the index and the nav. It carries only what a card needs.
 *
 * The write-ups themselves are not data. Each one is a hand-built page at
 * `src/app/case-studies/<slug>/page.tsx`, so a new study needs both an entry
 * here and a page in a folder named after its `slug`.
 */
export type CaseStudy = {
  /** Must match the page's folder name under `app/case-studies/`. */
  slug: string;
  /** Short line on the carousel card. Keep it to one clause. */
  cardHeading: string;
  client: string;
  /** Hex, used for the card wash and the nav dot. */
  accent: string;
};

export const caseStudies = (data as { caseStudies: CaseStudy[] }).caseStudies;
