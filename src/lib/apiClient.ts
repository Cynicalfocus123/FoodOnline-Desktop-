import { SignupFormValues, SignupRoleKey } from "./registerSchema";
import { apiBaseUrl } from "./runtimeConfig";

type ApiOptions = {
  method?: "GET" | "POST" | "PUT";
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
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: options.method ?? "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const payload = (await response.json().catch(() => ({}))) as {
    errors?: Record<string, string[]>;
    message?: string;
  };

  if (!response.ok) {
    throw new ApiError(payload.message || "Request failed.", response.status, payload.errors ?? {});
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
