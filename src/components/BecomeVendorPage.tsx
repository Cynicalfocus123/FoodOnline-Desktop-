import { useEffect } from "react";
import { useHomeStore } from "../store/homeStore";

const basePath = import.meta.env.BASE_URL;

const vendorSections = [
  {
    key: "hero",
    src: `${basePath}images/become-vendor/vendor-hero.png`,
    alt: "FoodOnlines Sell Globally vendor page hero with produce and get started button",
    loading: "eager" as const,
  },
  {
    key: "stats",
    src: `${basePath}images/become-vendor/vendor-stats.png`,
    alt: "FoodOnlines Sell Globally marketplace statistics",
    loading: "eager" as const,
  },
  {
    key: "selling",
    src: `${basePath}images/become-vendor/vendor-selling.png`,
    alt: "Who is selling on Globally trusted brands and businesses marketplace section",
    loading: "lazy" as const,
  },
  {
    key: "scale",
    src: `${basePath}images/become-vendor/vendor-scale.png`,
    alt: "Everything vendors need to scale their business with seller portal and fulfillment support",
    loading: "lazy" as const,
  },
  {
    key: "steps",
    src: `${basePath}images/become-vendor/vendor-steps.png`,
    alt: "Start selling in just three simple steps on FoodOnlines",
    loading: "lazy" as const,
  },
  {
    key: "final-cta",
    src: `${basePath}images/become-vendor/vendor-final-cta.png`,
    alt: "Start selling today sign up and log in call to action",
    loading: "lazy" as const,
  },
];

function VendorOverlayButton({
  ariaLabel,
  className,
  onClick,
}: {
  ariaLabel: string;
  className: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={ariaLabel}
      className={`absolute border-0 bg-transparent p-0 text-transparent outline-none transition focus-visible:ring-4 focus-visible:ring-citrus-500/75 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${className}`}
      onClick={onClick}
      type="button"
    />
  );
}

export function BecomeVendorPage() {
  const openSignup = useHomeStore((state) => state.openSignup);
  const openLogin = useHomeStore((state) => state.openLogin);

  useEffect(() => {
    document.title = "Become a Vendor | FoodOnlines";

    const description =
      "Sell globally with FoodOnlines and reach more customers through a global marketplace for food brands and suppliers.";
    let metaDescription = document.querySelector<HTMLMetaElement>('meta[name="description"]');

    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.name = "description";
      document.head.appendChild(metaDescription);
    }

    metaDescription.content = description;
  }, []);

  return (
    <div className="bg-[#c4dfb8] pt-[116px] sm:pt-[128px] lg:pt-[138px]">
      <div aria-label="Become a Vendor" className="mx-auto w-full max-w-none bg-[#c4dfb8]">
        <h1 className="sr-only">Become a Vendor with FoodOnlines</h1>
        {vendorSections.map((section) => (
          <section className="relative m-0 block border-0 p-0" key={section.key}>
            <img
              alt={section.alt}
              className="block h-auto w-full max-w-none"
              decoding="async"
              draggable={false}
              fetchPriority={section.loading === "eager" ? "high" : "auto"}
              loading={section.loading}
              src={section.src}
            />
            {section.key === "hero" ? (
              <VendorOverlayButton
                ariaLabel="Get started as a vendor"
                className="left-[6.8%] top-[71.4%] h-[10.7%] w-[27.4%] rounded-full"
                onClick={openSignup}
              />
            ) : null}
            {section.key === "final-cta" ? (
              <>
                <VendorOverlayButton
                  ariaLabel="Sign up as a vendor"
                  className="left-[64.1%] top-[37%] h-[26%] w-[28.8%] rounded-full"
                  onClick={openSignup}
                />
                <VendorOverlayButton
                  ariaLabel="Log in to seller account"
                  className="left-[8.9%] top-[69.5%] h-[9%] w-[7%] rounded-full"
                  onClick={openLogin}
                />
              </>
            ) : null}
          </section>
        ))}
      </div>
    </div>
  );
}
