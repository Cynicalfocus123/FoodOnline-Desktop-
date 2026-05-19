const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL || "https://www.api.foodonlines.com/api/v1";

export const adminApiBaseUrl = configuredApiBaseUrl.replace(/\/+$/, "");
