import data from "@/data/caseStudies.json";

/**
 * One source for both the carousel on the landing page and the detail pages.
 * Add a study to `src/data/caseStudies.json` and both follow — the card reads
 * the top handful of fields, the detail page reads the rest.
 *
 * Everything optional is genuinely optional: a study with no video, no
 * screenshots, no quote and no sub-projects renders as a clean single column.
 */

export type ApproachStep = { title: string; body: string };

export type Screenshot = {
  src: string;
  alt: string;
  caption?: string | null;
};

/**
 * Some engagements covered two separate builds under one theme (the calendar
 * work, for instance). Rather than splitting them into two thin pages, the
 * study carries its own challenge/approach/outcome per sub-project.
 */
export type SubProject = {
  label: string;
  title: string;
  client: string;
  challenge: string;
  approach: ApproachStep[];
  outcome: string;
};

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
  /** Runtime of the demo, shown on the play button. Omit if unknown. */
  duration?: string | null;
  /** Loom / YouTube / Google Drive / Cloudinary — see `lib/video.ts`. */
  demoVideo?: string | null;
  testimonialVideo?: string | null;
  /** Still used as the card art and as the demo player's facade image. */
  poster?: string | null;
  services: string[];
  summary: string;
  /** The warm, second-person opener some studies lead with. */
  intro?: string | null;
  metrics: { value: string; label: string }[];
  challenge?: string | null;
  approach: ApproachStep[];
  stack: string[];
  outcome?: string | null;
  /** The closing "why this matters for you" paragraph, ahead of the CTA. */
  whyItMatters?: string | null;
  screenshots: Screenshot[];
  subProjects: SubProject[];
  quote?: { text: string; name: string; role: string } | null;
};

export const caseStudies = (data as { caseStudies: CaseStudy[] }).caseStudies;

export const getCaseStudy = (slug: string) =>
  caseStudies.find((study) => study.slug === slug);

export const caseStudySlugs = caseStudies.map((study) => study.slug);
