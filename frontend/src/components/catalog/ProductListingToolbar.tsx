"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  PRODUCT_SORT_OPTIONS,
  buildListingQueryString,
} from "@/lib/product-listing";
import type { ProductListingQuery, ProductSort } from "@/types/product-listing";

type ProductListingToolbarProps = {
  basePath: string;
  query: ProductListingQuery;
  total: number;
};

export function ProductListingToolbar({
  basePath,
  query,
  total,
}: ProductListingToolbarProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div
      className={`mb-4 flex flex-wrap items-center justify-between gap-3 ${
        pending ? "opacity-70" : ""
      }`}
    >
      <p className="text-sm text-[var(--color-neutral-500)]">
        {total.toLocaleString("fa-IR")} کالا
      </p>
      <label className="flex items-center gap-2 text-sm text-[var(--color-neutral-700)]">
        <span className="text-[var(--color-neutral-500)]">مرتب‌سازی:</span>
        <select
          value={query.sort}
          onChange={(event) => {
            const sort = event.target.value as ProductSort;
            startTransition(() => {
              router.push(
                `${basePath}${buildListingQueryString({
                  ...query,
                  sort,
                  page: 1,
                })}`,
              );
            });
          }}
          className="rounded-lg border border-[var(--color-neutral-200)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
        >
          {PRODUCT_SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
