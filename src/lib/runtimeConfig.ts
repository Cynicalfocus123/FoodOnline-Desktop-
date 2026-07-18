const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() || "https://api.foodonlines.com/api/v1";

export const apiBaseUrl = configuredApiBaseUrl.replace(/\/+$/, "");
export type CatalogSource = "api" | "local" | "hybrid";

const configuredCatalogSource = import.meta.env.VITE_CATALOG_SOURCE?.trim().toLowerCase();
export const catalogSource: CatalogSource =
  configuredCatalogSource === "local" || configuredCatalogSource === "api" ? configuredCatalogSource : "hybrid";
export const adminApiBaseUrl = apiBaseUrl;
export const registerEndpointPath = "/auth/register";
export const loginEndpointPath = "/auth/login";
export const adminUsersEndpointPath = "/admin/users";
