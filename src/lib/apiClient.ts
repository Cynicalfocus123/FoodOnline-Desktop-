import { SignupSubmission } from "./registerSchema";
import { adminApiBaseUrl } from "./runtimeConfig";

type ApiOptions = {
  method?: "GET" | "POST" | "PUT";
  token?: string | null;
  body?: unknown;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export async function apiRequest<T>(path: string, options: ApiOptions = {}) {
  const response = await fetch(`${adminApiBaseUrl}${path}`, {
    method: options.method ?? "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const payload = (await response.json().catch(() => ({}))) as { message?: string };

  if (!response.ok) {
    throw new ApiError(payload.message || "Request failed.", response.status);
  }

  return payload as T;
}

export function toRegisterPayload(submission: SignupSubmission) {
  return {
    role: submission.selectedRole,
    email: submission.emailAddress,
    first_name: submission.firstName,
    last_name: submission.lastName,
    contact_number: submission.contactNumber,
    line_id: submission.lineId || null,
    company_name: submission.companyName,
    registered_from: "website",
  };
}
