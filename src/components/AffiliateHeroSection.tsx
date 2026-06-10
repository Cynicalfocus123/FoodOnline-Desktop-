import { useEffect } from "react";

type AffiliateProduct = {
  discount: string;
  brand: string;
  name: string;
  size: string;
  unitPrice: string;
  price: string;
  oldPrice: string;
  placeholder: "carton" | "can" | "loaf";
};

type AffiliateStat = {
  number: string;
  lines: string[];
};

type AffiliateRewardCardData = {
  eyebrow: string;
  title: string;
  body: string;
  extra?: string;
  button: string;
  variant: "pastel" | "coral";
  icon: "link" | "cart" | "user-plus";
};

type HowItWorksStep = {
  number: string;
  title: string;
  body: string;
  variant: "signup" | "share" | "earn";
  image: string;
  imageAlt: string;
};

const affiliateImagePath = (path: string) => `${import.meta.env.BASE_URL}${path}`;

const affiliateProducts: AffiliateProduct[] = [
  {
    discount: "14% OFF",
    brand: "STOUFFER",
    name: "Farm Fresh Whole Milk",
    size: "500 g",
    unitPrice: "$12.16/lb",
    price: "$6.08",
    oldPrice: "$7.05",
    placeholder: "carton",
  },
  {
    discount: "14% OFF",
    brand: "ARIZONA",
    name: "Green Tea With Ginseng & Honey",
    size: "500 ml",
    unitPrice: "$3.98/bottle",
    price: "$3.42",
    oldPrice: "$3.98",
    placeholder: "can",
  },
  {
    discount: "14% OFF",
    brand: "STARKIST",
    name: "Golden Brown Bread Loaf",
    size: "1 kg",
    unitPrice: "$6.58/pack",
    price: "$6.58",
    oldPrice: "$7.63",
    placeholder: "loaf",
  },
];

const affiliateStats: AffiliateStat[] = [
  {
    number: "No.1",
    lines: ["World Largest", "online Supermarket"],
  },
  {
    number: "100k+",
    lines: ["Bringing the World's", "Authentic and Fresh", "Groceries to You"],
  },
  {
    number: "50M",
    lines: ["Guaranteed Low", "Prices on Every Order"],
  },
  {
    number: "#1",
    lines: ["World grocery app", "on IOS & Android"],
  },
];

const affiliateRewardCards: AffiliateRewardCardData[] = [
  {
    eyebrow: "Share Your Affiliate Link",
    title: "Earn up to 4% commission",
    body: "on qualifying purchases made through your referral link.",
    extra: "Share your qualified affiliate link within a 48 hour window.",
    button: "Start earning",
    variant: "pastel",
    icon: "link",
  },
  {
    eyebrow: "EARN 5% COMMISSION ON EVERY REFERRAL PURCHASE",
    title: "Receive ongoing commissions",
    body: "whenever your referred customers make a purchase.",
    button: "Earn 5%",
    variant: "coral",
    icon: "cart",
  },
  {
    eyebrow: "REFER FRIENDS & EARN MORE",
    title: "Receive ฿100",
    body: "for every successful referral who signs up.",
    button: "Refer now",
    variant: "coral",
    icon: "user-plus",
  },
];

const howItWorksSteps: HowItWorksStep[] = [
  {
    number: "1",
    title: "Create Your Account",
    body: "Sign up in just a few steps with our easy-to-follow onboarding experience.",
    variant: "signup",
    image: affiliateImagePath("images/affiliate/how-it-works/create-account-visual.png"),
    imageAlt: "FoodOnlines affiliate account signup form preview",
  },
  {
    number: "2",
    title: "Share",
    body: "Recommend great products and exclusive deals that your audience will appreciate.",
    variant: "share",
    image: affiliateImagePath("images/affiliate/how-it-works/share-visual.png"),
    imageAlt: "Affiliate sharing network with social icons",
  },
  {
    number: "3",
    title: "Get Started",
    body: "Earn commissions from qualified purchases and successful referrals.",
    variant: "earn",
    image: affiliateImagePath("images/affiliate/how-it-works/get-started-visual.png"),
    imageAlt: "Affiliate earnings money bag illustration",
  },
];

