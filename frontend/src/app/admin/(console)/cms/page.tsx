"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminFooterSettings } from "@/components/admin/AdminFooterSettings";
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
import type { AdminCmsItem, AdminCmsSlot } from "@/types/admin";
import { paginateLocal } from "@/types/paging";

const SLOT_LABELS: Record<AdminCmsSlot, string> = {
  top: "بالای صفحه",
  hero: "اسلایدر اصلی",
  mid: "میانی (۴تایی)",
  bottom: "پایین صفحه",
};

const empty: AdminCmsItem = {
  id: "",
  title: "",
  kind: "banner",
  slot: "hero",
  status: "published",
  updatedAt: "",
  imageUrl: "",
  href: "/",
  alt: "",
  sortOrder: 1,
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
  const [slotFilter, setSlotFilter] = useState<AdminCmsSlot | "all">("all");

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

  const filtered = useMemo(
    () =>
      slotFilter === "all"
        ? rows
        : rows.filter((r) => (r.slot ?? "hero") === slotFilter),
    [rows, slotFilter],
  );

  const paged = useMemo(
    () => paginateLocal(filtered, page, pageSize),
    [filtered, page, pageSize],
  );

  const columns: AdminColumn<AdminCmsItem>[] = [
    { key: "title", header: "عنوان", cell: (r) => r.title },
    {
      key: "slot",
      header: "جایگاه",
      cell: (r) => SLOT_LABELS[r.slot ?? "hero"],
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
    {
      key: "href",
      header: "لینک",
      cell: (r) => (
        <span className="max-w-[10rem] truncate text-xs" dir="ltr">
          {r.href || "—"}
        </span>
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
            setForm({ ...empty, ...r, slot: r.slot ?? "hero" });
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
        title="بازاریابی صفحه اصلی"
        description={
          source === "api"
            ? "بنرهای Top / Hero / Mid / Bottom از Merchandising"
            : "جایگاه‌های بازاریابی صفحه اصلی (mock)"
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
              بنر جدید
            </AdminButton>
          </>
        }
      />

      <div className="mb-3 flex flex-wrap gap-2">
        {(
          [
            ["all", "همه"],
            ["top", SLOT_LABELS.top],
            ["hero", SLOT_LABELS.hero],
            ["mid", SLOT_LABELS.mid],
            ["bottom", SLOT_LABELS.bottom],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setSlotFilter(id);
              setPage(1);
            }}
            className={[
              "rounded-lg px-3 py-1.5 text-xs font-medium",
              slotFilter === id
                ? "bg-[var(--color-primary)] text-white"
                : "bg-[var(--color-neutral-100)] text-[var(--color-neutral-700)]",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>

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
              const payload: AdminCmsItem = {
                ...form,
                id: form.id || `cms-local-${Date.now()}`,
                kind: "banner",
                slot: form.slot ?? "hero",
                updatedAt:
                  form.updatedAt || new Date().toISOString().slice(0, 10),
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
                live ? "بنر بازاریابی ذخیره شد" : "ذخیره شد (mock محلی)",
              );
              window.setTimeout(() => setNotice(null), 2200);
            })();
          }}
        >
          <h3 className="text-sm font-bold">
            {editing ? "ویرایش بنر" : "بنر بازاریابی جدید"}
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
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block space-y-1 text-sm">
              <span className="text-[var(--color-neutral-600)]">جایگاه</span>
              <select
                value={form.slot ?? "hero"}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    slot: e.target.value as AdminCmsSlot,
                  }))
                }
                className="w-full rounded-lg border border-[var(--color-neutral-200)] px-3 py-2"
              >
                {(Object.keys(SLOT_LABELS) as AdminCmsSlot[]).map((s) => (
                  <option key={s} value={s}>
                    {SLOT_LABELS[s]}
                  </option>
                ))}
              </select>
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
                className="w-full rounded-lg border border-[var(--color-neutral-200)] px-3 py-2"
              >
                <option value="published">منتشر</option>
                <option value="draft">پیش‌نویس</option>
              </select>
            </label>
          </div>
          <label className="block space-y-1 text-sm">
            <span className="text-[var(--color-neutral-600)]">آدرس تصویر</span>
            <input
              dir="ltr"
              value={form.imageUrl ?? ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, imageUrl: e.target.value }))
              }
              placeholder="/images/marketings/…"
              className="w-full rounded-lg border border-[var(--color-neutral-200)] px-3 py-2"
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span className="text-[var(--color-neutral-600)]">لینک مقصد</span>
            <input
              dir="ltr"
              value={form.href ?? "/"}
              onChange={(e) =>
                setForm((p) => ({ ...p, href: e.target.value }))
              }
              className="w-full rounded-lg border border-[var(--color-neutral-200)] px-3 py-2"
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span className="text-[var(--color-neutral-600)]">متن جایگزین (alt)</span>
            <input
              value={form.alt ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, alt: e.target.value }))}
              className="w-full rounded-lg border border-[var(--color-neutral-200)] px-3 py-2"
            />
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

      <div className="mt-6">
        <AdminFooterSettings />
      </div>
    </RequireAdmin>
  );
}
