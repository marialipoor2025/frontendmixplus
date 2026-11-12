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
import { emptyPage, type PagedResult } from "@/types/paging";

type PublishFilter = "all" | "published" | "draft";
type StockFilter = "all" | "in" | "out";

function guessCategoryLabel(title: string) {
  const t = title.toLowerCase();
  if (t.includes("مایکروویو") || t.includes("مایکروفر")) {
    return "مایکروویو، مایکروفر";
  }
  if (t.includes("سینک")) return "سینک";
  if (t.includes("هود")) return "هود";
  if (t.includes("اجاق") || t.includes("فر ")) return "اجاق گاز";
  if (t.includes("یخچال")) return "یخچال و فریزر";
  if (t.includes("لباسشویی") || t.includes("ماشین لباسشویی")) {
    return "ماشین لباسشویی";
  }
  if (t.includes("ظرفشویی")) return "ماشین ظرفشویی";
  return "لوازم خانگی";
}

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

        {/* TableHeadAction — Digikala product-management */}
        <div className="digi-table-head-action">
          <div className="digi-table-head-action__leading">
            <Link
              href="/seller/digi/products/create/initial"
              className="digi-btn-primary digi-btn-primary--icon digi-btn-primary--medium"
            >
              <span className="digi-btn-primary__icon" aria-hidden>
                <PlusIcon />
              </span>
              افزودن کالای جدید
            </Link>
          </div>
          <div className="digi-table-head-action__trailing">
            <div>
              <span className="digi-table-head-action__count-label">
                تعداد نتایج:
              </span>
              <span className="digi-table-head-action__count-value">
                {result.totalCount.toLocaleString("fa-IR")}
              </span>
            </div>
            <span className="digi-pipe" aria-hidden />
            <div className="digi-table-head-action__pagesize">
              <span className="digi-table-head-action__pagesize-label">
                تعداد نمایش
              </span>
              <label className="digi-dropdown">
                <select
                  className="digi-dropdown__native"
                  value={pageSize}
                  aria-label="تعداد نمایش"
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
                <span className="digi-dropdown__value" role="listbox">
                  {pageSize.toLocaleString("fa-IR")}
                </span>
                <span className="digi-dropdown__chevron" aria-hidden>
                  <ChevronTiny />
                </span>
              </label>
            </div>
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
              <section className="digi-product-grid digi-product-grid--head">
                <div className="digi-product-grid__title-head">عنوان کالا</div>
                <div>گروه کالایی</div>
                <div>کانال فروش</div>
                <div>برند کالا</div>
                <div>وضعیت</div>
                <div>تعداد تنوع</div>
                <div>
                  برچسب محصول
                  <span className="digi-header-info" aria-hidden>
                    <InfoIcon />
                  </span>
                </div>
                <div />
              </section>

              {result.items.map((row) => {
                const manageHref = `/seller/digi/products/${encodeURIComponent(row.id)}/manage`;
                const variantHref = `${manageHref}?step=variants`;
                const categoryLabel = guessCategoryLabel(row.title);
                const variantCount = row.inStock ? 1 : 0;
                return (
                  <section
                    key={row.id}
                    className="digi-product-row digi-product-grid"
                  >
                    <div className="digi-product-row__cell digi-product-row__title">
                      <div className="digi-product-row__thumb">
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
                      <div className="digi-product-row__title-meta">
                        <Link
                          href={manageHref}
                          className="digi-product-row__title-link"
                          title={row.title}
                        >
                          <span className="digi-product-row__title-text">
                            {row.title}
                          </span>
                        </Link>
                        <span className="digi-dkp-badge">
                          {productCode(row.id)}
                        </span>
                      </div>
                    </div>

                    <div className="digi-product-row__cell">
                      <span className="digi-link-secondary">{categoryLabel}</span>
                    </div>

                    <div className="digi-product-row__cell">
                      <span className="digi-badge-neutral">میکس پلاس</span>
                    </div>

                    <div className="digi-product-row__cell">
                      <span className="digi-link-secondary">
                        {row.brandName || "میکس پلاس"}
                      </span>
                    </div>

                    <div className="digi-product-row__cell">
                      <span
                        className={
                          row.isPublished
                            ? "digi-badge-success"
                            : "digi-badge-error"
                        }
                      >
                        {row.isPublished ? "تایید شده" : "تکمیل‌نشده"}
                      </span>
                    </div>

                    <div className="digi-product-row__cell">
                      {variantCount.toLocaleString("fa-IR")}
                    </div>

                    <div className="digi-product-row__cell" />

                    <div className="digi-product-row__cell digi-product-row__actions">
                      <Link href={variantHref} className="digi-btn-row-primary">
                        افزودن تنوع
                      </Link>
                      {row.isPublished ? (
                        <Link
                          href="/seller/digi/marketing"
                          className="digi-btn-row-outline"
                        >
                          افزایش فروش
                        </Link>
                      ) : null}
                      <div className="relative">
                        <button
                          type="button"
                          className="digi-more-btn"
                          aria-label="عملیات"
                          onClick={() =>
                            setMenuId((prev) =>
                              prev === row.id ? null : row.id,
                            )
                          }
                        >
                          <MoreIcon />
                        </button>
                        {menuId === row.id ? (
                          <div className="digi-row-menu">
                            <Link
                              href={manageHref}
                              className="digi-row-menu__item"
                            >
                              مدیریت کالا
                            </Link>
                            <Link
                              href={`${manageHref}?step=pricing`}
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
                              {row.isPublished
                                ? "لغو انتشار"
                                : "انتشار در سایت"}
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </section>
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
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      aria-hidden
      style={{ fill: "var(--color-icon-white)" }}
    >
      <path d="M19 11h-6V5a1 1 0 1 0-2 0v6H5a1 1 0 1 0 0 2h6v6a1 1 0 1 0 2 0v-6h6a1 1 0 1 0 0-2Z" />
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

function InfoIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      aria-hidden
      style={{ fill: "var(--color-icon-black)" }}
    >
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 15h-2v-6h2v6Zm0-8h-2V7h2v2Z" />
    </svg>
  );
}
