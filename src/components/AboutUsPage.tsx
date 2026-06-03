import { useEffect, useRef, useState, type ReactNode } from "react";

const basePath = import.meta.env.BASE_URL;

const aboutSections = [
  {
    src: `${basePath}images/about/about-hero.png`,
    alt: "FoodOnlines.com message that Asian groceries should be widely accessible and affordable for all",
    loading: "eager" as const,
    className: "pt-8 sm:pt-10 lg:pt-12",
  },
  {
    src: `${basePath}images/about/about-mission.png`,
    alt: "FoodOnlines.com mission to make authentic Asian groceries affordable for everyone",
    loading: "lazy" as const,
    className: "pt-10 sm:pt-14 lg:pt-16",
  },
  {
    src: `${basePath}images/about/about-delivery-scale.png`,
    alt: "FoodOnlines.com teams fulfill and deliver more than 100,000 orders every day",
    loading: "lazy" as const,
    className: "py-10 sm:py-14 lg:py-16",
  },
];

const timelineMilestones = [
  {
    year: "1999",
    title: "Global Sourcing Foundation",
    body: "Established as a global sourcing and procurement company under American Buying Service, providing purchasing, product development, and supply chain solutions for major retail chains across the United States.",
  },
  {
    year: "2005",
    title: "Manufacturing And Brand Development",
    body: "Expanded into product manufacturing and proprietary consumer brands distributed through leading national retail chains, later transitioning several food brands through strategic acquisitions by major manufacturers.",
  },
  {
    year: "2007",
    title: "Technology And Capital Expansion",
    body: "Diversified with Mstar Technologies for website, e-commerce, and digital marketing services, while Mstar Capital Group provided investment capital and strategic support to startups and growth-stage companies.",
  },
  {
    year: "2015",
    title: "Unified Holding Platform",
    body: "Consolidated affiliated businesses under Mstar Holding Inc., creating a unified investment and operating platform focused on technology ventures and successful startup exits.",
  },
  {
    year: "2019",
    title: "FoodOnlines.com Launch",
    body: "Launched FoodOnlines.com as an e-commerce marketplace originating in the United States, later expanding into Southeast Asia and building a global food commerce ecosystem.",
  },
  {
    year: "Today",
    title: "Global Digital Supermarket",
    body: "FoodOnlines is evolving into a global digital supermarket platform, making products from every culture accessible and affordable while connecting manufacturers and consumers through technology-driven commerce.",
  },
];

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return {
    ref,
    className: isVisible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0",
  };
}

function AboutImageSection({
  alt,
  children,
  className,
  loading,
  src,
}: {
  alt: string;
  children?: ReactNode;
  className: string;
  loading: "eager" | "lazy";
  src: string;
}) {
  const reveal = useReveal<HTMLElement>();

  return (
    <section
      ref={reveal.ref}
      className={`mx-auto w-full max-w-[1648px] px-0 transition-all duration-700 ease-out sm:px-4 lg:px-6 ${reveal.className} ${className}`}
    >
      {children}
      <img
        alt={alt}
        className="block h-auto w-full max-w-full object-contain"
        decoding="async"
        fetchPriority={loading === "eager" ? "high" : "auto"}
        loading={loading}
        src={src}
      />
    </section>
  );
}

function AboutTimelineSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;

    let frame = 0;

    const updateActiveMilestone = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const scrollerCenter = scroller.getBoundingClientRect().left + scroller.clientWidth / 2;
        let nearestIndex = 0;
        let nearestDistance = Number.POSITIVE_INFINITY;

        itemRefs.current.forEach((item, index) => {
          if (!item) return;

          const rect = item.getBoundingClientRect();
          const itemCenter = rect.left + rect.width / 2;
          const distance = Math.abs(itemCenter - scrollerCenter);

          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestIndex = index;
          }
        });

        setActiveIndex(nearestIndex);
      });
    };

    updateActiveMilestone();
    scroller.addEventListener("scroll", updateActiveMilestone, { passive: true });
    window.addEventListener("resize", updateActiveMilestone);

    return () => {
      window.cancelAnimationFrame(frame);
      scroller.removeEventListener("scroll", updateActiveMilestone);
      window.removeEventListener("resize", updateActiveMilestone);
    };
  }, []);

  const scrollToMilestone = (index: number) => {
    itemRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  };

  return (
    <section aria-label="FoodOnlines company timeline" className="overflow-hidden bg-[#f3f4f2] py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-[1648px]">
        <div className="px-4 text-center sm:px-6">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-leaf-600">Our Story</p>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.03em] text-neutral-950 sm:text-4xl lg:text-5xl">
            A FoodOnlines timeline built for global grocery access
          </h2>
        </div>

        <div
          ref={scrollRef}
          className="relative mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain scroll-smooth px-[8vw] pb-4 pt-2 [scrollbar-width:none] sm:gap-8 sm:px-[12vw] lg:px-[18vw]"
        >
          <div className="pointer-events-none absolute left-0 right-0 top-[234px] z-0 h-1 bg-leaf-500 sm:top-[254px]" aria-hidden="true" />
          {timelineMilestones.map((milestone, index) => (
            <article
              aria-label={`${milestone.year}: ${milestone.title}`}
              className="relative z-10 min-h-[560px] w-[84vw] max-w-[820px] shrink-0 snap-center overflow-hidden rounded-[36px] bg-[#e9e9e9] px-6 py-8 shadow-[0_24px_80px_rgba(15,23,42,0.12)] sm:min-h-[600px] sm:w-[70vw] sm:px-10 lg:w-[58vw] lg:px-14"
              key={milestone.year}
              ref={(element) => {
                itemRefs.current[index] = element;
              }}
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-8 -top-20 text-[12rem] font-light leading-none text-white/70 sm:-right-12 sm:text-[18rem] lg:text-[24rem]"
              >
                {milestone.year === "Today" ? "Now" : milestone.year}
              </span>
              <div className="absolute left-0 right-0 top-[232px] h-1 bg-leaf-500 sm:top-[252px]" aria-hidden="true" />

              <div className="relative z-10 flex h-full flex-col">
                <div className="inline-flex w-fit rounded-[18px] bg-leaf-500 px-5 py-2 text-xl font-black text-white shadow-[0_10px_24px_rgba(111,191,18,0.28)]">
                  {milestone.year}
                </div>

                <div className="mt-10 flex items-center justify-center">
                  <div className="relative flex h-[248px] w-[248px] items-center justify-center rounded-full border-[14px] border-white bg-[radial-gradient(circle_at_35%_30%,#ffffff_0%,#eef8df_40%,#d9efbe_100%)] shadow-[0_24px_56px_rgba(15,23,42,0.22)] sm:h-[300px] sm:w-[300px]">
                    <div className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-[5px] border-white bg-leaf-500 shadow-[0_0_0_8px_rgba(111,191,18,0.18)]" />
                    <div className="relative h-24 w-24 rounded-full bg-white/90 shadow-[0_16px_34px_rgba(15,23,42,0.12)]" aria-hidden="true">
                      <span className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-leaf-500/70" />
                      <span className="absolute right-4 top-4 h-4 w-4 rounded-full bg-citrus-500/80" />
                      <span className="absolute bottom-5 left-5 h-3 w-10 rounded-full bg-leaf-500/50" />
                    </div>
                  </div>
                </div>

                <div className="mt-auto max-w-2xl pt-10">
                  <h3 className="text-[2rem] font-black leading-tight tracking-[-0.03em] text-neutral-950 sm:text-[2.45rem]">
                    {milestone.title}
                  </h3>
                  <p className="mt-4 text-base font-medium leading-8 text-neutral-700 sm:text-lg">{milestone.body}</p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div aria-label="Timeline slide navigation" className="mt-3 flex justify-center gap-3">
          {timelineMilestones.map((milestone, index) => {
            const isActive = index === activeIndex;

            return (
              <button
                aria-current={isActive ? "true" : undefined}
                aria-label={`Show ${milestone.year} milestone`}
                className={`h-4 w-4 rounded-full transition focus:outline-none focus:ring-2 focus:ring-leaf-500 focus:ring-offset-2 ${
                  isActive ? "bg-leaf-500 shadow-[0_0_0_4px_rgba(111,191,18,0.16)]" : "bg-neutral-300 hover:bg-neutral-400"
                }`}
                key={milestone.year}
                onClick={() => scrollToMilestone(index)}
                type="button"
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function AboutUsPage() {
  useEffect(() => {
    document.title = "About FoodOnlines | Asian Groceries Online";

    const description =
      "Learn about FoodOnlines.com, our mission to make authentic Asian groceries more accessible, affordable, and easy to receive.";
    let metaDescription = document.querySelector<HTMLMetaElement>('meta[name="description"]');

    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.name = "description";
      document.head.appendChild(metaDescription);
    }

    metaDescription.content = description;
  }, []);

  return (
    <div className="overflow-x-hidden bg-white pt-[116px] sm:pt-[128px] lg:pt-[138px]">
      <AboutImageSection {...aboutSections[0]} />
      <AboutTimelineSection />
      {aboutSections.slice(1).map((section) => (
        <AboutImageSection key={section.src} {...section} />
      ))}
    </div>
  );
}
