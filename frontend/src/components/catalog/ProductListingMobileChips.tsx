"use client";

import { useRouter } from "next/navigation";
import {
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { countActiveFilters } from "@/components/catalog/ProductListingFilters";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FilterIcon,
  SortIcon,
} from "@/components/layout/icons";
import { formatPrice } from "@/lib/format";
import {
  PRODUCT_SORT_OPTIONS,
  buildListingQueryString,
} from "@/lib/product-listing";
import type {
  ProductListingFacets,
  ProductListingQuery,
  ProductSort,
} from "@/types/product-listing";

type FilterSection = "price" | "brand" | "condition";
type SheetKind = "sort" | "filters" | null;

type ProductListingMobileChipsProps = {
  basePath: string;
  query: ProductListingQuery;
  facets: ProductListingFacets;
  total: number;
};

function ChipButton({
  children,
  onClick,
  active = false,
  className = "",
  "aria-label": ariaLabel,
}: {
  children: ReactNode;
  onClick: () => void;
  active?: boolean;
  className?: string;
  "aria-label"?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`inline-flex shrink-0 cursor-pointer items-center gap-1 whitespace-nowrap rounded-lg border px-3 py-1 text-xs shadow-none transition-colors ${
        active
          ? "border-transparent text-[var(--color-primary-700,#ef394e)]"
          : "border-[var(--color-neutral-200)] text-[var(--color-neutral-700)]"
      } ${className}`}
    >
      {children}
    </button>
  );
}

function CloseGlyph() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M18.3 5.71 12 12.01 5.7 5.7 4.29 7.11 10.59 13.4 4.29 19.71 5.7 21.12 12 14.82l6.3 6.3 1.41-1.41-6.3-6.3 6.3-6.29z" />
    </svg>
  );
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

