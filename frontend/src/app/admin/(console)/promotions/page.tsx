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
  deleteAdminPromotion,
  listAdminPromotions,
  upsertAdminPromotion,
} from "@/lib/api/promotions";
import { siteConfig } from "@/config/site";
import { mockAdminPromotions } from "@/lib/mocks/admin";
import type { AdminPromotion } from "@/types/admin";
import { paginateLocal } from "@/types/paging";

const empty: AdminPromotion = {
  id: "",
  title: "",
  type: "campaign",
  status: "active",
  endsAt: "",
};

export default function AdminPromotionsPage() {
  const [rows, setRows] = useState(mockAdminPromotions);
  const [source, setSource] = useState<"mock" | "api">(
    siteConfig.useMocks || !siteConfig.apiBaseUrl ? "mock" : "api",
  );
  const [editing, setEditing] = useState<AdminPromotion | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<AdminPromotion>(empty);
  const [notice, setNotice] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const live = await listAdminPromotions();
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

  const columns: AdminColumn<AdminPromotion>[] = [
    { key: "title", header: "عنوان", cell: (r) => r.title },
    {
      key: "type",
      header: "نوع",
      cell: (r) =>
        r.type === "campaign"
          ? "کمپین"
          : r.type === "percent"
            ? "درصدی"
            : "مبلغ ثابت",
    },
    {
      key: "status",
      header: "وضعیت",
      cell: (r) => (
        <StatusPill
          tone={
            r.status === "active"
              ? "success"
              : r.status === "scheduled"
                ? "info"
                : "muted"
          }
        >
          {r.status === "active"
            ? "فعال"
            : r.status === "scheduled"
              ? "زمان‌بندی"
              : "پایان‌یافته"}
        </StatusPill>
      ),
    },
    { key: "ends", header: "پایان", cell: (r) => r.endsAt },
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
              const live = await deleteAdminPromotion(r.id);
              setRows((prev) => prev.filter((x) => x.id !== r.id));
              setNotice(
                live ? "پروموشن حذف شد" : "پروموشن حذف شد (mock محلی)",
              );
              window.setTimeout(() => setNotice(null), 2000);
            })();
          }}
        />
      ),
    },
  ];

  return (
    <RequireAdmin permission="promotions:manage">
      <AdminPageHeader
        title="مدیریت پروموشن‌ها"
        description={
          source === "api"
            ? "کمپین‌های شگفت‌انگیز از Promotions API"
            : "تخفیف‌ها و کمپین‌های فروش (mock)"
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
              پروموشن جدید
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
                id: form.id || `pr-local-${Date.now()}`,
                type: "campaign" as const,
              };
              const live = await upsertAdminPromotion(payload);
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
                  ? "پروموشن در Promotions ذخیره شد"
                  : "پروموشن ذخیره شد (mock محلی)",
              );
              window.setTimeout(() => setNotice(null), 2200);
            })();
          }}
        >
          <h3 className="text-sm font-bold">
            {editing ? "ویرایش پروموشن" : "پروموشن جدید"}
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
                  status: e.target.value as AdminPromotion["status"],
                }))
              }
              className="w-full max-w-xs rounded-lg border border-[var(--color-neutral-200)] px-3 py-2"
            >
              <option value="active">فعال</option>
              <option value="scheduled">زمان‌بندی</option>
              <option value="ended">پایان‌یافته</option>
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
