"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { SortIcon } from "@/components/layout/icons";
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

  const setSort = (sort: ProductSort) => {
    startTransition(() => {
      router.push(
        `${basePath}${buildListingQueryString({
          ...query,
          sort,
          page: 1,
        })}`,
      );
    });
  };

  return (
    <div
      className={`mb-4 hidden grow flex-row items-center gap-x-4 lg:flex ${
        pending ? "opacity-70" : ""
      }`}
    >
      <div className="flex shrink-0 items-center py-3">
        <div className="ms-2 flex shrink-0 text-[var(--color-icon-high-emphasis,#424750)]">
          <SortIcon className="text-current" />
        </div>
        <p className="cursor-pointer whitespace-nowrap text-sm font-bold text-[var(--color-neutral-700)]">
          <span>مرتب سازی:</span>
        </p>
      </div>

      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-2">
        {PRODUCT_SORT_OPTIONS.map((option) => {
          const active = query.sort === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setSort(option.value)}
              className={`cursor-pointer whitespace-nowrap text-sm transition-colors ${
                active
                  ? "font-bold text-[var(--color-primary-700,#ef394e)]"
                  : "font-normal text-[var(--color-neutral-500)] hover:text-[var(--color-neutral-700)]"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div className="ms-auto hidden shrink-0 xl:block">
        <span className="whitespace-nowrap text-sm text-[var(--color-neutral-500)]">
          {total.toLocaleString("fa-IR")} کالا
        </span>
      </div>
    </div>
  );
}
