import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { AdminUserRecord } from "../../data/admin";
import { ApiError } from "../../lib/apiClient";
import type { SignupRoleKey } from "../../lib/registerSchema";
import { toUserFacingErrorMessage } from "../../lib/userFacingError";
import {
  usersApi,
  type ManagedUser,
  type ManagedUserAddress,
  type ManagedUserPaymentMethod,
} from "../../services/admin/usersApi";
import { AdminListPage, exportCsv } from "./AdminListPage";
import {
  customerAddressCountry,
  customerAddressFields,
  customerAddressPhone,
  customerAddressRecipient,
  customerDetailSectionState,
  maskedPaymentMethodExpiry,
  maskedPaymentMethodLabel,
  shouldAcceptCustomerDetail,
  type CustomerDetailPhase,
  type CustomerDetailSectionState,
} from "./customerDetailPresentation";

const plural: Record<SignupRoleKey, string> = {
  customer: "customers",
  supplier: "suppliers",
  partner: "partners",
};
const labels: Record<SignupRoleKey, string> = {
  customer: "Customer",
  supplier: "Supplier",
  partner: "Partner",
};
const empty = {
  email: "",
  first_name: "",
  last_name: "",
  contact_number: "",
  line_id: "",
  company_name: "",
  business_type: "",
  status: "active",
  password: "",
};
const optionalValue = (value: string) => value.trim() || null;

type Props = {
  token: string;
  role: SignupRoleKey;
  users: AdminUserRecord[];
  loading: boolean;
  mode?: "list" | "create" | "edit";
  recordId?: string | null;
  onChangeRole: (role: SignupRoleKey) => void;
  onNavigate: (path: string, replace?: boolean) => void;
  onReload: () => Promise<void>;
};

