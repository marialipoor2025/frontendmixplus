"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AdminButton,
  AdminOutlineButton,
  AdminPageHeader,
  AdminTable,
  RowActions,
  StatusPill,
  type AdminColumn,
} from "@/components/admin/AdminUi";
import { RequireAdmin } from "@/components/admin/RequireAdmin";
import {
  deleteAdminSeller,
  listAdminSellers,
  upsertAdminSeller,
} from "@/lib/api/sellers";
import { siteConfig } from "@/config/site";
import { mockAdminSellers } from "@/lib/mocks/admin";
import type { AdminSeller } from "@/types/admin";
import { paginateLocal } from "@/types/paging";

const statusLabel = {
  approved: "تأیید شده",
  pending: "در انتظار",
  suspended: "معلق",
} as const;

const empty: AdminSeller = {
  id: "",
  name: "",
  status: "approved",
  offers: 0,
  rating: 0,
};

export default function AdminSellersPage() {
  const [rows, setRows] = useState(mockAdminSellers);
  const [source, setSource] = useState<"mock" | "api">(
    siteConfig.useMocks || !siteConfig.apiBaseUrl ? "mock" : "api",
  );
  const [editing, setEditing] = useState<AdminSeller | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<AdminSeller>(empty);
  const [notice, setNotice] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const live = await listAdminSellers();
      if (!cancelled && live) {
        setRows(live);
        if (!siteConfig.useMocks && siteConfig.apiBaseUrl) {
          setSource("api");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const paged = useMemo(
    () => paginateLocal(rows, page, pageSize),
    [rows, page, pageSize],
  );

  const columns: AdminColumn<AdminSeller>[] = [
    { key: "name", header: "فروشنده", cell: (r) => r.name },
    {
      key: "status",
      header: "وضعیت",
      cell: (r) => (
        <StatusPill
          tone={
            r.status === "approved"
              ? "success"
              : r.status === "pending"
                ? "warn"
                : "danger"
          }
        >
          {statusLabel[r.status]}
        </StatusPill>
      ),
    },
    { key: "offers", header: "آفرها", cell: (r) => r.offers },
    {
      key: "rating",
      header: "امتیاز",
      cell: (r) => (r.rating ? r.rating.toFixed(1) : "—"),
    },
    {
      key: "actions",
      header: "",
      cell: (r) => (
        <RowActions
          onEdit={() => {
            setCreating(false);
            setEditing(r);
            setForm(r);
          }}
          onDelete={() => {
            void (async () => {
              const live = await deleteAdminSeller(r.id);
              setRows((prev) => prev.filter((x) => x.id !== r.id));
              setNotice(
                live ? "فروشنده حذف شد" : "فروشنده حذف شد (mock محلی)",
              );
              window.setTimeout(() => setNotice(null), 2000);
            })();
          }}
        />
      ),
    },
  ];

  return (
    <RequireAdmin permission="sellers:manage">
      <AdminPageHeader
        title="مدیریت فروشندگان"
        description={
          source === "api"
            ? "فروشندگان از Sellers API خوانده می‌شوند"
            : "تأیید، تعلیق و پایش فروشندگان بازارگاه (mock)"
        }
        actions={
          <>
            <AdminOutlineButton
              type="button"
              onClick={() => {
                setCreating(false);
                setEditing(null);
              }}
            >
              بستن فرم
            </AdminOutlineButton>
            <AdminButton
              type="button"
              onClick={() => {
                setEditing(null);
                setCreating(true);
                setForm(empty);
              }}
            >
              فروشنده جدید
            </AdminButton>
          </>
        }
      />

      {notice ? (
        <p className="mb-3 rounded-lg bg-[var(--color-primary-soft)] px-3 py-2 text-sm text-[var(--color-primary)]">
          {notice}
        </p>
      ) : null}

      {creating || editing ? (
        <form
          className="mb-4 space-y-3 rounded-xl border border-[var(--color-neutral-200)] bg-white p-4"
          onSubmit={(e) => {
            e.preventDefault();
            void (async () => {
              const payload = {
                ...form,
                id: form.id || `s-${Date.now()}`,
              };
              const live = await upsertAdminSeller(payload);
              const saved = live ?? payload;
              setRows((prev) => {
                const exists = prev.some((x) => x.id === saved.id);
                return exists
                  ? prev.map((x) => (x.id === saved.id ? saved : x))
                  : [saved, ...prev];
              });
              setCreating(false);
              setEditing(null);
              setNotice(
                live
                  ? "فروشنده در Sellers ذخیره شد"
                  : "فروشنده ذخیره شد (mock محلی)",
              );
              window.setTimeout(() => setNotice(null), 2200);
            })();
          }}
        >
          <h3 className="text-sm font-bold">
            {editing ? "ویرایش فروشنده" : "فروشنده جدید"}
          </h3>
          <label className="block space-y-1 text-sm">
            <span className="text-[var(--color-neutral-600)]">نام</span>
            <input
              required
              value={form.name}
              onChange={(e) =>
                setForm((p) => ({ ...p, name: e.target.value }))
              }
              className="w-full rounded-lg border border-[var(--color-neutral-200)] px-3 py-2"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block space-y-1 text-sm">
              <span className="text-[var(--color-neutral-600)]">وضعیت</span>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    status: e.target.value as AdminSeller["status"],
                  }))
                }
                className="w-full rounded-lg border border-[var(--color-neutral-200)] px-3 py-2"
              >
                <option value="approved">تأیید شده</option>
                <option value="pending">در انتظار</option>
                <option value="suspended">معلق</option>
              </select>
            </label>
            <label className="block space-y-1 text-sm">
              <span className="text-[var(--color-neutral-600)]">امتیاز</span>
              <input
                type="number"
                min={0}
                max={5}
                step={0.1}
                value={form.rating || ""}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    rating: Number(e.target.value) || 0,
                  }))
                }
                className="w-full rounded-lg border border-[var(--color-neutral-200)] px-3 py-2"
              />
            </label>
          </div>
          <div className="flex gap-2">
            <AdminButton type="submit">ذخیره</AdminButton>
            <AdminOutlineButton
              type="button"
              onClick={() => {
                setCreating(false);
                setEditing(null);
              }}
            >
              انصراف
            </AdminOutlineButton>
          </div>
        </form>
      ) : null}

      <AdminTable
        columns={columns}
        rows={paged.items}
        paging={{
          page: paged.page,
          pageSize: paged.pageSize,
          totalCount: paged.totalCount,
          totalPages: paged.totalPages,
          onPageChange: setPage,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setPage(1);
          },
        }}
      />
    </RequireAdmin>
  );
}
