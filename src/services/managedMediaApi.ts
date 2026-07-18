import { ApiError, apiRequest } from "../lib/apiClient";
import { apiBaseUrl } from "../lib/runtimeConfig";
import type { MediaStorageStatus } from "../types/adminCatalog";

export type AccountMediaPurpose = "review_image" | "return_evidence" | "support_attachment";

export const managedMediaApi = {
  capability: (token: string) => apiRequest<{ data: MediaStorageStatus }>("/account/media-storage/status", { token }).then((response) => response.data),
  remove: (token: string, uploadId: string) => apiRequest(`/account/media-uploads/${uploadId}`, { method: "DELETE", token }),
};

export async function uploadAccountImage({ token, purpose, targetUuid, file, altText, onProgress }: {
  token: string;
  purpose: AccountMediaPurpose;
  targetUuid: string;
  file: File;
  altText?: string;
  onProgress: (percent: number) => void;
}) {
  const capability = await managedMediaApi.capability(token);
  if (!capability.uploads_available) throw new Error("Image uploads are temporarily unavailable.");

  if (capability.strategy === "multipart") {
    const form = new FormData();
    form.append("purpose", purpose);
    form.append("target_uuid", targetUuid);
    if (altText) form.append("alt_text", altText);
    form.append("file", file);
    return xhrUpload(`${apiBaseUrl}/account/media-uploads/local`, token, form, onProgress);
  }

  const authorization = await apiRequest<{ upload_id: string; upload_url: string; headers: Record<string, string> }>("/account/media-uploads", {
    method: "POST", token, body: { purpose, target_uuid: targetUuid, original_filename: file.name, mime_type: file.type, size_bytes: file.size },
  });
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", authorization.upload_url);
    Object.entries(authorization.headers).forEach(([key, value]) => xhr.setRequestHeader(key, value));
    xhr.upload.onprogress = (event) => event.lengthComputable && onProgress(Math.round((event.loaded / event.total) * 100));
    xhr.onload = () => xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error("Upload failed. Check the file and try again."));
    xhr.onerror = () => reject(new Error("Upload failed. Check the file and try again."));
    xhr.send(file);
  });
  return apiRequest(`/account/media-uploads/${authorization.upload_id}/complete`, { method: "POST", token, body: { alt_text: altText ?? null } });
}

function xhrUpload(url: string, token: string, form: FormData, onProgress: (percent: number) => void) {
  return new Promise<unknown>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.upload.onprogress = (event) => event.lengthComputable && onProgress(Math.round((event.loaded / event.total) * 100));
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try { resolve(JSON.parse(xhr.responseText)); } catch { reject(new Error("Upload failed. Check the file and try again.")); }
      } else reject(new ApiError("Upload failed. Check the file and try again.", xhr.status));
    };
    xhr.onerror = () => reject(new Error("Upload failed. Check the file and try again."));
    xhr.send(form);
  });
}