function ProductPlaceholder({ type }: { type: AffiliateProduct["placeholder"] }) {
  if (type === "can") {
    return (
      <div className="relative h-[72%] w-[44%] rounded-[999px] border border-[#a6d3c4] bg-[linear-gradient(90deg,#c5f0dd_0_18%,#f7fff8_18%_25%,#bbefcf_25%_70%,#e8b4c8_70%_100%)] shadow-[inset_0_10px_20px_rgba(255,255,255,0.65),0_12px_22px_rgba(62,86,72,0.14)] max-[640px]:h-[74%] max-[640px]:w-[38%]">
        <span className="absolute inset-x-2 top-[18%] h-px bg-[#7dc79d]" />
        <span className="absolute inset-x-2 bottom-[18%] h-px bg-[#7dc79d]" />
      </div>
    );
  }

  if (type === "loaf") {
    return (
      <div className="relative h-[70%] w-[48%] rounded-b-[12px] rounded-t-[24px] bg-[#b85a28] shadow-[0_12px_22px_rgba(88,48,28,0.16)] max-[640px]:h-[74%] max-[640px]:w-[40%]">
        <span className="absolute inset-x-2 top-3 rounded-md bg-[#d71920] px-1 py-2 text-center text-[9px] font-black uppercase leading-none text-white max-[640px]:text-[7px]">
          Bread
        </span>
        <span className="absolute inset-x-3 bottom-4 h-[46%] rounded-[14px] bg-[#f3c07a]" />
      </div>
    );
  }

  return (
    <div className="relative h-[72%] w-[48%] rounded-b-[12px] rounded-t-[8px] bg-[#eef8fb] shadow-[0_12px_22px_rgba(55,81,92,0.14)] max-[640px]:h-[74%] max-[640px]:w-[42%]">
      <span className="absolute left-1/2 top-0 h-[28%] w-[72%] -translate-x-1/2 rounded-t-[8px] bg-[#4a8dc7]" />
      <span className="absolute inset-x-3 top-[35%] text-center text-[clamp(0.8rem,1.5vw,1.2rem)] font-black leading-none text-[#3b8bc7] max-[640px]:text-[0.7rem]">
        Milk
      </span>
      <span className="absolute inset-x-4 bottom-5 h-[18%] rounded-full bg-[#d7eef2]" />
    </div>
  );
}

