"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AdminButton,
  AdminOutlineButton,
  AdminPageHeader,
  AdminTable,
  RowActions,
  StatusPill,
  priceCell,
  type AdminColumn,
} from "@/components/admin/AdminUi";
import { RequireAdmin } from "@/components/admin/RequireAdmin";
import {
  createAdminOrder,
  listAdminOrders,
  setAdminOrderStatus,
} from "@/lib/api/orders";
import { siteConfig } from "@/config/site";
import { mockAdminOrders } from "@/lib/mocks/admin";
import type { AdminOrder } from "@/types/admin";
import { paginateLocal } from "@/types/paging";

const statusMap: Record<
  AdminOrder["status"],
  { label: string; tone: "info" | "warn" | "success" | "muted" | "danger" }
> = {
  new: { label: "جدید", tone: "info" },
  processing: { label: "در حال پردازش", tone: "warn" },
  shipped: { label: "ارسال‌شده", tone: "success" },
  delivered: { label: "تحویل‌شده", tone: "success" },
  cancelled: { label: "لغو", tone: "danger" },
};

const nextStatus = (status: AdminOrder["status"]): AdminOrder["status"] => {
  if (status === "new") return "processing";
  if (status === "processing") return "shipped";
  if (status === "shipped") return "delivered";
  if (status === "delivered") return "cancelled";
  return "new";
};

export default function AdminOrdersPage() {
  const [rows, setRows] = useState(mockAdminOrders);
  const [source, setSource] = useState<"mock" | "api">(
    siteConfig.useMocks || !siteConfig.apiBaseUrl ? "mock" : "api",
  );
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ customer: "", total: 0 });
  const [notice, setNotice] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const live = await listAdminOrders();
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

  const columns: AdminColumn<AdminOrder>[] = [
    { key: "id", header: "سفارش", cell: (r) => <span dir="ltr">{r.id}</span> },
    { key: "customer", header: "مشتری", cell: (r) => r.customer },
    { key: "total", header: "مبلغ", cell: (r) => priceCell(r.total) },
    {
      key: "status",
      header: "وضعیت",
      cell: (r) => (
        <StatusPill tone={statusMap[r.status].tone}>
          {statusMap[r.status].label}
        </StatusPill>
      ),
    },
    { key: "at", header: "زمان", cell: (r) => r.createdAt },
    {
      key: "actions",
      header: "",
      cell: (r) => (
        <RowActions
          onEdit={() => {
            void (async () => {
              const next = nextStatus(r.status);
              const live = await setAdminOrderStatus(r.id, next);
              setRows((prev) =>
                prev.map((x) =>
                  x.id === r.id ? { ...x, status: live?.status ?? next } : x,
                ),
              );
              setNotice(
                live ? "وضعیت سفارش به‌روز شد" : "وضعیت به‌روز شد (mock)",
              );
              window.setTimeout(() => setNotice(null), 2000);
            })();
          }}
        />
      ),
    },
  ];

  return (
    <RequireAdmin permission="orders:manage">
      <AdminPageHeader
        title="مدیریت سفارش‌ها"
        description={
          source === "api"
            ? "سفارش‌ها از Cart/Orders API"
            : "پردازش، ارسال و پیگیری سفارش‌های مشتریان (mock)"
        }
        actions={
          <>
            <AdminOutlineButton type="button" onClick={() => setCreating(false)}>
              بستن فرم
            </AdminOutlineButton>
            <AdminButton type="button" onClick={() => setCreating(true)}>
              ثبت دستی
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
              const live = await createAdminOrder({
                customer: form.customer,
                total: form.total,
                status: "new",
              });
              if (live) {
                setRows((prev) => [live, ...prev]);
                setNotice("سفارش ثبت شد");
              } else {
                const local: AdminOrder = {
                  id: `MP-${Date.now()}`,
                  customer: form.customer,
                  total: form.total,
                  status: "new",
                  createdAt: new Date().toLocaleString("fa-IR"),
                };
                setRows((prev) => [local, ...prev]);
                setNotice("سفارش ثبت شد (mock)");
              }
              setCreating(false);
              window.setTimeout(() => setNotice(null), 2000);
            })();
          }}
        >
          <h3 className="text-sm font-bold">ثبت سفارش دستی</h3>
          <div className="grid gap-3 sm:grid-cols-2">
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
              <span className="text-[var(--color-neutral-600)]">مبلغ</span>
              <input
                required
                type="number"
                min={0}
                value={form.total || ""}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    total: Number(e.target.value) || 0,
                  }))
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
