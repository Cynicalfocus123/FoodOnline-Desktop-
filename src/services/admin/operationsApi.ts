import { apiRequest } from "../../lib/apiClient";
import { apiBaseUrl } from "../../lib/runtimeConfig";
export const operationsApi = {
  returns: (token: string) => apiRequest<{ data: Array<Record<string, unknown>> }>("/admin/returns?per_page=100", { token }),
  returnAction: (token: string, uuid: string, body: Record<string, unknown>) => apiRequest(`/admin/returns/${uuid}/actions`, { method: "POST", token, body }),
  reviews: (token: string) => apiRequest<{ data: Array<Record<string, unknown>> }>("/admin/reviews?per_page=100", { token }),
  reviewAction: (token: string, uuid: string, body: Record<string, unknown>) => apiRequest(`/admin/reviews/${uuid}/actions`, { method: "POST", token, body }),
  support: (token: string) => apiRequest<{ data: Array<Record<string, unknown>> }>("/admin/support-tickets?per_page=100", { token }),
  supportMessage: (token: string, uuid: string, body: Record<string, unknown>) => apiRequest(`/admin/support-tickets/${uuid}/messages`, { method: "POST", token, body }),
  reports: (token: string) => apiRequest<Record<string, unknown>>("/admin/reports/summary", { token }),
  staff: (token: string) => apiRequest<{ data: Array<Record<string, unknown>> }>("/admin/staff", { token }),
  updateStaff: (token: string, id: number, body: Record<string, unknown>) => apiRequest(`/admin/staff/${id}`, { method: "PATCH", token, body }),
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
