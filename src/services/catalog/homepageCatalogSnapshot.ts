import { catalogSource } from "../../lib/runtimeConfig";
import { mergeAuthoritativeHomepageSections } from "./catalogMerge";
import { getImmediateHybridHomepageCatalog } from "./hybridCatalogRepository";
import { localHomepageCatalog, localHomepageCategories } from "./localCatalogRepository";
import type { HomepageCatalogData } from "./homepageCatalogState";

function localHomepageSnapshot(): HomepageCatalogData {
  const categories = [...localHomepageCategories];
  return {
    categories,
    sections: mergeAuthoritativeHomepageSections(localHomepageCatalog, [], categories),
  };
}

export function getImmediateHomepageCatalogSnapshot(): HomepageCatalogData {
  if (catalogSource === "api") return { categories: [], sections: [] };
  if (catalogSource === "hybrid") return getImmediateHybridHomepageCatalog();
  return localHomepageSnapshot();
}