export function EnterpriseUsersAdminPanel({
  token,
  role,
  users,
  loading,
  mode = "list",
  recordId,
  onChangeRole,
  onNavigate,
  onReload,
}: Props) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<ManagedUser | null>(null);
  const [form, setForm] = useState(empty);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [detailPhase, setDetailPhase] =
    useState<CustomerDetailPhase>("loading");
  const [detailMessage, setDetailMessage] = useState("");
  const [detailAttempt, setDetailAttempt] = useState(0);
  const userLoadVersion = useRef(0);

  useEffect(() => {
    const requestVersion = ++userLoadVersion.current;
    setEditing(null);
    if (mode === "create") {
      setForm(empty);
      setMessage("");
      setDetailMessage("");
      setDetailPhase("loaded");
      return;
    }
    if (mode !== "edit") return;
    if (!recordId) {
      setDetailMessage("Customer information is unavailable.");
      setDetailPhase("unavailable");
      return;
    }
    setMessage("");
    setDetailMessage("");
    setDetailPhase("loading");
    void usersApi
      .show(token, recordId)
      .then(({ user }) => {
        if (
          !shouldAcceptCustomerDetail(
            recordId,
            user.id,
            requestVersion,
            userLoadVersion.current,
          )
        )
          return;
        if (user.account_type !== role) {
          setDetailMessage("Customer information is unavailable.");
          setDetailPhase("unavailable");
          return;
        }
        setEditing(user);
        setForm({
          email: user.email,
          first_name: user.first_name ?? "",
          last_name: user.last_name ?? "",
          contact_number: user.contact_number ?? "",
          line_id: user.line_id ?? "",
          company_name: user.company_name ?? "",
          business_type: user.business_type ?? "",
          status: user.status,
          password: "",
        });
        setDetailPhase("loaded");
      })
      .catch((error) => {
        if (requestVersion !== userLoadVersion.current) return;
        if (error instanceof ApiError && error.status === 404) {
          setDetailMessage("Customer information is unavailable.");
          setDetailPhase("unavailable");
          return;
        }
        setDetailMessage(
          toUserFacingErrorMessage(
            error,
            "Unable to load this customer. Please try again.",
          ),
        );
        setDetailPhase("error");
      });
    return () => {
      userLoadVersion.current += 1;
    };
  }, [detailAttempt, mode, recordId, role, token]);

  const filtered = useMemo(
    () =>
      users
        .filter(
          (user) =>
            (!status ||
              (status === "active"
                ? user.requestStatus === "approved"
                : status === "disabled"
                  ? user.requestStatus === "disabled"
                  : user.requestStatus === "in_review")) &&
            `${user.emailAddress} ${user.firstName} ${user.lastName} ${user.contactNumber} ${user.lineId} ${user.companyName}`
              .toLowerCase()
              .includes(search.toLowerCase()),
        )
        .sort((left, right) =>
          sort === "name"
            ? `${left.firstName} ${left.lastName}`.localeCompare(
                `${right.firstName} ${right.lastName}`,
              )
            : sort === "oldest"
              ? left.createdTimestamp.localeCompare(right.createdTimestamp)
              : right.createdTimestamp.localeCompare(left.createdTimestamp),
        ),
    [users, search, status, sort],
  );
  const pageSize = 20;
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);
  const allSelected =
    pageItems.length > 0 && pageItems.every((user) => selectedIds.has(user.id));

  async function bulk(action: "publish" | "archive" | "delete") {
    const targets = users.filter((user) => selectedIds.has(user.id));
    if (
      !targets.length ||
      !window.confirm(
        `${action[0].toUpperCase() + action.slice(1)} ${targets.length} selected ${plural[role]}?`,
      )
    )
      return;
    try {
      for (const user of targets) {
        if (action === "publish")
          await usersApi.save(token, user.id, { status: "active" });
        else await usersApi.archive(token, user.id);
      }
      setSelectedIds(new Set());
      await onReload();
    } catch (error) {
      setMessage(
        toUserFacingErrorMessage(error, "Unable to update the selected users."),
      );
    }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const response = await usersApi.save(token, editing?.id ?? null, {
        ...form,
        account_type: role,
        line_id: optionalValue(form.line_id),
        company_name: optionalValue(form.company_name),
        password: form.password || undefined,
      });
      setEditing(response.user);
      setDetailPhase("loaded");
      setForm((current) => ({ ...current, password: "" }));
      await onReload();
      setMessage(`${labels[role]} saved.`);
      if (mode === "create")
        onNavigate(`/admin/${plural[role]}/${response.user.id}/edit`, true);
    } catch (error) {
      setMessage(
        toUserFacingErrorMessage(
          error,
          `Unable to save this ${labels[role].toLowerCase()}.`,
        ),
      );
    } finally {
      setSaving(false);
    }
  }

  if (mode === "list") {
    return (
      <AdminListPage
        bulkActions={[
          {
            label: "Bulk delete",
            tone: "danger",
            onClick: () => void bulk("delete"),
          },
          { label: "Bulk publish", onClick: () => void bulk("publish") },
          { label: "Bulk archive", onClick: () => void bulk("archive") },
        ]}
        count={filtered.length}
        createLabel={`Create ${labels[role]}`}
        description={`Manage ${plural[role]} in a dedicated list with lifecycle, export, and bulk controls.`}
        filters={
          <div className="flex flex-wrap gap-2">
            <div className="flex flex-wrap gap-2">
              {(["customer", "supplier", "partner"] as SignupRoleKey[]).map(
                (value) => (
                  <button
                    className={`min-h-10 rounded-full px-4 text-xs font-black ${role === value ? "bg-citrus-500 text-white" : "bg-neutral-100 text-neutral-700"}`}
                    key={value}
                    onClick={() => onChangeRole(value)}
                    type="button"
                  >
                    {plural[value][0].toUpperCase() + plural[value].slice(1)}
                  </button>
                ),
              )}
            </div>
            <select
              className="min-h-10 rounded-xl border border-neutral-200 px-4 text-sm font-bold"
              onChange={(event) => setStatus(event.target.value)}
              value={status}
            >
              <option value="">All statuses</option>
              <option value="active">Published</option>
              <option value="in_review">In review</option>
              <option value="disabled">Archived</option>
            </select>
          </div>
        }
        onCreate={() => onNavigate(`/admin/${plural[role]}/create`)}
        onExport={() =>
          exportCsv(
            `${plural[role]}.csv`,
            filtered.map((user) => ({
              email: user.emailAddress,
              first_name: user.firstName,
              last_name: user.lastName,
              phone: user.contactNumber,
              line_id: user.lineId || undefined,
              company: user.companyName,
              status: user.requestStatus,
              created: user.createdTimestamp,
            })),
          )
        }
        onPage={setPage}
        onSearch={setSearch}
        onSort={setSort}
        page={page}
        pageSize={pageSize}
        search={search}
        selectedCount={selectedIds.size}
        sort={sort}
        sortOptions={[
          { value: "newest", label: "Sort: Newest" },
          { value: "oldest", label: "Sort: Oldest" },
          { value: "name", label: "Sort: Name" },
        ]}
        title={plural[role][0].toUpperCase() + plural[role].slice(1)}
        total={filtered.length}
      >
        <table className="min-w-[1050px] w-full text-left text-sm">
          <thead className="bg-neutral-50">
            <tr>
              {[
                "",
                "User",
                "Contact",
                "Company",
                "Status",
                "Source",
                "Created",
                "Updated",
                "",
              ].map((header, index) => (
                <th
                  className="px-4 py-4 text-xs font-black uppercase tracking-[0.14em] text-neutral-500"
                  key={`${header}-${index}`}
                >
                  {index === 0 ? (
                    <input
                      aria-label="Select page"
                      checked={allSelected}
                      onChange={() =>
                        setSelectedIds((current) => {
                          const next = new Set(current);
                          pageItems.forEach((user) =>
                            allSelected
                              ? next.delete(user.id)
                              : next.add(user.id),
                          );
                          return next;
                        })
                      }
                      type="checkbox"
                    />
                  ) : (
                    header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-10 text-center" colSpan={9}>
                  Loading users…
                </td>
              </tr>
            ) : (
              pageItems.map((user) => (
                <tr
                  className="border-t border-neutral-100 hover:bg-orange-50/30"
                  key={user.id}
                >
                  <td className="px-4 py-4">
                    <input
                      aria-label={`Select ${user.emailAddress}`}
                      checked={selectedIds.has(user.id)}
                      onChange={() =>
                        setSelectedIds((current) => {
                          const next = new Set(current);
                          next.has(user.id)
                            ? next.delete(user.id)
                            : next.add(user.id);
                          return next;
                        })
                      }
                      type="checkbox"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <button
                      className="font-black hover:text-citrus-600"
                      onClick={() =>
                        onNavigate(`/admin/${plural[role]}/${user.id}/edit`)
                      }
                      type="button"
                    >
                      {user.firstName || user.lastName
                        ? `${user.firstName} ${user.lastName}`.trim()
                        : user.emailAddress}
                    </button>
                    <p className="mt-1 text-xs text-neutral-500">
                      {user.emailAddress}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <p>{user.contactNumber || "—"}</p>
                    {user.lineId ? (
                      <p className="mt-1 text-xs text-neutral-500">
                        {user.lineId}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-4">{user.companyName || "—"}</td>
                  <td className="px-4 py-4 capitalize">
                    {user.requestStatus.replaceAll("_", " ")}
                  </td>
                  <td className="px-4 py-4">{user.sourceLabel}</td>
                  <td className="px-4 py-4">
                    {new Date(user.createdTimestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-4">
                    {user.reviewedAt
                      ? new Date(user.reviewedAt).toLocaleString()
                      : "—"}
                  </td>
                  <td className="px-4 py-4">
                    <button
                      className="font-black text-leaf-700"
                      onClick={() =>
                        onNavigate(`/admin/${plural[role]}/${user.id}/edit`)
                      }
                      type="button"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </AdminListPage>
    );
  }

  if (mode === "edit" && (detailPhase !== "loaded" || !editing)) {
    return (
      <DetailLoadShell
        message={detailMessage}
        onBack={() => onNavigate(`/admin/${plural[role]}`)}
        onRetry={() => setDetailAttempt((attempt) => attempt + 1)}
        phase={detailPhase}
        role={role}
      />
    );
  }

  return (
    <form
      className="grid gap-6 rounded-[28px] border border-neutral-200 bg-white p-5 shadow-soft sm:p-8"
      onSubmit={save}
    >
      <button
        className="w-fit text-sm font-black text-leaf-700"
        onClick={() => onNavigate(`/admin/${plural[role]}`)}
        type="button"
      >
        ← {plural[role][0].toUpperCase() + plural[role].slice(1)}
      </button>
      <div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-citrus-500">
            {editing
              ? `Edit ${labels[role].toLowerCase()}`
              : `Create ${labels[role].toLowerCase()}`}
          </p>
          <h2 className="mt-2 text-3xl font-black">
            {editing
              ? `${editing.first_name ?? ""} ${editing.last_name ?? ""}`.trim() ||
                editing.email
              : `Create ${labels[role]}`}
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="rounded-2xl bg-citrus-500 px-5 py-3 text-sm font-black text-white disabled:opacity-50"
            disabled={saving}
            type="submit"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <button
            className="rounded-2xl border border-neutral-200 px-5 py-3 text-sm font-black"
            disabled={saving}
            type="submit"
          >
            Save &amp; Continue
          </button>
          {editing ? (
            <button
              className="rounded-2xl border border-rose-200 px-5 py-3 text-sm font-black text-rose-700"
              onClick={() => {
                if (
                  window.confirm(
                    `Delete this ${labels[role].toLowerCase()}? Existing commerce history will be preserved.`,
                  )
                )
                  void usersApi
                    .archive(token, editing.id)
                    .then(() => onNavigate(`/admin/${plural[role]}`));
              }}
              type="button"
            >
              Delete
            </button>
          ) : null}
        </div>
      </div>
      {message ? (
        <p
          aria-live="polite"
          className="rounded-2xl bg-neutral-50 p-3 text-sm"
          role="status"
        >
          {message}
        </p>
      ) : null}
      <section className="grid gap-4 rounded-2xl border border-neutral-200 p-5 md:grid-cols-2">
        {[
          ["email", "Email", "email"],
          ["first_name", "First name", "text"],
          ["last_name", "Last name", "text"],
          ["contact_number", "Contact number", "tel"],
          ["line_id", "LINE ID (optional)", "text"],
          ["company_name", "Company name (optional)", "text"],
          ["business_type", "Business type", "text"],
          [
            "password",
            editing ? "New password (optional)" : "Password",
            "password",
          ],
        ].map(([key, label, type]) => (
          <label className="grid gap-2 text-sm font-bold" key={key}>
            {label}
            <input
              className="min-h-12 rounded-xl border border-neutral-200 px-4 text-base"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  [key]: event.target.value,
                }))
              }
              required={key === "email" || (!editing && key === "password")}
              type={type}
              value={form[key as keyof typeof form]}
            />
          </label>
        ))}
        <label className="grid gap-2 text-sm font-bold">
          Publication
          <select
            className="min-h-12 rounded-xl border border-neutral-200 px-4"
            onChange={(event) =>
              setForm((current) => ({ ...current, status: event.target.value }))
            }
            value={form.status}
          >
            <option value="active">Published</option>
            <option value="in_review">In review</option>
            <option value="disabled">Archived</option>
          </select>
        </label>
      </section>
      {role === "customer" && editing ? (
        <CustomerDetailSections
          addresses={editing.addresses ?? []}
          paymentMethods={editing.payment_methods ?? []}
          phase={detailPhase}
        />
      ) : null}
    </form>
  );
}

function DetailLoadShell({
  message,
  onBack,
  onRetry,
  phase,
  role,
}: {
  message: string;
  onBack: () => void;
  onRetry: () => void;
  phase: CustomerDetailPhase;
  role: SignupRoleKey;
}) {
  return (
    <section className="grid gap-6 rounded-[28px] border border-neutral-200 bg-white p-5 shadow-soft sm:p-8">
      <button
        className="w-fit text-sm font-black text-leaf-700"
        onClick={onBack}
        type="button"
      >
        ← {plural[role][0].toUpperCase() + plural[role].slice(1)}
      </button>
      <div>
        <p className="text-sm font-black uppercase tracking-[0.18em] text-citrus-500">
          {phase === "loading"
            ? `Loading ${labels[role].toLowerCase()}`
            : `${labels[role]} unavailable`}
        </p>
        <h2 className="mt-2 text-3xl font-black">
          {phase === "loading"
            ? `Loading ${labels[role].toLowerCase()} information…`
            : message || `${labels[role]} information is unavailable.`}
        </h2>
      </div>
      {role === "customer" ? (
        <CustomerDetailSections
          addresses={[]}
          onRetry={onRetry}
          paymentMethods={[]}
          phase={phase}
        />
      ) : phase === "error" ? (
        <button
          className="w-fit rounded-2xl bg-citrus-500 px-5 py-3 text-sm font-black text-white"
          onClick={onRetry}
          type="button"
        >
          Retry
        </button>
      ) : null}
    </section>
  );
}

function CustomerDetailSections({
  addresses,
  onRetry,
  paymentMethods,
  phase,
}: {
  addresses: ManagedUserAddress[];
  onRetry?: () => void;
  paymentMethods: ManagedUserPaymentMethod[];
  phase: CustomerDetailPhase;
}) {
  const addressState = customerDetailSectionState(phase, addresses.length);
  const paymentState = customerDetailSectionState(phase, paymentMethods.length);

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 rounded-2xl border border-neutral-200 p-5">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-citrus-500">
            Customer addresses
          </p>
          <h3 className="mt-2 text-xl font-black">Saved addresses</h3>
        </div>
        {addressState === "ready" ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {addresses.map((address) => (
              <AddressCard address={address} key={address.id} />
            ))}
          </div>
        ) : (
          <DetailSectionMessage
            emptyMessage="No saved addresses for this customer."
            loadingMessage="Loading saved addresses…"
            onRetry={onRetry}
            state={addressState}
          />
        )}
      </section>

      <section className="grid gap-4 rounded-2xl border border-neutral-200 p-5">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-citrus-500">
            Customer payments
          </p>
          <h3 className="mt-2 text-xl font-black">Payment methods</h3>
          <p className="mt-1 text-sm text-neutral-500">
            Read-only masked payment information.
          </p>
        </div>
        {paymentState === "ready" ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {paymentMethods.map((method) => (
              <article
                className="min-w-0 rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
                key={method.id}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="font-black text-neutral-950">
                    {maskedPaymentMethodLabel(method)}
                  </p>
                  {method.is_default ? <DefaultBadge /> : null}
                </div>
                <p className="mt-2 text-sm text-neutral-700">
                  {maskedPaymentMethodExpiry(method)}
                </p>
                {method.status ? (
                  <p className="mt-1 text-xs capitalize text-neutral-500">
                    {method.status.replaceAll("_", " ")}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <DetailSectionMessage
            emptyMessage="No saved payment methods for this customer."
            loadingMessage="Loading payment methods…"
            onRetry={onRetry}
            state={paymentState}
          />
        )}
      </section>
    </div>
  );
}

function AddressCard({ address }: { address: ManagedUserAddress }) {
  const phone = customerAddressPhone(address);
  const fields = customerAddressFields(address);

  return (
    <article className="min-w-0 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="font-black text-neutral-950">
          {customerAddressRecipient(address)}
        </p>
        {address.is_default ? <DefaultBadge /> : null}
      </div>
      {address.summary ? (
        <p className="mt-2 break-words text-sm leading-6 text-neutral-700">
          {address.summary}
        </p>
      ) : null}
      <dl className="mt-3 grid gap-2 border-t border-neutral-200 pt-3 text-sm">
        <AddressField label="Country" value={customerAddressCountry(address)} />
        {phone ? <AddressField label="Phone number" value={phone} /> : null}
        {fields.map((field) => (
          <AddressField
            key={field.field}
            label={field.label}
            value={field.value}
          />
        ))}
      </dl>
    </article>
  );
}

function AddressField({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-0.5 sm:grid-cols-[9rem_1fr]">
      <dt className="font-bold text-neutral-500">{label}</dt>
      <dd className="min-w-0 break-words text-neutral-800">{value}</dd>
    </div>
  );
}

function DefaultBadge() {
  return (
    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-leaf-700">
      Default
    </span>
  );
}

function DetailSectionMessage({
  emptyMessage,
  loadingMessage,
  onRetry,
  state,
}: {
  emptyMessage: string;
  loadingMessage: string;
  onRetry?: () => void;
  state: Exclude<CustomerDetailSectionState, "ready">;
}) {
  const message =
    state === "loading"
      ? loadingMessage
      : state === "empty"
        ? emptyMessage
        : state === "unavailable"
          ? "Customer information is unavailable."
          : "Unable to load this customer information.";

  return (
    <div className="rounded-2xl bg-neutral-50 p-4 text-sm text-neutral-600">
      <p aria-live="polite">{message}</p>
      {state === "error" && onRetry ? (
        <button
          className="mt-3 rounded-xl bg-citrus-500 px-4 py-2 text-xs font-black text-white"
          onClick={onRetry}
          type="button"
        >
          Retry
        </button>
      ) : null}
    </div>
  );
}