function AffiliateProductCard({ product }: { product: AffiliateProduct }) {
  return (
    <article className="grid h-full min-h-[390px] rounded-[26px] bg-white p-[clamp(0.85rem,1.25vw,1.2rem)] shadow-[0_18px_38px_rgba(55,35,25,0.14)] max-[640px]:min-h-0 max-[640px]:grid-cols-[82px_minmax(0,1fr)_36px] max-[640px]:items-center max-[640px]:gap-3 max-[640px]:rounded-[14px] max-[640px]:p-3 max-[640px]:shadow-[0_10px_22px_rgba(55,35,25,0.1)]">
      <div className="relative flex h-[210px] items-center justify-center rounded-[20px] bg-gradient-to-br from-[#f4f5f2] to-[#d9dedb] max-[1024px]:h-[190px] max-[860px]:h-[170px] max-[640px]:h-[96px] max-[640px]:rounded-[10px]">
        <ProductPlaceholder type={product.placeholder} />
        <button
          aria-label={`Add ${product.name}`}
          className="absolute -bottom-4 -right-4 grid h-12 w-12 place-items-center rounded-full border-2 border-[#68b630] bg-white text-3xl font-light leading-none text-[#68b630] shadow-[0_8px_18px_rgba(79,128,38,0.18)] max-[640px]:hidden"
          type="button"
        >
          +
        </button>
      </div>

      <div className="pt-8 max-[640px]:min-w-0 max-[640px]:pt-0">
        <p className="mb-3 w-fit rounded-full bg-[#fff0ef] px-3 py-1 text-[0.72rem] font-black tracking-[0.16em] text-[#fa6158] max-[640px]:mb-1 max-[640px]:px-2 max-[640px]:py-0.5 max-[640px]:text-[0.53rem]">
          {product.discount}
        </p>
        <p className="mb-2 text-[0.68rem] font-bold uppercase tracking-[0.22em] text-neutral-400 max-[640px]:mb-1 max-[640px]:text-[0.52rem]">{product.brand}</p>
        <h3 className="mb-3 text-[clamp(1rem,1.25vw,1.32rem)] font-black leading-[1.15] text-black max-[640px]:mb-1 max-[640px]:text-[0.8rem]">
          {product.name}
        </h3>
        <p className="text-[0.9rem] leading-[1.35] text-neutral-600 max-[640px]:text-[0.65rem]">{product.size}</p>
        <p className="text-[0.9rem] leading-[1.35] text-neutral-600 max-[640px]:text-[0.65rem]">{product.unitPrice}</p>
        <p className="mt-4 text-[clamp(1.4rem,1.75vw,2rem)] font-black leading-none text-black max-[640px]:mt-1 max-[640px]:text-[1rem]">
          {product.price}
          <span className="ml-2 align-baseline text-[0.78rem] font-bold text-neutral-400 line-through max-[640px]:text-[0.6rem]">{product.oldPrice}</span>
        </p>
      </div>

      <button
        aria-label={`Add ${product.name}`}
        className="hidden h-9 w-9 place-items-center rounded-full border-2 border-[#68b630] bg-white text-2xl font-light leading-none text-[#68b630] shadow-[0_8px_18px_rgba(79,128,38,0.18)] max-[640px]:grid"
        type="button"
      >
        +
      </button>
    </article>
  );
}

