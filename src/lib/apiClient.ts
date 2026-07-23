import { SignupFormValues, SignupRoleKey, optionalRegistrationValue } from "./registerSchema";
import { apiBaseUrl } from "./runtimeConfig";
import { safeApiStatusMessage, sanitizeApiFieldErrors, type ApiFieldErrors } from "./userFacingError";

export type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  token?: string | null;
  body?: unknown;
  headers?: Record<string, string>;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public fieldErrors: ApiFieldErrors = {},
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

  let response: Response;
  try {
    response = await fetch(endpointUrl, {
      cache: "no-store",
      method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError(safeApiStatusMessage(0, null, {}), 0);
  }
  const contentType = response.headers.get("content-type") ?? "";
  const responseText = await response.text();
  const payload = ((): { errors?: unknown; message?: unknown } => {
    if (!contentType.includes("application/json") || !responseText) {
      return {};
    }

    try {
      return JSON.parse(responseText) as { errors?: unknown; message?: unknown };
    } catch {
      return {};
    }
  })();
  const fieldErrors = sanitizeApiFieldErrors(payload.errors);
  const responseMessage = safeApiStatusMessage(response.status, payload.message, fieldErrors);

  if (import.meta.env.DEV) {
    console.info("[FoodOnlines API response]", {
      endpointUrl,
      method,
      status: response.status,
    });
  }

  if (!response.ok) {
    if (import.meta.env.DEV) {
      console.warn("[FoodOnlines API error]", {
        endpointUrl,
        method,
        status: response.status,
      });
    }

    throw new ApiError(responseMessage, response.status, fieldErrors);
  }

  return payload as T;
}

export function toRegisterPayload(selectedRole: SignupRoleKey, formValues: SignupFormValues, referralCode?: string | null) {
  return {
    account_type: selectedRole,
    email: formValues.emailAddress,
    first_name: formValues.firstName,
    last_name: formValues.lastName,
    contact_number: formValues.contactNumber,
    line_id: optionalRegistrationValue(formValues.lineId),
    company_name: optionalRegistrationValue(formValues.companyName),
    password: formValues.password,
    ...(referralCode?.trim() ? { referral_code: referralCode.trim().toUpperCase() } : {}),
    registered_from: "main_public_frontend",
  };
}
