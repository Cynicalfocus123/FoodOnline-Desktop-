import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  driverAssets,
  driverPathCards,
  driverStats,
  eligibilityItems,
  fleetBenefits,
  fleetCards,
  flexBenefits,
  groupedDeliverySteps,
  moreInfoItems,
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

function ArrowIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
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
        <DriverImage assetKey="hero" eager className="h-full min-h-full rounded-none opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/78 via-black/48 to-black/10" />
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/55 to-transparent" />
      </div>
      <div className="relative z-10 mx-auto flex min-h-[calc(720px-184px)] max-w-[1180px] items-center px-4 py-20 sm:px-6">
        <div className="driver-hero-text grid max-w-3xl gap-6 text-white">
          <p className="text-lg font-semibold">Drivers</p>
          <h1 className="max-w-[760px] text-[clamp(3.2rem,8vw,6.8rem)] font-light leading-[0.96] tracking-[-0.05em]">
            Start earning.<br />Drive with us.
            <span className="mt-5 block text-[clamp(1.6rem,3vw,2.4rem)] font-black leading-tight tracking-[-0.02em]">
              1. Be Your Own Boss
              <br />
              Work on Your Terms.
            </span>
          </h1>
          <div className="mt-6 grid max-w-sm gap-2">
            <p className="text-lg font-semibold leading-7 text-white/92">Choose your schedule, control your time, and enjoy the freedom to live and work the way you want.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <DriverButton href="#apply">Get started</DriverButton>
            <DriverButton href="#fleet" variant="white">
              See full-time roles
            </DriverButton>
          </div>
        </div>
      </div>
    </section>
  );
}

