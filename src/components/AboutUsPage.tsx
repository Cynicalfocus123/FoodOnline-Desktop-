import { useEffect, useRef, useState, type ReactNode } from "react";

const basePath = import.meta.env.BASE_URL;

const aboutSections = [
  {
    src: `${basePath}images/about/about-hero.png`,
    alt: "FoodOnlines.com message that Asian groceries should be widely accessible and affordable for all",
    loading: "eager" as const,
    className: "pt-8 sm:pt-10 lg:pt-12",
  },
  {
    src: `${basePath}images/about/about-mission.png`,
    alt: "FoodOnlines.com mission to make authentic Asian groceries affordable for everyone",
    loading: "lazy" as const,
    className: "pt-10 sm:pt-14 lg:pt-16",
  },
  {
    src: `${basePath}images/about/about-delivery-scale.png`,
    alt: "FoodOnlines.com teams fulfill and deliver more than 100,000 orders every day",
    loading: "lazy" as const,
    className: "py-10 sm:py-14 lg:py-16",
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

function AboutImageSection({
  alt,
  children,
  className,
  loading,
  src,
}: {
  alt: string;
  children?: ReactNode;
  className: string;
  loading: "eager" | "lazy";
  src: string;
}) {
  const reveal = useReveal<HTMLElement>();

  return (
    <section
      ref={reveal.ref}
      className={`mx-auto w-full max-w-[1648px] px-0 transition-all duration-700 ease-out sm:px-4 lg:px-6 ${reveal.className} ${className}`}
    >
      {children}
      <img
        alt={alt}
        className="block h-auto w-full max-w-full object-contain"
        decoding="async"
        fetchPriority={loading === "eager" ? "high" : "auto"}
        loading={loading}
        src={src}
      />
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
    <div className="overflow-x-hidden bg-white pt-[116px] sm:pt-[128px] lg:pt-[138px]">
      {aboutSections.map((section) => (
        <AboutImageSection key={section.src} {...section} />
      ))}
    </div>
  );
}
