"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

/** Discount code printed on the ticket banner image. */
const FIRST_ORDER_DISCOUNT_CODE = "krS2Bqv";

/**
 * barghchi-style dual promo strip under the header:
 * discount ticket (copy code) + proforma invoice.
 */
export function HomePromoBanners() {
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2500);
    return () => window.clearTimeout(id);
  }, [toast]);

  async function copyDiscountCode() {
    try {
      await navigator.clipboard.writeText(FIRST_ORDER_DISCOUNT_CODE);
      setToast("کد تخفیف کپی شد 🎉");
    } catch {
      setToast("کپی کد تخفیف ممکن نشد");
    }
  }

  return (
    <section
      className="mx-auto grid w-full max-w-[1320px] grid-cols-1 gap-4 text-center md:grid-cols-2"
      aria-label="پیشنهادها و پیش‌فاکتور"
    >
      <div className="relative">
        <button
          type="button"
          onClick={() => void copyDiscountCode()}
          className="block w-full overflow-hidden rounded-md"
          title="کپی کد تخفیف"
        >
          <Image
            src="/images/index/ticket.jpg"
            alt="تخفیفات ویژه"
            width={648}
            height={160}
            className="h-auto w-full transition duration-[400ms] hover:scale-[1.01]"
            sizes="(min-width: 768px) 648px, 100vw"
            priority
          />
        </button>

        {toast ? (
          <div
            role="status"
            className="pointer-events-none absolute inset-x-0 bottom-3 z-10 flex justify-center px-3"
          >
            <span className="rounded-lg bg-[var(--color-neutral-800)]/95 px-4 py-2 text-sm font-medium text-white shadow-lg">
              {toast}
            </span>
          </div>
        ) : null}
      </div>

      <Link
        href="/proforma-invoice"
        className="block overflow-hidden rounded-md"
        title="صدور پیش‌فاکتور"
      >
        <Image
          src="/images/index/pre-invoice.png"
          alt="صدور پیش‌فاکتور"
          width={648}
          height={160}
          className="h-auto w-full transition duration-[400ms] hover:scale-[1.01]"
          sizes="(min-width: 768px) 648px, 100vw"
          priority
        />
      </Link>
    </section>
  );
}
