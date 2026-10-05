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
  deleteAdminCms,
  listAdminCms,
  upsertAdminCms,
} from "@/lib/api/cms";
import { siteConfig } from "@/config/site";
import { mockAdminCms } from "@/lib/mocks/admin";
import type { AdminCmsItem } from "@/types/admin";
import { paginateLocal } from "@/types/paging";

const empty: AdminCmsItem = {
  id: "",
  title: "",
  kind: "banner",
  status: "published",
  updatedAt: "",
};

export default function AdminCmsPage() {
  const [rows, setRows] = useState(mockAdminCms);
  const [source, setSource] = useState<"mock" | "api">(
    siteConfig.useMocks || !siteConfig.apiBaseUrl ? "mock" : "api",
  );
  const [editing, setEditing] = useState<AdminCmsItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<AdminCmsItem>(empty);
  const [notice, setNotice] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const live = await listAdminCms();
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

  const columns: AdminColumn<AdminCmsItem>[] = [
    { key: "title", header: "عنوان", cell: (r) => r.title },
    {
      key: "kind",
      header: "نوع",
      cell: (r) =>
        r.kind === "banner" ? "بنر" : r.kind === "blog" ? "بلاگ" : "صفحه",
    },
    {
      key: "status",
      header: "وضعیت",
      cell: (r) => (
        <StatusPill tone={r.status === "published" ? "success" : "warn"}>
          {r.status === "published" ? "منتشر" : "پیش‌نویس"}
        </StatusPill>
      ),
    },
    { key: "updated", header: "به‌روزرسانی", cell: (r) => r.updatedAt },
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
              const live = await deleteAdminCms(r.id);
              setRows((prev) => prev.filter((x) => x.id !== r.id));
              setNotice(live ? "آیتم حذف شد" : "آیتم حذف شد (mock)");
              window.setTimeout(() => setNotice(null), 2000);
            })();
          }}
        />
      ),
    },
  ];

  return (
    <RequireAdmin permission="cms:manage">
      <AdminPageHeader
        title="مدیریت محتوا"
        description={
          source === "api"
            ? "بنرهای صفحه اصلی از Merchandising"
            : "بنر، صفحه و بلاگ (mock)"
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
              آیتم جدید
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
                id: form.id || `cms-local-${Date.now()}`,
                kind: "banner" as const,
                updatedAt: form.updatedAt || new Date().toISOString().slice(0, 10),
              };
              const live = await upsertAdminCms(payload);
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
                live ? "محتوا ذخیره شد" : "محتوا ذخیره شد (mock محلی)",
              );
              window.setTimeout(() => setNotice(null), 2200);
            })();
          }}
        >
          <h3 className="text-sm font-bold">
            {editing ? "ویرایش محتوا" : "محتوای جدید"}
          </h3>
          <label className="block space-y-1 text-sm">
            <span className="text-[var(--color-neutral-600)]">عنوان</span>
            <input
              required
              value={form.title}
              onChange={(e) =>
                setForm((p) => ({ ...p, title: e.target.value }))
              }
              className="w-full rounded-lg border border-[var(--color-neutral-200)] px-3 py-2"
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span className="text-[var(--color-neutral-600)]">وضعیت</span>
            <select
              value={form.status}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  status: e.target.value as AdminCmsItem["status"],
                }))
              }
              className="w-full max-w-xs rounded-lg border border-[var(--color-neutral-200)] px-3 py-2"
            >
              <option value="published">منتشر</option>
              <option value="draft">پیش‌نویس</option>
            </select>
          </label>
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
