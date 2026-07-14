import { ApiError, apiRequest } from "../../lib/apiClient";
import { apiBaseUrl } from "../../lib/runtimeConfig";
import type {
  AdminBrand,
  AdminCategory,
  AdminMedia,
  AdminNutrition,
  AdminProduct,
  AdminVariant,
  MediaPurpose,
  MediaStorageStatus,
  Paginated,
} from "../../types/adminCatalog";

const data = <T>(response: { data: T }) => response.data;
export const catalogApi = {
  categories: (token: string, query = "") =>
    apiRequest<Paginated<AdminCategory>>(
      `/admin/categories?per_page=100${query}`,
      { token },
    ),
  category: (token: string, id: string) =>
    apiRequest<{ data: AdminCategory }>(`/admin/categories/${id}`, {
      token,
    }).then(data),
  saveCategory: (token: string, id: string | null, body: unknown) =>
    apiRequest<{ data: AdminCategory }>(
      id ? `/admin/categories/${id}` : "/admin/categories",
      { method: id ? "PATCH" : "POST", token, body },
    ).then(data),
  archiveCategory: (token: string, id: string) =>
    apiRequest<{ data: AdminCategory }>(`/admin/categories/${id}/archive`, {
      method: "POST",
      token,
    }).then(data),
  restoreCategory: (token: string, id: string) =>
    apiRequest<{ data: AdminCategory }>(`/admin/categories/${id}/restore`, {
      method: "POST",
      token,
    }).then(data),
  addAlias: (token: string, id: string, body: unknown) =>
    apiRequest(`/admin/categories/${id}/aliases`, {
      method: "POST",
      token,
      body,
    }),
  deleteAlias: (token: string, id: string) =>
    apiRequest(`/admin/category-aliases/${id}`, { method: "DELETE", token }),
  brands: (token: string, query = "") =>
    apiRequest<Paginated<AdminBrand>>(`/admin/brands?per_page=100${query}`, {
      token,
    }),
  saveBrand: (token: string, uuid: string | null, body: unknown) =>
    apiRequest<{ data: AdminBrand }>(
      uuid ? `/admin/brands/${uuid}` : "/admin/brands",
      { method: uuid ? "PATCH" : "POST", token, body },
    ).then(data),
  products: (token: string, query = "") =>
    apiRequest<Paginated<AdminProduct>>(`/admin/products?per_page=50${query}`, {
      token,
    }),
  product: (token: string, uuid: string) =>
    apiRequest<{ data: AdminProduct }>(`/admin/products/${uuid}`, {
      token,
    }).then(data),
  saveProduct: (token: string, uuid: string | null, body: unknown) =>
    apiRequest<{ data: AdminProduct }>(
      uuid ? `/admin/products/${uuid}` : "/admin/products",
      { method: uuid ? "PATCH" : "POST", token, body },
    ).then(data),
  productAction: (
    token: string,
    uuid: string,
    action: "publish" | "restore" | "archive",
  ) =>
    action === "archive"
      ? apiRequest(`/admin/products/${uuid}`, { method: "DELETE", token })
      : apiRequest<{ data: AdminProduct }>(
          `/admin/products/${uuid}/${action}`,
          { method: "POST", token },
        ).then(data),
  saveVariant: (
    token: string,
    productUuid: string,
    variantUuid: string | null,
    body: unknown,
  ) =>
    apiRequest<{ data: AdminVariant }>(
      variantUuid
        ? `/admin/product-variants/${variantUuid}`
        : `/admin/products/${productUuid}/variants`,
      { method: variantUuid ? "PATCH" : "POST", token, body },
    ).then(data),
  deactivateVariant: (token: string, uuid: string) =>
    apiRequest(`/admin/product-variants/${uuid}`, { method: "DELETE", token }),
  makeDefault: (token: string, uuid: string) =>
    apiRequest<{ data: AdminVariant }>(
      `/admin/product-variants/${uuid}/make-default`,
      { method: "POST", token },
    ).then(data),
  updateMedia: (token: string, id: string, body: unknown) =>
    apiRequest<{ data: AdminMedia }>(`/admin/product-media/${id}`, {
      method: "PATCH",
      token,
      body,
    }).then(data),
  deleteMedia: (token: string, id: string) =>
    apiRequest(`/admin/product-media/${id}`, { method: "DELETE", token }),
  makePrimary: (token: string, id: string) =>
    apiRequest(`/admin/product-media/${id}/make-primary`, {
      method: "POST",
      token,
    }),
  reorderMedia: (token: string, productUuid: string, ids: string[]) =>
    apiRequest(`/admin/products/${productUuid}/media/reorder`, {
      method: "POST",
      token,
      body: { media_ids: ids.map(Number) },
    }),
  nutrition: (token: string, productUuid: string) =>
    apiRequest<{ data: AdminNutrition | null }>(
      `/admin/products/${productUuid}/nutrition-facts`,
      { token },
    ).then(data),
  saveNutrition: (token: string, productUuid: string, body: unknown) =>
    apiRequest<{ data: AdminNutrition }>(
      `/admin/products/${productUuid}/nutrition-facts`,
      { method: "PUT", token, body },
    ).then(data),
  deleteNutrition: (token: string, productUuid: string) =>
    apiRequest(`/admin/products/${productUuid}/nutrition-facts`, {
      method: "DELETE",
      token,
    }),
  storageStatus: (token: string) =>
    apiRequest<{ data: MediaStorageStatus }>("/admin/media-storage/status", {
      token,
    }).then(data),
};

export async function uploadManagedImage(options: {
  token: string;
  purpose: MediaPurpose;
  targetUuid: string;
  file: File;
  productMediaId?: string;
  metadata?: Record<string, unknown>;
  onProgress: (percent: number) => void;
}) {
  const authorization = await apiRequest<{
    upload_id: string;
    upload_url: string;
    method: "PUT";
    headers: Record<string, string>;
  }>("/admin/media-uploads", {
    method: "POST",
    token: options.token,
    body: {
      purpose: options.purpose,
      target_uuid: options.targetUuid,
      product_media_id: options.productMediaId
        ? Number(options.productMediaId)
        : null,
      original_filename: options.file.name,
      mime_type: options.file.type,
      size_bytes: options.file.size,
    },
  });
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", authorization.upload_url);
    Object.entries(authorization.headers).forEach(([key, value]) =>
      xhr.setRequestHeader(key, value),
    );
    xhr.upload.onprogress = (event) =>
      event.lengthComputable &&
      options.onProgress(Math.round((event.loaded / event.total) * 100));
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(
            new Error("The image could not be uploaded to media storage."),
          );
    xhr.onerror = () => reject(new Error("The image upload was interrupted."));
    xhr.send(options.file);
  });
  return apiRequest<{ data: unknown }>(
    `/admin/media-uploads/${authorization.upload_id}/complete`,
    { method: "POST", token: options.token, body: options.metadata ?? {} },
  );
}

export function adminError(error: unknown) {
  return error instanceof ApiError
    ? {
        message: error.message.replace(/^Request failed \(\d+\):\s*/, ""),
        fields: error.fieldErrors,
      }
    : {
        message:
          error instanceof Error
            ? error.message
            : "The request could not be completed.",
        fields: {},
      };
}
export const mediaPublicBaseUrl = apiBaseUrl;
