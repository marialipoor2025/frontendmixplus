"use client";

import { useRouter } from "next/navigation";
import {
  useEffect,
  useId,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
} from "@/components/layout/icons";
import { formatPrice } from "@/lib/format";
import { buildListingQueryString } from "@/lib/product-listing";
import type {
  ProductListingFacets,
  ProductListingQuery,
} from "@/types/product-listing";

type AccordionId = "price" | "brand" | "condition";

type ProductListingFiltersProps = {
  basePath: string;
  query: ProductListingQuery;
  facets: ProductListingFacets;
  /** Extra classes on the outer aside. */
  className?: string;
};

export function countActiveFilters(query: ProductListingQuery) {
  const { filters } = query;
  let count = filters.brands.length;
  if (filters.inStockOnly) count += 1;
  if (filters.condition) count += 1;
  if (filters.minPrice != null || filters.maxPrice != null) count += 1;
  return count;
}

function hasActiveFilters(query: ProductListingQuery) {
  return countActiveFilters(query) > 0;
}

function FilterSwitch({
  id,
  checked,
  onChange,
  disabled,
}: {
  id: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative ms-4 inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full border transition-colors ${
        checked
          ? "border-[var(--color-primary-500)] bg-[var(--color-primary-500)]"
          : "border-[var(--color-neutral-400)] bg-[var(--color-neutral-400)]"
      } ${disabled ? "opacity-60" : ""}`}
    >
      <span
        className={`pointer-events-none absolute top-0.5 size-5 rounded-full bg-white shadow transition-[inset-inline-start] ${
          checked ? "start-[1.125rem]" : "start-0.5"
        }`}
      />
    </button>
  );
}

function AccordionRow({
  title,
  open,
  onToggle,
  children,
  bordered = true,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children?: ReactNode;
  bordered?: boolean;
}) {
  return (
    <div className="w-full px-5">
      <div className="w-full cursor-pointer">
        <div
          className={`relative flex w-full flex-col items-start py-3 ${
            bordered ? "border-b border-[var(--color-neutral-200)]" : ""
          }`}
        >
          <button
            type="button"
            className="flex w-full items-center justify-between text-start"
            aria-expanded={open}
            onClick={onToggle}
          >
            <span className="flex items-center text-sm font-bold text-[var(--color-neutral-700)]">
              {title}
            </span>
            <span className="flex text-[var(--color-icon-high-emphasis,#424750)] lg:hidden">
              <ChevronLeftIcon size={24} className="text-current" />
            </span>
            <span
              className={`hidden text-[var(--color-neutral-400)] lg:inline-flex ${
                open ? "rotate-180" : ""
              } transition-transform`}
            >
              <ChevronDownIcon size={24} className="text-current" />
            </span>
          </button>
          {open && children ? (
            <div className="mt-3 w-full pb-1">{children}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function ProductListingFilters({
  basePath,
  query,
  facets,
  className = "",
}: ProductListingFiltersProps) {
  const router = useRouter();
  const switchId = useId();
  const [pending, startTransition] = useTransition();
  const [openSections, setOpenSections] = useState<
    Partial<Record<AccordionId, boolean>>
  >({
    brand: query.filters.brands.length > 0,
    price:
      query.filters.minPrice != null || query.filters.maxPrice != null,
    condition: Boolean(query.filters.condition),
  });
  const [minDraft, setMinDraft] = useState(
    query.filters.minPrice != null ? String(query.filters.minPrice) : "",
  );
  const [maxDraft, setMaxDraft] = useState(
    query.filters.maxPrice != null ? String(query.filters.maxPrice) : "",
  );

  useEffect(() => {
    setMinDraft(
      query.filters.minPrice != null ? String(query.filters.minPrice) : "",
    );
    setMaxDraft(
      query.filters.maxPrice != null ? String(query.filters.maxPrice) : "",
    );
  }, [query.filters.minPrice, query.filters.maxPrice]);

  const active = hasActiveFilters(query);

  const navigate = (next: ProductListingQuery) => {
    startTransition(() => {
      router.push(`${basePath}${buildListingQueryString(next)}`);
    });
  };

  const toggleSection = (id: AccordionId) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const clearFilters = () => {
    setMinDraft("");
    setMaxDraft("");
    navigate({
      ...query,
      page: 1,
      filters: {
        brands: [],
        inStockOnly: false,
        condition: undefined,
        minPrice: undefined,
        maxPrice: undefined,
      },
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

  const applyPrice = () => {
    const minRaw = minDraft.trim();
    const maxRaw = maxDraft.trim();
    const minPrice = minRaw ? Number(minRaw.replace(/,/g, "")) : undefined;
    const maxPrice = maxRaw ? Number(maxRaw.replace(/,/g, "")) : undefined;
    navigate({
      ...query,
      page: 1,
      filters: {
        ...query.filters,
        minPrice:
          minPrice != null && Number.isFinite(minPrice) ? minPrice : undefined,
        maxPrice:
          maxPrice != null && Number.isFinite(maxPrice) ? maxPrice : undefined,
      },
    });
  };

  return (
    <aside
      className={`w-full rounded-lg border border-[var(--color-neutral-200)] bg-[var(--color-neutral-000,#fff)] ${
        pending ? "opacity-70" : ""
      } ${className}`}
      aria-label="فیلتر محصولات"
    >
      <div className="w-full px-5 py-4 text-base">
        <div className="flex w-full items-center justify-start">
          <div className="grow font-bold text-[var(--color-neutral-700)]">
            فیلترها
          </div>
          <button
            type="button"
            onClick={clearFilters}
            disabled={!active || pending}
            className={`cursor-pointer text-sm ${
              active
                ? "text-[var(--color-secondary-500)]"
                : "cursor-default text-[var(--color-neutral-300)]"
            }`}
          >
            حذف فیلتر‌ها
          </button>
        </div>
      </div>

      <AccordionRow
        title="محدوده قیمت"
        open={Boolean(openSections.price)}
        onToggle={() => toggleSection("price")}
      >
        <div className="space-y-3 text-xs text-[var(--color-neutral-500)]">
          {facets.price.max > 0 ? (
            <p>
              از {formatPrice(facets.price.min)} تا{" "}
              {formatPrice(facets.price.max)} تومان
            </p>
          ) : null}
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              placeholder="حداقل"
              value={minDraft}
              onChange={(e) => setMinDraft(e.target.value)}
              onBlur={applyPrice}
              onKeyDown={(e) => {
                if (e.key === "Enter") applyPrice();
              }}
              className="w-full rounded-md border border-[var(--color-neutral-200)] px-2 py-1.5 text-sm text-[var(--color-neutral-700)] outline-none focus:border-[var(--color-secondary-500)]"
            />
            <span>تا</span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="حداکثر"
              value={maxDraft}
              onChange={(e) => setMaxDraft(e.target.value)}
              onBlur={applyPrice}
              onKeyDown={(e) => {
                if (e.key === "Enter") applyPrice();
              }}
              className="w-full rounded-md border border-[var(--color-neutral-200)] px-2 py-1.5 text-sm text-[var(--color-neutral-700)] outline-none focus:border-[var(--color-secondary-500)]"
            />
          </div>
        </div>
      </AccordionRow>

      <AccordionRow
        title="برند"
        open={Boolean(openSections.brand)}
        onToggle={() => toggleSection("brand")}
      >
        <ul className="max-h-56 space-y-2 overflow-y-auto">
          {facets.brands.length === 0 ? (
            <li className="text-xs text-[var(--color-neutral-400)]">
              برندی برای فیلتر نیست
            </li>
          ) : (
            facets.brands.map((brand) => {
              const checked = query.filters.brands.includes(brand.value);
              return (
                <li key={brand.value}>
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--color-neutral-700)]">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleBrand(brand.value)}
                      className="size-4 rounded border-[var(--color-neutral-300)] accent-[var(--color-primary-500)]"
                    />
                    <span className="grow truncate">{brand.label}</span>
                    <span className="text-xs text-[var(--color-neutral-400)]">
                      {brand.count}
                    </span>
                  </label>
                </li>
              );
            })
          )}
        </ul>
      </AccordionRow>

      <AccordionRow
        title="وضعیت کالا"
        open={Boolean(openSections.condition)}
        onToggle={() => toggleSection("condition")}
      >
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
                className="size-4 accent-[var(--color-primary-500)]"
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
                  className="size-4 accent-[var(--color-primary-500)]"
                />
                <span className="grow">{item.label}</span>
                <span className="text-xs text-[var(--color-neutral-400)]">
                  {item.count}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </AccordionRow>

      <div className="w-full px-5">
        <div className="relative flex w-full flex-col items-start py-3">
          <div className="flex w-full items-center justify-between">
            <label
              htmlFor={`${switchId}-stock`}
              className="flex cursor-pointer items-center text-sm font-bold text-[var(--color-neutral-700)]"
            >
              فقط کالاهای موجود
            </label>
            <FilterSwitch
              id={`${switchId}-stock`}
              checked={query.filters.inStockOnly}
              disabled={pending}
              onChange={(inStockOnly) =>
                navigate({
                  ...query,
                  page: 1,
                  filters: { ...query.filters, inStockOnly },
                })
              }
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
