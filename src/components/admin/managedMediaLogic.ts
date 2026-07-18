import type { MediaStorageState, MediaStorageStatus } from "../../types/adminCatalog.ts";

export function mediaCapabilityMessage(state: MediaStorageState): string {
  if (state.phase === "checking") return "Checking image-upload availability… You can still save this record.";
  if (state.phase === "unavailable") return "Image uploads are temporarily unavailable. You can still save this record and add images later.";
  return "Image uploads are available.";
}

export function mediaUploadTransport(capability: MediaStorageStatus): "multipart" | "direct" {
  return capability.strategy === "direct" ? "direct" : "multipart";
}

export function parentSaveAllowed(_state: MediaStorageState): true {
  return true;
}
