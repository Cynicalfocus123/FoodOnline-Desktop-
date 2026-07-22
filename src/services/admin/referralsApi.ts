import { apiRequest } from "../../lib/apiClient";

export type AdminReferral = {
  id: string; status: string; review_status: string; registered_at: string | null; first_qualified_at: string | null; second_qualified_at: string | null;
  disqualification_reason: string | null; code: string | null;
  referrer: { id: string | null; name: string | null; email: string | null };
  referred: { id: string | null; name: string | null; email: string | null };
  rewards: Array<{ id: string; milestone: string; amount_minor: number; status: string; coupon_code: string | null; expires_at: string | null }>;
};
export type ReferralProgram = Record<string, unknown> & { name?: string; status?: string; currency_code?: string; referrer_first_reward_minor?: number; referrer_second_reward_minor?: number; referee_first_discount_minor?: number; referee_second_discount_minor?: number; minimum_order_subtotal_minor?: number; first_order_deadline_days?: number; second_order_deadline_days?: number; reward_expiration_days?: number; terms_content?: string };

export const adminReferralsApi = {
  list: (token: string) => apiRequest<{ data: AdminReferral[]; summary: Record<string, number> }>("/admin/referrals?per_page=100", { token }),
  show: (token: string, id: string) => apiRequest<{ referral: AdminReferral }>("/admin/referrals/" + id, { token }),
  action: (token: string, id: string, body: Record<string, unknown>) => apiRequest<{ referral: AdminReferral }>("/admin/referrals/" + id + "/actions", { method: "POST", token, body }),
  settings: (token: string) => apiRequest<{ program: ReferralProgram | null }>("/admin/referral-settings", { token }),
  saveSettings: (token: string, body: Record<string, unknown>) => apiRequest<{ program: ReferralProgram }>("/admin/referral-settings", { method: "PUT", token, body }),
};
