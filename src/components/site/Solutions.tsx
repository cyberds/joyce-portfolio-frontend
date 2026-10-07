import Image from "next/image";
import { ArrowRightIcon } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/Reveal";

/** Unsplash serves the crop itself, so these skip the Next image optimiser. */
const photo = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=640&h=640&q=75`;

const solutions = [
  {
    title: "Welcoming New Clients",
    lead: "Still sending forms, contracts, welcome emails and setting everything up one client at a time?",
    body: "We can connect the steps so your onboarding runs smoothly from the moment a client says yes.",
    link: "Client onboarding automation",
    image: photo("photo-1686771416282-3888ddaf249b"),
    alt: "Two people shaking hands across a desk",
  },
  {
    title: "Bookings & Calendar Management",
    lead: "Less back-and-forth trying to find a time that works.",
    body: "We can simplify bookings, calendar scheduling, confirmations and reminders so appointments are easier for you and your clients.",
    link: "Booking & scheduling automation",
    image: photo("photo-1506784983877-45594efa4cbe"),
    alt: "A weekly planner open on a desk",
  },
  {
    title: "Emails & Client Follow-ups",
    lead: "Some emails need your personal attention. Others don’t need to be written from scratch every single time.",
    body: "We can automate the right follow-ups, reminders and email journeys while keeping the communication feeling like your business.",
    link: "Email & follow-up automation",
    image: photo("photo-1515378791036-0648a3ef77b2"),
    alt: "Someone typing on a laptop",
  },
  {
    title: "Admin, Documents & Reporting",
    lead: "If information is constantly being copied, updated, chased or pulled together manually, there may be a much simpler way.",
    body: "We can connect your systems and automate repetitive admin, document processes and routine reporting.",
    link: "Business process automation",
    image: photo("photo-1758876201660-103984519266"),
    alt: "A woman working through documents at an office desk",
  },
  {
    title: "Marketing & Content",
    lead: "Your business shouldn’t disappear online every time things get busy.",
    body: "We can create simpler systems for planning, scheduling and managing your marketing so staying consistent takes less of your time.",
    link: "Marketing automation",
    image: photo("photo-1676276375773-add2cbdd1cc5"),
    alt: "A hand writing on a sticky note while planning content",
  },
  {
    title: "Websites That Work With Your Business",
    lead: "Your website can do more than tell people who you are.",
    body: "We can build and connect websites that help customers enquire, book, receive information and move naturally to the next step — while the right things happen automatically behind the scenes.",
    link: "Website & booking solutions",
    image: photo("photo-1487014679447-9f8336841d58"),
    alt: "A laptop showing a website, beside a mug",
  },
];

export function Solutions() {
  return (
    <section id="solutions" className="relative z-10 mx-auto shell scroll-mt-24">
      <div className="max-w-[44rem]">
        <Reveal>
          <p className="eyebrow flex items-center gap-3 text-ink-faint">
            <span className="h-px w-8 bg-ink-faint/60" aria-hidden />
            Automation solutions
          </p>
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="display mt-6 text-[clamp(2.1rem,4.4vw,3.4rem)] text-ink">
            What&rsquo;s taking up{" "}
            <em className="italic">more time than it should?</em>
          </h2>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mt-6 text-[1.02rem] leading-[1.75] text-ink-muted">
            Here are some of the everyday processes we can help make simpler.
          </p>
        </Reveal>
      </div>

      <ol className="mt-12 border-t border-hairline md:mt-16">
        {solutions.map((item, i) => (
          <Reveal
            as="li"
            key={item.title}
            className="group grid grid-cols-[5.5rem_1fr] gap-x-5 border-b border-hairline py-7 sm:grid-cols-[9rem_1fr] sm:gap-x-8 md:grid-cols-[12rem_1fr] md:gap-x-12 md:py-10"
          >
            <div className="relative aspect-square w-full overflow-hidden rounded-[var(--r-md)] bg-hairline">
              <Image
                src={item.image}
                alt={item.alt}
                fill
                unoptimized
                sizes="(max-width: 640px) 88px, 192px"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="max-w-[40rem] self-center">
              <p className="eyebrow text-accent">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="display mt-2 text-[clamp(1.3rem,2.4vw,1.8rem)] leading-[1.15] text-ink">
                {item.title}
              </h3>
              <p className="mt-3 text-[0.95rem] leading-[1.65] text-ink">
                {item.lead}
              </p>
              <p className="mt-2 text-[0.95rem] leading-[1.65] text-ink-muted">
                {item.body}
              </p>
              <a
                href="#talk"
                className="mt-4 inline-flex items-center gap-2 text-[0.88rem] font-medium text-ink"
              >
                {item.link}
                <ArrowRightIcon className="text-accent transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </div>
          </Reveal>
        ))}
      </ol>

      <Reveal className="mt-10 rounded-[var(--r-lg)] bg-[#f1f1f1] p-8 md:mt-14 md:p-12">
        <p className="eyebrow text-ink-faint">
          Don&rsquo;t see your particular problem here?
        </p>
        <h3 className="display mt-4 text-[clamp(1.6rem,3vw,2.3rem)] leading-tight text-ink">
          Tell me what&rsquo;s taking too much time.
        </h3>
        <p className="mt-5 max-w-[36rem] text-[0.98rem] leading-[1.7] text-ink-muted">
          Sometimes the best automation starts with something as simple as:
        </p>
        <p className="display mt-3 max-w-[36rem] border-l-2 border-accent/40 pl-4 text-[1.2rem] leading-[1.4] text-ink italic">
          &ldquo;Joyce, we keep doing this manually and it&rsquo;s driving us
          mad.&rdquo;
        </p>
        <p className="mt-4 text-[0.98rem] leading-[1.7] text-ink-muted">
          We can start there.
        </p>
        <a
          href="#talk"
          className="group mt-7 inline-flex items-center gap-2 rounded-[var(--r-pill)] bg-ink px-6 py-3.5 text-[0.92rem] font-medium text-white transition-transform duration-300 hover:-translate-y-0.5"
        >
          Talk to Joyce
          <ArrowRightIcon className="transition-transform duration-300 group-hover:translate-x-1" />
        </a>
      </Reveal>
    </section>
  );
}
