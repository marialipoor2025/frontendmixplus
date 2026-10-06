"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, useTransition } from "react";
import {
  AdminOutlineButton,
  AdminTable,
  StatusPill,
  priceCell,
  type AdminColumn,
} from "@/components/admin/AdminUi";
import {
  getSellerMe,
  listSellerProducts,
  type SellerProductListItem,
  type SellerProductSortBy,
} from "@/lib/api/seller";
import { emptyPage, type PagedResult } from "@/types/paging";

type PublishFilter = "all" | "published" | "draft";
type StockFilter = "all" | "in" | "out";

function SortHeader({
  label,
  column,
  sortBy,
  sortDir,
  onSort,
  disabled,
}: {
  label: string;
  column: SellerProductSortBy;
  sortBy: SellerProductSortBy;
  sortDir: "asc" | "desc";
  onSort: (column: SellerProductSortBy) => void;
  disabled?: boolean;
}) {
  const active = sortBy === column;
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onSort(column);
      }}
      className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-muted)] hover:text-[var(--color-neutral-800)] disabled:opacity-60"
    >
      {label}
      <span className="text-[10px] tabular-nums" aria-hidden>
        {active ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
      </span>
    </button>
  );
}

export default function SellerDashboardPage() {
  const [shopName, setShopName] = useState("");
  const [result, setResult] =
    useState<PagedResult<SellerProductListItem>>(emptyPage());
  const [q, setQ] = useState("");
  const [publishFilter, setPublishFilter] = useState<PublishFilter>("all");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [sortBy, setSortBy] = useState<SellerProductSortBy>("title");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const load = useCallback(
    async (opts?: {
      q?: string;
      publishFilter?: PublishFilter;
      stockFilter?: StockFilter;
      sortBy?: SellerProductSortBy;
      sortDir?: "asc" | "desc";
      page?: number;
      pageSize?: number;
      soft?: boolean;
    }) => {
      const nextQ = opts?.q ?? q;
      const nextPublish = opts?.publishFilter ?? publishFilter;
      const nextStock = opts?.stockFilter ?? stockFilter;
      const nextSortBy = opts?.sortBy ?? sortBy;
      const nextSortDir = opts?.sortDir ?? sortDir;
      const nextPage = opts?.page ?? page;
      const nextSize = opts?.pageSize ?? pageSize;
      const soft = opts?.soft ?? !initialLoading;

      if (soft) setRefreshing(true);
      else setInitialLoading(true);
      setError(null);
      try {
        const data = await listSellerProducts({
          q: nextQ.trim() || undefined,
          isPublished:
            nextPublish === "all" ? undefined : nextPublish === "published",
          inStock: nextStock === "all" ? undefined : nextStock === "in",
          sortBy: nextSortBy,
          sortDir: nextSortDir,
          page: nextPage,
          pageSize: nextSize,
        });
        startTransition(() => {
          setResult(data);
          setPage(data.page);
          setPageSize(data.pageSize);
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "بارگذاری ناموفق بود");
      } finally {
        setRefreshing(false);
        setInitialLoading(false);
      }
    },
    [
      q,
      publishFilter,
      stockFilter,
      sortBy,
      sortDir,
      page,
      pageSize,
      initialLoading,
    ],
  );

  useEffect(() => {
    void getSellerMe()
      .then((me) => setShopName(me.name))
      .catch(() => undefined);
    void load({ page: 1, soft: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSort(column: SellerProductSortBy) {
    const nextDir =
      sortBy === column ? (sortDir === "asc" ? "desc" : "asc") : "asc";
    setSortBy(column);
    setSortDir(nextDir);
    void load({ sortBy: column, sortDir: nextDir, page: 1, soft: true });
  }

  const columns: AdminColumn<SellerProductListItem>[] = [
    {
      key: "product",
      header: (
        <SortHeader
          label="محصول"
          column="title"
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={handleSort}
          disabled={refreshing}
        />
      ),
      widthClass: "w-[34%]",
      cell: (r) => (
        <div className="min-w-0">
          <p
            className="truncate text-xs font-medium text-[var(--color-neutral-900)]"
            title={r.title}
          >
            {r.title}
          </p>
          <p
            className="truncate text-[10px] text-[var(--color-muted)]"
            dir="ltr"
            title={r.slug}
          >
            {r.slug}
          </p>
        </div>
      ),
    },
    {
      key: "brand",
      header: "برند",
      widthClass: "w-[14%]",
      cell: (r) => (
        <span className="block truncate text-xs" title={r.brandName}>
          {r.brandName || "—"}
        </span>
      ),
    },
    {
      key: "price",
      header: (
        <SortHeader
          label="قیمت"
          column="price"
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={handleSort}
          disabled={refreshing}
        />
      ),
      widthClass: "w-[12%]",
      nowrap: true,
      cell: (r) => (
        <div className="text-xs">{priceCell(r.price?.amount ?? 0)}</div>
      ),
    },
    {
      key: "media",
      header: (
        <SortHeader
          label="تصاویر"
          column="media"
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={handleSort}
          disabled={refreshing}
        />
      ),
      widthClass: "w-[9%]",
      nowrap: true,
      cell: (r) => (
        <span className="text-xs tabular-nums">
          {(r.mediaCount ?? 0).toLocaleString("fa-IR")}
        </span>
      ),
    },
    {
      key: "stock",
      header: (
        <SortHeader
          label="موجودی"
          column="stock"
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={handleSort}
          disabled={refreshing}
        />
      ),
      widthClass: "w-[10%]",
      nowrap: true,
      cell: (r) => (
        <StatusPill tone={r.inStock ? "success" : "danger"}>
          {r.inStock ? "موجود" : "ناموجود"}
        </StatusPill>
      ),
    },
    {
      key: "status",
      header: (
        <SortHeader
          label="انتشار"
          column="status"
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={handleSort}
          disabled={refreshing}
        />
      ),
      widthClass: "w-[10%]",
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
      widthClass: "w-[11%]",
      cell: (r) => (
        <Link
          href={`/seller/products/${encodeURIComponent(r.id)}/manage`}
          className="block"
        >
          <AdminOutlineButton type="button" className="w-full">
            مدیریت
          </AdminOutlineButton>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-[var(--color-neutral-900)]">
            مدیریت محصولات
          </h1>
          <p className="text-sm text-[var(--color-muted)]">
            {shopName
              ? `${shopName} — جستجو، فیلتر و مدیریت محصولات فروشگاه`
              : "جستجو، فیلتر و مدیریت محصولات فروشگاه"}
          </p>
        </div>
        <Link
          href="/seller/products/new"
          className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white"
        >
          + افزودن محصول
        </Link>
      </div>

      <div className="flex flex-col gap-2 rounded-xl border border-[var(--color-neutral-200)] bg-white p-3 sm:flex-row sm:flex-wrap sm:items-center">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              void load({
                q,
                publishFilter,
                stockFilter,
                page: 1,
                soft: true,
              });
            }
          }}
          placeholder="جستجو عنوان، اسلاگ یا برند…"
          className="w-full rounded-lg border border-[var(--color-neutral-200)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)] sm:max-w-xs"
        />
        <select
          value={publishFilter}
          onChange={(e) =>
            setPublishFilter(e.target.value as PublishFilter)
          }
          className="rounded-lg border border-[var(--color-neutral-200)] bg-white px-3 py-2.5 text-sm"
        >
          <option value="all">همه وضعیت‌ها</option>
          <option value="published">منتشر شده</option>
          <option value="draft">پیش‌نویس</option>
        </select>
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value as StockFilter)}
          className="rounded-lg border border-[var(--color-neutral-200)] bg-white px-3 py-2.5 text-sm"
        >
          <option value="all">همه موجودی</option>
          <option value="in">موجود</option>
          <option value="out">ناموجود</option>
        </select>
        <AdminOutlineButton
          type="button"
          disabled={refreshing}
          onClick={() =>
            void load({
              q,
              publishFilter,
              stockFilter,
              page: 1,
              soft: true,
            })
          }
        >
          اعمال فیلتر
        </AdminOutlineButton>
        {refreshing ? (
          <span className="text-xs text-[var(--color-muted)]">به‌روزرسانی…</span>
        ) : null}
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {initialLoading ? (
        <p className="py-10 text-center text-sm text-[var(--color-muted)]">
          در حال بارگذاری محصولات…
        </p>
      ) : (
        <div
          className={
            refreshing ? "opacity-70 transition-opacity" : "transition-opacity"
          }
        >
          <AdminTable
            columns={columns}
            rows={result.items}
            empty="محصولی یافت نشد"
            paging={{
              page: result.page,
              pageSize: result.pageSize,
              totalCount: result.totalCount,
              totalPages: result.totalPages,
              onPageChange: (next) => void load({ page: next, soft: true }),
              onPageSizeChange: (nextSize) =>
                void load({ page: 1, pageSize: nextSize, soft: true }),
            }}
          />
        </div>
      )}
    </div>
  );
}
