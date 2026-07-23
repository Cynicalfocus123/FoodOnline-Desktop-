import { apiRequest } from "../../lib/apiClient";

export type ReferralIdentity = { id: string | null; name: string | null; email: string | null; account_type: string; status: string | null; registered_at: string | null };
export type AdminReferral = {
  id: string; status: string; review_status: string; review_note: string | null; registered_at: string | null; updated_at: string | null;
  first_qualified_at: string | null; second_qualified_at: string | null; disqualification_reason: string | null; code: string | null;
  referrer: ReferralIdentity | null; referred: ReferralIdentity | null;
  program: { id: string; name: string; currency_code: string } | null;
  attribution: { source: string; created_during_registration: boolean; valid: boolean; self_referral_protection: string; duplicate_prevention: string };
  qualification_state?: string; reward_state?: string;
};
export type ReferralQualification = {
  status: string; rule: string | null; minimum_order_subtotal_minor: number | null; currency_code: string | null; reason: string | null;
  first: ReferralOrder | null; second: ReferralOrder | null;
};
export type ReferralOrder = { id: string; reference: string; order_status: string; payment_status: string; fulfillment_status: string; subtotal_minor: number; currency_code: string; qualified_at: string | null };
export type ReferralReward = {
  id: string; milestone: string; reward_type: string; amount_minor: number; currency_code: string; status: string; issued_at: string | null; expires_at: string | null;
  redeemed_at: string | null; revoked_at: string | null; revocation_reason: string | null; beneficiary: ReferralIdentity | null;
  coupon: { id: string; code: string; status: string; expires_at: string | null } | null; qualifying_order: ReferralOrder | null;
};
export type ReferralAuditEvent = { id: string; action: string; timestamp: string | null; actor_type: string; admin_actor: string | null; previous_status: string | null; new_status: string | null; summary: string };
export type ReferralNotification = { id: string; event: string; title: string; message: string; recipient: string; created_at: string | null };
export type ReferralProgram = Record<string, unknown> & { name?: string; status?: string; currency_code?: string; referrer_first_reward_minor?: number; referrer_second_reward_minor?: number; referee_first_discount_minor?: number; referee_second_discount_minor?: number; minimum_order_subtotal_minor?: number; first_order_deadline_days?: number; second_order_deadline_days?: number; reward_expiration_days?: number; maximum_successful_referrals_per_user?: number | null; manual_code_entry_enabled?: boolean; terms_content?: string };
export type ReferralListMeta = { current_page: number; last_page: number; total: number };
export type ReferralListOptions = { page?: number; perPage?: number; search?: string; status?: string; reviewStatus?: string; referrerAccountType?: string; referredAccountType?: string };

function queryForList(options: ReferralListOptions) {
  const query = new URLSearchParams({ page: String(options.page ?? 1), per_page: String(options.perPage ?? 25) });
  if (options.search?.trim()) query.set("search", options.search.trim());
  if (options.status) query.set("status", options.status);
  if (options.reviewStatus) query.set("review_status", options.reviewStatus);
  if (options.referrerAccountType) query.set("referrer_account_type", options.referrerAccountType);
  if (options.referredAccountType) query.set("referred_account_type", options.referredAccountType);
  return query.toString();
}

export const adminReferralsApi = {
  list: (token: string, options: ReferralListOptions = {}) => apiRequest<{ data: AdminReferral[]; meta: ReferralListMeta; summary: Record<string, number> }>("/admin/referrals?" + queryForList(options), { token }),
  show: (token: string, id: string) => apiRequest<{ referral: AdminReferral }>("/admin/referrals/" + id, { token }),
  qualification: (token: string, id: string) => apiRequest<{ qualification: ReferralQualification }>("/admin/referrals/" + id + "/qualification", { token }),
  rewards: (token: string, id: string) => apiRequest<{ rewards: ReferralReward[] }>("/admin/referrals/" + id + "/rewards", { token }),
  auditHistory: (token: string, id: string) => apiRequest<{ data: ReferralAuditEvent[] }>("/admin/referrals/" + id + "/audit-history", { token }),
  notifications: (token: string, id: string) => apiRequest<{ data: ReferralNotification[] }>("/admin/referrals/" + id + "/notifications", { token }),
  action: (token: string, id: string, body: Record<string, unknown>) => apiRequest<{ referral: AdminReferral }>("/admin/referrals/" + id + "/actions", { method: "POST", token, body }),
  settings: (token: string) => apiRequest<{ program: ReferralProgram | null }>("/admin/referral-settings", { token }),
  saveSettings: (token: string, body: Record<string, unknown>) => apiRequest<{ program: ReferralProgram }>("/admin/referral-settings", { method: "PUT", token, body }),
};
