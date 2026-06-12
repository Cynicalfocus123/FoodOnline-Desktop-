import type { ReactNode } from "react";

type ContactTone = "blue" | "pink" | "orange";
type ContactIconName =
  | "megaphone"
  | "refresh"
  | "mail"
  | "handshake"
  | "box"
  | "target"
  | "money"
  | "starPeople"
  | "people"
  | "truck";

type ContactCard = {
  title: string;
  link: string;
  icon: ContactIconName;
  tone: ContactTone;
};

const contactImagePath = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;

const getInTouchCards: ContactCard[] = [
  { title: "Press & media", link: "pr@foodonlines.com", icon: "megaphone", tone: "blue" },
  { title: "Returns & refunds", link: "Go to your account", icon: "refresh", tone: "blue" },
  { title: "Email support", link: "sale@foodonlines.com", icon: "mail", tone: "blue" },
];

const partnerCards: ContactCard[] = [
  { title: "Partnerships", link: "partnerships@foodonlines.com", icon: "handshake", tone: "pink" },
  { title: "Vendors", link: "vendors@foodonlines.com", icon: "box", tone: "pink" },
  { title: "Advertising", link: "ads@foodonlines.com", icon: "target", tone: "pink" },
  { title: "Affiliates", link: "affiliate@foodonlines.com", icon: "money", tone: "pink" },
  { title: "Sponsors", link: "sponsors@foodonlines.com", icon: "starPeople", tone: "pink" },
];

const hiringCards: ContactCard[] = [
  { title: "Careers", link: "careers@foodonlines.com", icon: "people", tone: "orange" },
  { title: "Drivers", link: "drivers@foodonlines.com", icon: "truck", tone: "orange" },
];

const toneStyles: Record<ContactTone, { circle: string; icon: string; link: string }> = {
  blue: {
    circle: "bg-sky-50",
    icon: "text-sky-600",
    link: "text-sky-700",
  },
  pink: {
    circle: "bg-rose-50",
    icon: "text-rose-500",
    link: "text-sky-700",
  },
  orange: {
    circle: "bg-orange-50",
    icon: "text-citrus-600",
    link: "text-sky-700",
  },
};

function isEmailLink(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function ArrowRightIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function ContactIcon({ name }: { name: ContactIconName }) {
  const common = {
    className: "h-6 w-6",
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.9,
    viewBox: "0 0 24 24",
  };

  switch (name) {
    case "megaphone":
      return (
        <svg {...common}>
          <path d="m4 14 3.4-.8L18 7v10L7.4 10.8 4 10v4Z" />
          <path d="m7.5 14 1.2 4.2c.2.6.7.8 1.2.5l1.8-1.1" />
          <path d="M20 9.5v5" />
        </svg>
      );
    case "refresh":
      return (
        <svg {...common}>
          <path d="M20 12a8 8 0 0 1-13.7 5.6" />
          <path d="M4 12A8 8 0 0 1 17.7 6.4" />
          <path d="M7 18H4v-3" />
          <path d="M17 6h3v3" />
        </svg>
      );
    case "mail":
      return (
        <svg {...common}>
          <path d="M4 6.5h16v11H4z" />
          <path d="m5.5 8.5 6.5 5 6.5-5" />
        </svg>
      );
    case "handshake":
      return (
        <svg {...common}>
          <path d="m8.5 12 2-2a2.5 2.5 0 0 1 3.5 0l1.5 1.5" />
          <path d="m14 10 1.8-1.8a2.2 2.2 0 0 1 3.1 0L21 10.3" />
          <path d="m3 10.5 2.1-2.3a2.2 2.2 0 0 1 3.1 0L10 10" />
          <path d="m7 13 4.5 4.4a2.3 2.3 0 0 0 3.2 0l2.3-2.3" />
          <path d="m17 15 1.4-1.4" />
        </svg>
      );
    case "box":
      return (
        <svg {...common}>
          <path d="M4.5 8.5 12 4l7.5 4.5v7L12 20l-7.5-4.5v-7Z" />
          <path d="m4.8 8.7 7.2 4.2 7.2-4.2" />
          <path d="M12 13v7" />
        </svg>
      );
    case "target":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="4.2" />
          <path d="M12 12h7.5" />
          <path d="m17 7 2.5-2.5" />
        </svg>
      );
    case "money":
      return (
        <svg {...common}>
          <rect height="11" rx="2" width="16" x="4" y="7" />
          <path d="M8 11h.01" />
          <path d="M16 14h.01" />
          <circle cx="12" cy="12.5" r="2" />
        </svg>
      );
    case "starPeople":
      return (
        <svg {...common}>
          <path d="M8.5 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
          <path d="M3.5 19a5 5 0 0 1 9.2-2.7" />
          <path d="m17 7 1 2 2.2.3-1.6 1.6.4 2.1-2-1.1-2 1.1.4-2.1-1.6-1.6L16 9l1-2Z" />
        </svg>
      );
    case "people":
      return (
        <svg {...common}>
          <path d="M9 11a3.2 3.2 0 1 0 0-6.4A3.2 3.2 0 0 0 9 11Z" />
          <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
          <path d="M16.5 11.5a2.6 2.6 0 1 0-.7-5.1" />
          <path d="M16.5 14.2A4.5 4.5 0 0 1 21 18.7" />
        </svg>
      );
    case "truck":
      return (
        <svg {...common}>
          <path d="M3.5 7h11v8h-11z" />
          <path d="M14.5 10h3.2l2.8 3v2h-6" />
          <circle cx="7" cy="17" r="1.7" />
          <circle cx="17" cy="17" r="1.7" />
        </svg>
      );
    default:
      return null;
  }
}

function ContactSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="grid gap-5">
      <h2 className="text-[clamp(1.65rem,2.2vw,2.25rem)] font-black tracking-[-0.03em] text-slate-950">{title}</h2>
      {children}
    </section>
  );
}

function ContactCardItem({ card }: { card: ContactCard }) {
  const tone = toneStyles[card.tone];
  const href = isEmailLink(card.link) ? `mailto:${card.link}` : "#account/settings";

  return (
    <article className="grid min-h-[150px] gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_55px_rgba(15,23,42,0.08)]">
      <span className={`inline-flex h-12 w-12 items-center justify-center rounded-full ${tone.circle} ${tone.icon}`}>
        <ContactIcon name={card.icon} />
      </span>
      <div className="min-w-0">
        <h3 className="text-xl font-black tracking-[-0.02em] text-slate-950">{card.title}</h3>
        <a className={`mt-2 inline-flex min-h-8 items-center text-base font-bold ${tone.link} hover:underline`} href={href}>
          {card.link}
        </a>
      </div>
    </article>
  );
}

function ContactGrid({ cards }: { cards: ContactCard[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <ContactCardItem card={card} key={card.title} />
      ))}
    </div>
  );
}

export function ContactUsPage() {
  return (
    <section className="bg-white pt-[116px] sm:pt-[128px] lg:pt-[138px]">
      <div className="grid min-h-[calc(100vh-138px)] lg:grid-cols-[minmax(320px,36%)_minmax(0,64%)]">
        <aside className="relative overflow-hidden bg-[#eef3fb] px-6 py-12 sm:px-10 lg:sticky lg:top-[138px] lg:min-h-[calc(100vh-138px)] lg:px-12 lg:py-14">
          <div className="relative z-10 max-w-[460px]">
            <p className="text-base font-black uppercase tracking-[0.18em] text-rose-500">Let's talk</p>
            <h1 className="mt-4 text-[clamp(3.3rem,7vw,6.75rem)] font-black leading-[0.9] tracking-[-0.06em] text-slate-950">
              Contact us
            </h1>
            <p className="mt-8 max-w-[330px] text-lg font-semibold leading-8 text-slate-700">
              Can't find what you're looking for?
            </p>
            <a className="mt-3 inline-flex min-h-11 items-center gap-2 text-base font-black text-sky-700 hover:underline" href="#help-center">
              Try our help center
              <ArrowRightIcon />
            </a>
          </div>

          <img
            alt="Fresh FoodOnlines groceries and herbs"
            className="pointer-events-none relative z-0 mt-6 mb-0 ml-[-6%] w-[112%] max-w-none object-contain object-left-bottom drop-shadow-[0_28px_55px_rgba(15,23,42,0.14)] sm:mt-7 sm:ml-[-3%] sm:w-[108%] lg:absolute lg:bottom-0 lg:left-0 lg:mt-0 lg:ml-0 lg:w-[112%] lg:translate-x-[-3%]"
            loading="eager"
            src={contactImagePath("/images/contact-us/contact-hero-groceries.png")}
          />
        </aside>

        <div className="px-4 py-10 sm:px-8 sm:py-12 lg:px-12 lg:py-14 xl:px-16">
          <div className="mx-auto grid max-w-[980px] gap-12">
            <ContactSection title="Get in touch">
              <ContactGrid cards={getInTouchCards} />
            </ContactSection>

            <ContactSection title="Partners">
              <ContactGrid cards={partnerCards} />
            </ContactSection>

            <ContactSection title="We're hiring">
              <ContactGrid cards={hiringCards} />
            </ContactSection>
          </div>
        </div>
      </div>
    </section>
  );
}
