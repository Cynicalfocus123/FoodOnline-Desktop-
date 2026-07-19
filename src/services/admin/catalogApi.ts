import { ApiError, apiRequest } from "../../lib/apiClient";
import { toUserFacingErrorMessage } from "../../lib/userFacingError";
import { apiBaseUrl } from "../../lib/runtimeConfig";
import { mediaUploadTransport } from "../../components/admin/managedMediaLogic";
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
  allCategories: async (token: string, query = "") => {
    const items: AdminCategory[] = [];
    let page = 1;
    let lastPage = 1;
    do {
      const response = await apiRequest<Paginated<AdminCategory>>(
        `/admin/categories?per_page=100&page=${page}${query}`,
        { token },
      );
      items.push(...response.data);
      lastPage = Math.max(1, response.meta?.last_page ?? 1);
      page++;
    } while (page <= lastPage);
    return items;
  },
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
  deleteCategory: (token: string, id: string) =>
    apiRequest(`/admin/categories/${id}`, {
      method: "DELETE",
      token,
    }),
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
  allBrands: async (token: string, query = "") => {
    const items: AdminBrand[] = [];
    let page = 1;
    let lastPage = 1;
    do {
      const response = await apiRequest<Paginated<AdminBrand>>(`/admin/brands?per_page=100&page=${page}${query}`, { token });
      items.push(...response.data);
      lastPage = Math.max(1, response.meta?.last_page ?? 1);
      page++;
    } while (page <= lastPage);
    return items;
  },
  brand: (token: string, uuid: string) =>
    apiRequest<{ data: AdminBrand }>(`/admin/brands/${uuid}`, { token }).then(data),
  saveBrand: (token: string, uuid: string | null, body: unknown) =>
    apiRequest<{ data: AdminBrand }>(
      uuid ? `/admin/brands/${uuid}` : "/admin/brands",
      { method: uuid ? "PATCH" : "POST", token, body },
    ).then(data),
  deleteBrand: (token: string, uuid: string) =>
    apiRequest(`/admin/brands/${uuid}`, { method: "DELETE", token }),
  products: (token: string, query = "") =>
    apiRequest<Paginated<AdminProduct>>(`/admin/products?per_page=50${query}`, {
      token,
    }),
  allProducts: async (token: string, query = "") => {
    const items: AdminProduct[] = [];
    let page = 1;
    let lastPage = 1;
    do {
      const response = await apiRequest<Paginated<AdminProduct>>(`/admin/products?per_page=100&page=${page}${query}`, { token });
      items.push(...response.data);
      lastPage = Math.max(1, response.meta?.last_page ?? 1);
      page++;
    } while (page <= lastPage);
    return items;
  },
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
  deleteManagedUpload: (token: string, uuid: string) =>
    apiRequest(`/admin/media-uploads/${uuid}`, { method: "DELETE", token }),
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
  const capability = await catalogApi.storageStatus(options.token);
  if (!capability.uploads_available) {
    throw new Error("Image uploads are temporarily unavailable. You can still save this record and add images later.");
  }

  if (mediaUploadTransport(capability) === "multipart") {
    const form = new FormData();
    form.append("purpose", options.purpose);
    form.append("target_uuid", options.targetUuid);
    if (options.productMediaId) form.append("product_media_id", options.productMediaId);
    Object.entries(options.metadata ?? {}).forEach(([key, value]) => {
      if (value !== null && value !== undefined) form.append(key, typeof value === "boolean" ? (value ? "1" : "0") : String(value));
    });
    form.append("file", options.file);

    return new Promise<{ data: unknown }>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${apiBaseUrl}/admin/media-uploads/local`);
      xhr.setRequestHeader("Accept", "application/json");
      xhr.setRequestHeader("Authorization", `Bearer ${options.token}`);
      xhr.upload.onprogress = (event) =>
        event.lengthComputable && options.onProgress(Math.round((event.loaded / event.total) * 100));
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText) as { data: unknown });
          } catch {
            reject(new Error("Upload failed. Check the file and try again."));
          }
        } else {
          reject(new ApiError("Upload failed. Check the file and try again.", xhr.status));
        }
      };
      xhr.onerror = () => reject(new Error("Upload failed. Check the file and try again."));
      xhr.send(form);
    });
  }

  const authorization = await apiRequest<{
    upload_id: string;
    strategy: "direct";
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
            new Error("Upload failed. Check the file and try again."),
          );
    xhr.onerror = () => reject(new Error("Upload failed. Check the file and try again."));
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
        message: toUserFacingErrorMessage(error, "The request could not be completed."),
        fields: error.fieldErrors,
      }
    : {
        message:
          toUserFacingErrorMessage(error, "The request could not be completed."),
        fields: {},
      };
}