function AffiliateStatsRow() {
  return (
    <div aria-label="FoodOnlines affiliate highlights" className="mt-[clamp(2rem,4.2vw,4.8rem)] grid grid-cols-4 max-[640px]:mt-7 max-[640px]:grid-cols-1">
      {affiliateStats.map((stat, index) => (
        <div
          className={`flex min-h-[88px] flex-col justify-center gap-2 px-[clamp(0.8rem,2vw,2.4rem)] py-[clamp(0.65rem,1.4vw,1.35rem)] ${
            index === 0 ? "" : "border-l border-white/70"
          } max-[1024px]:min-h-[74px] max-[1024px]:px-3 max-[1024px]:py-2 max-[640px]:grid max-[640px]:min-h-[62px] max-[640px]:grid-cols-[86px_minmax(0,1fr)] max-[640px]:items-center max-[640px]:gap-3 max-[640px]:border-l-0 max-[640px]:border-t max-[640px]:border-white/70 max-[640px]:px-0 max-[640px]:py-3 ${
            index === 0 ? "max-[640px]:border-t-0" : ""
          }`}
          key={stat.number}
        >
          <strong className="text-[clamp(1.7rem,3.15vw,3.35rem)] font-black leading-none tracking-normal text-black max-[1024px]:text-[clamp(1.3rem,3vw,2rem)] max-[640px]:text-[1.75rem]">
            {stat.number}
          </strong>
          <span className="grid gap-0.5 text-[clamp(0.72rem,0.95vw,1rem)] font-normal leading-[1.22] text-black max-[1024px]:text-[0.62rem] max-[640px]:text-[0.78rem]">
            {stat.lines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </span>
        </div>
      ))}
    </div>
  );
}

function AffiliateRewardIcon({ type }: { type: AffiliateRewardCardData["icon"] }) {
  if (type === "link") {
    return (
      <svg aria-hidden="true" fill="none" viewBox="0 0 64 64">
        <path d="M24.5 39.5 19 45a10.6 10.6 0 0 1-15-15l9.5-9.5a10.6 10.6 0 0 1 15 0" stroke="currentColor" strokeLinecap="round" strokeWidth="7" />
        <path d="M39.5 24.5 45 19a10.6 10.6 0 0 1 15 15l-9.5 9.5a10.6 10.6 0 0 1-15 0" stroke="currentColor" strokeLinecap="round" strokeWidth="7" />
        <path d="M24 40 40 24" stroke="currentColor" strokeLinecap="round" strokeWidth="7" />
      </svg>
    );
  }

  if (type === "cart") {
    return (
      <svg aria-hidden="true" fill="none" viewBox="0 0 64 64">
        <path d="M10 14h8l6 30h28l5-21H24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6" />
        <circle cx="29" cy="52" fill="currentColor" r="4" />
        <circle cx="49" cy="52" fill="currentColor" r="4" />
        <path d="M31 30v8M42 30v8" stroke="currentColor" strokeLinecap="round" strokeWidth="5" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 64 64">
      <circle cx="25" cy="22" fill="currentColor" r="10" />
      <path d="M8 55c2.8-13 10.3-20 17-20s14.2 7 17 20" fill="currentColor" />
      <path d="M49 23v18M40 32h18" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="6" />
    </svg>
  );
}

function AffiliateRewardCard({ card }: { card: AffiliateRewardCardData }) {
  const isPastel = card.variant === "pastel";

  return (
    <article
      className={`affiliate-reward-card affiliate-reward-card--${card.variant} relative isolate min-h-[clamp(270px,23vw,390px)] overflow-hidden rounded-[clamp(18px,1.8vw,28px)] p-[clamp(1.35rem,2.6vw,2.65rem)] shadow-[0_18px_38px_rgba(91,42,25,0.1)] max-[860px]:min-h-[230px] max-[860px]:p-5 max-[640px]:aspect-[1.05/1] max-[640px]:min-h-0 max-[640px]:rounded-[14px] max-[640px]:p-3.5 max-[640px]:shadow-[0_12px_24px_rgba(91,42,25,0.1)] ${
        isPastel
          ? "border-[3px] border-[#ff8c83] bg-[radial-gradient(circle_at_20%_82%,rgba(255,133,123,0.34),transparent_36%),radial-gradient(circle_at_82%_12%,rgba(126,255,222,0.48),transparent_42%),linear-gradient(145deg,#e8fff4_0%,#d9f2ff_52%,#ffd6cd_100%)] text-black"
          : "grid border-2 border-white/80 bg-[#f75b43] text-white min-[641px]:max-[1024px]:min-h-[230px] min-[641px]:max-[1024px]:grid-cols-[minmax(0,1fr)_92px] min-[641px]:max-[1024px]:items-center min-[641px]:max-[1024px]:gap-4 min-[641px]:max-[1024px]:p-6 max-[860px]:landscape:min-h-[150px] max-[860px]:landscape:grid-cols-[minmax(0,1fr)_58px] max-[860px]:landscape:gap-3.5 max-[860px]:landscape:p-[18px] max-[640px]:block"
      }`}
    >
      <div
        className={`affiliate-reward-card__content relative z-10 max-w-[30rem] pr-[clamp(2.5rem,5vw,5rem)] max-[640px]:pr-14 ${
          isPastel ? "" : "min-[641px]:max-[1024px]:max-w-none min-[641px]:max-[1024px]:pr-0"
        }`}
      >
        <p
          className={`affiliate-reward-card__eyebrow mb-3 text-[clamp(1.125rem,1.6vw,1.5rem)] font-bold uppercase leading-[1.15] tracking-[0.06em] max-[1024px]:text-[clamp(1.125rem,2.4vw,1.375rem)] max-[860px]:mb-2 max-[640px]:text-[clamp(0.8125rem,3.8vw,0.9375rem)] max-[640px]:tracking-[0.03em] ${
            isPastel
              ? ""
              : "min-[641px]:max-[1024px]:mb-3 min-[641px]:max-[1024px]:font-extrabold min-[641px]:max-[1024px]:leading-[1.16] min-[641px]:max-[1024px]:tracking-[0.08em] max-[860px]:landscape:mb-1.5 max-[860px]:landscape:text-[clamp(0.78rem,1.8vw,0.95rem)]"
          }`}
        >
          {card.eyebrow}
        </p>
        <h3
          className={`text-[clamp(2.25rem,3.8vw,3.625rem)] font-black leading-[1.02] tracking-normal max-[1024px]:text-[clamp(2.125rem,5vw,2.875rem)] max-[640px]:max-w-[15.5rem] max-[640px]:text-[clamp(1.5rem,7vw,1.875rem)] ${
            isPastel
              ? ""
              : "min-[641px]:max-[1024px]:max-w-[22rem] min-[641px]:max-[1024px]:leading-[0.99] max-[860px]:landscape:text-[clamp(1.25rem,3.2vw,1.55rem)] max-[860px]:landscape:leading-[1.04]"
          }`}
        >
          {card.title}
        </h3>
        <p
          className={`mt-4 max-w-[25rem] text-[clamp(1.25rem,1.8vw,1.75rem)] font-semibold leading-[1.25] max-[1024px]:text-[clamp(1.25rem,3vw,1.625rem)] max-[860px]:mt-3 max-[640px]:mt-2 max-[640px]:max-w-[14.25rem] max-[640px]:text-[clamp(0.9375rem,4.5vw,1.125rem)] ${
            isPastel
              ? ""
              : "min-[641px]:max-[1024px]:mt-3 min-[641px]:max-[1024px]:max-w-[21rem] min-[641px]:max-[1024px]:leading-[1.23] max-[860px]:landscape:mt-2 max-[860px]:landscape:text-[clamp(0.78rem,2vw,0.95rem)] max-[860px]:landscape:leading-[1.2]"
          }`}
        >
          {card.body}
        </p>
        {card.extra ? (
          <p className="affiliate-reward-card__extra mt-3 max-w-[22rem] text-[clamp(0.95rem,1.2vw,1.18rem)] font-medium leading-[1.25] opacity-80 max-[1024px]:text-[clamp(0.9rem,2vw,1.05rem)] max-[860px]:mt-2 max-[640px]:hidden">
            {card.extra}
          </p>
        ) : null}
        <a
          className="affiliate-reward-card__button mt-6 inline-flex min-h-12 items-center gap-3 rounded-full bg-black px-6 text-[clamp(0.86rem,1vw,1.05rem)] font-black text-white no-underline shadow-[0_12px_26px_rgba(0,0,0,0.16)] transition hover:-translate-y-0.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-black/25 max-[860px]:mt-4 max-[860px]:min-h-10 max-[860px]:px-5 max-[860px]:text-[0.82rem] max-[860px]:landscape:hidden max-[640px]:hidden min-[641px]:max-[1024px]:mt-5 min-[641px]:max-[1024px]:min-h-11 min-[641px]:max-[1024px]:px-5 min-[641px]:max-[1024px]:text-base"
          href="#affiliate-apply"
        >
          <span>{card.button}</span>
          <span aria-hidden="true">›</span>
        </a>
      </div>

      <div
        className={`affiliate-reward-card__icon absolute bottom-[clamp(1rem,2.4vw,2.6rem)] right-[clamp(1rem,2.6vw,2.8rem)] z-0 h-[clamp(4.3rem,7.5vw,8.4rem)] w-[clamp(4.3rem,7.5vw,8.4rem)] text-white/95 max-[860px]:h-16 max-[860px]:w-16 max-[640px]:bottom-3 max-[640px]:right-3 max-[640px]:h-14 max-[640px]:w-14 ${
          isPastel
            ? ""
            : "min-[641px]:max-[1024px]:static min-[641px]:max-[1024px]:h-[92px] min-[641px]:max-[1024px]:w-[92px] min-[641px]:max-[1024px]:self-center min-[641px]:max-[1024px]:justify-self-end max-[860px]:landscape:static max-[860px]:landscape:h-14 max-[860px]:landscape:w-14 max-[860px]:landscape:self-center max-[860px]:landscape:justify-self-end max-[640px]:absolute max-[640px]:h-14 max-[640px]:w-14"
        }`}
      >
        <AffiliateRewardIcon type={card.icon} />
      </div>
    </article>
  );
}

function AffiliateRewardsSection() {
  return (
    <section aria-labelledby="affiliate-rewards-title" className="bg-white text-black">
      <div className="mx-auto w-full max-w-[1440px] px-[clamp(1.15rem,5vw,4.5rem)] pb-[clamp(3rem,6vw,5.5rem)] pt-[clamp(2.8rem,5.4vw,4.8rem)] max-[640px]:px-4 max-[640px]:pb-10 max-[640px]:pt-8">
        <h2 className="sr-only" id="affiliate-rewards-title">
          Affiliate Rewards and Referral Cards
        </h2>
        <div className="grid grid-cols-[minmax(280px,0.95fr)_minmax(520px,1.7fr)] items-end gap-[clamp(1.5rem,4vw,3.25rem)] max-[1024px]:grid-cols-1 max-[1024px]:items-stretch max-[1024px]:gap-5 min-[641px]:max-[860px]:grid-cols-[0.9fr_2fr] min-[641px]:max-[860px]:gap-4 max-[640px]:block">
          <div>
            <p className="affiliate-rewards-label mb-3.5 text-[clamp(1.75rem,2.8vw,2.5rem)] font-medium leading-[1.08] text-[#f45d4d] max-[1024px]:text-[clamp(1.75rem,4vw,2.25rem)] max-[640px]:mb-2.5 max-[640px]:text-[clamp(1.5rem,7vw,1.875rem)]">
              Share your link
            </p>
            <AffiliateRewardCard card={affiliateRewardCards[0]} />
          </div>

          <div className="max-[640px]:mt-5">
            <p className="affiliate-rewards-label mb-3.5 text-[clamp(1.75rem,2.8vw,2.5rem)] font-medium leading-[1.08] text-[#f45d4d] max-[1024px]:text-[clamp(1.75rem,4vw,2.25rem)] max-[640px]:mb-2.5 max-[640px]:text-[clamp(1.5rem,7vw,1.875rem)]">
              Refer friends &amp; keep earning
            </p>
            <div className="grid grid-cols-2 gap-[clamp(1rem,2.4vw,2.15rem)] max-[640px]:grid-cols-1 max-[640px]:gap-2.5">
              {affiliateRewardCards.slice(1).map((card) => (
                <AffiliateRewardCard card={card} key={card.eyebrow} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorksVisual({ step }: { step: HowItWorksStep }) {
  return (
    <div
      className={`affiliate-how-it-works__visual affiliate-how-it-works__visual--${step.variant} flex aspect-[5/6] min-h-[clamp(320px,33vw,520px)] w-full items-center justify-center overflow-hidden rounded-[clamp(20px,2.2vw,34px)] border-[6px] border-[#ff6ba7] bg-gradient-to-b from-[#fff0b8] to-[#ffc69f] p-[clamp(1rem,2vw,1.8rem)] shadow-[0_24px_48px_rgba(116,64,41,0.14)] max-[1024px]:min-h-[clamp(270px,36vw,430px)] max-[640px]:aspect-[5/5.8] max-[640px]:min-h-[300px] max-[640px]:rounded-[24px] max-[640px]:border-[5px] max-[640px]:p-4`}
    >
      <img
        alt={step.imageAlt}
        className="affiliate-how-it-works__image block h-full max-h-full w-full object-contain object-center"
        loading="lazy"
        src={step.image}
      />
    </div>
  );
}

function HowItWorksStepCard({ step, index }: { step: HowItWorksStep; index: number }) {
  const isPrimary = index === 0;

  return (
    <article
      className={`relative min-w-0 ${
        index > 0 ? "min-[641px]:before:absolute min-[641px]:before:-left-[clamp(0.75rem,2vw,1.75rem)] min-[641px]:before:top-3 min-[641px]:before:h-[calc(100%-0.75rem)] min-[641px]:before:border-l min-[641px]:before:border-dashed min-[641px]:before:border-[#e8b9aa]" : ""
      }`}
    >
      <div>
        <div className="mb-4 flex items-center gap-3 max-[1024px]:mb-3 max-[640px]:mb-2.5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-[1.05rem] font-black text-[#ef5f4f] shadow-[0_10px_22px_rgba(133,78,54,0.12)] max-[1024px]:h-9 max-[1024px]:w-9 max-[640px]:h-8 max-[640px]:w-8 max-[640px]:text-sm">
            {step.number}
          </span>
          <h3 className="text-[clamp(1.55rem,2.1vw,2.2rem)] font-black leading-none tracking-normal text-[#ef5f4f] max-[1024px]:text-[1.45rem] max-[640px]:text-[1.2rem]">
            {step.title}
          </h3>
        </div>
        <p className={`max-w-[20rem] text-[clamp(0.95rem,1.05vw,1.15rem)] font-medium leading-[1.35] text-[#1f1714] max-[1024px]:text-[0.85rem] max-[640px]:text-[0.83rem] ${isPrimary ? "max-[640px]:max-w-none max-[640px]:text-[1rem]" : ""}`}>
          {step.body}
        </p>
      </div>

      <div className="mt-7 max-[640px]:mt-5">
        <HowItWorksVisual step={step} />
      </div>

      {isPrimary ? (
        <a
          className="mt-5 hidden min-h-12 items-center justify-center rounded-full bg-black px-6 text-sm font-black text-white no-underline shadow-[0_14px_28px_rgba(0,0,0,0.16)] max-[640px]:inline-flex"
          href="#affiliate-apply"
        >
          Join and earn
        </a>
      ) : null}
    </article>
  );
}

function AffiliateHowItWorksSection() {
  return (
    <section aria-labelledby="affiliate-how-it-works-title" className="overflow-hidden bg-[#fff3e8] text-black">
      <div className="mx-auto w-full max-w-[1440px] px-[clamp(1.15rem,5vw,4.5rem)] py-[clamp(3rem,6vw,5.75rem)] max-[640px]:px-4 max-[640px]:py-8">
        <div className="mb-[clamp(2rem,4vw,3.5rem)] flex items-start justify-between gap-6 max-[640px]:mb-5 max-[640px]:block">
          <div>
            <p className="mb-3 text-[clamp(1rem,1.4vw,1.35rem)] font-semibold leading-tight text-[#ef5f4f] max-[640px]:mb-2 max-[640px]:text-[0.95rem]">
              How does it work?
            </p>
            <h2 id="affiliate-how-it-works-title" className="max-w-[720px] text-[clamp(2.8rem,5.1vw,5.8rem)] font-black leading-[0.98] tracking-normal text-black max-[1024px]:text-[clamp(2.3rem,5vw,4rem)] max-[640px]:text-[clamp(2.15rem,10vw,3.35rem)]">
              Getting started is easy
            </h2>
          </div>
          <a
            className="inline-flex min-h-14 shrink-0 items-center gap-3 rounded-full bg-white px-7 text-[clamp(0.95rem,1.1vw,1.15rem)] font-black text-[#ef5f4f] no-underline shadow-[0_14px_30px_rgba(133,78,54,0.1)] transition hover:-translate-y-0.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#ef5f4f]/20 max-[640px]:hidden"
            href="#affiliate-apply"
          >
            <span>Join &amp; earn</span>
            <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" viewBox="0 0 24 24">
              <path d="M5 12h13" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </a>
        </div>

        <div className="grid grid-cols-3 gap-[clamp(1.5rem,4vw,3.5rem)] max-[1024px]:gap-6 max-[640px]:grid-cols-1 max-[640px]:gap-3.5">
          {howItWorksSteps.map((step, index) => (
            <HowItWorksStepCard index={index} key={step.number} step={step} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function AffiliateHeroSection() {
  useEffect(() => {
    document.title = "Affiliate Program | FoodOnlines";

    const description = "Join the FoodOnlines affiliate program and earn recurring income by connecting customers with global grocery products.";
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
      className="overflow-hidden bg-[#ffb28f] pt-[116px] text-black sm:pt-[128px] lg:pt-[138px]"
      style={{ fontFamily: 'Montserrat, Poppins, Inter, ui-sans-serif, system-ui, sans-serif' }}
    >
      <section className="mx-auto w-full max-w-[1650px] px-[clamp(1.25rem,4.8vw,5.2rem)] py-[clamp(2.5rem,5.8vw,6.4rem)] max-[1024px]:py-[clamp(2rem,4vw,3.6rem)] min-[700px]:max-[920px]:px-8 max-[640px]:px-4 max-[640px]:py-7">
        <div className="grid min-h-[560px] grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] items-center gap-[clamp(2rem,4vw,5rem)] max-[1024px]:min-h-0 max-[1024px]:grid-cols-1 max-[1024px]:gap-8 min-[700px]:max-[920px]:grid-cols-[minmax(0,0.68fr)_minmax(0,1.32fr)] min-[700px]:max-[920px]:gap-5">
        <div className="min-w-0 max-[640px]:text-left">
          <p className="mb-4 text-[clamp(1rem,1.55vw,1.75rem)] font-medium leading-tight tracking-[0.08em] text-black max-[640px]:mb-2 max-[640px]:text-[0.82rem] max-[640px]:tracking-[0.04em]">
            Turn Your Audience Into Income
          </p>
          <h1 className="max-w-[680px] text-[clamp(3rem,5.35vw,6.4rem)] font-black leading-[0.98] tracking-normal text-black min-[700px]:max-[920px]:text-[clamp(2.15rem,4vw,3.1rem)] max-[640px]:max-w-[360px] max-[640px]:text-[clamp(2.15rem,11vw,3.35rem)]">
            Earn Up to
            <span className="block">฿75,000</span>
            Per Month
          </h1>
          <p className="mt-7 max-w-[620px] text-[clamp(0.95rem,1.12vw,1.24rem)] font-normal leading-[1.45] text-black min-[700px]:max-[920px]:mt-4 min-[700px]:max-[920px]:text-[0.82rem] max-[640px]:mt-4 max-[640px]:max-w-[350px] max-[640px]:text-[0.82rem]">
            Become a Foodonlines.com affiliate and generate recurring income by connecting customers with products from around the world.
          </p>
          <a
            className="mt-9 inline-flex min-h-[62px] items-center gap-4 rounded-full bg-black px-9 text-[clamp(1rem,1.35vw,1.55rem)] font-bold text-white no-underline shadow-[0_16px_34px_rgba(0,0,0,0.2)] transition hover:-translate-y-0.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-black/25 min-[700px]:max-[920px]:mt-5 min-[700px]:max-[920px]:min-h-[44px] min-[700px]:max-[920px]:px-6 min-[700px]:max-[920px]:text-[0.88rem] max-[640px]:mt-5 max-[640px]:min-h-[44px] max-[640px]:px-6 max-[640px]:text-[0.92rem]"
            href="#affiliate-apply"
          >
            <span>Join &amp; Earn</span>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-black max-[640px]:h-7 max-[640px]:w-7" aria-hidden="true">
              <svg className="h-5 w-5 max-[640px]:h-4 max-[640px]:w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" viewBox="0 0 24 24">
                <path d="M5 12h13" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </span>
          </a>
        </div>

          <div className="grid min-w-0 grid-cols-3 items-stretch gap-[clamp(1rem,2vw,2rem)] max-[1024px]:gap-5 min-[700px]:max-[920px]:gap-3 max-[640px]:grid-cols-1 max-[640px]:gap-2.5">
            {affiliateProducts.map((product) => (
              <AffiliateProductCard key={product.name} product={product} />
            ))}
          </div>
        </div>
        <AffiliateStatsRow />
      </section>
      <AffiliateRewardsSection />
      <AffiliateHowItWorksSection />
    </div>
  );
}
