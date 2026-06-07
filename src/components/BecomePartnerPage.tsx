import { useEffect } from "react";
import type { ReactNode } from "react";

const basePath = import.meta.env.BASE_URL;
const partnerImagePath = (fileName: string) => `${basePath}images/become-partner/${fileName}`;
const partnerMailto = "mailto:info@foodonlines.com?subject=Become%20a%20Partner%20Inquiry";

type PartnerCardIconType = "globe" | "megaphone" | "growth";

const partnerCards: Array<{
  icon: PartnerCardIconType;
  title: ReactNode;
  body: ReactNode;
  className: string;
}> = [
  {
    icon: "globe",
    title: (
      <>
        Reach More
        <br />
        Customers Worldwide
      </>
    ),
    body: "Partner with Foodonlines.com to showcase your products to a global community of engaged shoppers. Our growing marketplace makes it easier than ever to connect with customers, build brand awareness, and drive sustainable growth beyond your home market.",
    className: "lg:self-start lg:translate-y-[-2.1rem]",
  },
  {
    icon: "megaphone",
    title: (
      <>
        Build a Brand That
        <br />
        Travels Beyond Borders
      </>
    ),
    body: "Through Foodonlines.com, your products gain access to millions of consumers worldwide. Increase brand awareness, enhance your market presence, and create meaningful connections with customers who value quality and authenticity.",
    className: "lg:self-center lg:translate-y-[2.4rem]",
  },
  {
    icon: "growth",
    title: (
      <>
        Drive Growth
        <br />
        Together
      </>
    ),
    body: (
      <>
        At Foodonlines.com, we do more than provide a marketplace&mdash;we help accelerate your growth. By partnering with us, you gain access to new
        customers, expanded market opportunities, and the tools needed to increase sales, strengthen customer loyalty, and scale your business globally.
      </>
    ),
    className: "lg:self-end lg:translate-y-[5.9rem]",
  },
];

function PartnerCardIcon({ type }: { type: "globe" | "megaphone" | "growth" }) {
  const iconFileName = {
    globe: "partner-icon-globe.png",
    megaphone: "partner-icon-megaphone.png",
    growth: "partner-icon-growth.png",
  }[type];

  return (
    <img
      alt=""
      aria-hidden="true"
      className="partner-card-icon h-[clamp(2.7rem,12vw,3.8rem)] w-[clamp(2.7rem,12vw,3.8rem)] object-contain md:h-[clamp(2.6rem,3.4vw,3.6rem)] md:w-[clamp(2.6rem,3.4vw,3.6rem)]"
      loading="lazy"
      src={partnerImagePath(iconFileName)}
    />
  );
}

function PartnerHeroSection() {
  return (
    <section className="relative mx-auto min-h-[940px] w-full max-w-[1650px] overflow-hidden px-[clamp(1.25rem,3.4vw,3.5rem)] pb-[clamp(3rem,5vw,4.6rem)] pt-[clamp(3.2rem,6vw,5.4rem)] sm:min-h-[980px] md:min-h-[840px] lg:aspect-[1650/980] lg:min-h-0">
      <div className="relative z-10 max-w-[900px]">
        <h1 className="text-[clamp(3rem,5vw,5.1rem)] font-bold leading-[1.2] tracking-normal text-black">
          Expand Your Reach
          <br />
          Across Global Markets
        </h1>
        <p className="mt-[clamp(1.1rem,1.8vw,1.5rem)] max-w-[760px] text-[clamp(1.02rem,1.42vw,1.42rem)] font-normal leading-[1.18] text-black">
          Showcase your products to millions of engaged consumers actively
          <br className="hidden sm:block" />
          seeking authentic, high-quality products from around the world.
        </p>
      </div>

      <div className="relative z-0 mt-[clamp(2.4rem,5vw,3.4rem)] grid gap-[clamp(1.15rem,2.6vw,2.4rem)] md:grid-cols-[minmax(0,1fr)_minmax(280px,0.72fr)] lg:absolute lg:inset-x-[3.4%] lg:bottom-[5.2%] lg:mt-0 lg:items-end">
        <img
          alt="A large food table prepared for a shared meal"
          className="partner-hero-food-image block h-[clamp(320px,72vw,520px)] w-full rounded-[12px] object-cover object-center md:h-[clamp(390px,36vw,560px)]"
          loading="eager"
          src={partnerImagePath("partner-food-table.png")}
        />
        <div className="relative pt-[clamp(2.6rem,10vw,4rem)] md:pt-[clamp(2.8rem,5.4vw,4.2rem)]">
          <img
            alt=""
            aria-hidden="true"
            className="partner-hero-leaf pointer-events-none absolute left-0 top-[clamp(0.65rem,2.8vw,1.15rem)] z-20 w-[clamp(3.5rem,14vw,5.5rem)] object-contain md:left-[2%] md:top-[clamp(0.65rem,1.5vw,1.1rem)] md:w-[clamp(3.4rem,5vw,5rem)]"
            draggable={false}
            src={partnerImagePath("partner-leaves.png")}
          />
          <img
            alt="Fruit plate"
            className="partner-hero-fruit-circle pointer-events-none absolute right-[-2%] top-[clamp(0.15rem,1.2vw,0.5rem)] z-20 w-[clamp(6.6rem,31vw,10rem)] rounded-full object-contain drop-shadow-[0_20px_38px_rgba(80,34,48,0.14)] md:right-[-4%] md:top-[clamp(0.1rem,0.8vw,0.45rem)] md:w-[clamp(8rem,13vw,12.5rem)]"
            draggable={false}
            src={partnerImagePath("partner-fruit-plate.png")}
          />
          <img
            alt="Partners stacking hands together"
            className="partner-hero-team-image block h-[clamp(476px,109vw,720px)] w-full rounded-[12px] object-cover object-center md:h-[clamp(546px,50vw,784px)]"
            loading="eager"
            src={partnerImagePath("partner-team.png")}
          />
        </div>
      </div>
    </section>
  );
}

