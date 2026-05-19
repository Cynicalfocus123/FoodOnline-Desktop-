const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://api.foodonlines.com/api/v1";

export const adminApiBaseUrl = configuredApiBaseUrl.replace(/\/+$/, "");