function DriverPathCards() {
  return (
    <DriverSection id="delivery" className="px-4 py-14 sm:px-6 lg:py-24">
      <div className="mx-auto grid max-w-[1180px] gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <h2 className="text-[clamp(2.3rem,5vw,4rem)] font-light leading-[1.05] tracking-[-0.04em] text-[#111827]">
            Maximize Your Income Potential
            <span className="block font-black">Unmatched Earning Opportunities</span>
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-8 text-[#6B7280]">
            Take your career to the next level with a compensation package designed to reward ambition, performance, and results.
          </p>
          <div className="mt-10 divide-y divide-[#E5E7EB]">
            {driverPathCards.map((card, index) => (
              <a
                className="group flex min-h-[92px] items-center gap-5 py-5 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#16A34A]"
                href={card.href}
                key={card.title}
              >
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${card.accent === "orange" ? "bg-orange-100 text-[#EA580C]" : "bg-emerald-100 text-[#15803D]"}`}>
                  <Icon type={index === 0 ? "car" : "van"} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xl font-black text-[#111827]">{card.title}</span>
                  <span className="mt-1 block text-sm font-black uppercase tracking-[0.12em] text-[#475569]">{card.cta}</span>
                </span>
                <span className="text-[#111827] transition group-hover:translate-x-1 group-hover:text-[#16A34A]">
                  <ArrowIcon />
                </span>
              </a>
            ))}
          </div>
        </div>
        <div className="mx-auto aspect-square w-full max-w-[560px] rounded-full bg-emerald-100 p-7">
          <div className="h-full overflow-hidden rounded-full">
            <DriverImage assetKey="fleet" className="rounded-full" />
          </div>
        </div>
      </div>
    </DriverSection>
  );
}

function ValueAndStats() {
  return (
    <DriverSection id="driver-company" className="px-4 py-14 sm:px-6 lg:py-24">
      <div className="mx-auto grid max-w-[1180px] gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-lg font-black text-[#B45309]">Drivers move our company forward</p>
          <h2 className="mt-5 text-[clamp(2.6rem,6vw,4.8rem)] font-light leading-none tracking-[-0.06em] text-[#111827]">
            Delivered with heart
          </h2>
          <p className="mt-6 max-w-2xl text-xl leading-9 text-[#111827]">
            We deeply believe that our drivers are the heartbeat of FoodOnlines. Their dedication, reliability, and care help customers receive groceries on time, every time.
          </p>
        </div>
        <div className="relative min-h-[460px] overflow-hidden">
          <div className="absolute left-[24%] top-[22%] h-40 w-40 rounded-full bg-orange-100" />
          <div className="absolute bottom-0 left-[52%] h-36 w-36 rounded-full bg-emerald-100" />
          {[
            { image: "team" as DriverAssetKey, className: "left-[28%] top-0 h-56 w-56 sm:h-72 sm:w-72" },
            { image: "handoff" as DriverAssetKey, className: "right-2 top-10 h-36 w-36 sm:h-44 sm:w-44" },
            { image: "flex" as DriverAssetKey, className: "left-[18%] bottom-16 h-36 w-36 sm:h-44 sm:w-44" },
            { image: "fleet" as DriverAssetKey, className: "right-0 bottom-4 h-52 w-52 sm:h-64 sm:w-64" },
          ].map((item) => (
            <div className={`absolute overflow-hidden rounded-full border-4 border-white shadow-[0_12px_34px_rgba(17,24,39,0.16)] ${item.className}`} key={item.image}>
              <DriverImage assetKey={item.image} className="rounded-full" />
            </div>
          ))}
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

function FlexProgram() {
  return (
    <DriverSection id="flex" className="bg-[#FFF1F2] px-4 py-14 sm:px-6 lg:py-24">
      <div className="mx-auto max-w-[1180px]">
        <div className="grid gap-5">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <h2 className="text-[clamp(3.8rem,12vw,8rem)] font-black leading-[0.82] tracking-[-0.08em] text-[#F97316]">FoodOnlines Flex</h2>
            <DriverButton href="#apply" variant="outline">
              Sign up here
            </DriverButton>
          </div>
        </div>
        <div className="mt-14 grid gap-10 md:grid-cols-3">
          {flexBenefits.map((benefit, index) => (
            <div key={benefit.title}>
              <span className="inline-flex h-16 w-16 items-center justify-center rounded-lg bg-white text-[#16A34A] shadow-[0_10px_22px_rgba(17,24,39,0.08)]">
                <Icon type={index === 0 ? "clock" : index === 1 ? "pay" : "route"} />
              </span>
              <h3 className="mt-7 text-3xl font-light tracking-[-0.04em] text-[#7C3AED]">{benefit.title}</h3>
              <p className="mt-1 text-2xl font-medium text-[#1D4ED8]">{benefit.subtitle}</p>
              <p className="mt-5 text-base leading-7 text-[#1D4ED8]">{benefit.body}</p>
            </div>
          ))}
        </div>
      </div>
    </DriverSection>
  );
}

function HowFlexWorks() {
  return (
    <DriverSection className="px-4 py-14 sm:px-6 lg:py-24">
      <div className="mx-auto grid max-w-[1180px] gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="grid gap-5">
          <h2 className="text-[clamp(2.2rem,5vw,4.3rem)] font-black leading-none tracking-[-0.06em] text-[#111827]">
            How does the Flex driver program work?
          </h2>
          <p className="text-lg leading-8 text-[#6B7280]">
            FoodOnlines Flex gives independent drivers a flexible way to deliver groceries. Sign up, choose available routes, complete deliveries, and get paid for the work you finish.
          </p>
          <div className="grid gap-3">
            {["Choose your own hours", "No hourly requirements", "Flexible availability"].map((item, index) => (
              <div className="driver-check-item flex items-center gap-3 border-b border-[#E5E7EB] py-4" key={item} style={{ transitionDelay: `${index * 80}ms` }}>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#ECFDF5] text-[#15803D]">
                  <Icon type="check" />
                </span>
                <span className="font-black text-[#111827]">{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="driver-slide-in">
          <div className="aspect-[4/3] overflow-hidden rounded-[40px]">
            <DriverImage assetKey="appRoute" />
          </div>
        </div>
      </div>
    </DriverSection>
  );
}

function DriverBenefitCards() {
  return (
    <DriverSection className="px-4 py-14 sm:px-6 lg:py-24">
      <div className="mx-auto max-w-[1180px]">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-[#F97316]">Earning potential beyond the road</p>
        <h2 className="mt-3 text-[clamp(2.3rem,5vw,4.4rem)] font-black leading-none tracking-[-0.06em] text-[#111827]">Drive toward success</h2>
        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          {successCards.map((card, index) => (
            <div className="border-t border-[#E5E7EB] pt-6" key={card.title}>
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.14em] ${card.accent === "orange" ? "bg-orange-100 text-[#EA580C]" : "bg-emerald-100 text-[#15803D]"}`}>
                {index + 1}
              </span>
              <h3 className="mt-5 text-2xl font-black tracking-[-0.04em] text-[#111827]">{card.title}</h3>
              <p className="mt-2 text-sm font-black text-[#16A34A]">{card.subtitle}</p>
              <p className="mt-4 text-base leading-7 text-[#6B7280]">{card.body}</p>
            </div>
          ))}
        </div>
      </div>
    </DriverSection>
  );
}

function GroupedDeliveryTimeline() {
  const [activeStep, setActiveStep] = useState(0);
  const stepRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target instanceof HTMLElement) {
          const index = Number(visible.target.dataset.stepIndex ?? 0);
          setActiveStep(index);
        }
      },
      { rootMargin: "-28% 0px -42% 0px", threshold: [0.2, 0.55, 0.85] },
    );

    stepRefs.current.forEach((node) => {
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <DriverSection id="jobs" className="bg-[#FFF7ED] px-4 py-14 sm:px-6 lg:py-24">
      <div className="mx-auto grid max-w-[1180px] gap-10 lg:grid-cols-[0.94fr_1.06fr] lg:items-start">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.22em] text-[#16A34A]">Say goodbye to last-minute delivery chaos</p>
          <h2 className="mt-3 text-[clamp(2.4rem,5vw,4.6rem)] font-black leading-none tracking-[-0.06em] text-[#111827]">Grouped deliveries</h2>
          <div className="relative mt-8 grid gap-4">
            <span className="absolute left-5 top-5 hidden h-[calc(100%-40px)] w-1 rounded-full bg-orange-200 md:block" />
            <span
              className="driver-timeline-progress absolute left-5 top-5 hidden w-1 rounded-full bg-[#16A34A] md:block"
              style={{ height: `${((activeStep + 1) / groupedDeliverySteps.length) * 100}%` }}
            />
            {groupedDeliverySteps.map((step, index) => (
              <button
                className={`relative grid gap-2 border-b border-orange-200 py-5 pl-5 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#16A34A] md:pl-14 ${
                  activeStep === index ? "text-[#15803D]" : "text-[#111827]"
                }`}
                data-step-index={index}
                key={step.title}
                onClick={() => setActiveStep(index)}
                ref={(node) => {
                  stepRefs.current[index] = node;
                }}
                type="button"
              >
                <span className={`hidden h-11 w-11 items-center justify-center rounded-full border-4 border-white text-sm font-black md:absolute md:left-0 md:top-5 md:flex ${activeStep === index ? "bg-[#16A34A] text-white" : "bg-orange-100 text-[#EA580C]"}`}>
                  {index + 1}
                </span>
                <span className="text-xl font-black leading-7">{step.title}</span>
                <span className="text-sm leading-6 text-[#6B7280]">{step.body}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="sticky top-[170px] overflow-hidden rounded-[40px]">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[26px]">
            {groupedDeliverySteps.map((step, index) => (
              <div className={`absolute inset-0 transition duration-500 ${activeStep === index ? "opacity-100" : "opacity-0"}`} key={step.image}>
                <DriverImage assetKey={step.image} />
              </div>
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
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h2 className="text-[clamp(2.2rem,5vw,4.2rem)] font-black leading-none tracking-[-0.06em] text-[#111827]">Apply here to start driving</h2>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-[#6B7280]">Choose the driving path that fits you and start delivering with FoodOnlines.</p>
            <a className="mt-4 inline-flex text-sm font-black text-[#15803D] underline underline-offset-4" href="#fleet">
              Looking for full-time employment? Learn more here.
            </a>
          </div>
          <DriverButton href="/drivers/apply">Apply now</DriverButton>
        </div>
      </div>
    </DriverSection>
  );
}

function FleetProgram() {
  return (
    <DriverSection id="fleet" className="bg-[#111827] px-4 py-14 text-white sm:px-6 lg:py-24">
      <div className="mx-auto max-w-[1180px]">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-orange-300">Full-time opportunities</p>
            <h2 className="mt-3 text-[clamp(3.8rem,12vw,8rem)] font-black leading-[0.82] tracking-[-0.08em]">Fleet</h2>
            <p className="mt-5 text-lg leading-8 text-white/72">Join FoodOnlines as a full-time fleet driver with scheduled routes, team support, and growth opportunities.</p>
            <div className="mt-6">
              <DriverButton href="/careers" variant="white">
                See positions
              </DriverButton>
            </div>
          </div>
          <div className="divide-y divide-white/10 md:grid md:grid-cols-3 md:divide-x md:divide-y-0">
            {fleetBenefits.map((item, index) => (
              <div className="py-5 md:px-5" key={item.title}>
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-orange-300">
                  <Icon type={index === 0 ? "team" : index === 1 ? "route" : "shield"} />
                </span>
                <h3 className="mt-5 text-xl font-black">{item.title}</h3>
                <p className="mt-2 text-sm font-bold text-white/68">{item.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {fleetCards.map((card) => (
            <div className="border-t border-white/15 pt-5" key={card.title}>
              <h3 className="text-xl font-black">{card.title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/68">{card.subtitle}</p>
            </div>
          ))}
        </div>
      </div>
    </DriverSection>
  );
}

function OpenPositionsCta() {
  return (
    <DriverSection className="px-4 py-14 sm:px-6 lg:py-24">
      <div className="relative mx-auto min-h-[420px] max-w-[1180px] overflow-hidden rounded-[40px] bg-neutral-950">
        <div className="absolute inset-0">
          <DriverImage assetKey="team" className="rounded-none opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/78 via-black/45 to-black/12" />
        </div>
        <div className="relative z-10 grid min-h-[420px] content-center gap-5 p-6 text-white sm:p-10">
          <h2 className="max-w-2xl text-[clamp(2.2rem,5vw,4rem)] font-black leading-none tracking-[-0.06em]">Check our open positions</h2>
          <p className="max-w-xl text-lg leading-8 text-white/78">Explore FoodOnlines driver and operations roles.</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <DriverButton href="/careers" variant="green">
              See positions
            </DriverButton>
            <DriverButton href="#flex" variant="outline">
              Looking for part-time driving? Learn more here.
            </DriverButton>
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
      <DriverPathCards />
      <ValueAndStats />
      <FlexProgram />
      <HowFlexWorks />
      <DriverBenefitCards />
      <GroupedDeliveryTimeline />
      <DriverAccordion heading="Requirements for eligibility" idPrefix="driver-eligibility" items={eligibilityItems} />
      <ApplyCta />
      <FleetProgram />
      <DriverAccordion heading="More information" idPrefix="driver-more-info" items={moreInfoItems} />
      <OpenPositionsCta />
    </div>
  );
}
