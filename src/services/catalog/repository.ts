import { catalogSource } from "../../lib/runtimeConfig";
import { apiCatalogRepository } from "./apiCatalogRepository";
import { localCatalogRepository } from "./localCatalogRepository";

export const catalogRepository = catalogSource === "local" ? localCatalogRepository : apiCatalogRepository;
