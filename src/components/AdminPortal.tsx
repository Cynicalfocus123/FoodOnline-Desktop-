import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  adminRequestStatusMeta,
  adminRoleTabs,
  adminSecurityChecklist,
  adminSidebarItems,
  adminTableColumns,
  getAdminSummaryLabel,
} from "../data/admin";
import { SignupRoleKey } from "../lib/registerSchema";
import { formatDateTime } from "../lib/security";
import { useAdminStore } from "../store/adminStore";
import { catalogApi } from "../services/admin/catalogApi";
import type { MediaStorageState } from "../types/adminCatalog";
import { BrandAdminPanel } from "./admin/BrandAdminPanel";
import { CategoryAdminPanel } from "./admin/CategoryAdminPanel";
import { ProductAdminPanel } from "./admin/ProductAdminPanel";
import { AuditAdminPanel, CommerceSettingsPanel, InventoryAdminPanel, OrdersAdminPanel, PromotionsAdminPanel } from "./admin/CommerceAdminPanels";
import { ReturnsAdminPanel, ReviewsAdminPanel, ReportsAdminPanel, StaffAdminPanel, OperationsAdminPanel, SupportAdminPanel } from "./admin/OperationalAdminPanels";

export function AdminPortal() {
  const isAuthenticated = useAdminStore((state) => state.isAuthenticated);
  const token = useAdminStore((state) => state.token);
  const fetchCurrentAdmin = useAdminStore((state) => state.fetchCurrentAdmin);
  const fetchStats = useAdminStore((state) => state.fetchStats);
  const fetchUsers = useAdminStore((state) => state.fetchUsers);

  useEffect(() => {
    if (!isAuthenticated && token) {
      void fetchCurrentAdmin().then((success) => {
        if (success) {
          void fetchStats();
          void fetchUsers();
        }
      });
    }
  }, [fetchCurrentAdmin, fetchStats, fetchUsers, isAuthenticated, token]);

  if (!isAuthenticated) {
    return <AdminLoginScreen />;
  }

  return <AdminDashboard />;
}