function MobileFilterModal({
  open,
  onClose,
  basePath,
  query,
  facets,
  total,
  initialSection,
}: {
  open: boolean;
  onClose: () => void;
  basePath: string;
  query: ProductListingQuery;
  facets: ProductListingFacets;
  total: number;
  initialSection?: FilterSection | null;
}) {
  const router = useRouter();
  const switchId = useId();
  const [pending, startTransition] = useTransition();
  const [section, setSection] = useState<FilterSection | null>(
    initialSection ?? null,
  );
  const [minDraft, setMinDraft] = useState(
    query.filters.minPrice != null ? String(query.filters.minPrice) : "",
  );
  const [maxDraft, setMaxDraft] = useState(
    query.filters.maxPrice != null ? String(query.filters.maxPrice) : "",
  );

  useEffect(() => {
    if (!open) return;
    setSection(initialSection ?? null);
    setMinDraft(
      query.filters.minPrice != null ? String(query.filters.minPrice) : "",
    );
    setMaxDraft(
      query.filters.maxPrice != null ? String(query.filters.maxPrice) : "",
    );
  }, [
    open,
    initialSection,
    query.filters.minPrice,
    query.filters.maxPrice,
  ]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (section) setSection(null);
        else onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, section]);

  if (!open) return null;

  const active = countActiveFilters(query) > 0;

  const navigate = (next: ProductListingQuery) => {
    startTransition(() => {
      router.push(`${basePath}${buildListingQueryString(next)}`);
    });
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

  const sectionTitle =
    section === "price"
      ? "محدوده قیمت"
      : section === "brand"
        ? "برند"
        : section === "condition"
          ? "وضعیت کالا"
          : "فیلترها";

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col bg-white lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="فیلترها"
    >
      <div className="flex shrink-0 items-center justify-between px-5 pb-4 pt-4">
        <button
          type="button"
          onClick={() => {
            if (section) setSection(null);
            else onClose();
          }}
          className="flex text-[var(--color-icon-high-emphasis,#424750)]"
          aria-label={section ? "بازگشت" : "بستن"}
        >
          {section ? (
            <ChevronRightIcon size={24} className="text-current" />
          ) : (
            <CloseGlyph />
          )}
        </button>
        <div className="grow text-base font-bold text-[var(--color-neutral-800)]">
          {sectionTitle}
        </div>
      </div>

      <div
        className={`min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 ${
          pending ? "opacity-70" : ""
        }`}
        style={{ paddingBottom: 88 }}
      >
        {!section ? (
          <div className="py-0">
            {(
              [
                { id: "price" as const, label: "محدوده قیمت" },
                { id: "brand" as const, label: "برند" },
                { id: "condition" as const, label: "وضعیت کالا" },
              ] as const
            ).map((row) => (
              <button
                key={row.id}
                type="button"
                onClick={() => setSection(row.id)}
                className="flex w-full cursor-pointer items-center justify-between border-b border-[var(--color-neutral-200)] py-3 text-start"
              >
                <span className="text-sm font-bold text-[var(--color-neutral-700)]">
                  {row.label}
                </span>
                <ChevronLeftIcon
                  size={24}
                  className="text-[var(--color-icon-high-emphasis,#424750)]"
                />
              </button>
            ))}

            <div className="flex w-full items-center justify-between border-b border-[var(--color-neutral-200)] py-3">
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
        ) : null}

        {section === "price" ? (
          <div className="space-y-3 py-2 text-xs text-[var(--color-neutral-500)]">
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
                className="w-full rounded-md border border-[var(--color-neutral-200)] px-2 py-2 text-sm text-[var(--color-neutral-700)] outline-none focus:border-[var(--color-secondary-500)]"
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
                className="w-full rounded-md border border-[var(--color-neutral-200)] px-2 py-2 text-sm text-[var(--color-neutral-700)] outline-none focus:border-[var(--color-secondary-500)]"
              />
            </div>
          </div>
        ) : null}

        {section === "brand" ? (
          <ul className="space-y-2 py-2">
            {facets.brands.length === 0 ? (
              <li className="text-xs text-[var(--color-neutral-400)]">
                برندی برای فیلتر نیست
              </li>
            ) : (
              facets.brands.map((brand) => {
                const checked = query.filters.brands.includes(brand.value);
                return (
                  <li key={brand.value}>
                    <label className="flex cursor-pointer items-center gap-2 py-1.5 text-sm text-[var(--color-neutral-700)]">
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
        ) : null}

        {section === "condition" ? (
          <ul className="space-y-2 py-2">
            <li>
              <label className="flex cursor-pointer items-center gap-2 py-1.5 text-sm text-[var(--color-neutral-700)]">
                <input
                  type="radio"
                  name="mobile-condition"
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
                <label className="flex cursor-pointer items-center gap-2 py-1.5 text-sm text-[var(--color-neutral-700)]">
                  <input
                    type="radio"
                    name="mobile-condition"
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
        ) : null}
      </div>

      {!section ? (
        <div className="fixed inset-x-0 bottom-0 z-[1] bg-white px-5 py-4 shadow-[0_-1px_0_0_var(--color-neutral-200),0_-8px_8px_0_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex flex-1 items-center justify-center rounded-lg bg-[var(--color-primary-500,#ef4056)] px-3 py-2.5 text-sm font-bold text-white"
            >
              مشاهده {total.toLocaleString("fa-IR")} کالا
            </button>
            <button
              type="button"
              onClick={clearFilters}
              disabled={!active || pending}
              className={`shrink-0 px-2 text-sm font-bold ${
                active
                  ? "text-[var(--color-primary-500,#ef4056)]"
                  : "cursor-default text-[var(--color-neutral-300)]"
              }`}
            >
              حذف فیلتر
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function ProductListingMobileChips({
  basePath,
  query,
  facets,
  total,
}: ProductListingMobileChipsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [sheet, setSheet] = useState<SheetKind>(null);
  const [filterSection, setFilterSection] = useState<FilterSection | null>(
    null,
  );
  const [mounted, setMounted] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [barHeight, setBarHeight] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(0);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const header = document.querySelector<HTMLElement>("[data-sticky-header]");
    if (!header) return;

    const publish = () => setHeaderHeight(header.offsetHeight);
    publish();
    const ro = new ResizeObserver(publish);
    ro.observe(header);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setPinned(!entry.isIntersecting);
      },
      {
        threshold: 0,
        rootMargin: `-${Math.max(headerHeight, 0)}px 0px 0px 0px`,
      },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [headerHeight]);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    const publish = () => setBarHeight(bar.offsetHeight);
    publish();
    const ro = new ResizeObserver(publish);
    ro.observe(bar);
    return () => ro.disconnect();
  }, []);

  const activeCount = countActiveFilters(query);
  const currentSort =
    PRODUCT_SORT_OPTIONS.find((o) => o.value === query.sort) ??
    PRODUCT_SORT_OPTIONS[0];

  const openFilters = (section?: FilterSection) => {
    setFilterSection(section ?? null);
    setSheet("filters");
  };

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
    setSheet(null);
  };

  const toggleInStock = () => {
    startTransition(() => {
      router.push(
        `${basePath}${buildListingQueryString({
          ...query,
          page: 1,
          filters: {
            ...query.filters,
            inStockOnly: !query.filters.inStockOnly,
          },
        })}`,
      );
    });
  };

  const priceActive =
    query.filters.minPrice != null || query.filters.maxPrice != null;
  const brandActive = query.filters.brands.length > 0;
  const conditionActive = Boolean(query.filters.condition);

  const overlays = !mounted
    ? null
    : createPortal(
      <>
        {sheet === "sort" ? (
          <div
            className="fixed inset-0 z-[60] lg:hidden"
            role="dialog"
            aria-modal="true"
          >
            <button
              type="button"
              aria-label="بستن"
              className="absolute inset-0 bg-black/40"
              onClick={() => setSheet(null)}
            />
            <div className="absolute inset-x-0 bottom-0 flex max-h-[70dvh] flex-col rounded-t-xl bg-white shadow-xl">
              <div className="flex shrink-0 items-center justify-between border-b border-[var(--color-neutral-200)] px-4 py-3">
                <h2 className="text-sm font-bold text-[var(--color-neutral-800)]">
                  مرتب‌سازی
                </h2>
                <button
                  type="button"
                  onClick={() => setSheet(null)}
                  className="text-[var(--color-icon-high-emphasis,#424750)]"
                  aria-label="بستن"
                >
                  <CloseGlyph />
                </button>
              </div>
              <ul className="overflow-y-auto py-1">
                {PRODUCT_SORT_OPTIONS.map((option) => {
                  const active = query.sort === option.value;
                  return (
                    <li key={option.value}>
                      <button
                        type="button"
                        onClick={() => setSort(option.value)}
                        className={`flex w-full items-center justify-between px-4 py-3 text-sm ${
                          active
                            ? "font-bold text-[var(--color-primary-700,#ef394e)]"
                            : "text-[var(--color-neutral-700)]"
                        }`}
                      >
                        <span>{option.label}</span>
                        {active ? (
                          <span
                            className="size-2 rounded-full bg-[var(--color-primary-700,#ef394e)]"
                            aria-hidden
                          />
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        ) : null}

        <MobileFilterModal
          open={sheet === "filters"}
          onClose={() => {
            setSheet(null);
            setFilterSection(null);
          }}
          basePath={basePath}
          query={query}
          facets={facets}
          total={total}
          initialSection={filterSection}
        />
      </>,
      document.body,
    );

  return (
    <div className={`lg:hidden ${pending ? "opacity-70" : ""}`}>
      <div ref={sentinelRef} className="h-px w-full" aria-hidden />
      {pinned ? <div style={{ height: barHeight }} aria-hidden /> : null}
      <div
        ref={barRef}
        className={`border-b border-[var(--color-neutral-200)] bg-[var(--color-neutral-000,#fff)] ${
          pinned
            ? "fixed inset-x-0 z-40 shadow-[0_4px_10px_-6px_rgb(0_0_0_/_0.12)]"
            : "-mx-5"
        }`}
        style={pinned ? { top: headerHeight } : undefined}
      >
        <div className="hide-scrollbar flex items-center gap-1 overflow-x-auto overscroll-x-none px-3 pb-2 pt-1">
          <ChipButton onClick={() => setSheet("sort")} aria-label="مرتب‌سازی">
            <span>{currentSort.label}</span>
            <SortIcon className="size-[15px] text-[var(--color-icon-high-emphasis,#424750)]" />
          </ChipButton>

          <div className="relative shrink-0">
            <ChipButton
              onClick={() => openFilters()}
              active={activeCount > 0}
              aria-label="فیلتر"
            >
              <span>فیلتر</span>
              <FilterIcon
                className={`size-[15px] ${
                  activeCount > 0
                    ? "text-[var(--color-icon-primary,#ef4056)]"
                    : "text-[var(--color-icon-high-emphasis,#424750)]"
                }`}
              />
            </ChipButton>
            {activeCount > 0 ? (
              <span className="absolute -top-1 left-0 flex size-5 items-center justify-center rounded-full bg-[var(--color-primary-700,#ef394e)] text-[10px] font-bold text-white">
                {activeCount.toLocaleString("fa-IR")}
              </span>
            ) : null}
          </div>

          <ChipButton
            onClick={() => openFilters("price")}
            active={priceActive}
          >
            <span>محدوده قیمت</span>
            <ChevronDownIcon
              size={15}
              className="text-[var(--color-icon-high-emphasis,#424750)]"
            />
          </ChipButton>

          <ChipButton
            onClick={() => openFilters("brand")}
            active={brandActive}
          >
            <span>برند</span>
            <ChevronDownIcon
              size={15}
              className="text-[var(--color-icon-high-emphasis,#424750)]"
            />
          </ChipButton>

          <ChipButton
            onClick={() => openFilters("condition")}
            active={conditionActive}
          >
            <span>وضعیت کالا</span>
            <ChevronDownIcon
              size={15}
              className="text-[var(--color-icon-high-emphasis,#424750)]"
            />
          </ChipButton>

          <ChipButton
            onClick={toggleInStock}
            active={query.filters.inStockOnly}
          >
            <span>فقط کالاهای موجود</span>
          </ChipButton>
        </div>
      </div>

      {overlays}
    </div>
  );
}
