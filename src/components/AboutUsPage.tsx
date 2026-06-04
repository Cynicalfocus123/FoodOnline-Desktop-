import { useEffect } from "react";
import { assets } from "../data/home";

const flavorCircles = [
  "bg-[#b7dce8]",
  "bg-[#d7ecc5]",
  "bg-[#ffd779]",
  "bg-[#ffd0df]",
];

function LogoMark({ className = "" }: { className?: string }) {
  return (
    <img
      alt="FoodOnlines.com"
      className={`h-auto w-full object-contain ${className}`}
      decoding="async"
      src={assets.logo}
    />
  );
}

function PlaceholderLabel({ label }: { label: string }) {
  return (
    <span className="text-center text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-neutral-500">
      {label}
    </span>
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
    <div className="overflow-x-clip bg-white pt-[116px] font-['Poppins',Inter,'Nunito_Sans',ui-sans-serif,system-ui,sans-serif] text-black sm:pt-[128px] lg:pt-[138px]">
      <section className="bg-[#fff9ed] px-4 pb-8 pt-8 sm:px-6 sm:pb-10 sm:pt-10 lg:px-8 lg:pb-12">
        <div className="mx-auto max-w-[1648px]">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-14">
            <h1 className="min-w-0 max-w-full text-[clamp(1.75rem,8vw,4.45rem)] font-extrabold uppercase leading-[1.14] tracking-normal sm:max-w-6xl">
              <span className="block sm:hidden">
                <span className="block">CONNECTING PEOPLE</span>
                <span className="block">AROUND THE WORLD</span>
                <span className="block">WITH THE FOODS</span>
                <span className="block">THEY LOVE MOST</span>
              </span>
              <span className="hidden sm:block">
                CONNECTING PEOPLE AROUND THE WORLD
                <br />
                WITH THE FOODS THEY LOVE MOST
              </span>
            </h1>
            <p className="min-w-0 max-w-sm text-[clamp(1.1rem,2vw,1.55rem)] font-normal leading-snug lg:pt-3">
              We are dedicated to serving
              <br />
              the world with high-quality
              <br />
              food at affordable prices.
            </p>
          </div>

          {/* TODO: Replace this placeholder with the food-table image asset when it is ready. */}
          <div
            aria-label="Future food table image"
            className="about-hero-image-placeholder mt-8 flex aspect-[2.9/1] min-h-[210px] w-full items-center justify-center overflow-hidden rounded-[18px] border border-[#ece2d5] bg-[linear-gradient(135deg,#f5efe4,#ede8df)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.55)] sm:min-h-[280px] lg:mt-9 lg:min-h-[420px]"
          >
            <div className="h-[72%] w-[88%] rounded-[16px] border border-dashed border-neutral-300 bg-white/35" />
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-[1648px] text-center">
          <div className="mx-auto w-[min(480px,78vw)]">
            <LogoMark />
          </div>

          <h2 className="mx-auto mt-16 max-w-[1320px] text-[clamp(1.7rem,7.6vw,4.6rem)] font-extrabold uppercase leading-[1.18] tracking-normal text-[#64bd00]">
            <span className="block sm:hidden">
              <span className="block">ASIAN GROCERIES</span>
              <span className="block">SHOULD BE WIDELY</span>
              <span className="block">ACCESSIBLE AND</span>
              <span className="block">AFFORDABLE FOR ALL</span>
            </span>
            <span className="hidden sm:block">
              ASIAN GROCERIES SHOULD BE WIDELY
              <br />
              ACCESSIBLE AND AFFORDABLE FOR ALL
            </span>
          </h2>

          <p className="mt-8 text-[clamp(1.55rem,3.1vw,2.75rem)] font-bold leading-tight text-[#ff6b1a]">
            One of the World's Largest Online Supermarkets
          </p>

          <div className="pointer-events-none mt-10 grid min-h-[170px] grid-cols-2 items-end gap-8 sm:min-h-[210px] lg:absolute lg:inset-x-0 lg:bottom-0 lg:mx-auto lg:max-w-[1648px] lg:px-8">
            <div className="flex justify-start">
              <div className="relative h-[128px] w-[170px] sm:h-[168px] sm:w-[230px] lg:h-[230px] lg:w-[300px]">
                <span className="absolute bottom-0 left-0 h-[120px] w-[120px] rounded-full bg-[#b6d532] sm:h-[160px] sm:w-[160px] lg:h-[220px] lg:w-[220px]" />
                {/* TODO: Replace with grocery bag image asset. */}
                <div className="about-grocery-bag-placeholder absolute bottom-4 left-8 flex h-[92px] w-[98px] items-center justify-center rounded-[8px] border border-dashed border-neutral-300 bg-white/55 shadow-sm sm:h-[122px] sm:w-[132px] lg:h-[164px] lg:w-[176px]">
                  <PlaceholderLabel label="grocery bag" />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <div className="relative h-[128px] w-[170px] sm:h-[168px] sm:w-[230px] lg:h-[230px] lg:w-[300px]">
                <span className="absolute bottom-0 right-0 h-[120px] w-[120px] rounded-full bg-[#ff6b1a] sm:h-[160px] sm:w-[160px] lg:h-[220px] lg:w-[220px]" />
                {/* TODO: Replace with fruit image asset. */}
                <div className="about-fruit-placeholder absolute bottom-2 right-8 flex h-[98px] w-[112px] items-center justify-center rounded-full border border-dashed border-neutral-300 bg-white/55 shadow-sm sm:h-[130px] sm:w-[146px] lg:h-[176px] lg:w-[198px]">
                  <PlaceholderLabel label="fruit" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#fff9ed] px-4 py-14 sm:px-6 sm:py-[4.5rem] lg:px-8 lg:py-20">
        <div className="mx-auto max-w-[1648px] text-center">
          <h2 className="mx-auto max-w-5xl text-[clamp(1.8rem,7.4vw,3.75rem)] font-extrabold uppercase leading-[1.22] tracking-normal [overflow-wrap:anywhere] sm:[overflow-wrap:normal]">
            BRINGING THE WORLD'S AUTHENTIC
            <br />
            FLAVORS TO EVERY TABLE.
          </h2>
          <p className="mx-auto mt-5 max-w-5xl text-[clamp(1.12rem,2.2vw,2rem)] font-normal leading-snug">
            We create new and convenient ways for shoppers to discover, enjoy,
            <br className="hidden sm:block" />
            and reconnect with foods from every culture and corner of the world.
          </p>

          <div className="mt-12 grid grid-cols-1 justify-items-center gap-8 min-[430px]:grid-cols-2 lg:grid-cols-4 lg:gap-10">
            {flavorCircles.map((colorClass, index) => (
              <div
                aria-label={`Future flavor image ${index + 1}`}
                className={`about-flavor-circle-placeholder flex aspect-square w-[min(76vw,330px)] items-center justify-center rounded-full ${colorClass}`}
                key={colorClass}
              >
                {/* TODO: Replace each circle's inner placeholder with a food image asset. */}
                <div className="flex h-[38%] w-[48%] items-center justify-center rounded-[12px] border border-dashed border-neutral-300 bg-white/45">
                  <PlaceholderLabel label="food image" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="overflow-hidden bg-white px-4 py-14 sm:px-6 sm:py-[4.5rem] lg:px-8 lg:py-20">
        <div className="mx-auto grid max-w-[1648px] gap-10 lg:grid-cols-[minmax(0,1fr)_520px] lg:items-center lg:gap-14">
          <div>
            <div className="w-[min(350px,74vw)]">
              <LogoMark />
            </div>

            <h2 className="mt-12 max-w-[1160px] text-[clamp(1.75rem,7.4vw,4.15rem)] font-extrabold uppercase leading-[1.22] tracking-normal text-[#64bd00] [overflow-wrap:anywhere] sm:[overflow-wrap:normal]">
              OUR MISSION IS TO MAKE AUTHENTIC ASIAN
              <br />
              GROCERIES AFFORDABLE FOR EVERYONE
            </h2>

            <p className="mt-5 max-w-4xl text-[clamp(1.08rem,1.8vw,1.7rem)] font-normal leading-snug">
              By eliminating unnecessary middlemen, we deliver high-quality products
              <br className="hidden sm:block" />
              directly from factories to consumers at exceptional value.
            </p>

            <p className="mt-9 max-w-4xl text-[clamp(1.75rem,3.5vw,3.15rem)] font-bold leading-tight text-[#ff6b1a]">
              Proudly serving customers worldwide,
              <br />
              We are one of the largest online
              <br />
              destinations for Asian groceries.
            </p>
          </div>

          <div className="relative mx-auto h-[430px] w-full max-w-[560px] sm:h-[560px] lg:h-[680px]">
            <div className="absolute right-0 top-0 h-[190px] w-[190px] rounded-full bg-[#ffd6bd] sm:h-[250px] sm:w-[250px] lg:h-[320px] lg:w-[320px]" />
            {/* TODO: Replace with shopping cart image asset. */}
            <div className="about-cart-placeholder absolute right-4 top-8 flex h-[132px] w-[170px] items-center justify-center rounded-[10px] border border-dashed border-neutral-300 bg-white/65 shadow-sm sm:h-[178px] sm:w-[230px] lg:h-[230px] lg:w-[300px]">
              <PlaceholderLabel label="shopping cart" />
            </div>

            <div className="absolute bottom-0 left-0 h-[250px] w-[250px] rounded-full bg-[#d7ecc5] sm:h-[360px] sm:w-[360px] lg:h-[480px] lg:w-[480px]" />
            {/* TODO: Replace with food plate image asset. */}
            <div className="about-plate-placeholder absolute bottom-10 left-8 flex h-[146px] w-[210px] items-center justify-center rounded-full border border-dashed border-neutral-300 bg-white/70 shadow-sm sm:h-[206px] sm:w-[300px] lg:h-[266px] lg:w-[390px]">
              <PlaceholderLabel label="food plate" />
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden bg-white px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-10 lg:px-8">
        <div className="mx-auto max-w-[1648px] text-center">
          <h2 className="mx-auto max-w-[1250px] text-[clamp(1.9rem,8vw,4.9rem)] font-extrabold leading-[1.2] tracking-normal text-[#64bd00] [overflow-wrap:anywhere] sm:[overflow-wrap:normal]">
            Our teams fulfill and deliver more
            <br />
            than <span className="text-[#ff6b1a]">100,000</span> orders every day
          </h2>

          <div className="relative mx-auto mt-10 min-h-[520px] max-w-[1160px] sm:min-h-[630px] lg:min-h-[700px]">
            <div className="absolute left-1/2 top-[22%] h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-[#d7ecc5] sm:h-[420px] sm:w-[420px] lg:h-[560px] lg:w-[560px]" />

            {/* TODO: Replace with delivery truck image asset. */}
            <div className="about-truck-placeholder absolute bottom-0 left-1/2 z-10 flex h-[190px] w-[min(92vw,760px)] -translate-x-1/2 items-center justify-center rounded-[14px] border border-dashed border-neutral-300 bg-white/80 shadow-[0_18px_48px_rgba(15,23,42,0.12)] sm:h-[250px] lg:h-[300px]">
              <PlaceholderLabel label="delivery truck" />
            </div>

            {[
              "left-0 top-12",
              "bottom-28 left-4 sm:bottom-20",
              "right-0 top-16",
              "bottom-28 right-4 sm:bottom-24",
            ].map((position, index) => (
              <div
                aria-label={`Future surrounding dish image ${index + 1}`}
                className={`about-dish-placeholder absolute ${position} z-20 hidden h-[104px] w-[142px] items-center justify-center rounded-full border border-dashed border-neutral-300 bg-white/80 shadow-[0_12px_30px_rgba(15,23,42,0.12)] min-[430px]:flex sm:h-[130px] sm:w-[184px] lg:h-[150px] lg:w-[220px]`}
                key={position}
              >
                {/* TODO: Replace with surrounding food dish image asset. */}
                <PlaceholderLabel label="dish" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
