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
    image: `${basePath}images/about/timeline/timeline-1999.png`,
    imageAlt: "American Buying Service warehouse building",
  },
  {
    year: "2005",
    title: "Manufacturing And Brand Development",
    body: "Expanded into product manufacturing and proprietary consumer brands distributed through leading national retail chains, later transitioning several food brands through strategic acquisitions by major manufacturers.",
    image: `${basePath}images/about/timeline/timeline-2005.png`,
    imageAlt: "Food manufacturing visitors wearing lab coats",
  },
  {
    year: "2007",
    title: "Technology And Capital Expansion",
    body: "Diversified with Mstar Technologies for website, e-commerce, and digital marketing services, while Mstar Capital Group provided investment capital and strategic support to startups and growth-stage companies.",
    image: `${basePath}images/about/timeline/timeline-2007.png`,
    imageAlt: "Technology team gathered in an office",
  },
  {
    year: "2015",
    title: "Unified Holding Platform",
    body: "Consolidated affiliated businesses under Mstar Holding Inc., creating a unified investment and operating platform focused on technology ventures and successful startup exits.",
    image: `${basePath}images/about/timeline/timeline-2015.png`,
    imageAlt: "Supermarket checkout and grocery aisles",
  },
  {
    year: "2019",
    title: "FoodOnlines.com Launch",
    body: "Launched FoodOnlines.com as an e-commerce marketplace originating in the United States, later expanding into Southeast Asia and building a global food commerce ecosystem.",
    image: `${basePath}images/about/timeline/timeline-2019.png`,
    imageAlt: "FoodOnlines driver loading branded boxes into a van",
  },
  {
    year: "Today",
    title: "Global Digital Supermarket",
    body: "FoodOnlines is evolving into a global digital supermarket platform, making products from every culture accessible and affordable while connecting manufacturers and consumers through technology-driven commerce.",
    image: `${basePath}images/about/timeline/timeline-today.png`,
    imageAlt: "FoodOnlines warehouse with delivery trucks",
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
  const sectionRef = useRef<HTMLElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLElement | null>>([]);
  const scrollRangeRef = useRef(0);

  useEffect(() => {
    const section = sectionRef.current;
    const scroller = scrollRef.current;
    if (!section || !scroller) return;

    let frame = 0;

    const syncTimelineToPageScroll = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const maxScrollLeft = Math.max(scroller.scrollWidth - scroller.clientWidth, 0);
        const scrollRange = Math.max(maxScrollLeft, window.innerHeight * 0.8);
        const sectionTop = section.getBoundingClientRect().top + window.scrollY;
        const progress = Math.min(Math.max((window.scrollY - sectionTop) / scrollRange, 0), 1);

        scrollRangeRef.current = scrollRange;
        section.style.height = `${window.innerHeight + scrollRange}px`;
        scroller.scrollLeft = maxScrollLeft * progress;
        setActiveIndex(Math.round(progress * (timelineMilestones.length - 1)));
      });
    };

    syncTimelineToPageScroll();
    window.addEventListener("scroll", syncTimelineToPageScroll, { passive: true });
    window.addEventListener("resize", syncTimelineToPageScroll);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", syncTimelineToPageScroll);
      window.removeEventListener("resize", syncTimelineToPageScroll);
      section.style.removeProperty("height");
    };
  }, []);

  const scrollToMilestone = (index: number) => {
    const section = sectionRef.current;
    if (!section) return;

    const sectionTop = section.getBoundingClientRect().top + window.scrollY;
    const progress = timelineMilestones.length > 1 ? index / (timelineMilestones.length - 1) : 0;

    window.scrollTo({
      behavior: "smooth",
      top: sectionTop + scrollRangeRef.current * progress,
    });
  };

  return (
    <section ref={sectionRef} aria-label="FoodOnlines company timeline" className="relative overflow-hidden bg-[#f3f4f2]">
      <div className="sticky top-[116px] mx-auto flex min-h-[calc(100vh-116px)] max-w-[1648px] flex-col justify-center py-12 sm:top-[128px] sm:min-h-[calc(100vh-128px)] sm:py-16 lg:top-[138px] lg:min-h-[calc(100vh-138px)] lg:py-20">
        <div className="px-4 text-center sm:px-6">
          <h2 className="text-5xl font-black leading-none tracking-[-0.03em] text-neutral-950 sm:text-6xl lg:text-7xl">
            Our Story
          </h2>
        </div>

        <div
          ref={scrollRef}
          className="about-timeline-scroller relative mt-10 flex gap-5 overflow-x-hidden px-[8vw] pb-4 pt-2 [scrollbar-width:none] [touch-action:pan-y_pinch-zoom] sm:gap-8 sm:px-[12vw] lg:px-[18vw]"
        >
          <div className="pointer-events-none absolute left-0 right-0 top-[234px] z-0 h-1 bg-leaf-500 sm:top-[254px]" aria-hidden="true" />
          {timelineMilestones.map((milestone, index) => (
            <article
              aria-label={`${milestone.year}: ${milestone.title}`}
              className="relative z-10 min-h-[560px] w-[84vw] max-w-[820px] shrink-0 snap-center overflow-hidden px-6 py-8 sm:min-h-[600px] sm:w-[70vw] sm:px-10 lg:w-[58vw] lg:px-14"
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
                <div className="flex flex-col items-center">
                  <div className="inline-flex w-fit rounded-[18px] bg-leaf-500 px-5 py-2 text-xl font-black text-white shadow-[0_10px_24px_rgba(111,191,18,0.28)]">
                    {milestone.year}
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-center">
                  <div className="relative flex h-[248px] w-[248px] items-center justify-center rounded-full border-[14px] border-white bg-[radial-gradient(circle_at_35%_30%,#ffffff_0%,#eef8df_40%,#d9efbe_100%)] shadow-[0_24px_56px_rgba(15,23,42,0.22)] sm:h-[300px] sm:w-[300px]">
                    {milestone.image ? (
                      <img
                        alt={milestone.imageAlt}
                        className="h-full w-full rounded-full object-cover"
                        decoding="async"
                        draggable={false}
                        loading="lazy"
                        src={milestone.image}
                      />
                    ) : (
                      <>
                        <div className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-[5px] border-white bg-leaf-500 shadow-[0_0_0_8px_rgba(111,191,18,0.18)]" />
                        <div className="relative h-24 w-24 rounded-full bg-white/90 shadow-[0_16px_34px_rgba(15,23,42,0.12)]" aria-hidden="true">
                          <span className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-leaf-500/70" />
                          <span className="absolute right-4 top-4 h-4 w-4 rounded-full bg-citrus-500/80" />
                          <span className="absolute bottom-5 left-5 h-3 w-10 rounded-full bg-leaf-500/50" />
                        </div>
                      </>
                    )}
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
