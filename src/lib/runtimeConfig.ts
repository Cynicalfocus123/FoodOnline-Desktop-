const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL || "https://foodonlines.com/api/v1";

export const adminApiBaseUrl = configuredApiBaseUrl.replace(/\/+$/, "");
