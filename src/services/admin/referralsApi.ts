import { apiRequest } from "../../lib/apiClient";

export type AdminReferral = {
  id: string; status: string; review_status: string; registered_at: string | null; first_qualified_at: string | null; second_qualified_at: string | null;
  disqualification_reason: string | null; code: string | null;
  referrer: { id: string | null; name: string | null; email: string | null };
  referred: { id: string | null; name: string | null; email: string | null };
  rewards: Array<{ id: string; milestone: string; amount_minor: number; status: string; coupon_code: string | null; expires_at: string | null }>;
};
export type ReferralProgram = Record<string, unknown> & { name?: string; status?: string; currency_code?: string; referrer_first_reward_minor?: number; referrer_second_reward_minor?: number; referee_first_discount_minor?: number; referee_second_discount_minor?: number; minimum_order_subtotal_minor?: number; first_order_deadline_days?: number; second_order_deadline_days?: number; reward_expiration_days?: number; maximum_successful_referrals_per_user?: number | null; manual_code_entry_enabled?: boolean; terms_content?: string };
export type ReferralListMeta = { current_page: number; last_page: number; total: number };
export type ReferralListOptions = { page?: number; perPage?: number; search?: string; status?: string; reviewStatus?: string };

function queryForList(options: ReferralListOptions) {
  const query = new URLSearchParams({ page: String(options.page ?? 1), per_page: String(options.perPage ?? 25) });
  if (options.search?.trim()) query.set("search", options.search.trim());
  if (options.status) query.set("status", options.status);
  if (options.reviewStatus) query.set("review_status", options.reviewStatus);
  return query.toString();
}

export const adminReferralsApi = {
  list: (token: string, options: ReferralListOptions = {}) => apiRequest<{ data: AdminReferral[]; meta: ReferralListMeta; summary: Record<string, number> }>("/admin/referrals?" + queryForList(options), { token }),
  show: (token: string, id: string) => apiRequest<{ referral: AdminReferral }>("/admin/referrals/" + id, { token }),
  action: (token: string, id: string, body: Record<string, unknown>) => apiRequest<{ referral: AdminReferral }>("/admin/referrals/" + id + "/actions", { method: "POST", token, body }),
  settings: (token: string) => apiRequest<{ program: ReferralProgram | null }>("/admin/referral-settings", { token }),
  saveSettings: (token: string, body: Record<string, unknown>) => apiRequest<{ program: ReferralProgram }>("/admin/referral-settings", { method: "PUT", token, body }),
};
