import { useHomeStore } from "../store/homeStore";

const basePath = import.meta.env.BASE_URL;
const wholesalerImagePath = (fileName: string) => `${basePath}images/wholesaler/${fileName}`;

type SavingsIconType = "discount" | "delivery" | "package";

const savingsBenefits: Array<{
  icon: SavingsIconType;
  text: string;
}> = [
  {
    icon: "discount",
    text: "Business customers save 10% on every order over ฿3,000",
  },
  {
    icon: "delivery",
    text: "Flexible delivery options allow you to select a time slot that suits your schedule",
  },
  {
    icon: "package",
    text: "Enjoy premium delivery with unloading free of charge",
  },
];

const savingsProducts = [
  {
    className: "wholesaler-savings-product wholesaler-savings-product--chicken",
    fileName: "savings-canned-chicken.png",
    alt: "Japanese canned chicken product",
  },
  {
    className: "wholesaler-savings-product wholesaler-savings-product--curry",
    fileName: "savings-curry-box.png",
    alt: "Japanese curry product box",
  },
  {
    className: "wholesaler-savings-product wholesaler-savings-product--bibigo",
    fileName: "savings-bibigo-bag.png",
    alt: "Bibigo Korean meat ball product",
  },
  {
    className: "wholesaler-savings-product wholesaler-savings-product--sauce",
    fileName: "savings-sauce-tubs.png",
    alt: "Korean sauce tubs",
  },
];

const brandCards = [
  {
    title: "Retail & convenience",
    image: "brands-retail.png",
    alt: "Retail store shelves stocked with international grocery products",
    text: "Enjoy exclusive savings on every qualifying order and maximize the value of your business purchases.",
  },
  {
    title: "Corporate & workplace",
    image: "brands-corporate.png",
    alt: "Corporate employees enjoying workplace catering",
    text: "Discover a wide variety of international snacks and treats to keep your team energized, engaged, and satisfied throughout the day.",
  },
  {
    title: "Restaurant & bakery",
    image: "brands-restaurant.png",
    alt: "Fresh bakery products displayed in a bakery case",
    text: "We supply groceries to restaurants, cafes, and bakeries, streamlining your sourcing so you can focus on serving your customers.",
  },
  {
    title: "Food service & hospitality",
    image: "brands-hospitality.png",
    alt: "Food service staff preparing hospitality buffet service",
    text: "Streamline your restaurant's supply chain with fresh ingredients and seasonings delivered directly to you.",
  },
];

function SavingsIcon({ type }: { type: SavingsIconType }) {
  const commonProps = {
    className: "h-8 w-8",
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 2.2,
    viewBox: "0 0 24 24",
  };

  switch (type) {
    case "discount":
      return (
        <svg {...commonProps}>
          <path d="M4.5 8.5V6.2c0-.9.8-1.7 1.7-1.7h2.3" />
          <path d="M15.5 4.5h2.3c.9 0 1.7.8 1.7 1.7v2.3" />
          <path d="M19.5 15.5v2.3c0 .9-.8 1.7-1.7 1.7h-2.3" />
          <path d="M8.5 19.5H6.2c-.9 0-1.7-.8-1.7-1.7v-2.3" />
          <path d="m8 16 8-8" />
          <circle cx="8.6" cy="8.6" r="1.4" />
          <circle cx="15.4" cy="15.4" r="1.4" />
        </svg>
      );
    case "delivery":
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="7.5" />
          <path d="M12 7.8v4.5l3 1.8" />
          <path d="M5.2 4.8 3.8 6.2" />
          <path d="m18.8 4.8 1.4 1.4" />
        </svg>
      );
    case "package":
      return (
        <svg {...commonProps}>
          <path d="m12 3.8 7 3.8-7 3.8-7-3.8 7-3.8Z" />
          <path d="M5 7.6v8.8l7 3.8 7-3.8V7.6" />
          <path d="M12 11.4v8.8" />
          <path d="m8.4 5.7 7 3.8" />
        </svg>
      );
    default:
      return null;
  }
}

function WholesalerSavingsSection() {
  return (
    <section className="wholesaler-savings-section" aria-label="More Savings, More Convenience">
      <div className="wholesaler-savings-card">
        <p className="wholesaler-savings-eyebrow">More Savings, More Convenience</p>

        <div className="wholesaler-savings-desktop-heading">
          <h2>Business Customers Save 10% on Orders Over ฿3,000</h2>
          <p>Enjoy 10% savings on every order, flexible delivery arrangements, and free unloading at your destination.</p>
        </div>

        <div className="wholesaler-savings-mobile-heading">
          <h2>
            Save 10%
            <br />
            on every order
          </h2>
          <p>Flexible delivery and free unloading</p>
        </div>

        <div className="wholesaler-savings-benefits" aria-label="Wholesaler savings benefits">
          {savingsBenefits.map((benefit) => (
            <div className="wholesaler-savings-benefit" key={benefit.icon}>
              <div className="wholesaler-savings-benefit-icon" aria-hidden="true">
                <SavingsIcon type={benefit.icon} />
              </div>
              <p className="wholesaler-savings-benefit-text">{benefit.text}</p>
            </div>
          ))}
        </div>

        <div className="wholesaler-savings-products" aria-hidden="true">
          {savingsProducts.map((product) => (
            <img
              alt={product.alt}
              className={product.className}
              key={product.fileName}
              loading="lazy"
              src={wholesalerImagePath(product.fileName)}
            />
          ))}
          <img
            alt=""
            className="wholesaler-savings-wave"
            loading="lazy"
            src={wholesalerImagePath("savings-wave.png")}
          />
        </div>
      </div>
    </section>
  );
}

function WholesalerBrandsSection() {
  return (
    <section className="wholesaler-brands-section" aria-labelledby="wholesaler-brands-heading">
      <div className="wholesaler-brands-inner">
        <h2 id="wholesaler-brands-heading" className="wholesaler-brands-heading">
          Source products from <span>leading brands</span>
        </h2>

        <div className="wholesaler-brand-card-grid">
          {brandCards.map((card) => (
            <article className="wholesaler-brand-card" key={card.title}>
              <h3 className="wholesaler-brand-card-title">{card.title}</h3>
              <div className="wholesaler-brand-card-media">
                <img alt={card.alt} loading="lazy" src={wholesalerImagePath(card.image)} />
              </div>
              <p className="wholesaler-brand-card-text">{card.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function WholesalerPage() {
  const openSignup = useHomeStore((state) => state.openSignup);

  return (
    <div className="wholesaler-page bg-[#f8eaff] pt-[116px] sm:pt-[128px] lg:pt-[138px]">
      <section className="wholesaler-art-section" aria-label="Wholesaler discount introduction">
        <img
          alt="Get 10% off. Supercharge your business with exciting Asian products."
          className="block w-full"
          src={wholesalerImagePath("hero-section.png")}
        />
        <button className="wholesaler-hero-cta" onClick={openSignup} type="button">
          <span>Create account</span>
          <span aria-hidden="true">→</span>
        </button>
      </section>

      <WholesalerSavingsSection />

      <WholesalerBrandsSection />
    </div>
  );
}
