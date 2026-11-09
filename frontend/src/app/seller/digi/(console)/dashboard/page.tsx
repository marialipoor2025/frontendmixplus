"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  DigiAlert,
  DigiBadge,
  DigiButton,
  DigiCard,
} from "@/components/seller/digi/digiUi";
import {
  getSellerDashboard,
  getSellerMe,
  listSellerOrders,
  listSellerProducts,
  type SellerDashboardStats,
  type SellerOrderListItem,
  type SellerProductListItem,
} from "@/lib/api/seller";
import { formatPrice } from "@/lib/format";

const EMPTY_STATS: SellerDashboardStats = {
  productCount: 0,
  publishedCount: 0,
  draftCount: 0,
  outOfStockCount: 0,
  shopName: "",
};

type StockTab = "low" | "out";

function todayFaLabel() {
  try {
    return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  } catch {
    return "امروز";
  }
}

export default function DigiSellerDashboardPage() {
  const [stats, setStats] = useState<SellerDashboardStats>(EMPTY_STATS);
  const [orders, setOrders] = useState<SellerOrderListItem[]>([]);
  const [outOfStock, setOutOfStock] = useState<SellerProductListItem[]>([]);
  const [stockTab, setStockTab] = useState<StockTab>("out");
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError(null);
      setOrdersError(null);
      try {
        const [me, dashboard] = await Promise.all([
          getSellerMe(),
          getSellerDashboard(),
        ]);
        if (cancelled) return;
        setStats({ ...dashboard, shopName: dashboard.shopName || me.name });

        const [orderPage, stockPage] = await Promise.all([
          listSellerOrders({ page: 1, pageSize: 5 }).catch((err) => {
            if (!cancelled) {
              setOrdersError(
                err instanceof Error
                  ? err.message
                  : "بارگذاری سفارش‌ها ناموفق بود",
              );
            }
            return null;
          }),
          listSellerProducts({
            inStock: false,
            page: 1,
            pageSize: 5,
            sortBy: "stock",
            sortDir: "asc",
          }).catch(() => null),
        ]);

        if (cancelled) return;
        if (orderPage) setOrders(orderPage.items);
        if (stockPage) setOutOfStock(stockPage.items);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "بارگذاری میز کار ناموفق بود",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const soldEstimate = stats.publishedCount;
  const dateLabel = `${todayFaLabel()} - امروز`;

  return (
    <div className="space-y-4" dir="rtl">
      {/* Digikala home title row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[22px] font-bold text-[var(--digi-text-strong)]">
          خانه
        </h1>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--digi-border)] bg-white px-3 py-1.5 text-xs text-[var(--digi-text)] shadow-[var(--digi-shadow)]"
        >
          <CalendarIcon />
          {dateLabel}
        </button>
      </div>

      {error ? <DigiAlert>{error}</DigiAlert> : null}

      {loading ? (
        <p className="py-10 text-center text-sm text-[var(--digi-muted)]">
          در حال بارگذاری میز کار…
        </p>
      ) : (
        <>
          {/* Shop identity + feedback — Digikala shop card */}
          <DigiCard className="!p-0 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--digi-border)] px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--digi-primary-soft)] text-sm font-bold text-[var(--digi-primary)]">
                  {(stats.shopName || "ف").slice(0, 1)}
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-base font-bold text-[var(--digi-text-strong)]">
                    {stats.shopName || "فروشگاه شما"}
                  </h2>
                  <p className="text-[11px] text-[var(--digi-muted)]">
                    {stats.publishedCount.toLocaleString("fa-IR")} کالای فعال در
                    سایت
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <DigiButton variant="outline" className="!py-1.5 text-xs">
                  بازخورد خریدارها
                </DigiButton>
                <DigiButton variant="outline" className="!py-1.5 text-xs">
                  همه
                </DigiButton>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 bg-[var(--digi-bg)] px-4 py-2.5">
              <p className="text-xs text-[var(--digi-muted)]">
                دانلود اپلیکیشن فروشندگان برای پیگیری سریع‌تر سفارش‌ها
              </p>
              <Link
                href="/seller/digi/products/create/initial"
                className="text-xs font-medium text-[var(--digi-primary)]"
              >
                شروع ثبت کالا
              </Link>
            </div>
          </DigiCard>

          {/* Metric widgets row */}
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <MetricWidget
              title="کالاهای فعال"
              value={stats.publishedCount.toLocaleString("fa-IR")}
              hint="قابل نمایش در فروشگاه"
              href="/seller/digi/products"
            />
            <MetricWidget
              title="پیش‌نویس / تکمیل‌نشده"
              value={stats.draftCount.toLocaleString("fa-IR")}
              hint="نیازمند تکمیل یا انتشار"
              href="/seller/digi/products"
            />
            <MetricWidget
              title="سفارش‌های اخیر"
              value={orders.length.toLocaleString("fa-IR")}
              hint="۵ سفارش آخر"
              href="/seller/digi/orders"
            />
            <MetricWidget
              title="ناموجود"
              value={stats.outOfStockCount.toLocaleString("fa-IR")}
              hint="نیازمند تأمین موجودی"
              href="/seller/digi/inventory"
              tone="danger"
            />
          </div>

          {/* Promo banner — Digikala «ارتقا جایگاه نمایش» */}
          <div className="overflow-hidden rounded-[var(--digi-radius)] border border-[var(--digi-primary-border)] bg-gradient-to-l from-[var(--digi-primary-soft)] to-white px-4 py-4 shadow-[var(--digi-shadow)] sm:px-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-[var(--digi-text-strong)]">
                  جایگاه نمایش کالا را ارتقا دهید
                </p>
                <p className="mt-1 text-xs text-[var(--digi-muted)]">
                  فروش بیشتر با نمایش در نتایج اول جستجو — ابتدا کالاها را کامل
                  و منتشر کنید
                </p>
              </div>
              <Link href="/seller/digi/products/create/initial">
                <DigiButton>ثبت کالای جدید</DigiButton>
              </Link>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            {/* موجودی تنوع‌ها — Digikala tabs */}
            <DigiCard className="!p-0 overflow-hidden">
              <div className="flex items-center justify-between gap-2 border-b border-[var(--digi-border)] px-4 py-3">
                <h2 className="text-sm font-bold text-[var(--digi-text-strong)]">
                  موجودی تنوع‌ها
                </h2>
                <Link href="/seller/digi/inventory">
                  <DigiButton variant="ghost" className="!py-1 text-xs">
                    مشاهده همه
                  </DigiButton>
                </Link>
              </div>
              <div className="flex border-b border-[var(--digi-border)]">
                <StockTabButton
                  active={stockTab === "low"}
                  onClick={() => setStockTab("low")}
                  label="در حال اتمام"
                />
                <StockTabButton
                  active={stockTab === "out"}
                  onClick={() => setStockTab("out")}
                  label="ناموجود شده"
                  count={stats.outOfStockCount}
                />
              </div>
              <div className="min-h-[180px] p-3">
                {stockTab === "low" ? (
                  <EmptyWidget
                    text="کالایی با موجودی در حال اتمام ثبت نشده است."
                    href="/seller/digi/inventory"
                    cta="مدیریت موجودی"
                  />
                ) : outOfStock.length === 0 ? (
                  <EmptyWidget
                    text="همه کالاهای شما موجود هستند."
                    href="/seller/digi/products/create/initial"
                    cta="ثبت کالای جدید"
                  />
                ) : (
                  <ul className="space-y-2">
                    {outOfStock.map((p) => (
                      <li key={p.id}>
                        <Link
                          href={`/seller/digi/products/${encodeURIComponent(p.id)}/manage?step=pricing`}
                          className="flex items-center justify-between gap-3 rounded-lg border border-[var(--digi-border)] px-3 py-2 hover:border-[var(--digi-primary)]"
                        >
                          <span className="truncate text-xs font-medium">
                            {p.title}
                          </span>
                          <DigiBadge tone="danger">ناموجود</DigiBadge>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </DigiCard>

            {/* سفارش و تعهد ارسال */}
            <DigiCard className="!p-0 overflow-hidden">
              <div className="flex items-center justify-between gap-2 border-b border-[var(--digi-border)] px-4 py-3">
                <h2 className="text-sm font-bold text-[var(--digi-text-strong)]">
                  سفارش‌ها و تعهد ارسال
                </h2>
                <Link href="/seller/digi/orders">
                  <DigiButton variant="ghost" className="!py-1 text-xs">
                    همه سفارش‌ها
                  </DigiButton>
                </Link>
              </div>
              <div className="min-h-[180px] p-3">
                {ordersError ? (
                  <DigiAlert tone="warn">{ordersError}</DigiAlert>
                ) : orders.length === 0 ? (
                  <EmptyWidget
                    text="هنوز سفارشی ثبت نشده. پس از انتشار کالا، سفارش‌ها اینجا می‌آیند."
                    href="/seller/digi/products"
                    cta="مدیریت کالا"
                  />
                ) : (
                  <ul className="space-y-2">
                    {orders.map((order) => (
                      <li
                        key={order.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-[var(--digi-border)] px-3 py-2"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium" dir="ltr">
                            {order.id}
                          </p>
                          <p className="text-[11px] text-[var(--digi-muted)]">
                            {order.createdAt}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <span className="text-xs tabular-nums">
                            {formatPrice(order.sellerTotal)}
                          </span>
                          <DigiBadge tone="muted">{order.status}</DigiBadge>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </DigiCard>
          </div>

          {/* گزارش فروش + تقویم پروموشن */}
          <div className="grid gap-4 md:grid-cols-2">
            <DigiCard>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold text-[var(--digi-text-strong)]">
                  گزارش فروش
                </h2>
                <Link href="/seller/digi/analytics">
                  <DigiButton variant="outline" className="!py-1 text-xs">
                    جزئیات
                  </DigiButton>
                </Link>
              </div>
              <p className="text-2xl font-bold tabular-nums text-[var(--digi-text-strong)]">
                {soldEstimate.toLocaleString("fa-IR")}
              </p>
              <p className="mt-1 text-xs text-[var(--digi-muted)]">
                کالای فعال — گزارش کامل فروش به‌زودی
              </p>
            </DigiCard>

            <DigiCard>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold text-[var(--digi-text-strong)]">
                  تقویم پروموشن‌ها
                </h2>
                <Link href="/seller/digi/marketing">
                  <DigiButton variant="outline" className="!py-1 text-xs">
                    مشاهده
                  </DigiButton>
                </Link>
              </div>
              <p className="text-sm text-[var(--digi-muted)]">
                پس از تکمیل و انتشار کالا می‌توانید در کمپین‌ها شرکت کنید.
              </p>
            </DigiCard>
          </div>

          {/* Floating smart assistant — Digikala «دستیار هوشمند» */}
          <Link
            href="/seller/digi/products/create/initial"
            className="fixed bottom-6 start-6 z-30 inline-flex items-center gap-2 rounded-full bg-[var(--digi-primary)] px-4 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-[var(--digi-primary-hover)]"
          >
            <span className="flex size-6 items-center justify-center rounded-full bg-white/20 text-xs">
              AI
            </span>
            دستیار هوشمند
          </Link>
        </>
      )}
    </div>
  );
}

function MetricWidget({
  title,
  value,
  hint,
  href,
  tone,
}: {
  title: string;
  value: string;
  hint: string;
  href: string;
  tone?: "danger";
}) {
  return (
    <DigiCard className="!p-0 overflow-hidden">
      <div className="flex items-start justify-between gap-2 border-b border-[var(--digi-border)] px-4 py-2.5">
        <p className="text-xs font-medium text-[var(--digi-muted)]">{title}</p>
        <Link
          href={href}
          className="text-[11px] font-medium text-[var(--digi-primary)]"
        >
          جزئیات
        </Link>
      </div>
      <div className="px-4 py-3">
        <p
          className={[
            "text-xl font-bold tabular-nums",
            tone === "danger"
              ? "text-[var(--digi-danger)]"
              : "text-[var(--digi-text-strong)]",
          ].join(" ")}
        >
          {value}
        </p>
        <p className="mt-1 text-[11px] text-[var(--digi-muted)]">{hint}</p>
      </div>
    </DigiCard>
  );
}

function StockTabButton({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "relative flex-1 px-3 py-2.5 text-xs font-medium transition",
        active
          ? "text-[var(--digi-primary)]"
          : "text-[var(--digi-muted)] hover:text-[var(--digi-text)]",
      ].join(" ")}
    >
      {label}
      {typeof count === "number" && count > 0 ? (
        <span className="ms-1 inline-flex min-w-[18px] justify-center rounded-full bg-[var(--digi-danger-soft)] px-1 text-[10px] text-[var(--digi-danger)]">
          {count.toLocaleString("fa-IR")}
        </span>
      ) : null}
      {active ? (
        <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-t bg-[var(--digi-primary)]" />
      ) : null}
    </button>
  );
}

function EmptyWidget({
  text,
  href,
  cta,
}: {
  text: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="flex h-full min-h-[140px] flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="text-xs text-[var(--digi-muted)]">{text}</p>
      <Link href={href}>
        <DigiButton variant="outline" className="!py-1.5 text-xs">
          {cta}
        </DigiButton>
      </Link>
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M3 10h18M8 3v4M16 3v4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
