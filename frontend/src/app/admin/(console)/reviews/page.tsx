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
  createAdminReview,
  listAdminReviews,
  setAdminReviewStatus,
} from "@/lib/api/reviews";
import { siteConfig } from "@/config/site";
import { mockAdminReviews } from "@/lib/mocks/admin";
import type { AdminReview } from "@/types/admin";
import { paginateLocal } from "@/types/paging";

export default function AdminReviewsPage() {
  const [rows, setRows] = useState(mockAdminReviews);
  const [source, setSource] = useState<"mock" | "api">(
    siteConfig.useMocks || !siteConfig.apiBaseUrl ? "mock" : "api",
  );
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    product: "",
    customer: "",
    rating: 5,
    excerpt: "",
  });
  const [notice, setNotice] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const live = await listAdminReviews();
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

  const columns: AdminColumn<AdminReview>[] = [
    { key: "product", header: "محصول", cell: (r) => r.product },
    { key: "customer", header: "مشتری", cell: (r) => r.customer },
    { key: "rating", header: "امتیاز", cell: (r) => r.rating },
    { key: "excerpt", header: "خلاصه", cell: (r) => r.excerpt },
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
          {r.status === "approved"
            ? "تأیید"
            : r.status === "pending"
              ? "در انتظار"
              : "رد"}
        </StatusPill>
      ),
    },
    {
      key: "actions",
      header: "",
      cell: (r) => (
        <RowActions
          onEdit={() => {
            void (async () => {
              const next =
                r.status === "pending"
                  ? "approved"
                  : r.status === "approved"
                    ? "rejected"
                    : "pending";
              const live = await setAdminReviewStatus(r.id, next);
              setRows((prev) =>
                prev.map((x) =>
                  x.id === r.id ? { ...x, status: live?.status ?? next } : x,
                ),
              );
              setNotice(live ? "وضعیت نظر به‌روز شد" : "وضعیت به‌روز شد (mock)");
              window.setTimeout(() => setNotice(null), 2000);
            })();
          }}
        />
      ),
    },
  ];

  return (
    <RequireAdmin permission="reviews:moderate">
      <AdminPageHeader
        title="نظارت بر نظرات"
        description={
          source === "api"
            ? "تأیید و رد نظرات از Catalog"
            : "تأیید، رد و پایش نظرات مشتریان (mock)"
        }
        actions={
          <>
            <AdminOutlineButton
              type="button"
              onClick={() => setCreating(false)}
            >
              بستن فرم
            </AdminOutlineButton>
            <AdminButton type="button" onClick={() => setCreating(true)}>
              نظر نمونه
            </AdminButton>
          </>
        }
      />

      {notice ? (
        <p className="mb-3 rounded-lg bg-[var(--color-primary-soft)] px-3 py-2 text-sm text-[var(--color-primary)]">
          {notice}
        </p>
      ) : null}

      {creating ? (
        <form
          className="mb-4 space-y-3 rounded-xl border border-[var(--color-neutral-200)] bg-white p-4"
          onSubmit={(e) => {
            e.preventDefault();
            void (async () => {
              const live = await createAdminReview({
                ...form,
                status: "pending",
              });
              if (live) {
                setRows((prev) => [live, ...prev]);
                setNotice("نظر ثبت شد");
              } else {
                const local: AdminReview = {
                  id: `r-${Date.now()}`,
                  ...form,
                  status: "pending",
                };
                setRows((prev) => [local, ...prev]);
                setNotice("نظر ثبت شد (mock)");
              }
              setCreating(false);
              window.setTimeout(() => setNotice(null), 2000);
            })();
          }}
        >
          <h3 className="text-sm font-bold">ثبت نظر</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block space-y-1 text-sm">
              <span className="text-[var(--color-neutral-600)]">محصول</span>
              <input
                required
                value={form.product}
                onChange={(e) =>
                  setForm((p) => ({ ...p, product: e.target.value }))
                }
                className="w-full rounded-lg border border-[var(--color-neutral-200)] px-3 py-2"
              />
            </label>
            <label className="block space-y-1 text-sm">
              <span className="text-[var(--color-neutral-600)]">مشتری</span>
              <input
                required
                value={form.customer}
                onChange={(e) =>
                  setForm((p) => ({ ...p, customer: e.target.value }))
                }
                className="w-full rounded-lg border border-[var(--color-neutral-200)] px-3 py-2"
              />
            </label>
            <label className="block space-y-1 text-sm">
              <span className="text-[var(--color-neutral-600)]">امتیاز</span>
              <input
                type="number"
                min={1}
                max={5}
                value={form.rating}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    rating: Number(e.target.value) || 5,
                  }))
                }
                className="w-full rounded-lg border border-[var(--color-neutral-200)] px-3 py-2"
              />
            </label>
            <label className="block space-y-1 text-sm sm:col-span-2">
              <span className="text-[var(--color-neutral-600)]">خلاصه</span>
              <input
                required
                value={form.excerpt}
                onChange={(e) =>
                  setForm((p) => ({ ...p, excerpt: e.target.value }))
                }
                className="w-full rounded-lg border border-[var(--color-neutral-200)] px-3 py-2"
              />
            </label>
          </div>
          <div className="flex gap-2">
            <AdminButton type="submit">ذخیره</AdminButton>
            <AdminOutlineButton type="button" onClick={() => setCreating(false)}>
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
