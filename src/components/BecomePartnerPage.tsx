import { useEffect } from "react";

const basePath = import.meta.env.BASE_URL;
const partnerImagePath = (fileName: string) => `${basePath}images/become-partner/${fileName}`;
const partnerMailto = "mailto:info@foodonlines.com?subject=Become%20a%20Partner%20Inquiry";

const partnerCards = [
  {
    title: (
      <>
        Reach More
        <br />
        Customers Worldwide
      </>
    ),
    body: "Partner with Foodonlines.com to showcase your products to a global community of engaged shoppers. Our growing marketplace makes it easier than ever to connect with customers, build brand awareness, and drive sustainable growth beyond your home market.",
    icon: partnerImagePath("partner-icon-globe.png"),
    iconAlt: "Global reach icon",
    className: "lg:self-start lg:translate-y-[-2.1rem]",
  },
  {
    title: (
      <>
        Build a Brand That
        <br />
        Travels Beyond Borders
      </>
    ),
    body: "Through Foodonlines.com, your products gain access to millions of consumers worldwide. Increase brand awareness, enhance your market presence, and create meaningful connections with customers who value quality and authenticity.",
    icon: partnerImagePath("partner-icon-megaphone.png"),
    iconAlt: "Brand visibility icon",
    className: "lg:self-center lg:translate-y-[2.4rem]",
  },
  {
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
    icon: partnerImagePath("partner-icon-growth.png"),
    iconAlt: "Growth chart icon",
    className: "lg:self-end lg:translate-y-[5.9rem]",
  },
];

function PartnerHeroSection() {
  return (
    <section className="relative mx-auto min-h-[720px] w-full max-w-[1650px] overflow-hidden px-[clamp(1.25rem,3.4vw,3.5rem)] pb-[clamp(2.8rem,5vw,4.2rem)] pt-[clamp(3.2rem,6vw,5.4rem)] sm:min-h-[760px] lg:aspect-[1650/880] lg:min-h-0">
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

      <div className="relative z-0 mt-[clamp(2.2rem,5vw,3.2rem)] grid gap-4 md:grid-cols-[1fr_0.58fr] lg:absolute lg:inset-x-[3.4%] lg:bottom-[5.2%] lg:mt-0 lg:items-end">
        <img
          alt="A large food table prepared for a shared meal"
          className="partner-hero-food-image h-[clamp(250px,34vw,456px)] w-full rounded-[12px] object-cover object-center shadow-[0_20px_60px_rgba(80,34,48,0.12)]"
          loading="eager"
          src={partnerImagePath("partner-food-table.png")}
        />
        <img
          alt="Partners stacking hands together"
          className="partner-hero-team-image h-[clamp(250px,34vw,456px)] w-full rounded-[12px] object-cover object-center shadow-[0_20px_60px_rgba(80,34,48,0.12)] md:h-full"
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
    <section className="relative mx-auto min-h-[980px] w-full max-w-[1650px] overflow-visible px-[clamp(1.25rem,3.7vw,3.6rem)] pb-[clamp(6rem,10vw,8.5rem)] pt-[clamp(3.2rem,6vw,4.8rem)] lg:min-h-[980px]">
      <h2 className="relative z-30 mx-auto max-w-[1040px] text-center text-[clamp(2.55rem,4.2vw,4.4rem)] font-bold leading-[1.18] tracking-normal text-black lg:ml-auto lg:mr-[5.2%]">
        Partner with the World&apos;s Largest
        <br />
        Online Supermarket
      </h2>

      <div className="relative z-10 mt-[clamp(2.2rem,5vw,4rem)] grid gap-6 md:grid-cols-3 lg:absolute lg:inset-x-[9.2%] lg:bottom-[11%] lg:top-[32%] lg:mt-0 lg:gap-[5.3vw]">
        {partnerCards.map((card) => (
          <article
            className={`rounded-[20px] bg-white px-[clamp(1.5rem,2vw,1.65rem)] py-[clamp(1.55rem,2.4vw,2.15rem)] shadow-[0_24px_60px_rgba(82,38,53,0.08)] ${card.className}`}
            key={card.iconAlt}
          >
            <img
              alt={card.iconAlt}
              className="partner-card-icon ml-auto h-[clamp(11.5rem,18vw,17rem)] w-[clamp(11.5rem,18vw,17rem)] object-contain"
              loading="lazy"
              src={card.icon}
            />
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
    <section className="mx-auto grid w-full max-w-[1650px] gap-10 px-[clamp(1.25rem,8vw,8.4rem)] py-[clamp(3.5rem,7.3vw,7.4rem)] md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
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
