import { useEffect } from "react";

const basePath = import.meta.env.BASE_URL;
const sponsorImagePath = (fileName: string) => `${basePath}images/become-sponsor/${fileName}`;
const sponsorMailto = "mailto:info@foodonlines.com";
const adsLoginHref = "#ads-login";

type SponsorAction = "mailto" | "adsLogin";

const adSections = [
  {
    eyebrow: "SPONSORED PRODUCTS",
    title: "Search Results Advertising",
    body:
      "Increase visibility by appearing at the top of search results. Target relevant keywords and secure premium placement to connect with shoppers actively looking for products like yours.",
    image: "search-results-advertising.png",
    alt: "FoodOnlines search results advertising placement mockup",
    background: "bg-[#afc6a8]",
    imagePosition: "object-[82%_center]",
    showButton: false,
  },
  {
    eyebrow: "SPONSORED PRODUCTS",
    title: "Deals, Bestsellers & New Arrivals",
    body:
      "Showcase your products in high-traffic destinations where shoppers actively explore trending products, top sellers, and the best deals.",
    image: "deals-bestsellers-new-arrivals.png",
    alt: "FoodOnlines sponsored product listings for deals bestsellers and new arrivals",
    background: "bg-[#ffe399]",
    imagePosition: "object-[82%_center]",
    showButton: false,
  },
  {
    eyebrow: "SPONSORED PRODUCTS",
    title: "Category Pages",
    body:
      "Increase product visibility by featuring your products within relevant category pages, where shoppers actively browse, compare, and discover new favorites.",
    image: "category-pages.png",
    alt: "FoodOnlines sponsored product placements on category pages",
    background: "bg-[#bfeefa]",
    imagePosition: "object-[82%_center]",
    showButton: false,
  },
  {
    eyebrow: "SPONSORED PRODUCTS",
    title: "Featured on the Homepage",
    body:
      "Put your brand front and center with high-impact homepage placements designed to increase awareness, engagement, and sales.",
    image: "featured-homepage.png",
    alt: "FoodOnlines featured homepage advertising placement",
    background: "bg-[#f7c2d4]",
    imagePosition: "object-[82%_center]",
    showButton: false,
  },
  {
    eyebrow: "SPONSORED PRODUCTS",
    title: "Homepage Brand Takeover",
    body:
      "Own premium homepage visibility with high-impact placements designed to introduce your brand to shoppers the moment they start browsing.",
    image: "homepage-brand-takeover.png",
    alt: "FoodOnlines homepage brand takeover product placement mockup",
    background: "bg-[#f7c2d4]",
    imagePosition: "object-center",
    squareVisual: true,
    showButton: false,
  },
  {
    eyebrow: "SPONSORED PRODUCTS",
    title: "Product Detail Pages",
    body:
      "Engage shoppers at a critical point in their buying journey by showcasing your products alongside items they are actively considering.",
    image: "product-detail-pages.png",
    alt: "FoodOnlines product detail page advertising placement",
    background: "bg-[#fac38d]",
    imagePosition: "object-[82%_center]",
    showButton: true,
  },
];

function goToSponsorAction(action: SponsorAction) {
  if (typeof window === "undefined") {
    return;
  }

  window.location.href = action === "adsLogin" ? adsLoginHref : sponsorMailto;
}

function ArrowIcon() {
  return (
    <span aria-hidden="true" className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-black text-white sm:h-14 sm:w-14">
      <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" viewBox="0 0 24 24">
        <path d="M5 12h13" />
        <path d="m12 5 7 7-7 7" />
      </svg>
    </span>
  );
}

function SponsorButton({
  children,
  action = "mailto",
  className = "",
  showArrow = false,
}: {
  children: string;
  action?: SponsorAction;
  className?: string;
  showArrow?: boolean;
}) {
  return (
    <button
      className={`inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-white px-8 text-[clamp(1.05rem,1.5vw,1.55rem)] font-black leading-none text-black shadow-[0_14px_36px_rgba(0,0,0,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(0,0,0,0.13)] focus:outline-none focus-visible:ring-4 focus-visible:ring-black/20 ${className}`}
      onClick={() => goToSponsorAction(action)}
      type="button"
    >
      <span>{children}</span>
      {showArrow ? <ArrowIcon /> : null}
    </button>
  );
}

