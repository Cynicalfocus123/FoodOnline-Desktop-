import { catalogSource } from "../../lib/runtimeConfig";
import { apiCatalogRepository } from "./apiCatalogRepository";
import { hybridCatalogRepository } from "./hybridCatalogRepository";
import { localCatalogRepository } from "./localCatalogRepository";

export const catalogRepository =
  catalogSource === "local"
    ? localCatalogRepository
    : catalogSource === "hybrid"
      ? hybridCatalogRepository
      : apiCatalogRepository;
