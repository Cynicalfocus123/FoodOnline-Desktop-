import { apiRequest } from "../../lib/apiClient";
import type { CommerceOrder } from "../commerceApi";

export type AdminOrder = CommerceOrder & { customer: { name: string; email: string; phone: string }; customer_note?: string | null; internal_note?: string | null; payment?: { uuid: string; method_code: string; provider: string | null; status: string; amount: string; paid_at: string | null; refunded: string; metadata: Record<string, unknown> | null } | null };
export type InventoryRow = { variant_uuid: string; product_uuid: string; product_name: string; product_slug: string; product_image_url: string | null; category: string; variant_title: string; sku: string; gtin: string | null; quantity_on_hand: number; quantity_reserved: number; available_quantity: number | null; low_stock_threshold: number; tracking_enabled: boolean; allow_backorder: boolean; availability_status: string; updated_at: string };
export type Promotion = { uuid: string; code: string; description: string | null; discount_type: "percentage" | "fixed"; discount_value: number; minimum_subtotal_minor: number | null; maximum_discount_minor: number | null; currency_code: string | null; starts_at: string | null; ends_at: string | null; total_usage_limit: number | null; per_user_usage_limit: number | null; usage_count: number; active: boolean; applies_to: string; status: string; updated_at: string };
export type CommerceSettings = { store_currency: string; shipping_enabled: boolean; standard_shipping_minor: number; free_shipping_threshold_minor: number; supported_countries: string[]; cod_enabled: boolean; cod_fee_minor: number; cod_minimum_minor: number; cod_maximum_minor: number | null; cod_supported_countries: string[]; guest_checkout_enabled: boolean; reservation_minutes: number; quote_minutes: number; order_cancellation_minutes: number; tax_mode: "disabled" | "flat_rate"; flat_tax_basis_points: number; order_support_email: string; order_notification_email: string };

export const adminCommerceApi = {
  orders: (token: string, search = "") => apiRequest<{ data: AdminOrder[] }>(`/admin/orders?per_page=100&search=${encodeURIComponent(search)}`, { token }),
  allOrders: async (token: string, search = "") => {
    const orders: AdminOrder[] = []; let page = 1; let lastPage = 1;
    do { const response = await apiRequest<{ data: AdminOrder[]; meta: { last_page: number } }>(`/admin/orders?per_page=100&page=${page}&search=${encodeURIComponent(search)}`, { token }); orders.push(...response.data); lastPage = Math.max(1, response.meta?.last_page ?? 1); page++; } while (page <= lastPage);
    return { data: orders };
  },
  order: (token: string, uuid: string) => apiRequest<{ order: AdminOrder }>(`/admin/orders/${uuid}`, { token }),
  orderAction: (token: string, uuid: string, body: Record<string, unknown>) => apiRequest<{ order: AdminOrder }>(`/admin/orders/${uuid}/actions`, { method: "POST", token, body }),
  inventory: (token: string, search = "") => apiRequest<{ data: InventoryRow[] }>(`/admin/inventory?per_page=100&search=${encodeURIComponent(search)}`, { token }),
  adjustInventory: (token: string, uuid: string, body: Record<string, unknown>) => apiRequest<{ inventory: InventoryRow }>(`/admin/inventory/${uuid}/adjust`, { method: "POST", token, body }),
  movements: (token: string, uuid: string) => apiRequest<{ data: Array<Record<string, unknown>> }>(`/admin/inventory/${uuid}/movements`, { token }),
  promotions: (token: string) => apiRequest<{ data: Promotion[] }>("/admin/promo-codes?per_page=100", { token }),
  allPromotions: async (token: string) => {
    const promotions: Promotion[] = []; let page = 1; let lastPage = 1;
    do { const response = await apiRequest<{ data: Promotion[]; meta: { last_page: number } }>(`/admin/promo-codes?per_page=100&page=${page}`, { token }); promotions.push(...response.data); lastPage = Math.max(1, response.meta?.last_page ?? 1); page++; } while (page <= lastPage);
    return { data: promotions };
  },
  promotion: (token: string, uuid: string) => apiRequest<{ promotion: Promotion }>(`/admin/promo-codes/${uuid}`, { token }),
  savePromotion: (token: string, uuid: string | null, body: Record<string, unknown>) => apiRequest<{ promotion: Promotion }>(uuid ? `/admin/promo-codes/${uuid}` : "/admin/promo-codes", { method: uuid ? "PATCH" : "POST", token, body }),
  archivePromotion: (token: string, uuid: string) => apiRequest<{ promotion: Promotion }>(`/admin/promo-codes/${uuid}/archive`, { method: "POST", token }),
  settings: (token: string) => apiRequest<{ settings: CommerceSettings }>("/admin/commerce-settings", { token }),
  saveSettings: (token: string, body: Partial<CommerceSettings>) => apiRequest<{ settings: CommerceSettings }>("/admin/commerce-settings", { method: "PUT", token, body }),
  audits: (token: string) => apiRequest<{ data: Array<{ uuid: string; action: string; subject_type: string; subject_id: number | null; created_at: string }> }>("/admin/audit-logs?per_page=100", { token }),
};
