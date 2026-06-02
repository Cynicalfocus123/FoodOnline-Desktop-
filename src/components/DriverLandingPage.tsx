import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  driverAssets,
  driverStats,
  eligibilityItems,
  groupedDeliverySteps,
  successCards,
  type DriverAssetKey,
} from "../data/driverLanding";

type AccordionItem = {
  title: string;
  body: string;
};

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.14 },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return { ref, className: isVisible ? "driver-reveal is-visible" : "driver-reveal" };
}

function DriverSection({ children, className = "", id }: { children: ReactNode; className?: string; id?: string }) {
  const reveal = useReveal<HTMLElement>();

  return (
    <section id={id} ref={reveal.ref} className={`${reveal.className} ${className}`}>
      {children}
    </section>
  );
}

function Icon({ type }: { type: "route" | "bag" | "pay" | "car" | "van" | "clock" | "shield" | "team" | "check" }) {
  const common = {
    className: "h-6 w-6",
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.9,
    viewBox: "0 0 24 24",
  };

  switch (type) {
    case "bag":
      return (
        <svg {...common}>
          <path d="M6 8h12l-1 12H7L6 8Z" />
          <path d="M9 8a3 3 0 0 1 6 0" />
        </svg>
      );
    case "pay":
      return (
        <svg {...common}>
          <path d="M4 7h16v10H4z" />
          <path d="M7 11h4" />
          <path d="M15.5 14.5 18 12l-2.5-2.5" />
        </svg>
      );
    case "car":
      return (
        <svg {...common}>
          <path d="m5 12 1.7-4.2A3 3 0 0 1 9.5 6h5a3 3 0 0 1 2.8 1.8L19 12" />
          <path d="M4 12h16v5H4z" />
          <circle cx="7" cy="17" r="1.5" />
          <circle cx="17" cy="17" r="1.5" />
        </svg>
      );
    case "van":
      return (
        <svg {...common}>
          <path d="M3.5 7h10v9h-10z" />
          <path d="M13.5 10h3.5l3 3v3h-6.5" />
          <circle cx="7" cy="17" r="1.5" />
          <circle cx="17.5" cy="17" r="1.5" />
        </svg>
      );
    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v5l3 2" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3 5.5 5.5v5.2c0 4.2 2.7 7.8 6.5 9.3 3.8-1.5 6.5-5.1 6.5-9.3V5.5L12 3Z" />
          <path d="m9.5 12 1.6 1.6 3.5-3.8" />
        </svg>
      );
    case "team":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3" />
          <path d="M3.8 19a5.2 5.2 0 0 1 10.4 0" />
          <path d="M16 11a2.5 2.5 0 1 0-.7-4.9" />
          <path d="M16.5 15.2A4.5 4.5 0 0 1 20.2 19" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <path d="m5 12 4 4 10-10" />
        </svg>
      );
    case "route":
    default:
      return (
        <svg {...common}>
          <path d="M6 18c4-7 8 1 12-6" />
          <circle cx="6" cy="18" r="2" />
          <circle cx="18" cy="12" r="2" />
          <path d="M12 5v4" />
          <path d="M10 7h4" />
        </svg>
      );
  }
}

function ChevronIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function DriverButton({
  children,
  href,
  variant = "orange",
}: {
  children: ReactNode;
  href: string;
  variant?: "orange" | "green" | "outline" | "white";
}) {
  const className =
    variant === "green"
      ? "bg-[#16A34A] text-white shadow-[0_18px_34px_rgba(22,163,74,0.22)] hover:bg-[#15803D]"
      : variant === "outline"
        ? "border border-[#16A34A] bg-white text-[#15803D] hover:bg-[#ECFDF5]"
        : variant === "white"
          ? "bg-white text-[#111827] shadow-[0_18px_34px_rgba(17,24,39,0.12)] hover:bg-orange-50"
          : "bg-[#F97316] text-white shadow-[0_18px_34px_rgba(249,115,22,0.24)] hover:bg-[#EA580C]";

  return (
    <a
      className={`driver-button inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-black transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#16A34A] ${className}`}
      href={href}
    >
      {children}
    </a>
  );
}