function PartnerCardsSection() {
  return (
    <section className="relative mx-auto min-h-[980px] w-full max-w-[1650px] overflow-visible px-[clamp(1.25rem,3.7vw,3.6rem)] pb-[clamp(6rem,10vw,8.5rem)] pt-[clamp(3.2rem,6vw,4.8rem)] lg:min-h-[1040px]">
      <h2 className="relative z-30 mx-auto max-w-[1040px] text-center text-[clamp(2.55rem,4.2vw,4.4rem)] font-bold leading-[1.18] tracking-normal text-black lg:ml-auto lg:mr-[5.2%]">
        Partner with the World&apos;s Largest
        <br />
        Online Supermarket
      </h2>

      <div className="relative z-10 mt-[clamp(2.2rem,5vw,4rem)] grid gap-6 md:grid-cols-3 lg:absolute lg:inset-x-[7%] lg:bottom-[10%] lg:top-[30%] lg:mt-0 lg:gap-[3.6vw]">
        {partnerCards.map((card) => (
          <article
            className={`flex min-h-[620px] flex-col rounded-[20px] bg-white px-[clamp(1.35rem,2vw,1.75rem)] py-[clamp(1.55rem,2.4vw,2.25rem)] shadow-[0_24px_60px_rgba(82,38,53,0.08)] md:min-h-[760px] lg:min-h-[700px] ${card.className}`}
            key={card.icon}
          >
            <div className="flex min-h-[clamp(4.2rem,16vw,5.6rem)] items-center justify-center md:min-h-[clamp(4rem,5.4vw,5.4rem)]">
              <PartnerCardIcon type={card.icon} />
            </div>
            <h3 className="mt-[clamp(0.55rem,1.3vw,1.25rem)] text-[clamp(1.38rem,1.9vw,1.85rem)] font-bold leading-[1.18] text-black">{card.title}</h3>
            <p className="mt-[clamp(1rem,1.8vw,1.55rem)] text-[clamp(1rem,1.44vw,1.45rem)] font-normal leading-[1.16] text-black">{card.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function PartnerFinalCtaSection() {
  return (
    <section className="mx-auto mt-[clamp(5rem,10vw,10rem)] grid w-full max-w-[1650px] gap-10 px-[clamp(1.25rem,8vw,8.4rem)] py-[clamp(3.5rem,7.3vw,7.4rem)] md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
      <div className="max-w-[820px]">
        <h2 className="text-[clamp(2.25rem,3.3vw,3.35rem)] font-bold leading-tight text-black">Become a Partner</h2>
        <p className="mt-[clamp(0.9rem,1.5vw,1.2rem)] text-[clamp(1.1rem,1.75vw,1.85rem)] font-normal leading-[1.2] text-black">
          Partner with us to unlock new opportunities and connect with
          <br className="hidden lg:block" />
          customers worldwide seeking unique, authentic products and
          <br className="hidden lg:block" />
          services.
        </p>
        <p className="mt-[clamp(1.8rem,3vw,2.7rem)] inline-block border-b-4 border-[#f9a6c6] pb-1 text-[clamp(1.05rem,1.78vw,1.85rem)] font-normal leading-tight text-black">
          To learn more, contact us at{" "}
          <a className="transition hover:text-[#f77ea8] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#f77ea8]/35" href={partnerMailto}>
            info@foodonlines.com
          </a>
        </p>
      </div>

      <a
        aria-label="Contact FoodOnlines about becoming a partner"
        className="inline-flex min-h-[72px] w-full max-w-[480px] items-center justify-center gap-4 rounded-full border-[8px] border-[#f77ea8] bg-white/45 px-[clamp(1.8rem,4vw,5.7rem)] text-[clamp(2.05rem,3vw,3.1rem)] font-normal leading-none text-[#f77ea8] transition hover:-translate-y-0.5 hover:bg-white/70 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#f77ea8]/35 md:min-h-[128px] md:w-[clamp(350px,29vw,480px)]"
        href={partnerMailto}
      >
        <span>Let&apos;s Talk</span>
        <span aria-hidden="true" className="grid h-[clamp(3rem,4vw,3.85rem)] w-[clamp(3rem,4vw,3.85rem)] shrink-0 place-items-center rounded-full bg-[#f77ea8] text-white">
          <svg className="h-8 w-8 md:h-10 md:w-10" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M5 12h13" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </span>
      </a>
    </section>
  );
}

export function BecomePartnerPage() {
  useEffect(() => {
    document.title = "Become a Partner | FoodOnlines";

    const description = "Partner with FoodOnlines to reach global markets and connect with customers seeking authentic products and services.";
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
      className="overflow-hidden bg-[#f8e9ee] pt-[116px] text-black sm:pt-[128px] lg:pt-[138px]"
      style={{ fontFamily: 'Poppins, Inter, "Nunito Sans", ui-sans-serif, system-ui, sans-serif' }}
    >
      <PartnerHeroSection />
      <PartnerCardsSection />
      <PartnerFinalCtaSection />
    </div>
  );
}
