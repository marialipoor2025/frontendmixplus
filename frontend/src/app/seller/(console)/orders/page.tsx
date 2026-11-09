"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import {
  AdminOutlineButton,
  AdminPageHeader,
  AdminTable,
  StatusPill,
  type AdminColumn,
} from "@/components/admin/AdminUi";
import {
  listSellerOrders,
  type SellerOrderListItem,
} from "@/lib/api/seller";
import { formatPrice } from "@/lib/format";
import { emptyPage, type PagedResult } from "@/types/paging";

export default function SellerOrdersPage() {
  const [result, setResult] =
    useState<PagedResult<SellerOrderListItem>>(emptyPage());
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const load = useCallback(
    async (opts?: { status?: string; page?: number }) => {
      const nextStatus = opts?.status ?? status;
      const nextPage = opts?.page ?? page;
      setLoading(true);
      setError(null);
      try {
        const data = await listSellerOrders({
          status: nextStatus === "all" ? undefined : nextStatus,
          page: nextPage,
          pageSize: 10,
        });
        startTransition(() => {
          setResult(data);
          setPage(data.page);
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "بارگذاری سفارش‌ها ناموفق بود");
      } finally {
        setLoading(false);
      }
    },
    [status, page],
  );

  useEffect(() => {
    void load({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns: AdminColumn<SellerOrderListItem>[] = [
    {
      key: "id",
      header: "شناسه",
      widthClass: "w-[22%]",
      cell: (r) => (
        <span className="text-xs font-medium" dir="ltr">
          {r.id}
        </span>
      ),
    },
    {
      key: "customer",
      header: "مشتری",
      widthClass: "w-[20%]",
      cell: (r) => (
        <span className="block truncate text-xs" title={r.customerName}>
          {r.customerName}
        </span>
      ),
    },
    {
      key: "items",
      header: "اقلام فروشنده",
      widthClass: "w-[12%]",
      nowrap: true,
      cell: (r) => (
        <span className="text-xs tabular-nums">
          {r.itemCount.toLocaleString("fa-IR")}
        </span>
      ),
    },
    {
      key: "total",
      header: "مبلغ سهم فروشنده",
      widthClass: "w-[18%]",
      nowrap: true,
      cell: (r) => (
        <span className="text-xs tabular-nums">{formatPrice(r.sellerTotal)}</span>
      ),
    },
    {
      key: "status",
      header: "وضعیت",
      widthClass: "w-[14%]",
      nowrap: true,
      cell: (r) => <StatusPill tone="muted">{r.status}</StatusPill>,
    },
    {
      key: "created",
      header: "تاریخ",
      widthClass: "w-[14%]",
      nowrap: true,
      cell: (r) => (
        <span className="text-[11px] text-[var(--color-muted)]">{r.createdAt}</span>
      ),
    },
  ];

  return (
    <div className="space-y-4" dir="rtl">
      <AdminPageHeader
        title="سفارش‌ها"
        description="سفارش‌هایی که حداقل یک قلم از فروشگاه شما دارند"
      />

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--color-neutral-200)] bg-white p-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-[var(--color-neutral-200)] bg-white px-3 py-2.5 text-sm"
        >
          <option value="all">همه وضعیت‌ها</option>
          <option value="new">جدید</option>
          <option value="paid">پرداخت‌شده</option>
          <option value="processing">در حال پردازش</option>
          <option value="shipped">ارسال‌شده</option>
          <option value="delivered">تحویل‌شده</option>
          <option value="cancelled">لغو شده</option>
        </select>
        <AdminOutlineButton
          type="button"
          disabled={loading}
          onClick={() => void load({ status, page: 1 })}
        >
          اعمال فیلتر
        </AdminOutlineButton>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="py-10 text-center text-sm text-[var(--color-muted)]">
          در حال بارگذاری سفارش‌ها…
        </p>
      ) : (
        <AdminTable
          columns={columns}
          rows={result.items}
          empty="سفارشی یافت نشد"
          paging={{
            page: result.page,
            pageSize: result.pageSize,
            totalCount: result.totalCount,
            totalPages: result.totalPages,
            onPageChange: (next) => void load({ page: next }),
            onPageSizeChange: () => undefined,
          }}
        />
      )}
    </div>
  );
}
