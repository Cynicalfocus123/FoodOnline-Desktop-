import { useEffect, useState } from "react";
import type { Category } from "../types/catalog";
import { categoryFallbackInitial } from "./categoryVisuals";

export function CategoryArtwork({ category, className = "" }: { category: Category; className?: string }) {
  const [failed, setFailed] = useState(!category.image);

  useEffect(() => setFailed(!category.image), [category.image]);

  if (failed) {
    return (
      <span
        aria-label={`${category.name} image placeholder`}
        className={`flex aspect-square w-full items-center justify-center bg-gradient-to-br from-emerald-50 via-lime-50 to-amber-50 text-3xl font-black text-leaf-700 ${className}`}
        role="img"
      >
        {categoryFallbackInitial(category.name)}
      </span>
    );
  }

  return (
    <img
      alt={category.name}
      className={`aspect-square w-full object-contain ${className}`}
      decoding="async"
      height={360}
      loading="lazy"
      onError={() => setFailed(true)}
      src={category.image}
      width={360}
    />
  );
}
