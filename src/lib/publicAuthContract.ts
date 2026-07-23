import { isSignupRoleKey, type SignupRoleKey } from "./registerSchema.ts";

export type ApiAuthenticatedUser = {
  id: number | string;
  account_type?: SignupRoleKey;
  company_name: string | null;
  contact_number: string | null;
  email: string;
  first_name: string | null;
  last_name: string | null;
  line_id: string | null;
  registered_at: string | null;
  role?: SignupRoleKey;
  status: string;
};

export type PublicAuthEnvelope = {
  token: string;
  user: ApiAuthenticatedUser;
};

export function parsePublicAuthEnvelope(
  value: unknown,
  expectedAccountType?: SignupRoleKey,
): PublicAuthEnvelope | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const candidate = value as { token?: unknown; user?: unknown };
  if (typeof candidate.token !== "string" || !candidate.token.trim()) return null;
  if (!candidate.user || typeof candidate.user !== "object" || Array.isArray(candidate.user)) return null;

  const user = candidate.user as Partial<ApiAuthenticatedUser>;
  const accountType = user.account_type ?? user.role;
  if ((typeof user.id !== "string" && typeof user.id !== "number") || !String(user.id).trim()) return null;
  if (typeof user.email !== "string" || !user.email.trim()) return null;
  if (typeof user.status !== "string" || !user.status.trim()) return null;
  if (typeof accountType !== "string" || !isSignupRoleKey(accountType)) return null;
  if (expectedAccountType && accountType !== expectedAccountType) return null;

  return {
    token: candidate.token,
    user: {
      id: user.id,
      account_type: accountType,
      company_name: typeof user.company_name === "string" ? user.company_name : null,
      contact_number: typeof user.contact_number === "string" ? user.contact_number : null,
      email: user.email,
      first_name: typeof user.first_name === "string" ? user.first_name : null,
      last_name: typeof user.last_name === "string" ? user.last_name : null,
      line_id: typeof user.line_id === "string" ? user.line_id : null,
      registered_at: typeof user.registered_at === "string" ? user.registered_at : null,
      role: accountType,
      status: user.status,
    },
  };
}
