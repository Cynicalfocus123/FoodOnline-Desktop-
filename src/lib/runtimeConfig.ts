const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() || "https://www.api.foodonlines.com/api/v1";

export const apiBaseUrl = configuredApiBaseUrl.replace(/\/+$/, "");
export const adminApiBaseUrl = apiBaseUrl;
export const registerEndpointPath = "/auth/register";
export const loginEndpointPath = "/auth/login";
export const adminUsersEndpointPath = "/admin/users";