function DriverImage({
  assetKey,
  eager = false,
  className = "",
}: {
  assetKey: DriverAssetKey;
  eager?: boolean;
  className?: string;
}) {
  const [hasError, setHasError] = useState(false);
  const asset = driverAssets[assetKey];
  const src = `${import.meta.env.BASE_URL}images/drivers/${asset.src}`;

  if (hasError) {
    return (
      <div
        aria-label={asset.alt}
        className={`flex min-h-[260px] items-center justify-center overflow-hidden rounded-[28px] bg-gradient-to-br from-orange-100 via-white to-emerald-100 ${className}`}
        role="img"
      >
        <div className="grid place-items-center gap-3 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-white text-[#16A34A] shadow-sm">
            <Icon type="bag" />
          </span>
          <span className="max-w-[220px] text-sm font-black text-neutral-700">FoodOnlines driver image</span>
        </div>
      </div>
    );
  }

  return (
    <img
      alt={asset.alt}
      className={`driver-image h-full w-full rounded-[28px] object-cover ${className}`}
      loading={eager ? "eager" : "lazy"}
      onError={() => setHasError(true)}
      src={src}
    />
  );
}

function DriverHero() {
  return (
    <section className="relative isolate min-h-[720px] overflow-hidden bg-neutral-950 pt-[156px] sm:pt-[172px] lg:pt-[184px]">
      <div className="absolute inset-0">
        <DriverImage assetKey="hero" eager className="h-full min-h-full rounded-none object-cover object-[center_62%] opacity-70 brightness-[0.82]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/88 via-black/58 to-black/24" />
        <div className="absolute inset-0 bg-black/18" />
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/70 to-transparent" />
      </div>
      <div className="relative z-10 mx-auto flex min-h-[calc(720px-184px)] max-w-[1180px] items-center px-4 py-20 sm:px-6">
        <div className="driver-hero-text grid max-w-3xl gap-3 text-white">
          <p className="text-[clamp(2rem,4vw,3.25rem)] font-black leading-none">Drivers</p>
          <h1 className="max-w-[760px] text-[clamp(3.2rem,8vw,6.8rem)] font-black leading-[0.96] tracking-[-0.05em]">
            Start earning.<br />Drive with us.
          </h1>
          <h4 className="text-[clamp(1.45rem,2.7vw,2.15rem)] font-black leading-tight tracking-[-0.02em]">
            Be Your Own Boss
            <br />
            Work on Your Terms.
          </h4>
          <div className="grid max-w-sm gap-2">
            <p className="text-lg font-black leading-7 text-white">Choose your schedule, control your time, and enjoy the freedom to live and work the way you want.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <DriverButton href="#apply">Get started</DriverButton>
            <DriverButton href="/careers" variant="white">
              See full-time roles
            </DriverButton>
          </div>
        </div>
      </div>
    </section>
  );
}

