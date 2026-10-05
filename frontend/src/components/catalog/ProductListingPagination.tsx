"use client";

import Link from "next/link";
import { buildListingQueryString } from "@/lib/product-listing";
import type { ProductListingQuery } from "@/types/product-listing";

type ProductListingPaginationProps = {
  basePath: string;
  query: ProductListingQuery;
  pageCount: number;
};

export function ProductListingPagination({
  basePath,
  query,
  pageCount,
}: ProductListingPaginationProps) {
  if (pageCount <= 1) return null;

  const pages = Array.from({ length: pageCount }, (_, i) => i + 1).filter(
    (page) =>
      page === 1 ||
      page === pageCount ||
      Math.abs(page - query.page) <= 1,
  );

  const items: (number | "…")[] = [];
  for (let i = 0; i < pages.length; i++) {
    if (i > 0 && pages[i]! - pages[i - 1]! > 1) items.push("…");
    items.push(pages[i]!);
  }

  return (
    <nav
      className="mt-8 flex flex-wrap items-center justify-center gap-2"
      aria-label="صفحه‌بندی"
    >
      {query.page > 1 ? (
        <Link
          href={`${basePath}${buildListingQueryString({
            ...query,
            page: query.page - 1,
          })}`}
          className="rounded-lg border border-[var(--color-neutral-200)] px-3 py-1.5 text-sm text-[var(--color-neutral-700)] hover:border-[var(--color-primary)]"
        >
          قبلی
        </Link>
      ) : null}

      {items.map((item, index) =>
        item === "…" ? (
          <span
            key={`gap-${index}`}
            className="px-1 text-sm text-[var(--color-neutral-400)]"
          >
            …
          </span>
        ) : (
          <Link
            key={item}
            href={`${basePath}${buildListingQueryString({
              ...query,
              page: item,
            })}`}
            aria-current={item === query.page ? "page" : undefined}
            className={`min-w-9 rounded-lg px-3 py-1.5 text-center text-sm ${
              item === query.page
                ? "bg-[var(--color-primary)] font-bold text-white"
                : "border border-[var(--color-neutral-200)] text-[var(--color-neutral-700)] hover:border-[var(--color-primary)]"
            }`}
          >
            {item.toLocaleString("fa-IR")}
          </Link>
        ),
      )}

      {query.page < pageCount ? (
        <Link
          href={`${basePath}${buildListingQueryString({
            ...query,
            page: query.page + 1,
          })}`}
          className="rounded-lg border border-[var(--color-neutral-200)] px-3 py-1.5 text-sm text-[var(--color-neutral-700)] hover:border-[var(--color-primary)]"
        >
          بعدی
        </Link>
      ) : null}
    </nav>
  );
}
