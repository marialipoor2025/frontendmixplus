"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState, useTransition } from "react";
import { DigiAlert } from "@/components/seller/digi/digiUi";
import {
  getSellerMe,
  listSellerProducts,
  setSellerProductPublished,
  type SellerProductListItem,
} from "@/lib/api/seller";
import { formatPrice } from "@/lib/format";
import { emptyPage, type PagedResult } from "@/types/paging";

type PublishFilter = "all" | "published" | "draft";
type StockFilter = "all" | "in" | "out";

const FILTER_CHIPS = [
  { id: "categories", label: "گروه اصلی", kind: "option" as const },
  { id: "brands", label: "برند کالا", kind: "option" as const },
  { id: "types", label: "نوع کالا", kind: "option" as const },
  { id: "statuses", label: "وضعیت", kind: "option" as const },
  { id: "colors", label: "رنگ", kind: "option" as const },
  { id: "fake", label: "اصالت کالا", kind: "option" as const },
  { id: "high_selling", label: "پرفروش", kind: "switch" as const },
  { id: "high_demand", label: "پرطرفدار", kind: "switch" as const },
  { id: "low_stock", label: "در حال اتمام موجودی", kind: "switch" as const },
];

function productCode(id: string) {
  const short = id.replace(/-/g, "").slice(0, 8).toUpperCase();
  return `MXP-${short}`;
}

