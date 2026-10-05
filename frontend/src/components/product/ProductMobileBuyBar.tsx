"use client";

import {
  InfoFilledIcon,
  TomanIcon,
} from "@/components/layout/icons";
import { formatDiscountPercent, formatPrice } from "@/lib/format";
import type { ProductBuyBoxData } from "@/types/product-detail";

type ProductMobileBuyBarProps = {
  buyBox: ProductBuyBoxData;
  inStock: boolean;
};

/**
 * Digikala-style sticky bottom buy bar on mobile PDP.
 */
export function ProductMobileBuyBar({
  buyBox,
  inStock,
}: ProductMobileBuyBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 bg-white pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-8px_16px_#030a1614] lg:hidden">
      {buyBox.cheaperByAmount != null && buyBox.cheaperByAmount > 0 ? (
        <div className="flex items-center gap-2 bg-[#fff2eb] px-4 py-2 text-[11px] leading-[1.8] text-[var(--color-neutral-850)]">
          <InfoFilledIcon className="size-4 shrink-0 text-[rgb(63,105,242)]" />
          <span>
            این کالا را «
            <span className="font-semibold">
              {formatPrice(buyBox.cheaperByAmount)} تومان
            </span>
            » ارزان‌تر بخرید
          </span>
        </div>
      ) : null}

      <div className="flex items-center gap-3 border-t border-[var(--color-neutral-100)] px-4 py-3">
        <div className="flex min-w-0 flex-col items-start">
          {buyBox.originalPrice != null && buyBox.discountPercent != null ? (
            <div className="flex items-center gap-1">
              <span className="rounded-md bg-[var(--color-hint-object-error)] px-1 text-[11px] font-semibold text-white">
                {formatDiscountPercent(buyBox.discountPercent)}
              </span>
              <span className="text-[11px] text-[var(--color-neutral-300)] line-through">
                {formatPrice(buyBox.originalPrice)}
              </span>
            </div>
          ) : null}
          <div className="flex items-center gap-0.5">
            <span className="text-base font-bold text-[var(--color-neutral-800)]">
              {formatPrice(buyBox.price)}
            </span>
            <TomanIcon className="size-3.5 text-[var(--color-icon-high-emphasis)]" />
          </div>
        </div>
        <button
          type="button"
          data-testid="add-to-cart-mobile"
          disabled={!inStock}
          className="relative mr-auto flex h-12 min-w-[10rem] grow select-none items-center justify-center rounded-[var(--medium-radius)] bg-[var(--color-primary-500)] text-sm font-medium text-white transition enabled:hover:bg-[var(--color-primary-700)] disabled:cursor-not-allowed disabled:bg-[var(--color-button-disable)] disabled:text-[var(--color-neutral-500)]"
        >
          {inStock ? "افزودن به سبد خرید" : "ناموجود"}
        </button>
      </div>
    </div>
  );
}
