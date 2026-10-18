"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CartQtyStepper } from "@/components/cart/CartQtyStepper";
import { TomanIcon } from "@/components/layout/icons";
import {
  applyCartCoupon,
  applyCartGiftCard,
  applyCartWallet,
  clearCartCoupon,
  getCart,
  removeCartItem,
  revalidateCart,
  updateCartItemQty,
} from "@/lib/api/cart";
import { formatDiscountPercent, formatPrice } from "@/lib/format";
import { useAuth } from "@/lib/auth/useAuth";
import type { CartDto } from "@/types/cart";

export function CartPageClient() {
  const { ready, isAuthenticated } = useAuth();
  const [cart, setCart] = useState<CartDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [giftInput, setGiftInput] = useState("");
  const [walletInput, setWalletInput] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await revalidateCart().catch(() => getCart());
      setCart(next);
      if (next?.couponCode) setCouponInput(next.couponCode);
      if (next?.giftCardCode) setGiftInput(next.giftCardCode);
      if (next && next.walletApplied > 0) {
        setWalletInput(String(next.walletApplied));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "بارگذاری سبد ناموفق بود");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    void refresh();
  }, [ready, refresh]);

  async function run(action: () => Promise<CartDto>) {
    setBusy(true);
    setError(null);
    try {
      const next = await action();
      setCart(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "عملیات ناموفق بود");
    } finally {
      setBusy(false);
    }
  }

  if (!ready || loading) {
    return (
      <p className="py-12 text-center text-sm text-[var(--color-muted)]">
        در حال بارگذاری سبد…
      </p>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-white px-4 py-12 text-center">
        <p className="mb-4 text-sm text-[var(--color-muted)]">
          سبد خرید شما خالی است.
        </p>
        <Link
          href="/"
          className="inline-flex rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
        >
          بازگشت به صفحه اصلی
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-3">
        {error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-[var(--color-hint-object-error)]">
            {error}
          </p>
        ) : null}
        {cart.hasStockIssues ? (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            برخی کالاها موجودی کافی ندارند — تعداد را اصلاح کنید.
          </p>
        ) : null}

        <ul className="divide-y divide-[var(--color-neutral-100)] rounded-xl border border-[var(--color-neutral-200)] bg-white">
          {cart.items.map((line) => (
            <li key={line.id} className="flex gap-3 p-4">
              <Link
                href={`/product/${encodeURIComponent(line.productSlug)}`}
                className="size-20 shrink-0 overflow-hidden rounded-md bg-[var(--color-neutral-050)]"
              >
                <Image
                  src={line.imageUrl || "/placeholders/product-appliance.png"}
                  alt=""
                  width={80}
                  height={80}
                  className="size-20 object-contain"
                  unoptimized
                />
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/product/${encodeURIComponent(line.productSlug)}`}
                  className="line-clamp-2 text-sm font-medium text-[var(--color-neutral-900)]"
                >
                  {line.title}
                </Link>
                <p className="mt-1 text-xs text-[var(--color-neutral-500)]">
                  {line.sellerName}
                  {line.variantLabel ? ` · ${line.variantLabel}` : ""}
                </p>
                {!line.inStock ? (
                  <p className="mt-1 text-xs font-medium text-[var(--color-hint-object-error)]">
                    ناموجود
                  </p>
                ) : null}
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <CartQtyStepper
                    quantity={line.quantity}
                    max={Math.max(line.stockAvailable || 0, line.quantity, 99)}
                    disabled={busy || !line.inStock}
                    onDecrease={() => {
                      if (line.quantity <= 1) {
                        void run(() => removeCartItem(line.id));
                      } else {
                        void run(() =>
                          updateCartItemQty(line.id, line.quantity - 1),
                        );
                      }
                    }}
                    onIncrease={() =>
                      void run(() =>
                        updateCartItemQty(line.id, line.quantity + 1),
                      )
                    }
                    onSetQuantity={(qty) =>
                      void run(() => updateCartItemQty(line.id, qty))
                    }
                  />
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void run(() => removeCartItem(line.id))}
                    className="text-xs text-[var(--color-hint-object-error)]"
                  >
                    حذف
                  </button>
                  <div className="ms-auto flex items-center gap-1">
                    {line.originalPrice != null &&
                    line.originalPrice > line.unitPrice &&
                    line.discountPercent != null ? (
                      <>
                        <span className="text-xs text-[var(--color-neutral-300)] line-through">
                          {formatPrice(line.originalPrice * line.quantity)}
                        </span>
                        <span className="rounded bg-[var(--color-hint-object-error)] px-1 text-[10px] font-bold text-white">
                          {formatDiscountPercent(line.discountPercent)}
                        </span>
                      </>
                    ) : null}
                    <span className="text-sm font-bold text-[var(--color-neutral-800)]">
                      {formatPrice(line.lineTotal)}
                    </span>
                    <TomanIcon className="size-3.5" />
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <aside className="h-fit space-y-4 rounded-xl border border-[var(--color-neutral-200)] bg-white p-4 lg:sticky lg:top-28">
        <h2 className="text-sm font-bold text-[var(--color-neutral-900)]">
          خلاصه سبد
        </h2>

        <label className="block space-y-1.5">
          <span className="text-xs text-[var(--color-neutral-500)]">کد تخفیف</span>
          <div className="flex gap-2">
            <input
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              className="min-w-0 flex-1 rounded-md border border-[var(--color-neutral-200)] px-2 py-2 text-sm"
              placeholder="مثلاً WELCOME10"
            />
            {cart.couponCode ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => void run(() => clearCartCoupon())}
                className="rounded-md border border-[var(--color-neutral-200)] px-3 text-xs"
              >
                حذف
              </button>
            ) : (
              <button
                type="button"
                disabled={busy || !couponInput.trim()}
                onClick={() =>
                  void run(() => applyCartCoupon(couponInput.trim()))
                }
                className="rounded-md bg-[var(--color-primary)] px-3 text-xs text-white disabled:opacity-40"
              >
                اعمال
              </button>
            )}
          </div>
          {cart.couponLabel ? (
            <p className="text-[11px] text-[var(--color-secondary-500)]">
              {cart.couponLabel}
            </p>
          ) : null}
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs text-[var(--color-neutral-500)]">کارت هدیه</span>
          <div className="flex gap-2">
            <input
              value={giftInput}
              onChange={(e) => setGiftInput(e.target.value)}
              className="min-w-0 flex-1 rounded-md border border-[var(--color-neutral-200)] px-2 py-2 text-sm"
              placeholder="کد کارت هدیه"
            />
            <button
              type="button"
              disabled={busy || !giftInput.trim()}
              onClick={() =>
                void run(() => applyCartGiftCard(giftInput.trim()))
              }
              className="rounded-md bg-[var(--color-primary)] px-3 text-xs text-white disabled:opacity-40"
            >
              اعمال
            </button>
          </div>
        </label>

        {isAuthenticated ? (
          <label className="block space-y-1.5">
            <span className="text-xs text-[var(--color-neutral-500)]">
              کیف پول (موجودی: {formatPrice(cart.walletBalance)})
            </span>
            <div className="flex gap-2">
              <input
                value={walletInput}
                onChange={(e) =>
                  setWalletInput(e.target.value.replace(/[^\d]/g, ""))
                }
                className="min-w-0 flex-1 rounded-md border border-[var(--color-neutral-200)] px-2 py-2 text-sm"
                placeholder="مبلغ"
                inputMode="numeric"
              />
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  void run(() => applyCartWallet(Number(walletInput || "0")))
                }
                className="rounded-md bg-[var(--color-primary)] px-3 text-xs text-white disabled:opacity-40"
              >
                اعمال
              </button>
            </div>
          </label>
        ) : (
          <p className="rounded-lg bg-[var(--color-neutral-50)] px-3 py-2 text-xs text-[var(--color-muted)]">
            برای استفاده از کیف پول و پرداخت نهایی وارد شوید.
          </p>
        )}

        <dl className="space-y-2 border-t border-[var(--color-neutral-100)] pt-3 text-sm">
          <div className="flex justify-between text-[var(--color-neutral-600)]">
            <dt>جمع کالاها ({new Intl.NumberFormat("fa-IR").format(cart.itemCount)})</dt>
            <dd className="flex items-center gap-0.5 font-medium text-[var(--color-neutral-800)]">
              {formatPrice(cart.subtotal)}
              <TomanIcon className="size-3" />
            </dd>
          </div>
          {cart.couponDiscount > 0 ? (
            <div className="flex justify-between text-[var(--color-secondary-500)]">
              <dt>تخفیف کد</dt>
              <dd>−{formatPrice(cart.couponDiscount)}</dd>
            </div>
          ) : null}
          {cart.giftCardApplied > 0 ? (
            <div className="flex justify-between text-[var(--color-secondary-500)]">
              <dt>کارت هدیه</dt>
              <dd>−{formatPrice(cart.giftCardApplied)}</dd>
            </div>
          ) : null}
          {cart.walletApplied > 0 ? (
            <div className="flex justify-between text-[var(--color-secondary-500)]">
              <dt>کیف پول</dt>
              <dd>−{formatPrice(cart.walletApplied)}</dd>
            </div>
          ) : null}
          <div className="flex justify-between border-t border-[var(--color-neutral-100)] pt-2 text-base font-bold text-[var(--color-neutral-900)]">
            <dt>قابل پرداخت</dt>
            <dd className="flex items-center gap-0.5">
              {formatPrice(cart.payableBeforeShipping)}
              <TomanIcon className="size-3.5" />
            </dd>
          </div>
        </dl>

        <Link
          href={
            isAuthenticated
              ? "/checkout/shipping"
              : `/users/login?returnUrl=${encodeURIComponent("/checkout/shipping")}`
          }
          className={`flex h-12 w-full items-center justify-center rounded-[var(--medium-radius)] text-sm font-medium text-white ${
            cart.hasStockIssues
              ? "pointer-events-none bg-[var(--color-button-disable)] text-[var(--color-neutral-500)]"
              : "bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-700)]"
          }`}
        >
          {isAuthenticated
            ? "ادامه و انتخاب ارسال"
            : "ورود و ادامه پرداخت"}
        </Link>
      </aside>
    </div>
  );
}
