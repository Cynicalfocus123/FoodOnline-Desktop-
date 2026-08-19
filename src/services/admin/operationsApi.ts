import { apiRequest } from "../../lib/apiClient";
import { apiBaseUrl } from "../../lib/runtimeConfig";
type PagedRecords = { data: Array<Record<string, unknown>>; current_page?: number; last_page?: number } | Array<Record<string, unknown>>;
async function allRecords(path: string, token: string) {
  const items: Array<Record<string, unknown>> = []; let page = 1; let lastPage = 1;
  do { const response = await apiRequest<{ data: PagedRecords }>(`${path}${path.includes("?") ? "&" : "?"}per_page=100&page=${page}`, { token }); const records = Array.isArray(response.data) ? response.data : response.data.data; items.push(...records); lastPage = Array.isArray(response.data) ? 1 : Math.max(1, response.data.last_page ?? 1); page++; } while (page <= lastPage);
  return { data: items };
}
export const operationsApi = {
  returns: (token: string) => allRecords("/admin/returns", token),
  returnRequest: (token: string, uuid: string) => apiRequest<{ return: Record<string, unknown> }>(`/admin/returns/${uuid}`, { token }),
  returnAction: (token: string, uuid: string, body: Record<string, unknown>) => apiRequest(`/admin/returns/${uuid}/actions`, { method: "POST", token, body }),
  reviews: (token: string) => allRecords("/admin/reviews", token),
  review: (token: string, uuid: string) => apiRequest<{ review: Record<string, unknown> }>(`/admin/reviews/${uuid}`, { token }),
  reviewAction: (token: string, uuid: string, body: Record<string, unknown>) => apiRequest(`/admin/reviews/${uuid}/actions`, { method: "POST", token, body }),
  support: (token: string) => allRecords("/admin/support-tickets", token),
  supportTicket: (token: string, uuid: string) => apiRequest<{ ticket: Record<string, unknown> }>(`/admin/support-tickets/${uuid}`, { token }),
  supportMessage: (token: string, uuid: string, body: Record<string, unknown>) => apiRequest(`/admin/support-tickets/${uuid}/messages`, { method: "POST", token, body }),
  closeSupport: (token: string, uuid: string) => apiRequest(`/admin/support-tickets/${uuid}/close`, { method: "POST", token }),
  reports: (token: string) => apiRequest<Record<string, unknown>>("/admin/reports/summary", { token }),
  staff: (token: string) => apiRequest<{ data: Array<Record<string, unknown>> }>("/admin/staff", { token }),
  createStaff: (token: string, body: Record<string, unknown>) => apiRequest<{ staff: Record<string, unknown> }>("/admin/staff", { method: "POST", token, body }),
  updateStaff: (token: string, id: number, body: Record<string, unknown>) => apiRequest(`/admin/staff/${id}`, { method: "PATCH", token, body }),
  resetStaffPassword: (token: string, id: number, body: Record<string, unknown>) => apiRequest(`/admin/staff/${id}/password`, { method: "POST", token, body }),
  staffSessions: (token: string) => apiRequest<{ data: Array<Record<string, unknown>> }>("/admin/staff/sessions", { token }),
  revokeStaffSession: (token: string, id: number) => apiRequest(`/admin/staff/sessions/${id}`, { method: "DELETE", token }),
  operations: (token: string) => apiRequest<Record<string, unknown>>("/admin/operations", { token }),
  failedJobs: (token: string) => apiRequest<{ data: Array<{ uuid: string; queue: string; failed_at: string; exception: string }>; count: number }>("/admin/failed-jobs", { token }),
  retryFailedJob: (token: string, uuid: string) => apiRequest(`/admin/failed-jobs/${encodeURIComponent(uuid)}/retry`, { method: "POST", token }),
  downloadOrdersCsv: async (token: string) => {
    const response = await fetch(`${apiBaseUrl}/admin/reports/orders.csv`, { headers: { Accept: "text/csv", Authorization: `Bearer ${token}` } });
    if (!response.ok) throw new Error("Unable to export order report.");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(await response.blob());
    link.download = "orders.csv";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(link.href), 60_000);
  },
};
