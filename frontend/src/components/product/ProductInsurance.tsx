"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { ChevronLeftIcon, TomanIcon } from "@/components/layout/icons";
import { formatDiscountPercent, formatPrice } from "@/lib/format";
import type { ProductInsuranceOffer } from "@/types/product-detail";

type ProductInsuranceProps = {
  offer: ProductInsuranceOffer;
};

/**
 * Optional add-on insurance row under the variant strip.
 */
export function ProductInsurance({ offer }: ProductInsuranceProps) {
  const inputId = useId();
  const [checked, setChecked] = useState(false);

  return (
    <div className="w-full">
      <p className="py-3 text-sm font-medium leading-[1.8] text-[var(--color-neutral-900)]">
        بیمه
      </p>

      <div className="flex rounded-[var(--medium-radius)] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-000)]">
        <label
          htmlFor={inputId}
          className="flex shrink-0 cursor-pointer items-center border-l border-[var(--color-neutral-200)] px-3 py-1"
        >
          <input
            id={inputId}
            type="checkbox"
            className="peer sr-only"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />
          <span
            className={[
              "inline-flex size-[18px] shrink-0 cursor-pointer items-center justify-center rounded-[var(--small-radius)] border-2 transition",
              checked
                ? "border-[var(--color-secondary-500)] bg-[var(--color-secondary-500)]"
                : "border-[var(--color-neutral-300)] bg-[var(--color-neutral-000)]",
            ].join(" ")}
            aria-hidden
          >
            {checked ? (
              <svg
                width={10}
                height={10}
                viewBox="0 0 10 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1.5 5.2 3.8 7.5 8.5 2.5"
                  stroke="white"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : null}
          </span>
        </label>

        <div className="grow p-2">
          <p className="text-[13px] font-semibold leading-[2.15] text-[var(--color-neutral-700)]">
            {offer.title}
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-y-1">
            <div className="ml-auto flex items-center">
              {offer.discountPercent != null && offer.originalPrice != null ? (
                <div className="ml-1 flex items-center">
                  <div className="ml-1 flex items-center justify-center rounded-[var(--large-radius)] bg-[var(--color-hint-object-error)] px-1 text-white">
                    <span className="text-[13px] font-semibold leading-none">
                      {formatDiscountPercent(offer.discountPercent)}
                    </span>
                  </div>
                  <div className="text-[13px] text-[var(--color-neutral-300)] line-through">
                    {formatPrice(offer.originalPrice)}
                  </div>
                </div>
              ) : null}

              <div className="flex grow items-center justify-end gap-1 text-[13px] font-semibold text-[var(--color-neutral-700)]">
                <span>{formatPrice(offer.price)}</span>
                <TomanIcon className="size-4 text-[var(--color-icon-high-emphasis)]" />
              </div>
            </div>

            <Link
              href={offer.detailsHref ?? "#insurance-details"}
              className="inline-flex items-center text-xs font-medium text-[var(--color-secondary-500)]"
            >
              <span>جزئیات</span>
              <ChevronLeftIcon
                size={18}
                className="text-[var(--color-icon-secondary)]"
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
