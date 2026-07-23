import { apiRequest } from "../../lib/apiClient";
import type { SignupRoleKey } from "../../lib/registerSchema";

export type ManagedUser = {
  id: string;
  account_type?: SignupRoleKey;
  role?: SignupRoleKey;
  email: string;
  first_name: string | null;
  last_name: string | null;
  contact_number: string | null;
  line_id: string | null;
  company_name: string | null;
  business_type: string | null;
  status: "active" | "in_review" | "disabled";
  registered_from: string | null;
  created_at: string | null;
  updated_at: string | null;
  addresses?: ManagedUserAddress[];
  payment_methods?: ManagedUserPaymentMethod[];
};

export type ManagedUserAddress = {
  id: number;
  user_id: string;
  country_key: string;
  address_values: Record<string, string | null>;
  summary: string | null;
  is_default: boolean;
  created_at: string | null;
  updated_at: string | null;
};

export type ManagedUserPaymentMethod = {
  id: number;
  user_id: string;
  brand: string;
  last4: string;
  expiry_month: number;
  expiry_year: number;
  is_default: boolean;
  status: string;
  created_at: string | null;
};
export const usersApi = {
  show: (token: string, id: string) =>
    apiRequest<{ user: ManagedUser }>(`/admin/users/${id}`, { token }),
  save: (token: string, id: string | null, body: Record<string, unknown>) =>
    apiRequest<{ user: ManagedUser }>(
      id ? `/admin/users/${id}` : "/admin/users",
      { method: id ? "PATCH" : "POST", token, body },
    ),
  archive: (token: string, id: string) =>
    apiRequest<{ user: ManagedUser }>(`/admin/users/${id}`, {
      method: "DELETE",
      token,
    }),
};
