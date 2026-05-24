import { useEffect, useRef, useState } from "react";
import { ProductCarouselSection } from "../data/home";
import { useHomeStore } from "../store/homeStore";
import { ProductCard } from "./ProductCard";

type ProductCarouselProps = {
  section: ProductCarouselSection;
};

export function ProductCarousel({ section }: ProductCarouselProps) {
  const openCategory = useHomeStore((state) => state.openCategory);
  const scrollReference = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    const container = scrollReference.current;
    if (!container) {
      return;
    }

    const updateScrollState = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      setCanScrollLeft(scrollLeft > 8);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 8);
    };

    updateScrollState();
    container.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      container.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [section.items.length]);

  function scrollByCard(direction: "left" | "right") {
    const container = scrollReference.current;
    if (!container) {
      return;
    }

    const amount = container.clientWidth * 0.82;
    container.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }

  return (
    <section
      className="home-section-auto px-4 py-7 sm:px-6 sm:py-8"
      id={section.sectionId}
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-[1.65rem] font-bold tracking-[-0.02em] text-neutral-950 sm:text-[1.9rem]">
            {section.title}
          </h2>
          <a
            className="text-sm font-semibold text-leaf-600 transition hover:text-leaf-700"
            href={section.seeAllHref}
            onClick={(event) => {
              event.preventDefault();
              openCategory(section.sectionId);
            }}
          >
            see all
          </a>
        </div>

        <div className="relative">
          <button
            aria-label={`Scroll ${section.title} left`}
            className={`absolute left-0 top-1/2 z-10 hidden h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white text-xl text-neutral-700 shadow-lg shadow-neutral-950/10 transition hover:border-neutral-300 hover:text-neutral-950 lg:flex ${
              canScrollLeft ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
            onClick={() => scrollByCard("left")}
            type="button"
          >
            <span aria-hidden="true">‹</span>
          </button>

          <div
            className="flex items-stretch gap-3 overflow-x-auto pb-4 pt-1 scrollbar-none snap-x snap-mandatory scroll-smooth scroll-px-4"
            ref={scrollReference}
          >
            {section.items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <button
            aria-label={`Scroll ${section.title} right`}
            className={`absolute right-0 top-1/2 z-10 hidden h-12 w-12 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white text-xl text-neutral-700 shadow-lg shadow-neutral-950/10 transition hover:border-neutral-300 hover:text-neutral-950 lg:flex ${
              canScrollRight ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
            onClick={() => scrollByCard("right")}
            type="button"
          >
            <span aria-hidden="true">›</span>
          </button>
        </div>
      </div>
    </section>
  );
}
