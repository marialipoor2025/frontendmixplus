"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  buildListingQueryString,
} from "@/lib/product-listing";
import { formatPrice } from "@/lib/format";
import type {
  ProductListingFacets,
  ProductListingQuery,
} from "@/types/product-listing";

type ProductListingFiltersProps = {
  basePath: string;
  query: ProductListingQuery;
  facets: ProductListingFacets;
};

export function ProductListingFilters({
  basePath,
  query,
  facets,
}: ProductListingFiltersProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const navigate = (next: ProductListingQuery) => {
    startTransition(() => {
      router.push(`${basePath}${buildListingQueryString(next)}`);
    });
  };

  const toggleBrand = (brand: string) => {
    const brands = query.filters.brands.includes(brand)
      ? query.filters.brands.filter((b) => b !== brand)
      : [...query.filters.brands, brand];
    navigate({
      ...query,
      page: 1,
      filters: { ...query.filters, brands },
    });
  };

  return (
    <aside
      className={`space-y-6 rounded-xl border border-[var(--color-neutral-200)] bg-white p-4 ${
        pending ? "opacity-70" : ""
      }`}
      aria-label="فیلتر محصولات"
    >
      <div>
        <h2 className="mb-3 text-sm font-bold text-[var(--color-neutral-900)]">
          برند
        </h2>
        <ul className="max-h-56 space-y-2 overflow-y-auto">
          {facets.brands.map((brand) => {
            const checked = query.filters.brands.includes(brand.value);
            return (
              <li key={brand.value}>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--color-neutral-700)]">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleBrand(brand.value)}
                    className="size-4 rounded border-[var(--color-neutral-300)]"
                  />
                  <span className="grow truncate">{brand.label}</span>
                  <span className="text-xs text-[var(--color-neutral-400)]">
                    {brand.count}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="border-t border-[var(--color-neutral-100)] pt-4">
        <h2 className="mb-3 text-sm font-bold text-[var(--color-neutral-900)]">
          وضعیت کالا
        </h2>
        <ul className="space-y-2">
          <li>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--color-neutral-700)]">
              <input
                type="radio"
                name="condition"
                checked={!query.filters.condition}
                onChange={() =>
                  navigate({
                    ...query,
                    page: 1,
                    filters: { ...query.filters, condition: undefined },
                  })
                }
                className="size-4"
              />
              <span>همه</span>
            </label>
          </li>
          {facets.conditions.map((item) => (
            <li key={item.value}>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--color-neutral-700)]">
                <input
                  type="radio"
                  name="condition"
                  checked={query.filters.condition === item.value}
                  onChange={() =>
                    navigate({
                      ...query,
                      page: 1,
                      filters: {
                        ...query.filters,
                        condition:
                          item.value === "new" || item.value === "used"
                            ? item.value
                            : undefined,
                      },
                    })
                  }
                  className="size-4"
                />
                <span className="grow">{item.label}</span>
                <span className="text-xs text-[var(--color-neutral-400)]">
                  {item.count}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-[var(--color-neutral-100)] pt-4">
        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-[var(--color-neutral-800)]">
          <input
            type="checkbox"
            checked={query.filters.inStockOnly}
            onChange={(event) =>
              navigate({
                ...query,
                page: 1,
                filters: {
                  ...query.filters,
                  inStockOnly: event.target.checked,
                },
              })
            }
            className="size-4 rounded border-[var(--color-neutral-300)]"
          />
          فقط کالاهای موجود
        </label>
      </div>

      {facets.price.max > 0 ? (
        <div className="border-t border-[var(--color-neutral-100)] pt-4 text-xs text-[var(--color-neutral-500)]">
          بازه قیمت موجود: {formatPrice(facets.price.min)} تا{" "}
          {formatPrice(facets.price.max)} تومان
        </div>
      ) : null}
    </aside>
  );
}
