"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import {
  DigiAlert,
  DigiBadge,
  DigiButton,
  DigiSelect,
  DigiTable,
  type DigiColumn,
} from "@/components/seller/digi/digiUi";
import {
  listSellerOrders,
  type SellerOrderListItem,
} from "@/lib/api/seller";
import { formatPrice } from "@/lib/format";
import { emptyPage, type PagedResult } from "@/types/paging";

function statusTone(
  status: string,
): "success" | "warn" | "muted" | "danger" | "info" {
  const s = status.toLowerCase();
  if (s.includes("deliver") || s.includes("تحویل")) return "success";
  if (s.includes("cancel") || s.includes("لغو")) return "danger";
  if (s.includes("ship") || s.includes("ارسال") || s.includes("process"))
    return "info";
  if (s.includes("paid") || s.includes("new") || s.includes("پرداخت"))
    return "warn";
  return "muted";
}

export default function DigiSellerOrdersPage() {
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
        setError(
          err instanceof Error ? err.message : "بارگذاری سفارش‌ها ناموفق بود",
        );
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

  const columns: DigiColumn<SellerOrderListItem>[] = [
    {
      key: "id",
      header: "کد سفارش",
      widthClass: "w-[22%]",
      cell: (r) => (
        <span className="text-xs font-medium" dir="ltr">
          {r.id}
        </span>
      ),
    },
    {
      key: "customer",
      header: "خریدار",
      widthClass: "w-[18%]",
      cell: (r) => (
        <span className="block truncate text-xs" title={r.customerName}>
          {r.customerName || "—"}
        </span>
      ),
    },
    {
      key: "items",
      header: "تعداد اقلام",
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
        <span className="text-xs tabular-nums">
          {formatPrice(r.sellerTotal)}
        </span>
      ),
    },
    {
      key: "status",
      header: "وضعیت / تعهد ارسال",
      widthClass: "w-[16%]",
      nowrap: true,
      cell: (r) => (
        <DigiBadge tone={statusTone(r.status)}>{r.status}</DigiBadge>
      ),
    },
    {
      key: "created",
      header: "تاریخ",
      widthClass: "w-[14%]",
      nowrap: true,
      cell: (r) => (
        <span className="text-[11px] text-[var(--digi-muted)]">
          {r.createdAt}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4" dir="rtl">
      <div>
        <h1 className="text-[22px] font-bold text-[var(--digi-text-strong)]">
          سفارش‌ها و تعهد ارسال
        </h1>
        <p className="mt-1 text-xs text-[var(--digi-muted)]">
          وضعیت ارسال محموله‌ها و سفارش‌های امروز و قبل
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-[var(--digi-radius)] border border-[var(--digi-border)] bg-white p-3">
        <DigiSelect
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">همه وضعیت‌ها</option>
          <option value="new">جدید</option>
          <option value="paid">پرداخت‌شده</option>
          <option value="processing">در حال پردازش</option>
          <option value="shipped">ارسال‌شده</option>
          <option value="delivered">تحویل‌شده</option>
          <option value="cancelled">لغو شده</option>
        </DigiSelect>
        <DigiButton
          variant="outline"
          disabled={loading}
          onClick={() => void load({ status, page: 1 })}
        >
          اعمال فیلتر
        </DigiButton>
      </div>

      {error ? <DigiAlert>{error}</DigiAlert> : null}

      {loading ? (
        <p className="py-10 text-center text-sm text-[var(--digi-muted)]">
          در حال بارگذاری سفارش‌ها…
        </p>
      ) : (
        <DigiTable
          columns={columns}
          rows={result.items}
          empty="هنوز سفارشی ثبت نشده است"
          emptyDescription="پس از انتشار کالا و اولین خرید، سفارش‌ها اینجا نمایش داده می‌شوند."
          paging={{
            page: result.page,
            pageSize: result.pageSize,
            totalCount: result.totalCount,
            totalPages: result.totalPages,
            onPageChange: (next) => void load({ page: next }),
          }}
        />
      )}
    </div>
  );
}
