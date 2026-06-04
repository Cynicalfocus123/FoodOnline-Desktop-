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

const preTimelineSections = [
  {
    src: `${basePath}images/about/about-global-foods.png`,
    alt: "Connecting people around the world with the foods they love most",
    loading: "lazy" as const,
    className: "pt-10 sm:pt-14 lg:pt-16",
  },
  {
    src: `${basePath}images/about/about-authentic-flavors.png`,
    alt: "Bringing the world's authentic flavors to every table",
    loading: "lazy" as const,
    className: "pt-0",
  },
];

const leadershipCards = [
  {
    name: "Jakapun Viwatkurkul",
    role: "President and Founder",
    image: `${basePath}images/about/leadership/jakapun-viwatkurkul.webp`,
    imageAlt: "Jakapun Viwatkurkul",
  },
  {
    name: "Paul Pongpichan",
    role: "CSCO (Chief Supply Chain Officer)",
    image: `${basePath}images/about/leadership/paul-pongpichan.webp`,
    imageAlt: "Paul Pongpichan",
  },
  {
    name: "Pasit Viwatkurkul",
    role: "CTO",
    image: `${basePath}images/about/leadership/pasit-viwatkurkul.webp`,
    imageAlt: "Pasit Viwatkurkul",
  },
  {
    name: "Natalie",
    role: "CFO",
    image: `${basePath}images/about/leadership/natalie.png`,
    imageAlt: "Natalie",
  },
  {
    name: "Lucas Huber",
    role: "COO",
    image: `${basePath}images/about/leadership/lucas-huber.png`,
    imageAlt: "Lucas Huber",
    imageClassName: "scale-[1.13]",
  },
  {
    name: "Anna Goldstein",
    role: "Chief Marketing Officer / CMO",
    image: `${basePath}images/about/leadership/anna-goldstein.png`,
    imageAlt: "Anna Goldstein",
    imageClassName: "object-cover object-[50%_20%]",
  },
  {
    name: "Janet Weiler",
    role: "Chief Commercial Officer / CCO",
    image: `${basePath}images/about/leadership/janet-weiler.png`,
    imageAlt: "Janet Weiler",
    imageClassName: "object-cover object-[50%_18%]",
  },
  {
    name: "Ahmet Yılmaz",
    role: "Chief Customer & Experience Officer / CXO",
    image: `${basePath}images/about/leadership/ahmet-yilmaz.png`,
    imageAlt: "Ahmet Yılmaz",
    imageClassName: "object-cover object-[50%_12%]",
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
  return (
    <section
      aria-label="FoodOnlines company timeline"
      className="bg-[#f3f4f2] py-12 sm:py-16 lg:py-20"
    >
      <div className="mx-auto max-w-[1648px] px-4 sm:px-6 lg:px-8">
        <div className="px-4 text-center sm:px-6">
          <h2 className="text-5xl font-black leading-none tracking-[-0.03em] text-neutral-950 sm:text-6xl lg:text-7xl">
            Our Story
          </h2>
        </div>

        <div className="relative mx-auto mt-12 max-w-6xl pb-2 sm:mt-16 lg:mt-20">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-10 left-[34px] top-6 w-1 rounded-full bg-leaf-500 sm:left-1/2 sm:-translate-x-1/2"
          />
          <div className="space-y-12 sm:space-y-16 lg:space-y-20">
            {timelineMilestones.map((milestone, index) => {
              const textAlignClass = index % 2 === 0 ? "sm:pr-14 sm:text-right" : "sm:col-start-2 sm:pl-14 sm:text-left";
              const bodyAlignClass = index % 2 === 0 ? "sm:ml-auto" : "";
              const imageAlignClass = index % 2 === 0 ? "sm:col-start-2 sm:pl-14" : "sm:col-start-1 sm:row-start-1 sm:pr-14";

              return (
                <article
                  aria-label={`${milestone.year}: ${milestone.title}`}
                  className="relative grid gap-6 pl-24 sm:grid-cols-2 sm:items-center sm:gap-0 sm:pl-0"
                  key={milestone.year}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none absolute -top-8 hidden text-[8rem] font-light leading-none text-white/70 sm:block lg:text-[12rem] ${
                      index % 2 === 0 ? "left-4" : "right-4"
                    }`}
                  >
                    {milestone.year === "Today" ? "Now" : milestone.year}
                  </span>
                  <div
                    aria-hidden="true"
                    className="absolute left-[26px] top-[126px] z-10 h-5 w-5 rounded-full border-4 border-white bg-leaf-500 shadow-[0_0_0_8px_rgba(111,191,18,0.16)] sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2"
                  />

                  <div className={`relative z-10 ${textAlignClass}`}>
                    <div className="inline-flex w-fit rounded-[18px] bg-leaf-500 px-5 py-2 text-xl font-black text-white shadow-[0_10px_24px_rgba(111,191,18,0.28)]">
                      {milestone.year}
                    </div>
                    <h3 className="mt-5 text-[2rem] font-black leading-tight tracking-[-0.03em] text-neutral-950 sm:text-[2.45rem]">
                      {milestone.title}
                    </h3>
                    <p className={`mt-4 max-w-xl text-base font-medium leading-8 text-neutral-700 sm:text-lg ${bodyAlignClass}`}>
                      {milestone.body}
                    </p>
                  </div>

                  <div className={`relative z-10 flex justify-start sm:justify-center ${imageAlignClass}`}>
                    <div className="relative flex h-[224px] w-[224px] items-center justify-center rounded-full border-[14px] border-white bg-[radial-gradient(circle_at_35%_30%,#ffffff_0%,#eef8df_40%,#d9efbe_100%)] shadow-[0_24px_56px_rgba(15,23,42,0.22)] sm:h-[284px] sm:w-[284px] lg:h-[320px] lg:w-[320px]">
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
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function LeadershipPlaceholderSection() {
  const reveal = useReveal<HTMLElement>();

  return (
    <section
      aria-label="FoodOnlines leadership"
      ref={reveal.ref}
      className={`mx-auto w-full max-w-[1648px] px-4 pb-12 pt-0 transition-all duration-700 ease-out sm:px-6 sm:pb-16 lg:px-8 lg:pb-20 ${reveal.className}`}
    >
      <h2 className="mb-7 text-[2.65rem] font-black leading-none tracking-normal text-leaf-700 sm:mb-9 sm:text-[3.4rem] lg:mb-10 lg:text-[4rem]">
        Our leadership
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-6">
        {leadershipCards.map((leader, slot) => (
          <article
            aria-label={leader ? `${leader.name}, ${leader.role}` : `Leadership placeholder ${slot + 1}`}
            className="flex min-h-[360px] flex-col overflow-hidden rounded-[26px] border border-neutral-200 bg-white shadow-[0_12px_34px_rgba(15,23,42,0.06)] sm:min-h-[420px] lg:min-h-[520px]"
            key={leader?.name ?? `placeholder-${slot}`}
          >
            {leader ? (
              <>
                <div className="px-6 pb-4 pt-7 sm:px-7 sm:pt-8 lg:px-8">
                  <h3 className="text-[1.75rem] font-semibold leading-tight tracking-normal text-neutral-950 sm:text-[2rem]">
                    {leader.name}
                  </h3>
                  <p className="mt-2 text-lg font-normal leading-snug text-neutral-950 sm:text-xl">{leader.role}</p>
                </div>
                <div className="mt-auto flex h-[260px] items-end justify-center px-2 pt-2 sm:h-[310px] lg:h-[380px]">
                  <img
                    alt={leader.imageAlt}
                    className={`h-full w-full ${leader.imageClassName ?? "object-contain object-bottom"}`}
                    decoding="async"
                    loading="lazy"
                    src={leader.image}
                  />
                </div>
              </>
            ) : null}
          </article>
        ))}
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
    <div className="bg-white pt-[116px] sm:pt-[128px] lg:pt-[138px]">
      <AboutImageSection {...aboutSections[0]} />
      {preTimelineSections.map((section) => (
        <AboutImageSection key={section.src} {...section} />
      ))}
      <AboutTimelineSection />
      {aboutSections.slice(1).map((section) => (
        <AboutImageSection key={section.src} {...section} />
      ))}
      <LeadershipPlaceholderSection />
    </div>
  );
}
