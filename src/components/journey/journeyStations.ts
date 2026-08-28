/**
 * The journey: one enquiry, followed all the way through a connected pipeline.
 * Six stations, each represented by a point on the pipeline, a fluid color,
 * an icon, and a fly-in 2.5D card.
 */
export type Station = {
  id: string;
  index: string;
  tag: string;
  title: string;
  before: string;
  after: string;
  color: string;
  glowColor: string;
  icon: "mail" | "send" | "calendar" | "database" | "sync" | "chart";
};

export const stations: Station[] = [
  {
    id: "enquiry",
    index: "01",
    tag: "Capture",
    title: "Someone gets in touch at 11pm",
    before: "Normally it sits in an inbox until somebody happens to notice it next morning.",
    after:
      "Captured the instant it lands — from your website, inbox or WhatsApp — instantly logged into the pipeline without human delay.",
    color: "#f59e0b", // Amber / Tangerine
    glowColor: "rgba(245, 158, 11, 0.4)",
    icon: "mail",
  },
  {
    id: "reply",
    index: "02",
    tag: "Acknowledge",
    title: "They hear back straight away",
    before: "Normally you reply when you get a quiet ten minutes. Sometimes hours or days late.",
    after:
      "A warm, bespoke reply goes out in your exact tone of voice with the next step attached while they are hot.",
    color: "#df0f57", // Raspberry Accent
    glowColor: "rgba(223, 15, 87, 0.4)",
    icon: "send",
  },
  {
    id: "booking",
    index: "03",
    tag: "Calendar Sync",
    title: "The meeting arranges itself",
    before: "Normally that's six back-and-forth emails negotiating which Tuesday works.",
    after:
      "They choose a slot that already fits your live diary. Booked in both calendars before you even open your phone.",
    color: "#a855f7", // Electric Violet
    glowColor: "rgba(168, 85, 247, 0.4)",
    icon: "calendar",
  },
  {
    id: "record",
    index: "04",
    tag: "Unified CRM",
    title: "Everything lands in one place",
    before: "Normally it's fragmented across WhatsApp threads, email tabs, and a scattered folder.",
    after:
      "Their company info, interaction logs, and requirements sync into one unified dossier ready before your call.",
    color: "#06b6d4", // Electric Cyan
    glowColor: "rgba(6, 182, 212, 0.4)",
    icon: "database",
  },
  {
    id: "followup",
    index: "05",
    tag: "Automated Nurture",
    title: "The follow-up actually happens",
    before: "Normally leads go silent and nobody has the bandwidth to chase them consistently.",
    after:
      "Quotes, check-ins, and reminders trigger like clockwork, automatically pausing the moment a reply arrives.",
    color: "#10b981", // Emerald / Apple
    glowColor: "rgba(16, 185, 129, 0.4)",
    icon: "sync",
  },
  {
    id: "clarity",
    index: "06",
    tag: "Executive Clarity",
    title: "You can see how the week went",
    before: "Normally you operate purely on gut feeling, and the feeling is always 'overwhelmed'.",
    after:
      "Friday wrap-up: volume captured, revenue closed, bottlenecks cleared. One visual dashboard, zero spreadsheets.",
    color: "#eab308", // Lemon Gold
    glowColor: "rgba(234, 179, 8, 0.4)",
    icon: "chart",
  },
];
