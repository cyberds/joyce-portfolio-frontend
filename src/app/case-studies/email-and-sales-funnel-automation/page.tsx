import type { Metadata } from "next";
import { Reveal } from "@/components/ui/Reveal";
import { QuoteIcon } from "@/components/ui/icons";
import { VideoEmbed } from "@/components/casestudies/VideoEmbed";
import { StudyCta } from "@/components/casestudies/StudyCta";
import {
  BuiltWith,
  StudyHeader,
  StudyShell,
} from "@/components/casestudies/StudyShell";

const ACCENT = "#9c5f70";
const TITLE = "From 50 contacts in Gmail to an automated sales funnel";
const SUMMARY =
  "Kathy was sending every email by hand to 50+ contacts in Gmail, with no list and no system for growth. We built the funnel that grew the list four times over in nine months.";

export const metadata: Metadata = {
  title: `${TITLE} — Kathy | Joyce Wadawasina`,
  description: SUMMARY,
  openGraph: {
    title: `${TITLE} — Kathy`,
    description: SUMMARY,
    type: "article",
  },
};

/** A margin label on the left, the substance on the right. */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Reveal>
      <section className="grid gap-4 border-t border-hairline py-10 md:grid-cols-[12rem_minmax(0,1fr)] md:gap-10">
        <h2 className="display text-[1.35rem] leading-tight text-ink">{label}</h2>
        <div>{children}</div>
      </section>
    </Reveal>
  );
}

/** Kathy's own words lead; the write-up follows as a labelled ledger. */
export default function EmailAndSalesFunnelAutomation() {
  return (
    <StudyShell slug="email-and-sales-funnel-automation">
      <div className="mx-auto max-w-[56rem]">
        <StudyHeader
          client="Kathy"
          title={TITLE}
          summary={SUMMARY}
          accent={ACCENT}
          className="max-w-[46rem]"
        />

        <Reveal delay={0.1}>
          <figure
            className="mt-12 rounded-[var(--r-lg)] border p-8 md:p-12"
            style={{ borderColor: `${ACCENT}33`, backgroundColor: `${ACCENT}0d` }}
          >
            <span style={{ color: ACCENT }}>
              <QuoteIcon />
            </span>
            <blockquote className="display mt-5 text-[clamp(1.3rem,2.6vw,1.9rem)] leading-[1.35] text-ink">
              Joyce transformed my email strategy and elevated my business in
              just nine months. She has an intuitive talent for crafting emails
              that authentically capture my voice, making every message feel
              personal and professional.
            </blockquote>
            <figcaption className="mt-6 text-[0.88rem] text-ink-muted">
              <span className="text-ink">Kathy Mela</span> — Leadership Coach, USA
            </figcaption>
          </figure>
        </Reveal>

        <div className="mt-14">
          <Row label="The problem">
            <p className="text-[1.05rem] leading-[1.8] text-ink-muted">
              Manually sending emails to 50+ contacts on Gmail, with no email
              list and no system for growth. Every message was a fresh piece of
              work, and nothing compounded.
            </p>
          </Row>

          <Row label="How it was fixed">
            <dl className="space-y-7">
              <div>
                <dt className="text-[1.05rem] font-medium text-ink">
                  A funnel with something to give
                </dt>
                <dd className="mt-1.5 text-[1rem] leading-[1.75] text-ink-muted">
                  An automated sales funnel built around lead magnets and
                  nurturing sequences, so a new subscriber is welcomed and
                  warmed without anyone pressing send.
                </dd>
              </div>
              <div>
                <dt className="text-[1.05rem] font-medium text-ink">
                  A weekly rhythm that holds
                </dt>
                <dd className="mt-1.5 text-[1rem] leading-[1.75] text-ink-muted">
                  Weekly newsletters and workflows set up to engage new
                  subscribers from the moment they arrive.
                </dd>
              </div>
              <div>
                <dt className="text-[1.05rem] font-medium text-ink">
                  Follow-ups off the to-do list
                </dt>
                <dd className="mt-1.5 text-[1rem] leading-[1.75] text-ink-muted">
                  Manual follow-ups were removed entirely, so client engagement
                  got faster rather than more effortful.
                </dd>
              </div>
            </dl>
          </Row>

          <Row label="The benefits">
            <p className="text-[1.05rem] leading-[1.8] text-ink-muted">
              The email list grew four times over in nine months, engagement
              stayed consistent through the newsletters, and conversions rose
              for both the workshops and the coaching programmes.
            </p>
            <div className="mt-8">
              <VideoEmbed
                url="https://drive.google.com/file/d/1Idf_xZDAIs0dQIH7oPVFG0KN2KIQIad2/view"
                accent={ACCENT}
                label="Hear from Kathy"
              />
            </div>
          </Row>
        </div>

        <BuiltWith
          tools={["Mailchimp", "ActiveCampaign", "GoHighLevel", "Zapier"]}
        />

        <Reveal>
          <StudyCta accent={ACCENT} />
        </Reveal>
      </div>
    </StudyShell>
  );
}
