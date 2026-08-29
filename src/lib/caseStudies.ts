import data from "@/data/caseStudies.json";

/**
 * One source for both the carousel on the landing page and the detail pages.
 * Add a study to `src/data/caseStudies.json` and both follow — the card reads
 * the top handful of fields, the detail page reads the rest.
 */
export type CaseStudy = {
  slug: string;
  /** Short line on the carousel card. Keep it to one clause. */
  cardHeading: string;
  /** Full title, used on the detail page and in metadata. */
  title: string;
  client: string;
  clientType: string;
  industry: string;
  year: string;
  /** Hex, used for the card wash and detail-page accents. */
  accent: string;
  video: string;
  poster: string;
  duration: string;
  services: string[];
  summary: string;
  metrics: { value: string; label: string }[];
  challenge: string;
  approach: { title: string; body: string }[];
  stack: string[];
  outcome: string;
  quote: { text: string; name: string; role: string };
};

export const caseStudies = (data as { caseStudies: CaseStudy[] }).caseStudies;

export const getCaseStudy = (slug: string) =>
  caseStudies.find((study) => study.slug === slug);

export const caseStudySlugs = caseStudies.map((study) => study.slug);
