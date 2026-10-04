"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  AdminButton,
  AdminOutlineButton,
  AdminPageHeader,
  AdminTable,
  StatusPill,
  priceCell,
  type AdminColumn,
} from "@/components/admin/AdminUi";
import { RequireAdmin } from "@/components/admin/RequireAdmin";
import {
  listAdminProducts,
  setAdminProductStatus,
} from "@/lib/api/admin/products";
import { formatDiscountPercent } from "@/lib/format";
import type { AdminProduct } from "@/types/admin-product";
import { emptyPage, type PagedResult } from "@/types/paging";

export default function AdminProductsPage() {
  const [result, setResult] = useState<PagedResult<AdminProduct>>(emptyPage());
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(
    async (opts?: {
      q?: string;
      filter?: typeof filter;
      page?: number;
      pageSize?: number;
    }) => {
      const nextQ = opts?.q ?? q;
      const nextFilter = opts?.filter ?? filter;
      const nextPage = opts?.page ?? page;
      const nextSize = opts?.pageSize ?? pageSize;
      setLoading(true);
      setError(null);
      try {
        const data = await listAdminProducts({
          q: nextQ || undefined,
          isPublished:
            nextFilter === "all" ? undefined : nextFilter === "published",
          page: nextPage,
          pageSize: nextSize,
        });
        setResult(data);
        setPage(data.page);
        setPageSize(data.pageSize);
      } catch (err) {
        setError(err instanceof Error ? err.message : "بارگذاری ناموفق بود");
      } finally {
        setLoading(false);
      }
    },
    [q, filter, page, pageSize],
  );

  useEffect(() => {
    void load({ page: 1 });
    // initial load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function togglePublish(product: AdminProduct) {
    setBusyId(product.id);
    setError(null);
    try {
      await setAdminProductStatus(product.id, !product.isPublished);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "تغییر وضعیت ناموفق بود");
    } finally {
      setBusyId(null);
    }
  }

  const columns: AdminColumn<AdminProduct>[] = [
    {
      key: "product",
      header: "محصول",
      widthClass: "w-[34%]",
      cell: (r) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-[var(--color-neutral-50)]">
            <Image
              src={r.imageUrl}
              alt=""
              fill
              className="object-contain p-1"
              sizes="40px"
            />
          </div>
          <div className="min-w-0 flex-1">
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
        </div>
      ),
    },
    {
      key: "brand",
      header: "برند",
      widthClass: "w-[12%]",
      cell: (r) => (
        <span className="block truncate text-xs" title={r.brandName}>
          {r.brandName}
        </span>
      ),
    },
    {
      key: "seller",
      header: "فروشنده",
      widthClass: "w-[14%]",
      cell: (r) => (
        <span className="block truncate text-xs" title={r.sellerName}>
          {r.sellerName}
        </span>
      ),
    },
    {
      key: "price",
      header: "قیمت",
      widthClass: "w-[12%]",
      nowrap: true,
      cell: (r) => (
        <div className="text-xs">
          {priceCell(r.price.amount)}
          {r.discountPercent ? (
            <p className="truncate text-[10px] text-[var(--color-primary)]">
              {formatDiscountPercent(r.discountPercent)}
            </p>
          ) : null}
        </div>
      ),
    },
    {
      key: "stock",
      header: "موجودی",
      widthClass: "w-[9%]",
      nowrap: true,
      cell: (r) => (
        <StatusPill tone={r.inStock ? "success" : "danger"}>
          {r.inStock ? "موجود" : "ناموجود"}
        </StatusPill>
      ),
    },
    {
      key: "status",
      header: "انتشار",
      widthClass: "w-[9%]",
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
      widthClass: "w-[10%]",
      cell: (r) => (
        <div className="flex flex-col gap-1">
          <Link href={`/admin/products/${r.id}`} className="block">
            <AdminOutlineButton type="button" className="w-full">
              ویرایش
            </AdminOutlineButton>
          </Link>
          <AdminOutlineButton
            type="button"
            className="w-full"
            disabled={busyId === r.id}
            onClick={() => void togglePublish(r)}
          >
            {r.isPublished ? "لغو انتشار" : "انتشار"}
          </AdminOutlineButton>
        </div>
      ),
    },
  ];

  return (
    <RequireAdmin permission="products:manage">
      <AdminPageHeader
        title="مدیریت محصولات"
        description="همان فیلدهای کارت محصول صفحه اصلی — ایجاد، ویرایش و انتشار"
        actions={
          <Link href="/admin/products/new">
            <AdminButton type="button">محصول جدید</AdminButton>
          </Link>
        }
      />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void load({ q, filter, page: 1 });
          }}
          placeholder="جستجو عنوان، اسلاگ یا برند…"
          className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--color-neutral-650)] sm:max-w-sm"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm"
        >
          <option value="all">همه</option>
          <option value="published">منتشر شده</option>
          <option value="draft">پیش‌نویس</option>
        </select>
        <AdminOutlineButton
          type="button"
          onClick={() => void load({ q, filter, page: 1 })}
        >
          اعمال فیلتر
        </AdminOutlineButton>
      </div>

      {error ? (
        <p className="mb-3 text-xs font-medium text-[var(--dk-text-error)]">{error}</p>
      ) : null}

      {loading ? (
        <p className="py-10 text-center text-sm text-[var(--color-muted)]">
          در حال بارگذاری محصولات…
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
            onPageSizeChange: (nextSize) =>
              void load({ page: 1, pageSize: nextSize }),
          }}
        />
      )}
    </RequireAdmin>
  );
}
