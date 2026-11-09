"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, useTransition } from "react";
import {
  AdminOutlineButton,
  AdminPageHeader,
  AdminTable,
  StatusPill,
  type AdminColumn,
} from "@/components/admin/AdminUi";
import {
  listSellerProducts,
  type SellerProductListItem,
} from "@/lib/api/seller";
import { emptyPage, type PagedResult } from "@/types/paging";

export default function SellerInventoryPage() {
  const [result, setResult] =
    useState<PagedResult<SellerProductListItem>>(emptyPage());
  const [stockFilter, setStockFilter] = useState<"all" | "in" | "out">("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const load = useCallback(
    async (opts?: { stockFilter?: "all" | "in" | "out"; page?: number }) => {
      const nextStock = opts?.stockFilter ?? stockFilter;
      const nextPage = opts?.page ?? page;
      setLoading(true);
      setError(null);
      try {
        const data = await listSellerProducts({
          inStock: nextStock === "all" ? undefined : nextStock === "in",
          sortBy: "stock",
          sortDir: "asc",
          page: nextPage,
          pageSize: 10,
        });
        startTransition(() => {
          setResult(data);
          setPage(data.page);
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "بارگذاری موجودی ناموفق بود");
      } finally {
        setLoading(false);
      }
    },
    [stockFilter, page],
  );

  useEffect(() => {
    void load({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns: AdminColumn<SellerProductListItem>[] = [
    {
      key: "product",
      header: "محصول",
      widthClass: "w-[40%]",
      cell: (r) => (
        <div className="min-w-0">
          <p className="truncate text-xs font-medium" title={r.title}>
            {r.title}
          </p>
          <p className="truncate text-[10px] text-[var(--color-muted)]" dir="ltr">
            {r.slug}
          </p>
        </div>
      ),
    },
    {
      key: "stock",
      header: "موجودی",
      widthClass: "w-[16%]",
      nowrap: true,
      cell: (r) => (
        <StatusPill tone={r.inStock ? "success" : "danger"}>
          {r.inStock ? "موجود" : "ناموجود"}
        </StatusPill>
      ),
    },
    {
      key: "publish",
      header: "انتشار",
      widthClass: "w-[16%]",
      nowrap: true,
      cell: (r) => (
        <StatusPill tone={r.isPublished ? "success" : "warn"}>
          {r.isPublished ? "منتشر" : "پیش‌نویس"}
        </StatusPill>
      ),
    },
    {
      key: "actions",
      header: "عملیات",
      widthClass: "w-[28%]",
      cell: (r) => (
        <Link href={`/seller/products/${encodeURIComponent(r.id)}/manage`}>
          <AdminOutlineButton type="button" className="w-full">
            ویرایش قیمت و موجودی
          </AdminOutlineButton>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-4" dir="rtl">
      <AdminPageHeader
        title="موجودی و تنوع"
        description="وضعیت موجودی محصولات — تنظیم دقیق از ویزارد قیمت‌گذاری انجام می‌شود"
      />

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--color-neutral-200)] bg-white p-3">
        <select
          value={stockFilter}
          onChange={(e) =>
            setStockFilter(e.target.value as "all" | "in" | "out")
          }
          className="rounded-lg border border-[var(--color-neutral-200)] bg-white px-3 py-2.5 text-sm"
        >
          <option value="all">همه</option>
          <option value="in">موجود</option>
          <option value="out">ناموجود</option>
        </select>
        <AdminOutlineButton
          type="button"
          disabled={loading}
          onClick={() => void load({ stockFilter, page: 1 })}
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
          در حال بارگذاری موجودی…
        </p>
      ) : (
        <AdminTable
          columns={columns}
          rows={result.items}
          empty="محصولی یافت نشد"
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
