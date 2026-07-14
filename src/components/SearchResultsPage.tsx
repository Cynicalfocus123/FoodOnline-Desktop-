import { type ReactNode, useDeferredValue, useEffect, useState } from "react";
import { searchProducts } from "../services/catalog";
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
  const [results, setResults] = useState<Awaited<ReturnType<typeof searchProducts>>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setError(null);
    void searchProducts(deferredSearchQuery)
      .then((items) => mounted && setResults(items))
      .catch(() => mounted && setError("Search is temporarily unavailable."))
      .finally(() => mounted && setIsLoading(false));
    return () => { mounted = false; };
  }, [deferredSearchQuery]);

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
              <p className="text-sm font-medium text-neutral-500">{isLoading ? "Loading products..." : `${results.length} products shown`}</p>
              {error ? <p className="text-sm font-semibold text-rose-700">{error}</p> : null}
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
