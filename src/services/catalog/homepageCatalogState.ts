import type { Category, ProductCarouselSection } from "../../types/catalog";

export type HomepageCatalogData = {
  categories: Category[];
  sections: ProductCarouselSection[];
};

export type HomepageCatalogPhase = "loading" | "ready" | "refreshing" | "resolved" | "error";

export type HomepageCatalogState = HomepageCatalogData & {
  phase: HomepageCatalogPhase;
  error: string | null;
};

type HomepageCatalogControllerOptions = {
  initial: HomepageCatalogData;
  load: () => Promise<HomepageCatalogData>;
  errorMessage?: string;
};

function hasUsableCatalog(data: HomepageCatalogData) {
  return data.categories.length > 0 || data.sections.length > 0;
}

function cloneData(data: HomepageCatalogData): HomepageCatalogData {
  return { categories: [...data.categories], sections: [...data.sections] };
}

/**
 * Shares one homepage refresh between every consumer while retaining the last
 * usable presentation snapshot. The initial snapshot is intentionally passed
 * synchronously so React never needs to start the homepage from an empty array
 * when compatible local catalog data already exists.
 */
export function createHomepageCatalogController(options: HomepageCatalogControllerOptions) {
  const listeners = new Set<() => void>();
  let inFlight: Promise<HomepageCatalogState> | null = null;
  let state: HomepageCatalogState = {
    ...cloneData(options.initial),
    phase: hasUsableCatalog(options.initial) ? "ready" : "loading",
    error: null,
  };

  const publish = () => listeners.forEach((listener) => listener());
  const setState = (next: HomepageCatalogState) => {
    state = next;
    publish();
  };

  return {
    getSnapshot: () => state,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    refresh(): Promise<HomepageCatalogState> {
      if (inFlight) return inFlight;

      const retained = hasUsableCatalog(state);
      setState({
        ...state,
        phase: retained ? "refreshing" : "loading",
        error: null,
      });

      inFlight = options.load()
        .then((data) => {
          setState({ ...cloneData(data), phase: "resolved", error: null });
          return state;
        })
        .catch(() => {
          setState({
            ...state,
            phase: retained ? "ready" : "error",
            error: retained ? null : options.errorMessage ?? "Catalog sections are temporarily unavailable.",
          });
          return state;
        })
        .finally(() => {
          inFlight = null;
        });

      return inFlight;
    },
  };
}