function AdminLoginScreen() {
  const authError = useAdminStore((state) => state.authError);
  const securityMessage = useAdminStore((state) => state.securityMessage);
  const loginAdmin = useAdminStore((state) => state.loginAdmin);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    await loginAdmin(email, password);
    setIsSubmitting(false);
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(111,191,18,0.20),rgba(248,250,252,1)_42%,rgba(255,255,255,1)_100%)] px-4 py-8 text-ink sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-2xl items-center justify-center">
        <section className="w-full rounded-[32px] border border-neutral-200 bg-white p-8 shadow-soft sm:p-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-citrus-500">Admin Sign In</p>
              <h1 className="mt-3 text-3xl font-black text-ink">Open admin dashboard</h1>
            </div>
            <a
              className="inline-flex min-h-11 items-center rounded-full border border-neutral-200 px-4 text-sm font-bold text-neutral-700 transition hover:border-citrus-500 hover:text-citrus-500"
              href="/admin"
            >
              Admin Home
            </a>
          </div>

          <p className="mt-5 text-sm leading-7 text-neutral-600">{securityMessage}</p>
          <form className="mt-8 grid gap-5" noValidate onSubmit={handleSubmit}>
            <label className="grid gap-2">
              <span className="text-sm font-bold text-neutral-700">Email</span>
              <input
                autoComplete="username"
                className="min-h-14 rounded-2xl border border-neutral-200 px-4 text-base font-semibold text-ink outline-none ring-2 ring-transparent transition focus:border-leaf-500 focus:ring-leaf-500/15"
                inputMode="email"
                maxLength={254}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                value={email}
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
  const adminName = useAdminStore((state) => state.adminName);
  const lastLoginAt = useAdminStore((state) => state.lastLoginAt);
  const users = useAdminStore((state) => state.users);
  const auditLog = useAdminStore((state) => state.auditLog);
  const activeSidebarKey = useAdminStore((state) => state.activeSidebarKey);
  const activeUsersTab = useAdminStore((state) => state.activeUsersTab);
  const isLoadingUsers = useAdminStore((state) => state.isLoadingUsers);
  const stats = useAdminStore((state) => state.stats);
  const setActiveSidebarKey = useAdminStore((state) => state.setActiveSidebarKey);
  const setActiveUsersTab = useAdminStore((state) => state.setActiveUsersTab);
  const logoutAdmin = useAdminStore((state) => state.logoutAdmin);
  const deleteAccountRequests = useAdminStore((state) => state.deleteAccountRequests);
  const isLoadingDeleteAccountRequests = useAdminStore((state) => state.isLoadingDeleteAccountRequests);
  const fetchDeleteAccountRequests = useAdminStore((state) => state.fetchDeleteAccountRequests);
  const updateDeleteAccountRequestStatus = useAdminStore((state) => state.updateDeleteAccountRequestStatus);
  const token = useAdminStore((state) => state.token);
  const [mediaStorage, setMediaStorage] = useState<MediaStorageState>({ phase: "checking", status: null });

  useEffect(() => {
    if (activeSidebarKey === "deleteAccount") {
      void fetchDeleteAccountRequests();
    }
  }, [activeSidebarKey, fetchDeleteAccountRequests]);

  useEffect(() => {
    if (token) {
      setMediaStorage({ phase: "checking", status: null });
      void catalogApi.storageStatus(token)
        .then((status) => setMediaStorage({ phase: status.uploads_enabled ? "available" : "unavailable", status }))
        .catch(() => setMediaStorage({ phase: "unavailable", status: null }));
    }
  }, [token]);

  const filteredUsers = useMemo(
    () => users.filter((user) => user.selectedRole === activeUsersTab),
    [activeUsersTab, users],
  );

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f5f7f4] text-ink">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
        <aside className="border-b border-neutral-200 bg-[#112017] px-5 py-6 text-white lg:min-h-screen lg:w-[290px] lg:border-b-0 lg:border-r lg:px-6">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-emerald-200">FoodOnline</p>
          <h1 className="mt-4 text-3xl font-black">Admin Console</h1>
          <p className="mt-3 text-sm leading-7 text-emerald-50/80">
            Manage customers, suppliers, partners, products, and orders.
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
            <p className="mt-2 break-all text-sm font-semibold text-white">{adminName || adminEmail}</p>
            <p className="mt-2 text-xs text-emerald-100/70">
              Last login: {lastLoginAt ? formatDateTime(lastLoginAt) : "Current session"}
            </p>
          </div>

          <div className="mt-8 grid gap-3">
            <a
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 px-4 text-sm font-bold text-white transition hover:border-citrus-400 hover:text-citrus-200"
              href="/admin"
            >
              Admin Home
            </a>
            <button
              className="min-h-12 rounded-full bg-white px-4 text-sm font-black text-[#112017] transition hover:bg-emerald-100"
              onClick={() => void logoutAdmin()}
              type="button"
            >
              Log Out
            </button>
          </div>
        </aside>

        <section className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="All signup records" value={String(stats.total_users)} light />
            <MetricCard label="Customers" value={String(stats.customers)} light />
            <MetricCard label="Suppliers" value={String(stats.suppliers)} light />
            <MetricCard label="Partners" value={String(stats.partners)} light />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Categories" value={String(stats.total_categories)} light />
            <MetricCard label="Brands" value={String(stats.total_brands)} light />
            <MetricCard label="Products" value={String(stats.total_products)} light />
            <MetricCard label="Published products" value={String(stats.published_products)} light />
            <MetricCard label="Draft products" value={String(stats.draft_products)} light />
            <MetricCard label="Archived products" value={String(stats.archived_products)} light />
            <MetricCard label="Out-of-stock defaults" value={String(stats.out_of_stock_default_variants)} light />
            <MetricCard label="Orders today" value={String(stats.orders_today)} light />
            <MetricCard label="Pending orders" value={String(stats.pending_orders)} light />
            <MetricCard label="COD pending" value={String(stats.cod_pending_collection)} light />
            <MetricCard label="Low stock" value={String(stats.low_stock_variants)} light />
          </div>

          <div className="mt-6">
            {activeSidebarKey === "overview" ? <OverviewPanel auditLog={auditLog} /> : null}
            {activeSidebarKey === "users" ? (
              <UsersPanel
                activeUsersTab={activeUsersTab}
                filteredUsers={filteredUsers}
                isLoadingUsers={isLoadingUsers}
                onChangeTab={setActiveUsersTab}
              />
            ) : null}
            {activeSidebarKey === "deleteAccount" ? (
              <DeleteAccountRequestsPanel
                isLoading={isLoadingDeleteAccountRequests}
                requests={deleteAccountRequests}
                updateStatus={updateDeleteAccountRequestStatus}
              />
            ) : null}
            {activeSidebarKey === "settings" ? <div className="grid gap-6"><AdminSettingsPanel />{token ? <CommerceSettingsPanel token={token} /> : null}</div> : null}
            {activeSidebarKey === "categories" && token ? <CategoryAdminPanel storage={mediaStorage} token={token} /> : null}
            {activeSidebarKey === "brands" && token ? <BrandAdminPanel storage={mediaStorage} token={token} /> : null}
            {activeSidebarKey === "products" && token ? <ProductAdminPanel storage={mediaStorage} token={token} /> : null}
            {activeSidebarKey === "orders" && token ? <OrdersAdminPanel token={token} /> : null}
            {activeSidebarKey === "inventory" && token ? <InventoryAdminPanel token={token} /> : null}
            {activeSidebarKey === "promotions" && token ? <PromotionsAdminPanel token={token} /> : null}
            {activeSidebarKey === "audit" && token ? <AuditAdminPanel token={token} /> : null}
            {activeSidebarKey === "returns" && token ? <ReturnsAdminPanel token={token} /> : null}
            {activeSidebarKey === "reviews" && token ? <ReviewsAdminPanel token={token} /> : null}
            {activeSidebarKey === "support" && token ? <SupportAdminPanel token={token} /> : null}
            {activeSidebarKey === "reports" && token ? <ReportsAdminPanel token={token} /> : null}
            {activeSidebarKey === "staff" && token ? <StaffAdminPanel token={token} /> : null}
            {activeSidebarKey === "operations" && token ? <OperationsAdminPanel token={token} /> : null}
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
        <p className="text-sm font-black uppercase tracking-[0.2em] text-citrus-500">Live Operations</p>
        <h2 className="mt-3 text-3xl font-black text-ink">FoodOnlines admin command center</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-neutral-600">
          Review key activity, manage storefront content, and keep daily operations moving from one place.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {[
            ["Customer care", "Review accounts, support conversations, returns, and customer feedback."],
            ["Store management", "Organize categories, brands, products, availability, and promotions."],
            ["Order fulfillment", "Track orders, inventory, delivery progress, and payment collection."],
            ["Business oversight", "Review performance reports, staff access, and recorded admin activity."],
          ].map(([title, detail]) => (
            <div className="rounded-3xl border border-neutral-100 bg-neutral-50 p-5" key={title}>
              <p className="text-lg font-black text-ink">{title}</p>
              <p className="mt-3 text-sm leading-7 text-neutral-600">{detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6">
        <InfoCard title="Security checks" items={adminSecurityChecklist} />
        <section className="rounded-[32px] border border-neutral-200 bg-white p-6 shadow-soft sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-neutral-700">Session audit</p>
          <div className="mt-5 grid gap-4">
            {auditLog.length === 0 ? (
              <p className="text-sm font-semibold text-neutral-500">No local admin session events yet.</p>
            ) : (
              auditLog.map((entry) => (
                <div className="rounded-3xl border border-neutral-100 bg-neutral-50 p-4" key={entry.id}>
                  <p className="text-sm font-black text-ink">{entry.action}</p>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">{entry.detail}</p>
                  <p className="mt-2 text-xs font-semibold text-neutral-500">{formatDateTime(entry.createdTimestamp)}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </section>
    </div>
  );
}

function UsersPanel({
  activeUsersTab,
  filteredUsers,
  isLoadingUsers,
  onChangeTab,
}: {
  activeUsersTab: SignupRoleKey;
  filteredUsers: ReturnType<typeof useAdminStore.getState>["users"];
  isLoadingUsers: boolean;
  onChangeTab: (tab: SignupRoleKey) => void;
}) {
  return (
    <section className="rounded-[32px] border border-neutral-200 bg-white p-6 shadow-soft sm:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-citrus-500">Users</p>
          <h2 className="mt-3 text-3xl font-black text-ink">Signup queue and user intake tables</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-neutral-600">
            All public registration fields render as safe plain text in admin tables. Customer, supplier, and
            partner tabs show the latest account information.
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
          <table className="min-w-[1080px] w-full border-collapse text-left">
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
              {isLoadingUsers ? (
                <tr className="border-t border-neutral-100">
                  <td className="px-4 py-8 text-center text-sm font-semibold text-neutral-500" colSpan={adminTableColumns.length}>
                    Loading live users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr className="border-t border-neutral-100">
                  <td className="px-4 py-8 text-center text-sm font-semibold text-neutral-500" colSpan={adminTableColumns.length}>
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const statusMeta = adminRequestStatusMeta[user.requestStatus];
                  return (
                    <tr className="border-t border-neutral-100 align-top" key={user.id}>
                      <td className="px-4 py-4 text-sm font-semibold text-ink">{user.emailAddress}</td>
                      <td className="px-4 py-4 text-sm text-neutral-700">{user.firstName || "Not provided"}</td>
                      <td className="px-4 py-4 text-sm text-neutral-700">{user.lastName || "Not provided"}</td>
                      <td className="px-4 py-4 text-sm text-neutral-700">{user.contactNumber || "Not provided"}</td>
                      <td className="px-4 py-4 text-sm text-neutral-700">{user.lineId || "Not provided"}</td>
                      <td className="px-4 py-4 text-sm text-neutral-700">
                        <p className="font-semibold text-ink">{user.companyName || "Not provided"}</p>
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
                        {user.reviewedAt ? formatDateTime(user.reviewedAt) : "Not updated"}
                      </td>
                      <td className="px-4 py-4">
                        <AdminUserActionSelect />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function AdminUserActionSelect() {
  return (
    <select
      aria-label="User actions"
      className="min-h-10 min-w-[180px] rounded-full border border-neutral-200 bg-white px-3 text-xs font-black text-neutral-700 outline-none transition focus:border-citrus-500"
      defaultValue=""
      onChange={(event) => {
        void event.target.value;
        event.currentTarget.selectedIndex = 0;
      }}
    >
      <option value="">Actions</option>
      <option value="move-to-review">Move to Review</option>
      <option value="delete-user">Delete User</option>
    </select>
  );
}

function DeleteAccountRequestsPanel({
  isLoading,
  requests,
  updateStatus,
}: {
  isLoading: boolean;
  requests: ReturnType<typeof useAdminStore.getState>["deleteAccountRequests"];
  updateStatus: (requestId: number, status: "pending" | "reviewed" | "completed" | "cancelled") => Promise<void>;
}) {
  return (
    <section className="rounded-[32px] border border-neutral-200 bg-white p-6 shadow-soft sm:p-8">
      <p className="text-sm font-black uppercase tracking-[0.2em] text-citrus-500">Delete Account</p>
      <h2 className="mt-3 text-3xl font-black text-ink">Account deletion requests</h2>

      <div className="mt-8 overflow-hidden rounded-[24px] border border-neutral-100">
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full border-collapse text-left">
            <thead className="bg-neutral-50">
              <tr>
                {["User", "Email", "Phone", "Reason", "Other Reason", "Requested", "Status", "Action"].map((header) => (
                  <th className="px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-neutral-500" key={header}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr className="border-t border-neutral-100">
                  <td className="px-4 py-6 text-sm font-semibold text-neutral-500" colSpan={8}>
                    Loading delete account requests...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr className="border-t border-neutral-100">
                  <td className="px-4 py-6 text-sm font-semibold text-neutral-500" colSpan={8}>
                    No delete account requests found.
                  </td>
                </tr>
              ) : (
                requests.map((item) => (
                  <tr className="border-t border-neutral-100 align-top" key={item.id}>
                    <td className="px-4 py-3 text-sm font-semibold text-ink">{item.userName}</td>
                    <td className="px-4 py-3 text-sm text-neutral-700">{item.userEmail}</td>
                    <td className="px-4 py-3 text-sm text-neutral-700">{item.userPhone}</td>
                    <td className="px-4 py-3 text-sm text-neutral-700">{item.reason}</td>
                    <td className="px-4 py-3 text-sm text-neutral-700">{item.otherReason || "-"}</td>
                    <td className="px-4 py-3 text-sm text-neutral-700">{item.requestedAt ? formatDateTime(item.requestedAt) : "-"}</td>
                    <td className="px-4 py-3 text-sm text-neutral-700">{item.status}</td>
                    <td className="px-4 py-3">
                      <select
                        className="min-h-10 min-w-[150px] rounded-full border border-neutral-200 bg-white px-3 text-xs font-black text-neutral-700 outline-none transition focus:border-citrus-500"
                        onChange={(event) => void updateStatus(item.id, event.target.value as "pending" | "reviewed" | "completed" | "cancelled")}
                        value={item.status}
                      >
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function AdminSettingsPanel() {
  const adminEmail = useAdminStore((state) => state.adminEmail);
  const adminName = useAdminStore((state) => state.adminName);
  const securityMessage = useAdminStore((state) => state.securityMessage);
  const settingsMessage = useAdminStore((state) => state.settingsMessage);
  const updateAdminCredentials = useAdminStore((state) => state.updateAdminCredentials);
  const [currentPassword, setCurrentPassword] = useState("");
  const [nextName, setNextName] = useState(adminName);
  const [nextEmail, setNextEmail] = useState(adminEmail);
  const [nextPassword, setNextPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    const success = await updateAdminCredentials(currentPassword, nextName, nextEmail, nextPassword, confirmPassword);
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
        <h2 className="mt-3 text-3xl font-black text-ink">Update admin profile</h2>

        <form className="mt-8 grid gap-5" noValidate onSubmit={handleSubmit}>
          <TextInput label="Admin name" maxLength={121} onChange={setNextName} type="text" value={nextName} />
          <TextInput label="Admin email" maxLength={254} onChange={setNextEmail} type="email" value={nextEmail} />
          <PasswordInput label="Current password" onChange={setCurrentPassword} value={currentPassword} />
          <PasswordInput label="New password" onChange={setNextPassword} value={nextPassword} />
          <PasswordInput label="Confirm new password" onChange={setConfirmPassword} value={confirmPassword} />

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
            {isSaving ? "Updating..." : "Update Settings"}
          </button>
        </form>
      </div>

      <div className="grid gap-6">
        <div className="rounded-[32px] border border-neutral-200 bg-white p-6 shadow-soft sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-neutral-700">Current status</p>
          <p className="mt-4 break-all text-lg font-black text-ink">{adminName || adminEmail}</p>
          <p className="mt-3 text-sm leading-7 text-neutral-600">{securityMessage}</p>
        </div>
        <InfoCard
          title="Account security"
          items={[
            "Current password required before settings update.",
            "New passwords are protected before saving.",
            "Signing out ends the active session.",
            "Password is never returned to the browser.",
          ]}
        />
      </div>
    </section>
  );
}

function TextInput({
  label,
  maxLength,
  onChange,
  type,
  value,
}: {
  label: string;
  maxLength: number;
  onChange: (value: string) => void;
  type: string;
  value: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-bold text-neutral-700">{label}</span>
      <input
        className="min-h-14 rounded-2xl border border-neutral-200 px-4 text-base font-semibold text-ink outline-none ring-2 ring-transparent transition focus:border-leaf-500 focus:ring-leaf-500/15"
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        value={value}
      />
    </label>
  );
}

function PasswordInput({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return <TextInput label={label} maxLength={128} onChange={onChange} type="password" value={value} />;
}

function InfoCard({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-[32px] border border-neutral-200 bg-white p-6 shadow-soft sm:p-8">
      <p className="text-sm font-black uppercase tracking-[0.2em] text-neutral-700">{title}</p>
      <div className="mt-5 grid gap-3 text-sm leading-7 text-neutral-600">
        {items.map((item) => (
          <p key={item}>{item}</p>
        ))}
      </div>
    </section>
  );
}

function MetricCard({ label, value, light = false }: { label: string; value: string; light?: boolean }) {
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