function Eyebrow({ children, className = "" }: { children: string; className?: string }) {
  return <p className={`text-[clamp(1rem,1.75vw,1.9rem)] font-normal uppercase leading-tight tracking-[0.16em] text-black ${className}`}>{children}</p>;
}

function HeroIntroSection() {
  return (
    <section className="mx-auto w-full max-w-[1650px] px-[clamp(1.2rem,6vw,6.4rem)] pb-[clamp(4.5rem,8vw,7rem)] pt-[clamp(5rem,9vw,9.8rem)]">
      <h1 className="mx-auto max-w-[900px] text-center text-[clamp(1.7rem,3.6vw,3.2rem)] font-black leading-[1.2] text-black">
        Expand Your Reach to Millions of
        <br className="hidden md:block" />
        Qualified Consumers Worldwide
      </h1>

      <div className="mt-[clamp(3rem,5vw,4.8rem)] grid gap-8 lg:grid-cols-2">
        <article className="grid gap-7 rounded-[22px] bg-[#64bd00] px-[clamp(1.7rem,3vw,2.8rem)] py-[clamp(2rem,3.6vw,3.25rem)] shadow-[0_24px_64px_rgba(54,91,31,0.18)] sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <Eyebrow className="text-[clamp(1rem,1.45vw,1.8rem)] font-bold tracking-[0.18em]">AD PRODUCTS</Eyebrow>
            <h2 className="mt-4 text-[clamp(1.85rem,2.8vw,2.55rem)] font-black leading-tight text-black">Unlock online growth</h2>
            <p className="mt-3 max-w-[430px] text-[clamp(1.08rem,1.65vw,1.55rem)] font-medium leading-[1.14] text-black">
              Solution to expand reach,
              <br />
              elevate brands &amp; drive growth
            </p>
          </div>
          <SponsorButton className="justify-self-start px-9 sm:justify-self-end" action="mailto">
            Get Started
          </SponsorButton>
        </article>

        <article className="grid gap-7 rounded-[22px] bg-[#ff6b1a] px-[clamp(1.7rem,3vw,2.8rem)] py-[clamp(2rem,3.6vw,3.25rem)] shadow-[0_24px_64px_rgba(143,64,19,0.18)] sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <Eyebrow className="text-[clamp(1rem,1.45vw,1.8rem)] font-bold tracking-[0.18em]">AD TOOLS</Eyebrow>
            <h2 className="mt-4 text-[clamp(1.85rem,2.8vw,2.55rem)] font-black leading-tight text-black">Drive proven results</h2>
            <p className="mt-3 max-w-[480px] text-[clamp(1.08rem,1.65vw,1.55rem)] font-medium leading-[1.14] text-black">
              Self-serve tools for targeting,
              <br />
              measurement, and optimization
            </p>
          </div>
          <SponsorButton className="justify-self-start px-9 sm:justify-self-end" action="mailto">
            Get Started
          </SponsorButton>
        </article>
      </div>
    </section>
  );
}

function Sparkle() {
  return (
    <svg aria-hidden="true" className="h-12 w-12 shrink-0 text-black sm:h-16 sm:w-16" fill="currentColor" viewBox="0 0 64 64">
      <path d="M32 1c3.6 16.4 13.6 26.4 31 31-17.4 4.6-27.4 14.6-31 31C28.4 46.6 18.4 36.6 1 32 18.4 27.4 28.4 17.4 32 1Z" />
    </svg>
  );
}

