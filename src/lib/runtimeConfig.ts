const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() || "https://www.api.foodonlines.com/api/v1";

export const apiBaseUrl = configuredApiBaseUrl.replace(/\/+$/, "");
export type CatalogSource = "api" | "local";
export const catalogSource: CatalogSource = import.meta.env.VITE_CATALOG_SOURCE === "local" ? "local" : "api";
export const adminApiBaseUrl = apiBaseUrl;
export const registerEndpointPath = "/auth/register";
export const loginEndpointPath = "/auth/login";
export const adminUsersEndpointPath = "/admin/users";