export default function DigiSellerProductsPage() {
  const [shopName, setShopName] = useState("");
  const [result, setResult] =
    useState<PagedResult<SellerProductListItem>>(emptyPage());
  const [q, setQ] = useState("");
  const [publishFilter, setPublishFilter] = useState<PublishFilter>("all");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [switches, setSwitches] = useState<Record<string, boolean>>({});
  const [menuId, setMenuId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draftCount, setDraftCount] = useState(0);
  const [, startTransition] = useTransition();

  const load = useCallback(
    async (opts?: {
      q?: string;
      publishFilter?: PublishFilter;
      stockFilter?: StockFilter;
      page?: number;
      pageSize?: number;
      soft?: boolean;
    }) => {
      const nextQ = opts?.q ?? q;
      const nextPublish = opts?.publishFilter ?? publishFilter;
      const nextStock = opts?.stockFilter ?? stockFilter;
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
          sortBy: "title",
          sortDir: "asc",
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
    [q, publishFilter, stockFilter, page, pageSize, initialLoading],
  );

  useEffect(() => {
    void getSellerMe()
      .then((me) => setShopName(me.name))
      .catch(() => undefined);
    void listSellerProducts({ isPublished: false, page: 1, pageSize: 1 })
      .then((d) => setDraftCount(d.totalCount))
      .catch(() => undefined);
    void load({ page: 1, soft: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function showIncomplete() {
    setPublishFilter("draft");
    void load({ publishFilter: "draft", page: 1, soft: true });
  }

  function toggleSwitch(id: string) {
    setSwitches((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      if (id === "low_stock") {
        const stock: StockFilter = next[id] ? "out" : "all";
        setStockFilter(stock);
        void load({ stockFilter: stock, page: 1, soft: true });
      }
      return next;
    });
  }

  const totalPages = Math.max(result.totalPages, 1);
  const pageButtons = buildPageButtons(page, totalPages);

  return (
    <div className="space-y-3" dir="rtl">
      {draftCount > 0 ? (
        <div className="digi-incomplete-banner">
          <div>
            <p className="text-sm font-bold text-[var(--color-text-heading)]">
              {draftCount.toLocaleString("fa-IR")} کالای تکمیل‌نشده دارید.
            </p>
            <p className="mt-0.5 text-xs text-[var(--color-text-low-emphasis)]">
              این کالاها را ثبت کنید و بفروشید
              {shopName ? ` — ${shopName}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={showIncomplete}
            className="text-sm font-medium text-[var(--color-text-primary)]"
          >
            مشاهده کالاهای تکمیل‌نشده ‹
          </button>
        </div>
      ) : null}

      {error ? <DigiAlert>{error}</DigiAlert> : null}

      <div className="digi-table-card">
        {/* Search — Digikala FormComponentFrame grayOutlined */}
        <section className="bg-white px-4 pt-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void load({ q, page: 1, soft: true });
            }}
          >
            <label className="digi-search-field">
              <SearchIcon />
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="جستجوی کالا"
                className="digi-search-field__input"
              />
            </label>
          </form>
        </section>

        {/* Filter chips row */}
        <section className="sticky top-[var(--authenticated-header-height)] z-10 bg-white">
          <div className="flex items-center gap-2 overflow-x-auto px-4 py-3">
            <button
              type="button"
              className="digi-filter-all shrink-0"
              onClick={() =>
                void load({
                  publishFilter: "all",
                  stockFilter: "all",
                  page: 1,
                  soft: true,
                })
              }
            >
              <FilterIcon />
              همه فیلترها
            </button>

            {FILTER_CHIPS.map((chip) =>
              chip.kind === "switch" ? (
                <button
                  key={chip.id}
                  type="button"
                  className={[
                    "digi-chip shrink-0",
                    switches[chip.id] ? "digi-chip--on" : "",
                  ].join(" ")}
                  onClick={() => toggleSwitch(chip.id)}
                >
                  {chip.label}
                </button>
              ) : (
                <button
                  key={chip.id}
                  type="button"
                  className="digi-chip digi-chip--option shrink-0"
                  onClick={() => {
                    if (chip.id === "statuses") {
                      const next: PublishFilter =
                        publishFilter === "published" ? "draft" : "published";
                      setPublishFilter(next);
                      void load({ publishFilter: next, page: 1, soft: true });
                    }
                  }}
                >
                  <span>{chip.label}</span>
                  <ChevronTiny />
                </button>
              ),
            )}
          </div>
        </section>

        {/* Actions: ثبت کالای جدید + results */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-4">
          <Link
            href="/seller/digi/products/create/initial"
            className="digi-btn-primary"
          >
            <PlusIcon />
            ثبت کالای جدید
          </Link>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div>
              <span className="pl-1 text-[var(--color-text-low-emphasis)]">
                تعداد نتایج:
              </span>
              <span className="font-bold text-[var(--color-text-high-emphasis)]">
                {result.totalCount.toLocaleString("fa-IR")}
              </span>
            </div>
            <span className="digi-pipe" aria-hidden />
            <label className="flex items-center gap-2">
              <span>تعداد نمایش</span>
              <select
                className="digi-pagesize"
                value={pageSize}
                onChange={(e) =>
                  void load({
                    page: 1,
                    pageSize: Number(e.target.value),
                    soft: true,
                  })
                }
              >
                {[10, 20, 50].map((n) => (
                  <option key={n} value={n}>
                    {n.toLocaleString("fa-IR")}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* Table */}
        <section className="overflow-x-auto px-4 pb-4">
          {initialLoading ? (
            <p className="py-12 text-center text-sm text-[var(--color-text-low-emphasis)]">
              در حال بارگذاری کالاها…
            </p>
          ) : result.items.length === 0 ? (
            <div className="rounded-lg border border-[var(--color-neutral-200)] py-14 text-center">
              <p className="text-sm font-bold text-[var(--color-text-heading)]">
                کالایی یافت نشد
              </p>
              <p className="mt-1 text-xs text-[var(--color-text-low-emphasis)]">
                برای شروع، کالای جدید ثبت کنید.
              </p>
              <Link
                href="/seller/digi/products/create/initial"
                className="digi-btn-primary mt-4 inline-flex"
              >
                <PlusIcon />
                ثبت کالای جدید
              </Link>
            </div>
          ) : (
            <div
              className={
                refreshing ? "opacity-70 transition-opacity" : "transition-opacity"
              }
            >
              <div className="digi-product-grid digi-product-grid--head">
                <div />
                <div>عنوان کالا</div>
                <div>وضعیت</div>
                <div>کمیسیون</div>
                <div>قیمت مرجع (ریال)</div>
                <div>نوع قیمت کالا</div>
                <div>کمترین قیمت در MixPlus</div>
                <div>تعداد فروشندگان</div>
                <div>حداقل کالا در سبد</div>
                <div>برچسب محصول</div>
                <div>وضعیت فروش</div>
                <div />
              </div>

              {result.items.map((row) => {
                const sellable = row.isPublished && row.inStock;
                return (
                  <div key={row.id} className="digi-product-row digi-product-grid">
                    <div className="flex items-center">
                      <div className="relative size-[60px] overflow-hidden rounded bg-[var(--color-neutral-100)]">
                        {row.imageUrl ? (
                          <Image
                            src={row.imageUrl}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="60px"
                            unoptimized
                          />
                        ) : null}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/seller/digi/products/${encodeURIComponent(row.id)}/manage`}
                        className="block"
                      >
                        <p
                          className="line-clamp-2 text-sm text-[var(--color-text-high-emphasis)]"
                          title={row.title}
                        >
                          {row.title}
                        </p>
                        <span className="digi-dkp-badge mt-1 inline-block">
                          {productCode(row.id)}
                        </span>
                      </Link>
                    </div>
                    <div className="text-sm">
                      {row.isPublished ? "قابل فروش" : "تکمیل‌نشده"}
                    </div>
                    <div className="text-sm">--</div>
                    <div className="text-sm tabular-nums">
                      {formatPrice(row.price?.amount ?? 0)}
                    </div>
                    <div>
                      <span className="digi-badge-neutral">
                        {row.brandName ? "پیشنهادی" : "چاپ شده"}
                      </span>
                    </div>
                    <div className="text-sm tabular-nums">۰</div>
                    <div className="text-sm tabular-nums">۱</div>
                    <div className="text-sm tabular-nums">۱</div>
                    <div />
                    <div>
                      <span
                        className={
                          sellable ? "digi-badge-success" : "digi-badge-error"
                        }
                      >
                        {sellable ? "قابل‌فروش" : "غیر‌قابل‌فروش"}
                      </span>
                    </div>
                    <div className="relative flex justify-end">
                      <button
                        type="button"
                        className="digi-more-btn"
                        aria-label="عملیات"
                        onClick={() =>
                          setMenuId((prev) => (prev === row.id ? null : row.id))
                        }
                      >
                        <MoreIcon />
                      </button>
                      {menuId === row.id ? (
                        <div className="digi-row-menu">
                          <Link
                            href={`/seller/digi/products/${encodeURIComponent(row.id)}/manage`}
                            className="digi-row-menu__item"
                          >
                            مدیریت کالا
                          </Link>
                          <Link
                            href={`/seller/digi/products/${encodeURIComponent(row.id)}/manage?step=pricing`}
                            className="digi-row-menu__item"
                          >
                            قیمت و موجودی
                          </Link>
                          <button
                            type="button"
                            className="digi-row-menu__item"
                            onClick={() => {
                              void (async () => {
                                try {
                                  await setSellerProductPublished(
                                    row.id,
                                    !row.isPublished,
                                  );
                                  setMenuId(null);
                                  await load({ soft: true });
                                } catch {
                                  setError("تغییر وضعیت انتشار ناموفق بود");
                                }
                              })();
                            }}
                          >
                            {row.isPublished ? "لغو انتشار" : "انتشار در سایت"}
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Pagination */}
        {result.totalPages > 0 ? (
          <div className="mt-2 flex items-center justify-center gap-1 pb-6">
            <button
              type="button"
              className="digi-page-btn"
              disabled={page <= 1}
              onClick={() => void load({ page: page - 1, soft: true })}
              aria-label="صفحه قبل"
            >
              ‹
            </button>
            {pageButtons.map((p, i) =>
              p === "…" ? (
                <span key={`e-${i}`} className="digi-page-btn digi-page-btn--muted">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  className={[
                    "digi-page-btn",
                    p === page ? "digi-page-btn--active" : "digi-page-btn--muted",
                  ].join(" ")}
                  onClick={() => void load({ page: p, soft: true })}
                >
                  {p.toLocaleString("fa-IR")}
                </button>
              ),
            )}
            <button
              type="button"
              className="digi-page-btn"
              disabled={page >= totalPages}
              onClick={() => void load({ page: page + 1, soft: true })}
              aria-label="صفحه بعد"
            >
              ›
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function buildPageButtons(page: number, total: number): Array<number | "…"> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const items: Array<number | "…"> = [1];
  if (page > 3) items.push("…");
  for (let p = Math.max(2, page - 1); p <= Math.min(total - 1, page + 1); p++) {
    items.push(p);
  }
  if (page < total - 2) items.push("…");
  items.push(total);
  return items;
}

function SearchIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="m16 16 3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 6h16M7 12h10M10 18h4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronTiny() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 10l5 5 5-5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="6" r="1.5" fill="currentColor" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <circle cx="12" cy="18" r="1.5" fill="currentColor" />
    </svg>
  );
}
