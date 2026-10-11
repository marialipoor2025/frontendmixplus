"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TomanIcon } from "@/components/layout/icons";
import { getOrder } from "@/lib/api/cart";
import { formatPrice } from "@/lib/format";
import { useAuth } from "@/lib/auth/useAuth";
import type { OrderDto } from "@/types/cart";

export function OrderThanksClient() {
  const params = useParams<{ id: string }>();
  const orderId = params.id;
  const router = useRouter();
  const { ready, isAuthenticated } = useAuth();
  const [order, setOrder] = useState<OrderDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (!isAuthenticated) {
      router.replace(
        `/users/login?returnUrl=${encodeURIComponent(`/checkout/thanks/${orderId}`)}`,
      );
      return;
    }
    void getOrder(orderId)
      .then(setOrder)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "سفارش یافت نشد"),
      );
  }, [ready, isAuthenticated, orderId, router]);

  if (!ready || (!order && !error)) {
    return (
      <p className="py-12 text-center text-sm text-[var(--color-muted)]">
        در حال بارگذاری رسید…
      </p>
    );
  }

  if (error || !order) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-white px-4 py-12 text-center">
        <p className="mb-4 text-sm text-[var(--color-hint-object-error)]">
          {error ?? "سفارش یافت نشد"}
        </p>
        <Link href="/profile/orders" className="text-sm text-[var(--color-primary)]">
          سفارش‌های من
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-6 text-center">
        <p className="text-sm font-medium text-green-800">
          سفارش شما با موفقیت ثبت شد
        </p>
        <p className="mt-2 text-lg font-bold text-[var(--color-neutral-900)]">
          کد پیگیری:{" "}
          <span dir="ltr" className="font-mono">
            {order.code}
          </span>
        </p>
        <p className="mt-1 text-xs text-[var(--color-muted)]">
          {order.shippingLabel}
          {order.pickupBranchLabel ? ` · ${order.pickupBranchLabel}` : ""}
        </p>
      </div>

      <ul className="divide-y divide-[var(--color-neutral-100)] rounded-xl border border-[var(--color-neutral-200)] bg-white">
        {order.items.map((item) => (
          <li key={item.id} className="flex gap-3 p-4">
            <Image
              src={item.imageUrl || "/placeholders/product-appliance.png"}
              alt=""
              width={64}
              height={64}
              className="size-16 rounded-md object-contain"
              unoptimized
            />
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-medium">{item.title}</p>
              <p className="mt-1 text-xs text-[var(--color-muted)]">
                {item.sellerName}
                {item.variantLabel ? ` · ${item.variantLabel}` : ""} ·{" "}
                {new Intl.NumberFormat("fa-IR").format(item.quantity)} عدد
              </p>
              <p className="mt-1 flex items-center gap-0.5 text-sm font-bold">
                {formatPrice(item.unitPrice * item.quantity)}
                <TomanIcon className="size-3" />
              </p>
            </div>
          </li>
        ))}
      </ul>

      <dl className="space-y-2 rounded-xl border border-[var(--color-neutral-200)] bg-white p-4 text-sm">
        <div className="flex justify-between">
          <dt>جمع کالاها</dt>
          <dd>{formatPrice(order.subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>ارسال</dt>
          <dd>
            {order.shipping === 0 ? "رایگان" : formatPrice(order.shipping)}
          </dd>
        </div>
        {order.discount > 0 ? (
          <div className="flex justify-between text-[var(--color-secondary-500)]">
            <dt>تخفیف</dt>
            <dd>−{formatPrice(order.discount)}</dd>
          </div>
        ) : null}
        {order.giftCard > 0 ? (
          <div className="flex justify-between text-[var(--color-secondary-500)]">
            <dt>کارت هدیه</dt>
            <dd>−{formatPrice(order.giftCard)}</dd>
          </div>
        ) : null}
        {order.wallet > 0 ? (
          <div className="flex justify-between text-[var(--color-secondary-500)]">
            <dt>کیف پول</dt>
            <dd>−{formatPrice(order.wallet)}</dd>
          </div>
        ) : null}
        <div className="flex justify-between border-t border-[var(--color-neutral-100)] pt-2 text-base font-bold">
          <dt>مبلغ پرداخت‌شده</dt>
          <dd className="flex items-center gap-0.5">
            {formatPrice(order.totalAmount)}
            <TomanIcon className="size-3.5" />
          </dd>
        </div>
      </dl>

      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href={`/profile/orders/${order.id}`}
          className="rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-bold text-white"
        >
          جزئیات سفارش
        </Link>
        <Link
          href="/"
          className="rounded-lg border border-[var(--color-neutral-200)] px-4 py-2.5 text-sm font-medium"
        >
          ادامه خرید
        </Link>
      </div>
    </div>
  );
}
