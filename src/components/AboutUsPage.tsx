import { useEffect, useRef, useState } from "react";

const basePath = import.meta.env.BASE_URL;

const flavorCircles = [
  "bg-[#b7dce8]",
  "bg-[#d7ecc5]",
  "bg-[#ffd779]",
  "bg-[#ffd0df]",
];

const leadershipCards = [
  {
    name: "Jakapun Viwatkurkul",
    role: "President and Founder",
    image: `${basePath}images/about/leadership/jakapun-viwatkurkul.webp`,
    imageAlt: "Jakapun Viwatkurkul",
    imageClassName: "object-contain object-bottom scale-[1.24]",
  },
  {
    name: "Paul Pongpichan",
    role: "CSCO (Chief Supply Chain Officer)",
    image: `${basePath}images/about/leadership/paul-pongpichan.webp`,
    imageAlt: "Paul Pongpichan",
    imageClassName: "object-contain object-bottom scale-[1.24]",
  },
  {
    name: "Pasit Viwatkurkul",
    role: "CTO",
    image: `${basePath}images/about/leadership/pasit-viwatkurkul.webp`,
    imageAlt: "Pasit Viwatkurkul",
    imageClassName: "object-contain object-bottom scale-[1.24]",
  },
  {
    name: "Natalie",
    role: "CFO",
    image: `${basePath}images/about/leadership/natalie.png`,
    imageAlt: "Natalie",
    imageClassName: "object-contain object-bottom scale-[1.24]",
  },
  {
    name: "Lucas Huber",
    role: "COO",
    image: `${basePath}images/about/leadership/lucas-huber.png`,
    imageAlt: "Lucas Huber",
    imageClassName: "object-contain object-bottom scale-[1.13]",
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
    image: `${basePath}images/about/leadership/janet-weiler.jfif`,
    imageAlt: "Janet Weiler",
    imageClassName: "object-contain object-bottom scale-[0.92]",
  },
  {
    name: "Ahmet Yılmaz",
    role: "Chief Customer & Experience Officer / CXO",
    image: `${basePath}images/about/leadership/ahmet-yilmaz.png`,
    imageAlt: "Ahmet Yılmaz",
    imageClassName: "object-cover object-[50%_12%]",
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

function LeadershipSection() {
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
        {leadershipCards.map((leader) => (
          <article
            aria-label={`${leader.name}, ${leader.role}`}
            className="flex min-h-[360px] flex-col overflow-hidden rounded-[26px] border border-neutral-200 bg-white shadow-[0_12px_34px_rgba(15,23,42,0.06)] sm:min-h-[420px] lg:min-h-[520px]"
            key={leader.name}
          >
            <div className="px-6 pb-4 pt-7 sm:px-7 sm:pt-8 lg:px-8">
              <h3 className="text-[1.75rem] font-semibold leading-tight tracking-normal text-neutral-950 sm:text-[2rem]">
                {leader.name}
              </h3>
              <p className="mt-2 text-lg font-normal leading-snug text-neutral-950 sm:text-xl">{leader.role}</p>
            </div>
            <div className="mt-auto flex h-[260px] items-end justify-center px-2 pt-2 sm:h-[310px] lg:h-[380px]">
              <img
                alt={leader.imageAlt}
                className={`h-full w-full ${leader.imageClassName}`}
                decoding="async"
                loading="lazy"
                src={leader.image}
              />
            </div>
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
            className="about-hero-image-placeholder mt-8 aspect-[2.9/1] min-h-[210px] w-full overflow-hidden rounded-[18px] bg-[linear-gradient(135deg,#f5efe4,#ede8df)] sm:min-h-[280px] lg:mt-9 lg:min-h-[420px]"
          />
        </div>
      </section>

      <section className="relative overflow-hidden bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-[1648px] text-center">
          <h2 className="mx-auto max-w-[1320px] text-[clamp(1.7rem,7.6vw,4.6rem)] font-extrabold uppercase leading-[1.18] tracking-normal text-[#64bd00]">
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
                <div className="about-grocery-bag-placeholder absolute bottom-4 left-8 h-[92px] w-[98px] sm:h-[122px] sm:w-[132px] lg:h-[164px] lg:w-[176px]" />
              </div>
            </div>

            <div className="flex justify-end">
              <div className="relative h-[128px] w-[170px] sm:h-[168px] sm:w-[230px] lg:h-[230px] lg:w-[300px]">
                <span className="absolute bottom-0 right-0 h-[120px] w-[120px] rounded-full bg-[#ff6b1a] sm:h-[160px] sm:w-[160px] lg:h-[220px] lg:w-[220px]" />
                {/* TODO: Replace with fruit image asset. */}
                <div className="about-fruit-placeholder absolute bottom-2 right-8 h-[98px] w-[112px] rounded-full sm:h-[130px] sm:w-[146px] lg:h-[176px] lg:w-[198px]" />
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
                <div className="h-[38%] w-[48%]" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="overflow-hidden bg-white px-4 py-14 sm:px-6 sm:py-[4.5rem] lg:px-8 lg:py-20">
        <div className="mx-auto grid max-w-[1648px] gap-10 lg:grid-cols-[minmax(0,1fr)_520px] lg:items-center lg:gap-14">
          <div>
            <h2 className="max-w-[1160px] text-[clamp(1.22rem,5.2vw,2.25rem)] font-extrabold uppercase leading-[1.18] tracking-normal text-[#64bd00] sm:text-[clamp(2.05rem,4.6vw,4.15rem)] sm:leading-[1.22]">
              <span className="block sm:hidden">
                <span className="block">OUR MISSION IS TO MAKE</span>
                <span className="block">AUTHENTIC ASIAN GROCERIES</span>
                <span className="block">AFFORDABLE FOR EVERYONE</span>
              </span>
              <span className="hidden sm:block">
                OUR MISSION IS TO MAKE AUTHENTIC ASIAN
                <br />
                GROCERIES AFFORDABLE FOR EVERYONE
              </span>
            </h2>

            <p className="mt-5 max-w-4xl text-[clamp(1.08rem,1.8vw,1.7rem)] font-normal leading-snug">
              By eliminating unnecessary middlemen, we deliver high-quality products
              <br className="hidden sm:block" />
              directly from factories to consumers at exceptional value.
            </p>

            <p className="mt-7 max-w-4xl text-[clamp(1.22rem,5.1vw,2rem)] font-bold leading-[1.16] text-[#ff6b1a] sm:mt-9 sm:text-[clamp(1.75rem,3.5vw,3.15rem)] sm:leading-tight">
              <span className="block sm:hidden">
                <span className="block">Proudly serving customers worldwide,</span>
                <span className="block">We are one of the largest online</span>
                <span className="block">destinations for Asian groceries.</span>
              </span>
              <span className="hidden sm:block">
                Proudly serving customers worldwide,
                <br />
                We are one of the largest online
                <br />
                destinations for Asian groceries.
              </span>
            </p>
          </div>

          <div className="relative mx-auto h-[430px] w-full max-w-[560px] sm:h-[560px] lg:h-[680px]">
            <div className="absolute right-0 top-0 h-[190px] w-[190px] rounded-full bg-[#ffd6bd] sm:h-[250px] sm:w-[250px] lg:h-[320px] lg:w-[320px]" />
            {/* TODO: Replace with shopping cart image asset. */}
            <div className="about-cart-placeholder absolute right-4 top-8 h-[132px] w-[170px] sm:h-[178px] sm:w-[230px] lg:h-[230px] lg:w-[300px]" />

            <div className="absolute bottom-0 left-0 h-[250px] w-[250px] rounded-full bg-[#d7ecc5] sm:h-[360px] sm:w-[360px] lg:h-[480px] lg:w-[480px]" />
            {/* TODO: Replace with food plate image asset. */}
            <div className="about-plate-placeholder absolute bottom-10 left-8 h-[146px] w-[210px] rounded-full sm:h-[206px] sm:w-[300px] lg:h-[266px] lg:w-[390px]" />
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
            <div className="about-truck-placeholder absolute bottom-0 left-1/2 z-10 h-[190px] w-[min(92vw,760px)] -translate-x-1/2 sm:h-[250px] lg:h-[300px]" />

            {[
              "left-0 top-12",
              "bottom-28 left-4 sm:bottom-20",
              "right-0 top-16",
              "bottom-28 right-4 sm:bottom-24",
            ].map((position, index) => (
              <div
                aria-label={`Future surrounding dish image ${index + 1}`}
                className={`about-dish-placeholder absolute ${position} z-20 hidden h-[104px] w-[142px] rounded-full min-[430px]:block sm:h-[130px] sm:w-[184px] lg:h-[150px] lg:w-[220px]`}
                key={position}
              >
                {/* TODO: Replace with surrounding food dish image asset. */}
              </div>
            ))}
          </div>
        </div>
      </section>
      <LeadershipSection />
    </div>
  );
}
