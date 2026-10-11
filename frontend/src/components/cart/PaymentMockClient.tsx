"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TomanIcon } from "@/components/layout/icons";
import {
  getPayment,
  paymentCallback,
  retryPayment,
} from "@/lib/api/cart";
import { formatPrice } from "@/lib/format";
import { useAuth } from "@/lib/auth/useAuth";
import type { PaymentDto } from "@/types/cart";

/**
 * Mock MixPay gateway page — success / fail / retry.
 */
export function PaymentMockClient() {
  const params = useParams<{ id: string }>();
  const paymentId = params.id;
  const router = useRouter();
  const { ready, isAuthenticated } = useAuth();
  const [payment, setPayment] = useState<PaymentDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!isAuthenticated) {
      router.replace(
        `/users/login?returnUrl=${encodeURIComponent(`/checkout/payment/${paymentId}`)}`,
      );
      return;
    }
    void getPayment(paymentId)
      .then(setPayment)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "پرداخت یافت نشد"),
      );
  }, [ready, isAuthenticated, paymentId, router]);

  async function finish(result: "success" | "failed") {
    setBusy(true);
    setError(null);
    try {
      const res = await paymentCallback(
        paymentId,
        result,
        result === "failed" ? "لغو توسط کاربر در درگاه آزمایشی" : undefined,
      );
      setPayment(res.payment);
      if (result === "success" && res.order) {
        router.push(`/checkout/thanks/${res.order.id}`);
        return;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در تایید پرداخت");
    } finally {
      setBusy(false);
    }
  }

  async function retry() {
    setBusy(true);
    setError(null);
    try {
      const res = await retryPayment(paymentId);
      router.replace(res.redirectUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تلاش مجدد ناموفق بود");
    } finally {
      setBusy(false);
    }
  }

  if (!ready || (!payment && !error)) {
    return (
      <p className="py-12 text-center text-sm text-[var(--color-muted)]">
        در حال اتصال به درگاه…
      </p>
    );
  }

  if (error && !payment) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-white px-4 py-12 text-center">
        <p className="mb-4 text-sm text-[var(--color-hint-object-error)]">
          {error}
        </p>
        <Link href="/checkout/cart" className="text-sm text-[var(--color-primary)]">
          بازگشت به سبد
        </Link>
      </div>
    );
  }

  if (!payment) return null;

  const isPaid = payment.status === "paid";
  const isFailed = payment.status === "failed";

  return (
    <div className="mx-auto max-w-md rounded-xl border border-[var(--color-neutral-200)] bg-white p-6 text-center shadow-sm">
      <p className="text-xs font-medium tracking-wide text-[var(--color-neutral-500)]">
        درگاه آزمایشی MixPay
      </p>
      <h1 className="mt-2 text-lg font-bold text-[var(--color-neutral-900)]">
        پرداخت سفارش
      </h1>
      <p className="mt-1 text-xs text-[var(--color-muted)]" dir="ltr">
        {payment.key}
      </p>

      <div className="my-6 flex items-center justify-center gap-1 text-2xl font-black text-[var(--color-neutral-900)]">
        {formatPrice(payment.amount)}
        <TomanIcon className="size-5" />
      </div>

      {error ? (
        <p className="mb-3 text-sm text-[var(--color-hint-object-error)]">
          {error}
        </p>
      ) : null}

      {isPaid ? (
        <p className="mb-4 text-sm font-medium text-green-700">
          پرداخت موفق بود.
          {payment.orderId ? (
            <>
              {" "}
              <Link
                href={`/checkout/thanks/${payment.orderId}`}
                className="underline"
              >
                مشاهده رسید
              </Link>
            </>
          ) : null}
        </p>
      ) : null}

      {isFailed ? (
        <div className="mb-4 space-y-3">
          <p className="text-sm text-[var(--color-hint-object-error)]">
            {payment.failureReason || "پرداخت ناموفق بود"}
          </p>
          <button
            type="button"
            disabled={busy}
            onClick={() => void retry()}
            className="h-11 w-full rounded-lg bg-[var(--color-primary-500)] text-sm font-medium text-white"
          >
            تلاش مجدد
          </button>
        </div>
      ) : null}

      {!isPaid && !isFailed ? (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => void finish("success")}
            className="h-12 rounded-lg bg-[var(--color-primary-500)] text-sm font-medium text-white disabled:opacity-50"
          >
            {busy ? "…" : "پرداخت موفق (شبیه‌سازی)"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void finish("failed")}
            className="h-12 rounded-lg border border-[var(--color-neutral-200)] text-sm font-medium text-[var(--color-neutral-700)] disabled:opacity-50"
          >
            پرداخت ناموفق
          </button>
        </div>
      ) : null}

      <Link
        href="/checkout/shipping"
        className="mt-4 inline-block text-xs text-[var(--color-secondary-500)]"
      >
        بازگشت
      </Link>
    </div>
  );
}
