import { useEffect, useState } from "react";
import { catalogRepository } from "./repository";
import type { Product } from "../../types/catalog";

export function useCatalogProducts(ids: string[]) {
  const [products, setProducts] = useState<Map<string, Product>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const key = [...new Set(ids.filter(Boolean))].sort().join("|");

  useEffect(() => {
    let mounted = true;
    const uniqueIds = key ? key.split("|") : [];
    if (!uniqueIds.length) {
      setProducts(new Map());
      setIsLoading(false);
      return () => { mounted = false; };
    }
    setIsLoading(true);
    setError(null);
    void Promise.all(uniqueIds.map(async (id) => [id, await catalogRepository.getProductById(id)] as const))
      .then((items) => {
        if (!mounted) return;
        setProducts(new Map(items.filter((item): item is [string, Product] => Boolean(item[1]))));
      })
      .catch(() => mounted && setError("Some catalog items could not be loaded."))
      .finally(() => mounted && setIsLoading(false));
    return () => { mounted = false; };
  }, [key]);

  return { products, isLoading, error };
}
