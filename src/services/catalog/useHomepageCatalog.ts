import { useEffect, useSyncExternalStore } from "react";
import { catalogRepository } from "./repository";
import { createHomepageCatalogController } from "./homepageCatalogState";
import { getImmediateHomepageCatalogSnapshot } from "./homepageCatalogSnapshot";

const homepageCatalogController = createHomepageCatalogController({
  initial: getImmediateHomepageCatalogSnapshot(),
  load: async () => {
    const [categories, sections] = await Promise.all([
      catalogRepository.getHomepageCategories(),
      catalogRepository.getHomepageCatalog(),
    ]);
    return { categories, sections };
  },
});

export function useHomepageCatalog() {
  const snapshot = useSyncExternalStore(
    homepageCatalogController.subscribe,
    homepageCatalogController.getSnapshot,
    homepageCatalogController.getSnapshot,
  );

  useEffect(() => {
    void homepageCatalogController.refresh();
  }, []);

  return snapshot;
}
