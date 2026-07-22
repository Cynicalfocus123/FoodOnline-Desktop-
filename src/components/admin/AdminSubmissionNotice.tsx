import { useEffect } from "react";

export type AdminSubmissionNotice = {
  message: string;
  tone: "success" | "warning";
};

let pendingNotice: AdminSubmissionNotice | null = null;

export function queueAdminSubmissionNotice(notice: AdminSubmissionNotice) {
  pendingNotice = notice;
}

export function takeAdminSubmissionNotice() {
  const notice = pendingNotice;
  pendingNotice = null;
  return notice;
}

export function AdminSubmissionNotice({
  notice,
  onDismiss,
}: {
  notice: AdminSubmissionNotice | null;
  onDismiss: () => void;
}) {
  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(onDismiss, 6500);
    return () => window.clearTimeout(timeout);
  }, [notice, onDismiss]);

  if (!notice) return null;

  const isSuccess = notice.tone === "success";
  return (
    <div
      aria-live="polite"
      className={`rounded-2xl border p-4 text-sm font-bold ${
        isSuccess
          ? "border-emerald-200 bg-emerald-50 text-emerald-900"
          : "border-amber-200 bg-amber-50 text-amber-950"
      }`}
      role="status"
    >
      {notice.message}
    </div>
  );
}
