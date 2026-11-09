"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState, useTransition } from "react";
import {
  DigiAlert,
  DigiBadge,
  DigiButton,
  DigiSearchInput,
  DigiSelect,
  DigiTable,
  digiPriceCell,
  type DigiColumn,
} from "@/components/seller/digi/digiUi";
import {
  listSellerProducts,
  type SellerProductListItem,
} from "@/lib/api/seller";
import { emptyPage, type PagedResult } from "@/types/paging";

export default function DigiSellerInventoryPage() {
  const [result, setResult] =
    useState<PagedResult<SellerProductListItem>>(emptyPage());
  const [q, setQ] = useState("");
  const [stockFilter, setStockFilter] = useState<"all" | "in" | "out">("out");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const load = useCallback(
    async (opts?: {
      q?: string;
      stockFilter?: "all" | "in" | "out";
      page?: number;
    }) => {
      const nextQ = opts?.q ?? q;
      const nextStock = opts?.stockFilter ?? stockFilter;
      const nextPage = opts?.page ?? page;
      setLoading(true);
      setError(null);
      try {
        const data = await listSellerProducts({
          q: nextQ.trim() || undefined,
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
    [q, stockFilter, page],
  );

  useEffect(() => {
    void load({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns: DigiColumn<SellerProductListItem>[] = [
    {
      key: "product",
      header: "کالا / تنوع",
      widthClass: "w-[38%]",
      cell: (r) => (
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative size-11 shrink-0 overflow-hidden rounded-lg border border-[var(--digi-border)] bg-[var(--digi-bg)]">
            {r.imageUrl ? (
              <Image
                src={r.imageUrl}
                alt=""
                fill
                className="object-cover"
                sizes="44px"
                unoptimized
              />
            ) : null}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium" title={r.title}>
              {r.title}
            </p>
            <p
              className="truncate text-[10px] text-[var(--digi-muted)]"
              dir="ltr"
            >
              {r.slug}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "price",
      header: "قیمت فروش",
      widthClass: "w-[14%]",
      nowrap: true,
      cell: (r) => (
        <div className="text-xs">{digiPriceCell(r.price?.amount ?? 0)}</div>
      ),
    },
    {
      key: "stock",
      header: "موجودی",
      widthClass: "w-[14%]",
      nowrap: true,
      cell: (r) => (
        <DigiBadge tone={r.inStock ? "success" : "danger"}>
          {r.inStock ? "موجود" : "ناموجود"}
        </DigiBadge>
      ),
    },
    {
      key: "publish",
      header: "نمایش در سایت",
      widthClass: "w-[14%]",
      nowrap: true,
      cell: (r) => (
        <DigiBadge tone={r.isPublished ? "success" : "warn"}>
          {r.isPublished ? "فعال" : "غیرفعال"}
        </DigiBadge>
      ),
    },
    {
      key: "actions",
      header: "عملیات",
      widthClass: "w-[20%]",
      cell: (r) => (
        <Link
          href={`/seller/digi/products/${encodeURIComponent(r.id)}/manage?step=pricing`}
        >
          <DigiButton variant="outline" className="w-full !py-1.5 text-xs">
            ویرایش قیمت و موجودی
          </DigiButton>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold text-[var(--digi-text-strong)]">
            مدیریت تنوع و قیمت‌گذاری
          </h1>
          <p className="mt-1 text-xs text-[var(--digi-muted)]">
            موجودی تنوع‌ها · در حال اتمام و ناموجود
          </p>
        </div>
        <Link href="/seller/digi/products/create/initial">
          <DigiButton>جستجو و ثبت کالا</DigiButton>
        </Link>
      </div>

      <div className="flex flex-col gap-2 rounded-[var(--digi-radius)] border border-[var(--digi-border)] bg-white p-3 sm:flex-row sm:flex-wrap sm:items-center">
        <DigiSearchInput
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void load({ q, stockFilter, page: 1 });
          }}
          placeholder="جستجوی کالا…"
        />
        <DigiSelect
          value={stockFilter}
          onChange={(e) =>
            setStockFilter(e.target.value as "all" | "in" | "out")
          }
        >
          <option value="out">فقط ناموجود</option>
          <option value="in">فقط موجود</option>
          <option value="all">همه</option>
        </DigiSelect>
        <DigiButton
          variant="outline"
          disabled={loading}
          onClick={() => void load({ q, stockFilter, page: 1 })}
        >
          اعمال فیلتر
        </DigiButton>
      </div>

      {error ? <DigiAlert>{error}</DigiAlert> : null}

      {loading ? (
        <p className="py-10 text-center text-sm text-[var(--digi-muted)]">
          در حال بارگذاری موجودی…
        </p>
      ) : (
        <DigiTable
          columns={columns}
          rows={result.items}
          empty="کالایی با این فیلتر یافت نشد"
          emptyDescription="اگر هنوز کالا ثبت نکرده‌اید، از ثبت کالای جدید شروع کنید."
          emptyAction={
            <Link href="/seller/digi/products/create/initial">
              <DigiButton>ثبت کالای جدید</DigiButton>
            </Link>
          }
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