function ValueAndStats() {
  return (
    <DriverSection id="driver-company" className="px-4 py-14 sm:px-6 lg:py-24">
      <div className="mx-auto grid max-w-[1180px] gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <h2 className="text-[clamp(2.2rem,5vw,4rem)] font-black leading-none tracking-[-0.05em] text-[#B45309]">Efficient Routes</h2>
          <h1 className="mt-5 text-[clamp(2.8rem,7vw,5.4rem)] font-light leading-none tracking-[-0.06em] text-[#111827]">
            Reliable Daily Schedule
          </h1>
          <p className="mt-6 max-w-2xl text-xl leading-9 text-[#111827]">
            Spend less time on the road and more time focusing on what matters with organized routes and consistent daily deliveries.
          </p>
        </div>
        <div className="driver-slide-in">
          <div className="mx-auto grid max-w-[620px] grid-cols-2 grid-rows-[auto_auto_auto] gap-3 sm:gap-4 lg:max-w-none">
            {[
              { image: "valueLoading" as DriverAssetKey, className: "col-start-1 row-start-1 aspect-[4/3] self-end" },
              { image: "valueCab" as DriverAssetKey, className: "col-start-2 row-span-2 row-start-1 aspect-[3/4]" },
              { image: "valueTeam" as DriverAssetKey, className: "col-start-1 row-span-2 row-start-2 aspect-[3/4]" },
              { image: "valuePair" as DriverAssetKey, className: "col-start-2 row-start-3 aspect-[4/3]" },
            ].map((item) => (
              <div
                className={`overflow-hidden rounded-[10px] bg-white shadow-[0_18px_42px_rgba(17,24,39,0.12)] ring-1 ring-black/5 ${item.className}`}
                key={item.image}
              >
                <DriverImage assetKey={item.image} className="rounded-[10px] object-center" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <StatsRow />
    </DriverSection>
  );
}

function CountUpStat({ label, suffix, value }: { label: string; suffix: string; value: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduceMotion) {
          setDisplayValue(value);
          observer.disconnect();
          return;
        }

        const startedAt = performance.now();
        const duration = 1100;
        const tick = (now: number) => {
          const progress = Math.min(1, (now - startedAt) / duration);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplayValue(Math.round(value * eased));
          if (progress < 1) {
            window.requestAnimationFrame(tick);
          }
        };
        window.requestAnimationFrame(tick);
        observer.disconnect();
      },
      { threshold: 0.35 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="border-t border-[#E5E7EB] pt-5 text-left">
      <p className="text-3xl font-black tracking-[-0.04em] text-[#111827]">
        {displayValue.toLocaleString()}
        {suffix}
      </p>
      <p className="mt-2 text-sm font-bold leading-5 text-[#6B7280]">{label}</p>
    </div>
  );
}

function StatsRow() {
  return (
    <div className="mx-auto mt-12 grid max-w-[1180px] gap-6 md:grid-cols-4">
      {driverStats.map((stat) => (
        <CountUpStat key={stat.label} {...stat} />
      ))}
    </div>
  );
}

function HowFlexWorks() {
  const programHighlights = [
    {
      title: "Work on Your Schedule as an Independent Contractor.",
      body: "With the FoodOnline Driver Program, you have the flexibility to decide when and how often you work. Take control of your schedule and create a work-life balance that fits your personal and professional goals.",
    },
    {
      title: "No Minimum Hour Requirements",
      subtitle: "Choose the Deliveries That Work for You.",
      body: "Enjoy the freedom to select delivery opportunities that fit your availability. With no fixed hourly commitments, you can create a schedule that matches your lifestyle while maximizing your earning potential.",
    },
    {
      title: "Flexible Work That Fits Your Lifestyle",
      subtitle: "Supported by Strong Customer Demand",
      body: "As part of our delivery network, you'll benefit from consistent order volume and the freedom to choose when you're available, creating a rewarding and flexible earning experience.",
    },
  ];

  return (
    <DriverSection id="flex" className="px-4 py-14 sm:px-6 lg:py-24">
      <div className="mx-auto grid max-w-[1180px] gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] xl:items-center">
        <div className="grid min-w-0 gap-5">
          <h2 className="text-[clamp(2.2rem,5vw,4.3rem)] font-black leading-none tracking-[-0.06em] text-[#111827]">
            How Does the FoodOnline Driver Program Work?
          </h2>
          <p className="text-lg leading-8 text-[#6B7280]">
            The FoodOnline Driver Program provides a flexible and rewarding opportunity to earn income by delivering groceries to customers in your local area. As a driver, you have the freedom to choose when and how often you work, allowing you to create a schedule that fits your lifestyle.
            <br />
            <br />
            Simply sign up, complete the onboarding process, and start accepting delivery opportunities. Whether you're looking for a full-time career or a part-time source of income, FoodOnline gives you the flexibility to work on your terms while helping customers receive their groceries conveniently and reliably.
          </p>
          <div className="grid gap-3">
            {programHighlights.map((item, index) => (
              <div className="driver-check-item flex items-start gap-3 border-b border-[#E5E7EB] py-4" key={item.title} style={{ transitionDelay: `${index * 80}ms` }}>
                <span className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ECFDF5] text-[#15803D]">
                  <Icon type="check" />
                </span>
                <span className="grid gap-1">
                  <span className="font-black text-[#111827]">{item.title}</span>
                  {item.subtitle ? <span className="font-black text-[#475569]">{item.subtitle}</span> : null}
                  <span className="text-sm leading-6 text-[#6B7280]">{item.body}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="driver-slide-in w-full max-w-[420px] justify-self-center xl:justify-self-end">
          <div className="aspect-[4/3] w-full overflow-hidden rounded-[40px] bg-white">
            <DriverImage assetKey="appRoute" className="object-center" />
          </div>
        </div>
      </div>
    </DriverSection>
  );
}

function DriverBenefitCards() {
  return (
    <DriverSection className="bg-gradient-to-br from-orange-50 via-white to-emerald-50 px-4 py-14 sm:px-6 lg:py-20">
      <div className="mx-auto max-w-[1180px]">
        <h2 className="text-[clamp(2.8rem,7vw,5.8rem)] font-black leading-none tracking-[-0.07em] text-[#15803D]">
          How Much Can You <span className="text-[#F97316]">Earn?</span>
        </h2>
        <div className="mt-10 grid items-stretch gap-8 lg:grid-cols-3">
          {successCards.map((card) => (
            <div className="grid h-full grid-rows-[auto_auto_1fr] content-start" key={card.title}>
              <div className="lg:min-h-[112px]">
                <h3 className="text-2xl font-black tracking-[-0.04em] text-[#15803D]">{card.title}</h3>
                <p className="mt-1 text-xl font-black leading-7 text-[#EA580C]">{card.subtitle}</p>
              </div>
              <div className="mt-8 h-[260px] overflow-hidden rounded-[18px] bg-white sm:h-[300px] lg:mt-0 lg:h-[220px] xl:h-[250px]">
                <DriverImage assetKey={card.image} className="object-center" />
              </div>
              {card.body ? <p className="mt-5 text-lg font-black leading-8 text-[#15803D]">{card.body}</p> : null}
            </div>
          ))}
        </div>
      </div>
    </DriverSection>
  );
}

function GroupedDeliveryTimeline() {
  return (
    <DriverSection id="jobs" className="bg-[#FFF7ED] px-4 py-14 sm:px-6 lg:py-24">
      <div className="mx-auto max-w-[1180px]">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.22em] text-[#16A34A]">Enjoy Greater Schedule Stability.</p>
          <h3 className="mt-3 text-[clamp(2.4rem,5vw,4.6rem)] font-black leading-none tracking-[-0.06em] text-[#111827]">Grouped deliveries</h3>
          <p className="mt-5 max-w-2xl text-xl font-black leading-8 text-[#15803D]">
            With pre-planned delivery assignments, you can focus on earning while maintaining better control over your day.
          </p>
          <div className="mt-10 grid items-stretch gap-8 lg:grid-cols-3">
            {groupedDeliverySteps.map((step, index) => (
              <article
                className="grid h-full grid-rows-[auto_auto_1fr_auto] gap-4 border-t border-orange-200 pt-6"
                key={step.title}
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#16A34A] text-sm font-black text-white">
                  {index + 1}
                </span>
                <h4 className="text-xl font-black leading-7 text-[#15803D]">{step.title}</h4>
                <p className="text-sm font-bold leading-6 text-[#4B5563]">{step.body}</p>
                <div className="mt-2 h-[260px] overflow-hidden rounded-[26px] bg-white sm:h-[320px] lg:h-[280px]">
                  <DriverImage assetKey={step.image} className="object-center" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </DriverSection>
  );
}

function DriverAccordion({ heading, idPrefix, items }: { heading: string; idPrefix: string; items: readonly AccordionItem[] }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <DriverSection className="px-4 py-14 sm:px-6 lg:py-24">
      <div className="mx-auto max-w-[920px]">
        <h2 className="text-[clamp(2rem,5vw,3.6rem)] font-black leading-none tracking-[-0.05em] text-[#111827]">{heading}</h2>
        <div className="mt-7 divide-y divide-[#E5E7EB] border-y border-[#E5E7EB]">
          {items.map((item, index) => {
            const isOpen = openIndex === index;
            const panelId = `${idPrefix}-panel-${index}`;
            const buttonId = `${idPrefix}-button-${index}`;

            return (
              <div key={item.title}>
                <button
                  aria-controls={panelId}
                  aria-expanded={isOpen}
                  className="flex min-h-[64px] w-full items-center justify-between gap-4 py-4 text-left text-lg font-black text-[#111827] transition hover:text-[#EA580C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#F97316]"
                  id={buttonId}
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  type="button"
                >
                  {item.title}
                  <span className={`shrink-0 text-[#16A34A] transition duration-300 ${isOpen ? "rotate-180" : ""}`}>
                    <ChevronIcon />
                  </span>
                </button>
                <div
                  aria-labelledby={buttonId}
                  className={`driver-accordion-panel grid transition-all duration-[260ms] ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                  id={panelId}
                  role="region"
                >
                  <div className="overflow-hidden">
                    <p className="pb-5 text-base leading-7 text-[#6B7280]">{item.body}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DriverSection>
  );
}

function ApplyCta() {
  return (
    <DriverSection id="apply" className="bg-gradient-to-r from-orange-50 via-white to-emerald-50 px-4 py-14 sm:px-6 lg:py-24">
      <div className="mx-auto max-w-[1180px]">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,1.1fr)] lg:items-center">
          <div>
            <h2 className="text-[clamp(2.2rem,5vw,4.2rem)] font-black leading-none tracking-[-0.06em] text-[#111827]">Apply here to start driving</h2>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-[#6B7280]">Choose the driving path that fits you and start delivering with FoodOnlines.</p>
            <div className="mt-6">
              <DriverButton href="/drivers/apply">Apply now</DriverButton>
            </div>
          </div>
          <div className="overflow-hidden rounded-[32px] bg-white shadow-[0_20px_45px_rgba(17,24,39,0.12)]">
            <div className="h-[280px] sm:h-[360px] lg:h-[390px]">
              <DriverImage assetKey="applyTeam" className="object-center" />
            </div>
          </div>
        </div>
      </div>
    </DriverSection>
  );
}

export function DriverLandingPage() {
  const title = "Drive with FoodOnlines | Grocery Delivery Driver Jobs";
  const description =
    "Join FoodOnlines as a flexible or full-time grocery delivery driver. Choose routes, earn with grocery deliveries, and help bring global food to customers.";

  useEffect(() => {
    const previousTitle = document.title;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousDescription = meta?.content;

    document.title = title;
    if (meta) {
      meta.content = description;
    }

    return () => {
      document.title = previousTitle;
      if (meta && previousDescription) {
        meta.content = previousDescription;
      }
    };
  }, []);

  const pageJsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Drive with FoodOnlines",
      description,
      url: "https://foodonlines.com/company/drivers",
    }),
    [description],
  );

  return (
    <div className="bg-white text-[#111827]">
      <script type="application/ld+json">{JSON.stringify(pageJsonLd)}</script>
      <DriverHero />
      <ValueAndStats />
      <HowFlexWorks />
      <DriverBenefitCards />
      <GroupedDeliveryTimeline />
      <DriverAccordion heading="Requirements for eligibility" idPrefix="driver-eligibility" items={eligibilityItems} />
      <ApplyCta />
    </div>
  );
}
