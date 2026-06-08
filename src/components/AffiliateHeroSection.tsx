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
      <section className="mx-auto grid min-h-[640px] w-full max-w-[1650px] grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] items-center gap-[clamp(2rem,4vw,5rem)] px-[clamp(1.25rem,4.8vw,5.2rem)] py-[clamp(2.5rem,5.8vw,6.4rem)] max-[1024px]:grid-cols-1 max-[1024px]:gap-8 max-[1024px]:py-[clamp(2rem,4vw,3.6rem)] min-[700px]:max-[920px]:grid-cols-[minmax(0,0.68fr)_minmax(0,1.32fr)] min-[700px]:max-[920px]:gap-5 min-[700px]:max-[920px]:px-8 max-[640px]:min-h-0 max-[640px]:px-4 max-[640px]:py-7">
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
      </section>
    </div>
  );
}
