import { type ReactNode, useDeferredValue, useMemo } from "react";
import { searchProducts } from "../data/home";
import { useHomeStore } from "../store/homeStore";
import { ProductCard } from "./ProductCard";

function ResultsShell({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-[0_12px_34px_rgba(15,23,42,0.05)] sm:p-6">
      {children}
    </div>
  );
}

export function SearchResultsPage() {
  const searchQuery = useHomeStore((state) => state.searchQuery);
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const results = useMemo(() => searchProducts(deferredSearchQuery), [deferredSearchQuery]);

  return (
    <div className="bg-[#fcfcfd] pb-16 pt-[132px] sm:pt-[146px] lg:pt-[154px]">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6">
        <div className="grid gap-5">
          <ResultsShell>
            <div className="grid gap-2">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-citrus-500">Search Results</p>
              <h1 className="text-3xl font-black tracking-[-0.03em] text-neutral-950 sm:text-4xl">
                Results for "{searchQuery}"
              </h1>
              <p className="text-sm font-medium text-neutral-500">{results.length} products shown</p>
            </div>
          </ResultsShell>

          {results.length ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
              {results.map((product) => (
                <ProductCard key={product.id} layout="grid" product={product} />
              ))}
            </div>
          ) : (
            <ResultsShell>
              <div className="grid gap-2">
                <h2 className="text-2xl font-black text-neutral-950">No products found for "{searchQuery}"</h2>
                <p className="text-sm leading-7 text-neutral-600">Try another keyword, shorter phrase, or a different spelling.</p>
              </div>
            </ResultsShell>
          )}
        </div>
      </div>
    </div>
  );
}
