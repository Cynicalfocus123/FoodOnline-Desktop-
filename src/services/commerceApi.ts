import { apiRequest, type ApiOptions } from "../lib/apiClient";

const GUEST_CART_KEY = "foodonline-guest-cart-token-v1";

export type CartLine = {
  id: string;
  product_uuid: string;
  product_slug: string;
  product_name: string;
  product_image_url: string | null;
  variant_uuid: string;
  variant_title: string;
  sku: string;
  package_size: string | null;
  quantity: number;
  unit_price_minor: number;
  unit_price: string;
  line_subtotal_minor: number;
  line_subtotal: string;
  available: boolean;
  available_quantity: number | null;
  unavailable_reason: string | null;
};

export type CommerceCart = {
  uuid: string;
  status: string;
  currency_code: string;
  lines: CartLine[];
  item_count: number;
  display_subtotal_minor: number;
  display_subtotal: string;
  updated_at: string;
};

type CartResponse = { cart: CommerceCart; guest_token: string | null };

function guestToken() {
  return typeof window === "undefined" ? null : window.localStorage.getItem(GUEST_CART_KEY);
}

function rememberGuestToken(token: string | null) {
  if (typeof window === "undefined" || !token) return;
  window.localStorage.setItem(GUEST_CART_KEY, token);
}

async function cartRequest(path: string, token: string | null, options: ApiOptions = {}) {
  const response = await apiRequest<CartResponse>(path, {
    ...options,
    token,
    headers: { ...(guestToken() ? { "X-Guest-Cart-Token": guestToken()! } : {}), ...options.headers },
  });
  rememberGuestToken(response.guest_token);
  return response.cart;
}

export const commerceApi = {
  getCart: (token: string | null) => cartRequest("/cart", token),
  addItem: (variantUuid: string, quantity: number, token: string | null) =>
    cartRequest("/cart/items", token, { method: "POST", body: { variant_uuid: variantUuid, quantity } }),
  updateItem: (itemUuid: string, quantity: number, token: string | null) =>
    cartRequest(`/cart/items/${itemUuid}`, token, { method: "PATCH", body: { quantity } }),
  removeItem: (itemUuid: string, token: string | null) => cartRequest(`/cart/items/${itemUuid}`, token, { method: "DELETE" }),
  mergeGuestCart: async (token: string) => {
    const rawGuestToken = guestToken();
    const response = await apiRequest<CartResponse>("/cart/merge", {
      method: "POST",
      token,
      body: { guest_token: rawGuestToken },
      headers: rawGuestToken ? { "X-Guest-Cart-Token": rawGuestToken } : {},
    });
    if (typeof window !== "undefined") window.localStorage.removeItem(GUEST_CART_KEY);
    return response.cart;
  },
  guestToken,
};

export type PaymentMethodAvailability = {
  code: "cod" | "card" | "bank_transfer" | "promptpay" | "paypal" | "google_pay" | "alipay" | "cash_app";
  label: string;
  enabled: boolean;
  unavailable_reason: string | null;
  requires_provider: boolean;
  supports_guest_checkout: boolean;
};

export type MoneyAmount = { minor: number; amount: string; currency_code: string };
export type CheckoutQuote = {
  uuid: string;
  expires_at: string;
  items: Array<Record<string, unknown>>;
  retail_subtotal: MoneyAmount;
  product_discount: MoneyAmount;
  subtotal: MoneyAmount;
  promo_code: string | null;
  promo_discount: MoneyAmount;
  shipping: MoneyAmount & { code: string; label: string };
  cod_fee: MoneyAmount;
  tax: MoneyAmount;
  total: MoneyAmount;
  payment_method_code: string;
  can_place_order: boolean;
  warnings: string[];
};

export type CommerceOrder = {
  uuid: string;
  order_number: string;
  order_status: string;
  payment_status: string;
  fulfillment_status: string;
  payment_method_code: string;
  promotion_code: string | null;
  promotion: Record<string, unknown> | null;
  total: MoneyAmount;
  placed_at: string;
  items: Array<{ uuid: string; product_name: string; product_image_url: string | null; variant_title: string; sku: string; quantity: number; unit_price: string; line_total: string }>;
  addresses: Array<{ type: string; full_name: string; phone_number: string; country_key: string; summary: string; delivery_note: string | null }>;
  history: Array<{ uuid: string; event_type: string; message: string | null; created_at: string }>;
};

function commerceHeaders(): Record<string, string> {
  const value = guestToken();
  const headers: Record<string, string> = {};
  if (value) headers["X-Guest-Cart-Token"] = value;
  return headers;
}

export const checkoutApi = {
  paymentMethods: (token: string | null) => apiRequest<{ payment_methods: PaymentMethodAvailability[] }>("/checkout/payment-methods", { token }),
  quote: (body: Record<string, unknown>, token: string | null) => apiRequest<{ quote: CheckoutQuote }>("/checkout/quote", { method: "POST", token, body, headers: commerceHeaders() }),
  placeOrder: (quoteUuid: string, idempotencyKey: string, token: string | null, customerNote?: string) =>
    apiRequest<{ order: CommerceOrder; guest_access_token: string | null; idempotent_replay: boolean }>("/orders", {
      method: "POST", token, headers: { ...commerceHeaders(), "Idempotency-Key": idempotencyKey },
      body: { quote_uuid: quoteUuid, customer_note: customerNote || null },
    }),
  accountOrders: (token: string) => apiRequest<{ data: CommerceOrder[] }>("/account/orders?per_page=50", { token }),
  accountOrder: (uuid: string, token: string) => apiRequest<{ order: CommerceOrder }>(`/account/orders/${uuid}`, { token }),
  cancelOrder: (uuid: string, token: string) => apiRequest<{ order: CommerceOrder }>(`/account/orders/${uuid}/cancel`, { method: "POST", token }),
};
