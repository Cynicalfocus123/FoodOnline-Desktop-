import { FormEvent, useMemo, useState } from "react";
import {
  AdminRequestStatus,
  adminRequestStatusMeta,
  adminRoleTabs,
  adminSecurityChecklist,
  adminSidebarItems,
  adminTableColumns,
  getAdminSummaryLabel,
  laravelMySqlBlueprint,
} from "../data/admin";
import { SignupRoleKey } from "../lib/registerSchema";
import { formatDateTime } from "../lib/security";
import { useAdminStore } from "../store/adminStore";

const requestActions: Array<{
  status: AdminRequestStatus;
  label: string;
}> = [
  { status: "in_review", label: "Move To Review" },
  { status: "approved", label: "Approve" },
  { status: "needs_follow_up", label: "Needs Follow Up" },
  { status: "archived", label: "Archive" },
];

export function AdminPortal() {
  const isAuthenticated = useAdminStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <AdminLoginScreen />;
  }

  return <AdminDashboard />;
}

function AdminLoginScreen() {
  const authError = useAdminStore((state) => state.authError);
  const securityMessage = useAdminStore((state) => state.securityMessage);
  const loginAdmin = useAdminStore((state) => state.loginAdmin);
  const [adminIdentity, setAdminIdentity] = useState("Mock Admin");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    await loginAdmin(adminIdentity, password);
    setIsSubmitting(false);
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(111,191,18,0.20),rgba(248,250,252,1)_42%,rgba(255,255,255,1)_100%)] px-4 py-8 text-ink sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-2xl items-center justify-center">
        <section className="w-full rounded-[32px] border border-neutral-200 bg-white p-8 shadow-soft sm:p-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-citrus-500">
                Admin Sign In
              </p>
              <h1 className="mt-3 text-3xl font-black text-ink">Open admin dashboard</h1>
            </div>
            <a
              className="inline-flex min-h-11 items-center rounded-full border border-neutral-200 px-4 text-sm font-bold text-neutral-700 transition hover:border-citrus-500 hover:text-citrus-500"
              href="./"
            >
              Back to Site
            </a>
          </div>

          <p className="mt-5 text-sm leading-7 text-neutral-600">{securityMessage}</p>

          <form className="mt-8 grid gap-5" noValidate onSubmit={handleSubmit}>
            <label className="grid gap-2">
              <span className="text-sm font-bold text-neutral-700">Admin</span>
              <input
                autoComplete="username"
                className="min-h-14 rounded-2xl border border-neutral-200 px-4 text-base font-semibold text-ink outline-none ring-2 ring-transparent transition focus:border-leaf-500 focus:ring-leaf-500/15"
                maxLength={120}
                onChange={(event) => setAdminIdentity(event.target.value)}
                type="text"
                value={adminIdentity}
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-bold text-neutral-700">Password</span>
              <input
                autoComplete="current-password"
                className="min-h-14 rounded-2xl border border-neutral-200 px-4 text-base font-semibold text-ink outline-none ring-2 ring-transparent transition focus:border-leaf-500 focus:ring-leaf-500/15"
                maxLength={128}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                value={password}
              />
            </label>

            {authError ? (
              <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                {authError}
              </p>
            ) : null}

            <button
              className="min-h-14 rounded-2xl bg-citrus-500 px-6 text-base font-black text-white transition hover:bg-citrus-600 disabled:cursor-not-allowed disabled:bg-neutral-300"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Opening..." : "Sign In"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

