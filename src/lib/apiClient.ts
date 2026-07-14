import { SignupFormValues, SignupRoleKey } from "./registerSchema";
import { apiBaseUrl } from "./runtimeConfig";

type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  token?: string | null;
  body?: unknown;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public fieldErrors: Record<string, string[]> = {},
  ) {
    super(message);
  }
}

export async function apiRequest<T>(path: string, options: ApiOptions = {}) {
  const method = options.method ?? "GET";
  const endpointUrl = `${apiBaseUrl}${path}`;
  const payloadKeys = options.body && typeof options.body === "object" ? Object.keys(options.body) : [];

  if (import.meta.env.DEV) {
    console.info("[FoodOnlines API request]", {
      endpointUrl,
      method,
      payloadKeys,
    });
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const contentType = response.headers.get("content-type") ?? "";
  const responseText = await response.text();
  const payload = ((): { errors?: Record<string, string[]>; message?: string } => {
    if (!contentType.includes("application/json") || !responseText) {
      return {};
    }

    try {
      return JSON.parse(responseText) as { errors?: Record<string, string[]>; message?: string };
    } catch {
      return {};
    }
  })();
  const fallbackMessage = responseText
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
  const responseMessage = payload.message || fallbackMessage || "Request failed.";

  if (import.meta.env.DEV) {
    console.info("[FoodOnlines API response]", {
      endpointUrl,
      method,
      status: response.status,
      message: responseMessage,
    });
  }

  if (!response.ok) {
    if (import.meta.env.DEV) {
      console.warn("[FoodOnlines API error]", {
        endpointUrl,
        method,
        status: response.status,
        message: responseMessage,
      });
    }

    throw new ApiError(`Request failed (${response.status}): ${responseMessage}`, response.status, payload.errors ?? {});
  }

  return payload as T;
}

export function toRegisterPayload(selectedRole: SignupRoleKey, formValues: SignupFormValues) {
  return {
    account_type: selectedRole,
    email: formValues.emailAddress,
    first_name: formValues.firstName,
    last_name: formValues.lastName,
    contact_number: formValues.contactNumber,
    line_id: formValues.lineId || null,
    company_name: formValues.companyName,
    password: formValues.password,
    registered_from: "main_public_frontend",
  };
}
