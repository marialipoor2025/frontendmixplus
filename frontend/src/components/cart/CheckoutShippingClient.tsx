"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { TomanIcon } from "@/components/layout/icons";
import {
  createCheckoutAddress,
  getCart,
  getPickupBranches,
  getShippingOptions,
  listCheckoutAddresses,
  quoteCheckout,
  startCheckoutPayment,
} from "@/lib/api/cart";
import { formatPrice } from "@/lib/format";
import { useAuth } from "@/lib/auth/useAuth";
import type {
  CheckoutAddress,
  CheckoutQuote,
  PickupBranch,
  ShippingOption,
} from "@/types/cart";

export function CheckoutShippingClient() {
  const router = useRouter();
  const { ready, isAuthenticated } = useAuth();
  const [addresses, setAddresses] = useState<CheckoutAddress[]>([]);
  const [shipping, setShipping] = useState<ShippingOption[]>([]);
  const [branches, setBranches] = useState<PickupBranch[]>([]);
  const [addressId, setAddressId] = useState<string>("");
  const [shippingId, setShippingId] = useState("express");
  const [pickupId, setPickupId] = useState("");
  const [quote, setQuote] = useState<CheckoutQuote | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "منزل",
    receiverName: "",
    phone: "",
    province: "تهران",
    city: "تهران",
    postalCode: "",
    addressLine: "",
    isDefault: true,
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cart = await getCart();
      if (!cart || cart.items.length === 0) {
        router.replace("/checkout/cart");
        return;
      }
      const [addrs, opts, pickups] = await Promise.all([
        listCheckoutAddresses(),
        getShippingOptions(),
        getPickupBranches(),
      ]);
      setAddresses(addrs);
      setShipping(opts);
      setBranches(pickups);
      const defaultAddr =
        addrs.find((a) => a.isDefault) ?? addrs[0] ?? null;
      if (defaultAddr) setAddressId(defaultAddr.id);
      if (opts[0]) setShippingId(opts[0].id);
      if (pickups[0]) setPickupId(pickups[0].id);
      if (addrs.length === 0) setShowForm(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "بارگذاری ناموفق بود");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!ready) return;
    if (!isAuthenticated) {
      router.replace(
        `/users/login?returnUrl=${encodeURIComponent("/checkout/shipping")}`,
      );
      return;
    }
    void load();
  }, [ready, isAuthenticated, load, router]);

  const selectedShip = shipping.find((s) => s.id === shippingId);
  const needsAddress = selectedShip?.kind !== "pickup";
  const needsPickup = selectedShip?.kind === "pickup";

  useEffect(() => {
    if (!ready || !isAuthenticated || loading) return;
    if (needsAddress && !addressId) {
      setQuote(null);
      return;
    }
    if (needsPickup && !pickupId) {
      setQuote(null);
      return;
    }

    let cancelled = false;
    void quoteCheckout({
      addressId: needsAddress ? addressId : undefined,
      shippingMethodId: shippingId,
      pickupBranchId: needsPickup ? pickupId : undefined,
    })
      .then((q) => {
        if (!cancelled) setQuote(q);
      })
      .catch((err) => {
        if (!cancelled) {
          setQuote(null);
          setError(err instanceof Error ? err.message : "خطا در محاسبه");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [
    ready,
    isAuthenticated,
    loading,
    addressId,
    shippingId,
    pickupId,
    needsAddress,
    needsPickup,
  ]);

  async function saveAddress() {
    setBusy(true);
    setError(null);
    try {
      const created = await createCheckoutAddress(form);
      setAddresses((list) => [created, ...list]);
      setAddressId(created.id);
      setShowForm(false);
      const opts = await getShippingOptions(created.id);
      setShipping(opts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ثبت آدرس ناموفق بود");
    } finally {
      setBusy(false);
    }
  }

  async function pay() {
    if (!quote) return;
    setBusy(true);
    setError(null);
    try {
      const payment = await startCheckoutPayment({
        addressId: needsAddress ? addressId : undefined,
        shippingMethodId: shippingId,
        pickupBranchId: needsPickup ? pickupId : undefined,
      });
      router.push(payment.redirectUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "شروع پرداخت ناموفق بود");
    } finally {
      setBusy(false);
    }
  }

  if (!ready || loading) {
    return (
      <p className="py-12 text-center text-sm text-[var(--color-muted)]">
        در حال بارگذاری…
      </p>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-6">
        {error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-[var(--color-hint-object-error)]">
            {error}
          </p>
        ) : null}

        <section className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold">آدرس تحویل</h2>
            <button
              type="button"
              onClick={() => setShowForm((v) => !v)}
              className="text-xs text-[var(--color-secondary-500)]"
            >
              {showForm ? "بستن" : "آدرس جدید"}
            </button>
          </div>

          {showForm ? (
            <div className="mb-4 grid gap-2 sm:grid-cols-2">
              {(
                [
                  ["title", "عنوان"],
                  ["receiverName", "گیرنده"],
                  ["phone", "موبایل"],
                  ["province", "استان"],
                  ["city", "شهر"],
                  ["postalCode", "کدپستی"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="block text-xs">
                  <span className="mb-1 block text-[var(--color-neutral-500)]">
                    {label}
                  </span>
                  <input
                    value={form[key]}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, [key]: e.target.value }))
                    }
                    className="w-full rounded-md border border-[var(--color-neutral-200)] px-2 py-2 text-sm"
                  />
                </label>
              ))}
              <label className="block text-xs sm:col-span-2">
                <span className="mb-1 block text-[var(--color-neutral-500)]">
                  آدرس
                </span>
                <textarea
                  value={form.addressLine}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, addressLine: e.target.value }))
                  }
                  rows={2}
                  className="w-full rounded-md border border-[var(--color-neutral-200)] px-2 py-2 text-sm"
                />
              </label>
              <button
                type="button"
                disabled={busy}
                onClick={() => void saveAddress()}
                className="rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm text-white sm:col-span-2"
              >
                ذخیره آدرس
              </button>
            </div>
          ) : null}

          {addresses.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)]">
              هنوز آدرسی ثبت نشده است.
            </p>
          ) : (
            <ul className="space-y-2">
              {addresses.map((addr) => (
                <li key={addr.id}>
                  <label className="flex cursor-pointer gap-3 rounded-lg border border-[var(--color-neutral-200)] p-3 has-[:checked]:border-[var(--color-primary-500)]">
                    <input
                      type="radio"
                      name="address"
                      checked={addressId === addr.id}
                      onChange={() => setAddressId(addr.id)}
                      className="mt-1"
                    />
                    <div>
                      <p className="text-sm font-medium">
                        {addr.title}
                        {addr.isDefault ? (
                          <span className="ms-2 text-[10px] text-[var(--color-primary)]">
                            پیش‌فرض
                          </span>
                        ) : null}
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                        {addr.receiverName} · {addr.city} — {addr.addressLine}
                      </p>
                    </div>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-4">
          <h2 className="mb-3 text-sm font-bold">روش ارسال</h2>
          <ul className="space-y-2">
            {shipping.map((opt) => (
              <li key={opt.id}>
                <label className="flex cursor-pointer gap-3 rounded-lg border border-[var(--color-neutral-200)] p-3 has-[:checked]:border-[var(--color-primary-500)]">
                  <input
                    type="radio"
                    name="shipping"
                    checked={shippingId === opt.id}
                    onChange={() => setShippingId(opt.id)}
                    className="mt-1"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">{opt.title}</p>
                      <p className="flex items-center gap-0.5 text-sm font-bold">
                        {opt.cost === 0 ? (
                          "رایگان"
                        ) : (
                          <>
                            {formatPrice(opt.cost)}
                            <TomanIcon className="size-3" />
                          </>
                        )}
                      </p>
                    </div>
                    <p className="text-xs text-[var(--color-muted)]">
                      {opt.description}
                    </p>
                  </div>
                </label>
              </li>
            ))}
          </ul>

          {needsPickup ? (
            <div className="mt-4 space-y-2">
              <h3 className="text-xs font-bold text-[var(--color-neutral-700)]">
                انتخاب شعبه
              </h3>
              {branches.map((b) => (
                <label
                  key={b.id}
                  className="flex cursor-pointer gap-3 rounded-lg border border-[var(--color-neutral-200)] p-3 has-[:checked]:border-[var(--color-primary-500)]"
                >
                  <input
                    type="radio"
                    name="pickup"
                    checked={pickupId === b.id}
                    onChange={() => setPickupId(b.id)}
                    className="mt-1"
                  />
                  <div>
                    <p className="text-sm font-medium">{b.title}</p>
                    <p className="text-xs text-[var(--color-muted)]">
                      {b.address} · {b.hours}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          ) : null}
        </section>
      </div>

      <aside className="h-fit space-y-4 rounded-xl border border-[var(--color-neutral-200)] bg-white p-4 lg:sticky lg:top-28">
        <h2 className="text-sm font-bold">خلاصه پرداخت</h2>
        {quote ? (
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between text-[var(--color-neutral-600)]">
              <dt>کالاها</dt>
              <dd>{formatPrice(quote.subtotal)}</dd>
            </div>
            <div className="flex justify-between text-[var(--color-neutral-600)]">
              <dt>ارسال</dt>
              <dd>
                {quote.shippingCost === 0
                  ? "رایگان"
                  : formatPrice(quote.shippingCost)}
              </dd>
            </div>
            {quote.couponDiscount > 0 ? (
              <div className="flex justify-between text-[var(--color-secondary-500)]">
                <dt>تخفیف</dt>
                <dd>−{formatPrice(quote.couponDiscount)}</dd>
              </div>
            ) : null}
            {quote.giftCardApplied > 0 ? (
              <div className="flex justify-between text-[var(--color-secondary-500)]">
                <dt>کارت هدیه</dt>
                <dd>−{formatPrice(quote.giftCardApplied)}</dd>
              </div>
            ) : null}
            {quote.walletApplied > 0 ? (
              <div className="flex justify-between text-[var(--color-secondary-500)]">
                <dt>کیف پول</dt>
                <dd>−{formatPrice(quote.walletApplied)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between border-t border-[var(--color-neutral-100)] pt-2 text-base font-bold">
              <dt>مبلغ نهایی</dt>
              <dd className="flex items-center gap-0.5">
                {formatPrice(quote.payableTotal)}
                <TomanIcon className="size-3.5" />
              </dd>
            </div>
          </dl>
        ) : (
          <p className="text-xs text-[var(--color-muted)]">
            آدرس و روش ارسال را انتخاب کنید.
          </p>
        )}

        <button
          type="button"
          disabled={busy || !quote}
          onClick={() => void pay()}
          className="flex h-12 w-full items-center justify-center rounded-[var(--medium-radius)] bg-[var(--color-primary-500)] text-sm font-medium text-white disabled:bg-[var(--color-button-disable)] disabled:text-[var(--color-neutral-500)]"
        >
          {busy ? "در حال انتقال…" : "پرداخت"}
        </button>
        <Link
          href="/checkout/cart"
          className="block text-center text-xs text-[var(--color-secondary-500)]"
        >
          بازگشت به سبد
        </Link>
      </aside>
    </div>
  );
}