function ReachStatsSection() {
  const stats = [
    { value: "30\nMILLION+", label: "Trusted by customers around the world" },
    { value: "ZERO", label: "Only pay low commission on what you sell" },
    { value: "20 MILLION+\nMONTHLY\nVISITS", label: "" },
    { value: "90 %", label: "YOY growth" },
  ];

  return (
    <section className="mx-auto w-full max-w-[1650px] px-[clamp(1.5rem,5.8vw,6rem)] py-[clamp(4.2rem,7vw,5.8rem)]">
      <div className="text-center">
        <h2 className="text-[clamp(1.85rem,3.5vw,3.05rem)] font-black uppercase leading-none text-black">EXPAND YOUR REACH</h2>
        <p className="mx-auto mt-4 max-w-[850px] text-[clamp(1.05rem,1.7vw,1.85rem)] font-bold leading-[1.15] text-black">
          Maximize your brand&apos;s impact with data-driven advertising solutions
          <br className="hidden md:block" />
          designed to achieve your business objectives.
        </p>
      </div>

      <div className="mx-auto mt-[clamp(3rem,6vw,5.4rem)] w-full max-w-[960px]">
        <Eyebrow className="border-b border-[#ff6b1a] pb-3 text-center normal-case">Advertise on the World&apos;s #1 Grocery App</Eyebrow>
        <div className="grid border-b border-[#ff6b1a] sm:grid-cols-2">
          {stats.map((stat, index) => (
            <div
              className={`flex min-w-0 justify-center gap-4 px-2 py-[clamp(1.6rem,3.2vw,2.5rem)] sm:justify-start sm:px-5 lg:px-8 ${
                index < 2 ? "border-b border-[#ff6b1a]" : ""
              }`}
              key={stat.value}
            >
              <Sparkle />
              <div className="min-w-0">
                <p className="whitespace-pre-line break-words text-[clamp(1.8rem,3.8vw,3rem)] font-black uppercase leading-[1.14] text-black">{stat.value}</p>
                {stat.label ? <p className="mt-4 max-w-[310px] text-[clamp(0.98rem,1.25vw,1.08rem)] font-medium leading-snug text-black">{stat.label}</p> : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SponsoredOverviewSection() {
  return (
    <section className="mx-auto w-full max-w-[1650px] px-[clamp(1.5rem,5.4vw,5.5rem)] py-[clamp(4rem,6.5vw,5.8rem)]">
      <h2 className="text-[clamp(1.8rem,3.6vw,3.05rem)] font-black uppercase leading-none text-black">SPONSORED PRODUCTS</h2>
      <div className="mt-8 grid overflow-hidden rounded-[42px] bg-[#a9d3df] shadow-[0_24px_64px_rgba(0,0,0,0.08)] lg:grid-cols-[1.25fr_0.75fr]">
        <div className="px-[clamp(2rem,4.2vw,4.3rem)] py-[clamp(3rem,5.8vw,6.5rem)]">
          <h3 className="text-[clamp(1.8rem,3vw,3.05rem)] font-black leading-[1.25] text-black">
            Weekly Deals
            <br />
            That Drive Results
          </h3>
          <p className="mt-4 max-w-[880px] text-[clamp(1.35rem,2.4vw,2.7rem)] font-medium leading-[1.15] text-black">
            Increase exposure, attract more customers, and
            <br className="hidden xl:block" />
            accelerate sales with featured weekly promotions
            <br className="hidden xl:block" />
            amplified through our marketing channels.
          </p>
        </div>
        <div className="relative min-h-[330px] overflow-hidden lg:min-h-full">
          <img
            alt="FoodOnlines sponsored products weekly deals promotion mockup"
            className="absolute inset-0 h-full w-full scale-[1.55] object-cover object-[84%_center]"
            loading="lazy"
            src={sponsorImagePath("sponsored-products.png")}
          />
        </div>
      </div>
    </section>
  );
}

function FinalCtaSection() {
  return (
    <section className="mx-auto w-full max-w-[1650px] px-[clamp(1.5rem,5vw,5rem)] py-[clamp(4.5rem,7vw,7.2rem)] text-center">
      <Eyebrow className="normal-case">Advertise on the World&apos;s #1 Grocery App</Eyebrow>
      <h2 className="mx-auto mt-6 max-w-[620px] text-[clamp(1.55rem,2.7vw,2.1rem)] font-black uppercase leading-[1.18] text-black">
        REACH MILLION OF HIGH-INTEND
        <br className="hidden md:block" />
        ASIAN CONSUMERS
      </h2>
      <p className="mx-auto mt-6 max-w-[660px] text-[clamp(1.25rem,2vw,1.95rem)] font-medium leading-[1.18] text-black">
        Maximize impact with proven advertising
        <br />
        solution tailored to your goals
      </p>

      <div className="mx-auto mt-10 max-w-[620px] rounded-[34px] border-2 border-dashed border-[#a9d3df] bg-white/70 px-7 py-8 shadow-[0_24px_70px_rgba(86,116,130,0.14)] sm:px-14">
        <SponsorButton className="w-full bg-[#a9d3df] shadow-none" action="mailto">
          CONTACT US
        </SponsorButton>
        <p className="my-5 text-[clamp(1.35rem,2vw,1.7rem)] font-medium text-black">or</p>
        <SponsorButton className="w-full bg-[#d8e9c4] shadow-none" action="adsLogin">
          ADS LOGIN
        </SponsorButton>
      </div>

      <p className="mt-9 text-[clamp(1rem,1.25vw,1.25rem)] font-medium text-black">
        Reach us at{" "}
        <a className="font-black transition hover:text-[#ff6b1a] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#ff6b1a]/30" href={sponsorMailto}>
          info@foodonlines.com
        </a>
      </p>
    </section>
  );
}

function AdProductSection({
  section,
}: {
  section: (typeof adSections)[number];
}) {
  return (
    <section className={`${section.background} relative overflow-hidden`}>
      <div className="absolute -bottom-[22%] -left-[10%] h-[54%] w-[65%] rounded-[50%] bg-white/18" aria-hidden="true" />
      <div className="absolute -right-[7%] -top-[28%] h-[70%] w-[38%] rounded-[50%] bg-white/24" aria-hidden="true" />
      <div className="relative mx-auto grid min-h-[500px] w-full max-w-[1650px] gap-8 px-[clamp(1.5rem,7.8vw,8.2rem)] py-[clamp(4rem,6vw,6.4rem)] lg:grid-cols-[minmax(0,1fr)_minmax(440px,0.72fr)] lg:items-center">
        <div className="relative z-10">
          <Eyebrow>{section.eyebrow}</Eyebrow>
          <h2 className="mt-3 max-w-[650px] text-[clamp(1.45rem,2.5vw,2rem)] font-black leading-[1.08] text-black">{section.title}</h2>
          <p className="mt-5 max-w-[920px] text-[clamp(1.2rem,2vw,1.9rem)] font-medium leading-[1.16] text-black">{section.body}</p>
          {section.showButton ? (
            <SponsorButton className="mt-9 border-[7px] border-black px-8 py-1 text-[clamp(1.4rem,2.4vw,2.35rem)] font-medium shadow-none sm:min-h-[86px] sm:px-12" action="mailto" showArrow>
              Get Started
            </SponsorButton>
          ) : null}
        </div>

        <div className={`relative z-10 overflow-hidden ${section.squareVisual ? "mx-auto aspect-square max-w-[420px] rounded-[28px]" : "min-h-[300px] rounded-[28px] lg:min-h-[410px]"}`}>
          <img
            alt={section.alt}
            className={`h-full w-full ${section.squareVisual ? "object-contain" : `scale-[1.7] object-cover ${section.imagePosition}`} drop-shadow-[0_18px_38px_rgba(0,0,0,0.12)]`}
            loading="lazy"
            src={sponsorImagePath(section.image)}
          />
        </div>
      </div>
    </section>
  );
}

export function BecomeSponsorPage() {
  useEffect(() => {
    document.title = "Become a Sponsor | FoodOnlines";

    const description = "Advertise with FoodOnlines to reach qualified grocery shoppers through sponsored products, homepage placements, and product page ads.";
    let metaDescription = document.querySelector<HTMLMetaElement>('meta[name="description"]');

    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.name = "description";
      document.head.appendChild(metaDescription);
    }

    metaDescription.content = description;
  }, []);

  return (
    <div
      className="overflow-hidden bg-[linear-gradient(112deg,#fff6e9_0%,#ffffff_47%,#ecffd9_100%)] pt-[116px] text-black sm:pt-[128px] lg:pt-[138px]"
      style={{ fontFamily: 'Montserrat, Inter, "Nunito Sans", ui-sans-serif, system-ui, sans-serif' }}
    >
      <HeroIntroSection />
      <ReachStatsSection />
      <SponsoredOverviewSection />
      <FinalCtaSection />
      {adSections.map((section) => (
        <AdProductSection key={section.title} section={section} />
      ))}
    </div>
  );
}
