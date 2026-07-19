import { useState } from "react";
import type { MediaStorageState } from "../../types/adminCatalog";
import { ActionButton, Notice } from "./CatalogCommon";
import { mediaCapabilityMessage } from "./managedMediaLogic";

export type ManagedMediaItem = {
  id: string;
  purpose: string;
  label: string;
  url?: string | null;
  isPrimary?: boolean;
};

export function ManagedMediaControl({
  entityType,
  entityId,
  items,
  storage,
  progress,
  error,
  multiple = false,
  allowReplace = true,
  onUpload,
  onRemove,
  onMove,
  onMakePrimary,
}: {
  entityType: string;
  entityId: string | null;
  items: ManagedMediaItem[];
  storage: MediaStorageState;
  progress?: number | null;
  error?: string;
  multiple?: boolean;
  allowReplace?: boolean;
  onUpload: (purpose: string, file: File, itemId?: string) => void;
  onRemove?: (item: ManagedMediaItem) => void;
  onMove?: (index: number, direction: -1 | 1) => void;
  onMakePrimary?: (item: ManagedMediaItem) => void;
}) {
  const capability = mediaCapabilityMessage(storage);

  return (
    <div className="grid gap-3" data-entity-type={entityType}>
      {!entityId ? <Notice>Selected images will upload automatically with this record when you save.</Notice> : null}
      {storage.phase !== "available" ? <Notice>{capability}</Notice> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item, index) => (
          <article className="grid gap-3 rounded-xl border border-neutral-200 p-3" key={`${item.purpose}-${item.id}`}>
            <div className="flex items-center justify-between gap-2">
              <strong className="text-sm">{item.label}</strong>
              {item.isPrimary ? <span className="text-xs font-black text-emerald-700">Primary image</span> : null}
            </div>
            <ManagedMediaPreview alt={`${item.label} preview`} className="h-32 w-full rounded-lg bg-neutral-50 object-contain" url={item.url} />
            <div className="flex flex-wrap gap-2">
              {!item.url || allowReplace ? (
                <label className="inline-flex min-h-11 cursor-pointer items-center rounded-xl border border-neutral-200 px-4 text-sm font-black">
                  {item.url ? "Replace" : "Upload"}
                  <input accept="image/jpeg,image/png,image/webp" className="sr-only" multiple={multiple} onChange={(event) => Array.from(event.target.files ?? []).forEach((file) => onUpload(item.purpose, file, item.id))} type="file" />
                </label>
              ) : null}
              {item.url && onRemove ? <ActionButton onClick={() => onRemove(item)} tone="danger">Remove</ActionButton> : null}
              {onMove ? <><ActionButton onClick={() => onMove(index, -1)} tone="secondary">Move up</ActionButton><ActionButton onClick={() => onMove(index, 1)} tone="secondary">Move down</ActionButton></> : null}
              {!item.isPrimary && onMakePrimary ? <ActionButton onClick={() => onMakePrimary(item)} tone="secondary">Make primary</ActionButton> : null}
            </div>
          </article>
        ))}
      </div>
      {progress !== null && progress !== undefined ? <Notice>Uploading… {progress}%</Notice> : null}
      {error ? <Notice tone="error">{error}</Notice> : null}
    </div>
  );
}

export function ManagedMediaPreview({ url, alt, className }: { url?: string | null; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (!url || failed) return <div className={`grid place-items-center bg-neutral-50 px-2 text-center text-xs font-semibold text-neutral-500 ${className ?? "h-24 rounded-lg"}`}>Image unavailable</div>;
  return <img alt={alt} className={className} onError={() => setFailed(true)} src={url} />;
}
