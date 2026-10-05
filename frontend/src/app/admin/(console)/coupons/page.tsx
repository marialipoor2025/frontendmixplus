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
  deleteAdminCoupon,
  listAdminCoupons,
  upsertAdminCoupon,
} from "@/lib/api/coupons";
import { siteConfig } from "@/config/site";
import { mockAdminCoupons } from "@/lib/mocks/admin";
import type { AdminCoupon } from "@/types/admin";
import { paginateLocal } from "@/types/paging";

const empty: AdminCoupon = {
  id: "",
  code: "",
  discount: "",
  usage: 0,
  limit: 100,
  status: "active",
};

export default function AdminCouponsPage() {
  const [rows, setRows] = useState(mockAdminCoupons);
  const [source, setSource] = useState<"mock" | "api">(
    siteConfig.useMocks || !siteConfig.apiBaseUrl ? "mock" : "api",
  );
  const [editing, setEditing] = useState<AdminCoupon | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<AdminCoupon>(empty);
  const [notice, setNotice] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const live = await listAdminCoupons();
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

  const columns: AdminColumn<AdminCoupon>[] = [
    {
      key: "code",
      header: "کد",
      cell: (r) => <span dir="ltr">{r.code}</span>,
    },
    { key: "discount", header: "تخفیف", cell: (r) => r.discount },
    {
      key: "usage",
      header: "مصرف",
      cell: (r) => `${r.usage} / ${r.limit}`,
    },
    {
      key: "status",
      header: "وضعیت",
      cell: (r) => (
        <StatusPill tone={r.status === "active" ? "success" : "muted"}>
          {r.status === "active" ? "فعال" : "منقضی"}
        </StatusPill>
      ),
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
              const live = await deleteAdminCoupon(r.id);
              setRows((prev) => prev.filter((x) => x.id !== r.id));
              setNotice(live ? "کوپن حذف شد" : "کوپن حذف شد (mock)");
              window.setTimeout(() => setNotice(null), 2000);
            })();
          }}
        />
      ),
    },
  ];

  return (
    <RequireAdmin permission="coupons:manage">
      <AdminPageHeader
        title="مدیریت کوپن‌ها"
        description={
          source === "api"
            ? "کوپن‌ها از Promotions API"
            : "کدهای تخفیف (mock)"
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
              کوپن جدید
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
                id: form.id || `cp-local-${Date.now()}`,
              };
              const live = await upsertAdminCoupon(payload);
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
                live ? "کوپن ذخیره شد" : "کوپن ذخیره شد (mock محلی)",
              );
              window.setTimeout(() => setNotice(null), 2200);
            })();
          }}
        >
          <h3 className="text-sm font-bold">
            {editing ? "ویرایش کوپن" : "کوپن جدید"}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block space-y-1 text-sm">
              <span className="text-[var(--color-neutral-600)]">کد</span>
              <input
                required
                dir="ltr"
                value={form.code}
                onChange={(e) =>
                  setForm((p) => ({ ...p, code: e.target.value }))
                }
                className="w-full rounded-lg border border-[var(--color-neutral-200)] px-3 py-2"
              />
            </label>
            <label className="block space-y-1 text-sm">
              <span className="text-[var(--color-neutral-600)]">تخفیف</span>
              <input
                required
                value={form.discount}
                onChange={(e) =>
                  setForm((p) => ({ ...p, discount: e.target.value }))
                }
                className="w-full rounded-lg border border-[var(--color-neutral-200)] px-3 py-2"
                placeholder="۱۰٪ یا ۵۰٬۰۰۰ تومان"
              />
            </label>
            <label className="block space-y-1 text-sm">
              <span className="text-[var(--color-neutral-600)]">سقف مصرف</span>
              <input
                type="number"
                min={0}
                value={form.limit || ""}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    limit: Number(e.target.value) || 0,
                  }))
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
                    status: e.target.value as AdminCoupon["status"],
                  }))
                }
                className="w-full rounded-lg border border-[var(--color-neutral-200)] px-3 py-2"
              >
                <option value="active">فعال</option>
                <option value="expired">منقضی</option>
              </select>
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
