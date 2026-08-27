import { ArrowRightIcon } from "@/components/ui/icons";

const columns = [
  {
    title: "The site",
    links: [
      { label: "Sound familiar?", href: "#familiar" },
      { label: "How it works", href: "#journey" },
      { label: "About Joyce", href: "#joyce" },
      { label: "What we help with", href: "#help" },
    ],
  },
  {
    title: "Elsewhere",
    links: [
      { label: "LinkedIn", href: "#" },
      { label: "Email", href: "mailto:hello@joycewadawasina.com" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-hairline">
      <div className="mx-auto grid w-[min(1200px,94vw)] gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr] md:py-20">
        <div className="max-w-[26rem]">
          <p className="display text-[1.35rem] text-ink">Joyce Wadawasina</p>
          <p className="mt-3 text-[0.92rem] leading-[1.65] text-ink-muted">
            AI and automation, explained simply. Simpler systems that give you
            back the time to run your business.
          </p>
          <a
            href="#talk"
            className="mt-6 inline-flex items-center gap-2 text-[0.88rem] font-medium text-ink"
          >
            Talk to Joyce
            <ArrowRightIcon className="text-accent" />
          </a>
        </div>

        {columns.map((column) => (
          <div key={column.title}>
            <p className="eyebrow text-ink-faint">{column.title}</p>
            <ul className="mt-5 space-y-3">
              {column.links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-[0.92rem] text-ink-muted transition-colors hover:text-ink"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mx-auto flex w-[min(1200px,94vw)] flex-col gap-2 border-t border-hairline py-7 text-[0.78rem] text-ink-faint md:flex-row md:items-center md:justify-between">
        <p>&copy; {new Date().getFullYear()} Joyce Wadawasina. All rights reserved.</p>
        <p>Business automation · AI training · Software engineering &amp; branding</p>
      </div>
    </footer>
  );
}
