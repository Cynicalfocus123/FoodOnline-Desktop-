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
  const className = "partner-card-icon h-[clamp(13rem,48vw,19rem)] w-[clamp(13rem,48vw,19rem)] text-black md:h-[clamp(11rem,17vw,18rem)] md:w-[clamp(11rem,17vw,18rem)]";

  if (type === "globe") {
    return (
      <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" viewBox="0 0 120 120">
        <circle cx="55" cy="55" r="31" />
        <path d="M24 55h62M55 24c10 10 15 21 15 31S65 76 55 86M55 24C45 34 40 45 40 55s5 21 15 31" />
        <path d="M34 33c13 7 28 7 42 0M34 77c13-7 28-7 42 0" />
        <path d="M82 25h16v16M98 25 76 47M82 95c-16 9-37 7-51-7" />
      </svg>
    );
  }

  if (type === "megaphone") {
    return (
      <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 120 120">
        <path d="M31 65 74 39v50L31 75Z" />
        <path d="M31 65H19c-5 0-9 4-9 9s4 9 9 9h12M42 82l8 18c2 5 9 4 10-1l2-13" />
        <path d="M83 52c7 2 12 8 12 14s-5 12-12 14" />
        <path d="M98 29 103 39l11 2-8 8 2 11-10-5-10 5 2-11-8-8 11-2ZM89 12l5 10 11 2-8 8 2 11-10-5-10 5 2-11-8-8 11-2ZM106 68l4 8 9 2-7 7 2 9-8-4-8 4 2-9-7-7 9-2Z" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9" viewBox="0 0 120 120">
      <path d="M16 94h88" />
      <path d="M23 82h11V62H23zM45 82h11V52H45zM67 82h11V41H67zM89 82h11V27H89z" />
      <path d="M20 45c20 0 35-8 46-20 11-12 20-14 32-14" />
      <path d="m86 8 13 3-3 13" />
    </svg>
  );
}

function PartnerHeroSection() {
  return (
    <section className="relative mx-auto min-h-[780px] w-full max-w-[1650px] overflow-hidden px-[clamp(1.25rem,3.4vw,3.5rem)] pb-[clamp(3rem,5vw,4.6rem)] pt-[clamp(3.2rem,6vw,5.4rem)] sm:min-h-[820px] lg:aspect-[1650/900] lg:min-h-0">
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

      <div className="relative z-0 mt-[clamp(2.4rem,5vw,3.4rem)] grid gap-[clamp(1.15rem,2.6vw,2.4rem)] md:grid-cols-[minmax(0,1fr)_minmax(280px,0.72fr)] lg:absolute lg:inset-x-[3.4%] lg:bottom-[5%] lg:mt-0 lg:items-end">
        <img
          alt="A large food table prepared for a shared meal"
          className="partner-hero-food-image block h-[clamp(320px,72vw,520px)] w-full rounded-[12px] object-cover object-center md:h-[clamp(390px,36vw,560px)]"
          loading="eager"
          src={partnerImagePath("partner-food-table.png")}
        />
        <img
          alt="Partners stacking hands together"
          className="partner-hero-team-image block h-[clamp(340px,78vw,560px)] w-full rounded-[12px] object-cover object-center md:h-[clamp(390px,36vw,560px)]"
          loading="eager"
          src={partnerImagePath("partner-team.png")}
        />
      </div>

      <img
        alt="Fruit plate"
        className="partner-hero-fruit-circle pointer-events-none absolute right-[15%] top-[18rem] z-20 hidden w-[clamp(280px,31vw,470px)] rounded-full object-contain drop-shadow-[0_24px_48px_rgba(80,34,48,0.16)] md:block lg:top-[3rem]"
        draggable={false}
        src={partnerImagePath("partner-fruit-plate.png")}
      />
      <img
        alt=""
        aria-hidden="true"
        className="partner-hero-leaf pointer-events-none absolute right-[5%] top-[10%] z-20 hidden w-[clamp(182px,21vw,322px)] object-contain md:block lg:right-[3.5%] lg:top-[8%]"
        draggable={false}
        src={partnerImagePath("partner-leaves.png")}
      />
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
            <div className="flex min-h-[clamp(14rem,52vw,20rem)] items-center justify-center md:min-h-[clamp(12rem,18vw,18rem)]">
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