function AdminDashboard() {
  const adminEmail = useAdminStore((state) => state.adminEmail);
  const sessionAdminLabel = useAdminStore((state) => state.sessionAdminLabel);
  const lastLoginAt = useAdminStore((state) => state.lastLoginAt);
  const users = useAdminStore((state) => state.users);
  const auditLog = useAdminStore((state) => state.auditLog);
  const activeSidebarKey = useAdminStore((state) => state.activeSidebarKey);
  const activeUsersTab = useAdminStore((state) => state.activeUsersTab);
  const setActiveSidebarKey = useAdminStore((state) => state.setActiveSidebarKey);
  const setActiveUsersTab = useAdminStore((state) => state.setActiveUsersTab);
  const updateRequestStatus = useAdminStore((state) => state.updateRequestStatus);
  const logoutAdmin = useAdminStore((state) => state.logoutAdmin);

  const filteredUsers = useMemo(
    () => users.filter((user) => user.selectedRole === activeUsersTab),
    [activeUsersTab, users],
  );

  const stats = useMemo(() => {
    const totalPending = users.filter((user) => user.requestStatus === "pending").length;
    const totalApproved = users.filter((user) => user.requestStatus === "approved").length;
    const totalNeedsReview = users.filter((user) => user.requestStatus === "in_review").length;

    return {
      totalUsers: users.length,
      totalPending,
      totalApproved,
      totalNeedsReview,
    };
  }, [users]);

  return (
    <main className="min-h-screen bg-[#f5f7f4] text-ink">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
        <aside className="border-b border-neutral-200 bg-[#112017] px-5 py-6 text-white lg:min-h-screen lg:w-[290px] lg:border-b-0 lg:border-r lg:px-6">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-emerald-200">FoodOnline</p>
          <h1 className="mt-4 text-3xl font-black">Admin Console</h1>
          <p className="mt-3 text-sm leading-7 text-emerald-50/80">
            Standalone mock backend control room. Safe UI now, Laravel + MySQL later.
          </p>

          <div className="mt-8 grid gap-3">
            {adminSidebarItems.map((item) => {
              const isActive = activeSidebarKey === item.key;
              return (
                <button
                  className={`rounded-3xl border px-4 py-4 text-left transition ${
                    isActive
                      ? "border-citrus-400 bg-citrus-500 text-white shadow-lg shadow-orange-950/20"
                      : "border-white/10 bg-white/5 text-emerald-50 hover:border-emerald-300/40 hover:bg-white/10"
                  }`}
                  key={item.key}
                  onClick={() => setActiveSidebarKey(item.key)}
                  type="button"
                >
                  <p className="text-sm font-black">{item.label}</p>
                  <p className={`mt-1 text-sm leading-6 ${isActive ? "text-white/85" : "text-emerald-50/70"}`}>
                    {item.description}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-bold text-emerald-100">Signed in as</p>
            <p className="mt-2 break-all text-sm font-semibold text-white">
              {sessionAdminLabel || adminEmail}
            </p>
            <p className="mt-2 text-xs text-emerald-100/70">
              Last login: {lastLoginAt ? formatDateTime(lastLoginAt) : "First session"}
            </p>
          </div>

          <div className="mt-8 grid gap-3">
            <a
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 px-4 text-sm font-bold text-white transition hover:border-citrus-400 hover:text-citrus-200"
              href="./"
            >
              Back to Site
            </a>
            <button
              className="min-h-12 rounded-full bg-white px-4 text-sm font-black text-[#112017] transition hover:bg-emerald-100"
              onClick={logoutAdmin}
              type="button"
            >
              Log Out
            </button>
          </div>
        </aside>

        <section className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="All signup records" value={String(stats.totalUsers)} light />
            <MetricCard label="Pending approval" value={String(stats.totalPending)} light />
            <MetricCard label="Approved" value={String(stats.totalApproved)} light />
            <MetricCard label="In review" value={String(stats.totalNeedsReview)} light />
          </div>

          <div className="mt-6">
            {activeSidebarKey === "overview" ? <OverviewPanel auditLog={auditLog} /> : null}
            {activeSidebarKey === "users" ? (
              <UsersPanel
                activeUsersTab={activeUsersTab}
                filteredUsers={filteredUsers}
                onChangeStatus={updateRequestStatus}
                onChangeTab={setActiveUsersTab}
              />
            ) : null}
            {activeSidebarKey === "settings" ? <AdminSettingsPanel /> : null}
          </div>
        </section>
      </div>
    </main>
  );
}

function OverviewPanel({
  auditLog,
}: {
  auditLog: Array<{ id: string; action: string; detail: string; createdTimestamp: string }>;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-[32px] border border-neutral-200 bg-white p-6 shadow-soft sm:p-8">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-citrus-500">Laravel Handoff Blueprint</p>
        <h2 className="mt-3 text-3xl font-black text-ink">Backend map for real admin system</h2>

        <div className="mt-8 grid gap-4">
          {laravelMySqlBlueprint.tables.map((table) => (
            <div className="rounded-3xl border border-neutral-100 bg-neutral-50 p-5" key={table.name}>
              <p className="text-lg font-black text-ink">{table.name}</p>
              <p className="mt-3 text-sm leading-7 text-neutral-600">{table.columns.join(" | ")}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-neutral-100 bg-white p-5">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-neutral-700">Routes</p>
            <div className="mt-3 grid gap-2 text-sm leading-7 text-neutral-600">
              {laravelMySqlBlueprint.routes.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-neutral-100 bg-white p-5">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-neutral-700">Middleware + validation</p>
            <div className="mt-3 grid gap-2 text-sm leading-7 text-neutral-600">
              {[...laravelMySqlBlueprint.middleware, ...laravelMySqlBlueprint.validation].map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6">
        <div className="rounded-[32px] border border-neutral-200 bg-white p-6 shadow-soft sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-neutral-700">Security checks</p>
          <div className="mt-5 grid gap-3 text-sm leading-7 text-neutral-600">
            {adminSecurityChecklist.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] border border-neutral-200 bg-white p-6 shadow-soft sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-neutral-700">Audit preview</p>
          <div className="mt-5 grid gap-4">
            {auditLog.map((entry) => (
              <div className="rounded-3xl border border-neutral-100 bg-neutral-50 p-4" key={entry.id}>
                <p className="text-sm font-black text-ink">{entry.action}</p>
                <p className="mt-2 text-sm leading-6 text-neutral-600">{entry.detail}</p>
                <p className="mt-2 text-xs font-semibold text-neutral-500">{formatDateTime(entry.createdTimestamp)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function UsersPanel({
  activeUsersTab,
  filteredUsers,
  onChangeStatus,
  onChangeTab,
}: {
  activeUsersTab: SignupRoleKey;
  filteredUsers: ReturnType<typeof useAdminStore.getState>["users"];
  onChangeStatus: (userId: string, status: AdminRequestStatus) => void;
  onChangeTab: (tab: SignupRoleKey) => void;
}) {
  return (
    <section className="rounded-[32px] border border-neutral-200 bg-white p-6 shadow-soft sm:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-citrus-500">Users</p>
          <h2 className="mt-3 text-3xl font-black text-ink">Signup queue and user intake tables</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-neutral-600">
            All public registration fields render as safe plain text in admin tables. No raw HTML, no direct script
            execution, no unsafe interpolation.
          </p>
        </div>
        <div className="rounded-3xl border border-neutral-100 bg-neutral-50 px-5 py-4 text-sm font-semibold text-neutral-700">
          Active role view: {getAdminSummaryLabel(activeUsersTab)}
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        {adminRoleTabs.map((tab) => {
          const isActive = tab.key === activeUsersTab;
          return (
            <button
              className={`rounded-full border px-5 py-3 text-sm font-black transition ${
                isActive
                  ? "border-citrus-500 bg-citrus-500 text-white"
                  : "border-neutral-200 bg-white text-neutral-700 hover:border-leaf-500 hover:text-leaf-700"
              }`}
              key={tab.key}
              onClick={() => onChangeTab(tab.key)}
              type="button"
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="mt-8 overflow-hidden rounded-[28px] border border-neutral-100">
        <div className="overflow-x-auto bg-white">
          <table className="min-w-[1180px] w-full border-collapse text-left">
            <thead className="bg-neutral-50">
              <tr>
                {adminTableColumns.map((column) => (
                  <th className="px-4 py-4 text-xs font-black uppercase tracking-[0.16em] text-neutral-500" key={column}>
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const statusMeta = adminRequestStatusMeta[user.requestStatus];
                return (
                  <tr className="border-t border-neutral-100 align-top" key={user.id}>
                    <td className="px-4 py-4 text-sm font-semibold text-ink">{user.emailAddress}</td>
                    <td className="px-4 py-4 text-sm text-neutral-700">{user.firstName}</td>
                    <td className="px-4 py-4 text-sm text-neutral-700">{user.lastName}</td>
                    <td className="px-4 py-4 text-sm text-neutral-700">{user.contactNumber}</td>
                    <td className="px-4 py-4 text-sm text-neutral-700">{user.lineId || "Not provided"}</td>
                    <td className="px-4 py-4 text-sm text-neutral-700">
                      <p className="font-semibold text-ink">{user.companyName}</p>
                      <p className="mt-1 text-xs leading-5 text-neutral-500">{user.notes}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${statusMeta.classes}`}>
                        {statusMeta.label}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-neutral-700">{user.sourceLabel}</td>
                    <td className="px-4 py-4 text-sm text-neutral-700">{formatDateTime(user.createdTimestamp)}</td>
                    <td className="px-4 py-4 text-sm text-neutral-700">
                      {user.reviewedAt ? formatDateTime(user.reviewedAt) : "Not reviewed"}
                    </td>
                    <td className="px-4 py-4">
                      <div className="grid gap-2">
                        {requestActions.map((action) => (
                          <button
                            className="min-h-10 rounded-full border border-neutral-200 px-3 text-xs font-black text-neutral-700 transition hover:border-citrus-500 hover:text-citrus-500"
                            key={`${user.id}-${action.status}`}
                            onClick={() => onChangeStatus(user.id, action.status)}
                            type="button"
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function AdminSettingsPanel() {
  const adminEmail = useAdminStore((state) => state.adminEmail);
  const securityMessage = useAdminStore((state) => state.securityMessage);
  const settingsMessage = useAdminStore((state) => state.settingsMessage);
  const updateAdminCredentials = useAdminStore((state) => state.updateAdminCredentials);
  const [currentPassword, setCurrentPassword] = useState("");
  const [nextEmail, setNextEmail] = useState(adminEmail);
  const [nextPassword, setNextPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    const success = await updateAdminCredentials(currentPassword, nextEmail, nextPassword, confirmPassword);
    setIsSaving(false);

    if (success) {
      setCurrentPassword("");
      setNextPassword("");
      setConfirmPassword("");
    }
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
      <div className="rounded-[32px] border border-neutral-200 bg-white p-6 shadow-soft sm:p-8">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-citrus-500">Admin Settings</p>
        <h2 className="mt-3 text-3xl font-black text-ink">Rotate admin email and password</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-neutral-600">
          Phase 1 stores only salted local hash placeholder data. Future Laravel phase must move credential checks,
          session cookies, CSRF, throttle middleware, and audit persistence to server.
        </p>

        <form className="mt-8 grid gap-5" noValidate onSubmit={handleSubmit}>
          <label className="grid gap-2">
            <span className="text-sm font-bold text-neutral-700">Current password</span>
            <input
              className="min-h-14 rounded-2xl border border-neutral-200 px-4 text-base font-semibold text-ink outline-none ring-2 ring-transparent transition focus:border-leaf-500 focus:ring-leaf-500/15"
              maxLength={128}
              onChange={(event) => setCurrentPassword(event.target.value)}
              type="password"
              value={currentPassword}
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-bold text-neutral-700">New admin email</span>
            <input
              className="min-h-14 rounded-2xl border border-neutral-200 px-4 text-base font-semibold text-ink outline-none ring-2 ring-transparent transition focus:border-leaf-500 focus:ring-leaf-500/15"
              inputMode="email"
              maxLength={254}
              onChange={(event) => setNextEmail(event.target.value)}
              type="email"
              value={nextEmail}
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-bold text-neutral-700">New password</span>
            <input
              className="min-h-14 rounded-2xl border border-neutral-200 px-4 text-base font-semibold text-ink outline-none ring-2 ring-transparent transition focus:border-leaf-500 focus:ring-leaf-500/15"
              maxLength={128}
              onChange={(event) => setNextPassword(event.target.value)}
              type="password"
              value={nextPassword}
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-bold text-neutral-700">Confirm new password</span>
            <input
              className="min-h-14 rounded-2xl border border-neutral-200 px-4 text-base font-semibold text-ink outline-none ring-2 ring-transparent transition focus:border-leaf-500 focus:ring-leaf-500/15"
              maxLength={128}
              onChange={(event) => setConfirmPassword(event.target.value)}
              type="password"
              value={confirmPassword}
            />
          </label>

          {settingsMessage ? (
            <p className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-semibold text-neutral-700">
              {settingsMessage}
            </p>
          ) : null}

          <button
            className="min-h-14 rounded-2xl bg-citrus-500 px-6 text-base font-black text-white transition hover:bg-citrus-600 disabled:cursor-not-allowed disabled:bg-neutral-300"
            disabled={isSaving}
            type="submit"
          >
            {isSaving ? "Updating..." : "Update Credentials"}
          </button>
        </form>
      </div>

      <div className="grid gap-6">
        <div className="rounded-[32px] border border-neutral-200 bg-white p-6 shadow-soft sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-neutral-700">Current status</p>
          <p className="mt-4 break-all text-lg font-black text-ink">{adminEmail}</p>
          <p className="mt-3 text-sm leading-7 text-neutral-600">{securityMessage}</p>
        </div>

        <div className="rounded-[32px] border border-neutral-200 bg-white p-6 shadow-soft sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-neutral-700">Server TODO</p>
          <div className="mt-4 grid gap-3 text-sm leading-7 text-neutral-600">
            <p>`admins` migration with unique email index and hashed password column.</p>
            <p>Controller validation via `FormRequest` classes for login and credential rotation.</p>
            <p>`Hash::make` and `Hash::check` only on server, never client.</p>
            <p>Protected admin middleware group with secure session cookies and CSRF.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function MetricCard({
  label,
  value,
  light = false,
}: {
  label: string;
  value: string;
  light?: boolean;
}) {
  return (
    <div
      className={`rounded-[28px] border p-5 ${
        light ? "border-neutral-200 bg-white shadow-soft" : "border-white/15 bg-white/10 backdrop-blur"
      }`}
    >
      <p className={`text-sm font-bold ${light ? "text-neutral-500" : "text-emerald-100/80"}`}>{label}</p>
      <p className={`mt-3 text-2xl font-black ${light ? "text-ink" : "text-white"}`}>{value}</p>
    </div>
  );
}
