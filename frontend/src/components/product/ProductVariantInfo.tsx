"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ChevronLeftIcon,
  DoneCheckIcon,
  RatingStarIcon,
} from "@/components/layout/icons";
import type { ProductVariantInfoData } from "@/types/product-detail";

type ProductVariantInfoProps = {
  data: ProductVariantInfoData;
  /** Product slug for in-page review/Q&A anchors. */
  productSlug: string;
};

function formatFa(n: number, digits = 1): string {
  return new Intl.NumberFormat("fa-IR", {
    maximumFractionDigits: digits,
    minimumFractionDigits: Number.isInteger(n) ? 0 : Math.min(digits, 1),
  }).format(n);
}

/**
 * PDP variant strip: rating, review/Q chips, and color picker.
 */
export function ProductVariantInfo({
  data,
  productSlug,
}: ProductVariantInfoProps) {
  const [selectedColorId, setSelectedColorId] = useState(data.selectedColorId);
  const selectedColor =
    data.colors.find((c) => c.id === selectedColorId) ?? data.colors[0];

  return (
    <div
      id="pdp-variant"
      className="flex w-full min-w-[300px] flex-col items-start justify-center gap-3"
    >
      <div className="h-px w-full grow bg-[var(--color-neutral-200)]" />

      <div className="flex w-full flex-wrap items-center">
        <div className="flex items-center">
          <RatingStarIcon
            className="size-4 text-[var(--color-icon-rating)]"
            title="امتیاز"
          />
          <p className="mr-1 text-[13px] leading-[2.15] text-[var(--color-neutral-900)]">
            {formatFa(data.rating)}
          </p>
          <p className="mr-1 whitespace-nowrap text-[11px] text-[var(--color-neutral-300)]">
            (امتیاز {formatFa(data.ratingCount, 0)} خریدار)
          </p>
        </div>

        <div className="w-full overflow-x-auto px-5 [scrollbar-width:none] lg:w-auto lg:overflow-hidden lg:px-1.5 [&::-webkit-scrollbar]:hidden">
          <div className="flex w-full items-center gap-1.5">
            <Link
              href={`/product/${productSlug}#pdp-comments`}
              className="inline-flex cursor-pointer items-center py-1 text-[13px]"
            >
              <span className="flex items-center whitespace-nowrap rounded-lg bg-[var(--color-gradient-silver)] py-0.5 pr-2 pl-1 text-[13px] font-semibold text-[var(--color-icon-high-emphasis)]">
                {formatFa(data.commentCount, 0)} دیدگاه
                <ChevronLeftIcon
                  size={16}
                  className="text-[var(--color-icon-high-emphasis)]"
                />
              </span>
            </Link>
            <Link
              href={`/product/${productSlug}#pdp-questions`}
              className="inline-flex cursor-pointer items-center py-1 pl-5 text-[13px]"
            >
              <span className="flex items-center whitespace-nowrap rounded-lg bg-[var(--color-gradient-silver)] py-0.5 pr-2 pl-1 text-[13px] font-semibold text-[var(--color-icon-high-emphasis)]">
                {formatFa(data.questionCount, 0)} پرسش
                <ChevronLeftIcon
                  size={16}
                  className="text-[var(--color-icon-high-emphasis)]"
                />
              </span>
            </Link>
          </div>
        </div>
      </div>

      {data.colors.length > 0 && selectedColor ? (
        <div className="flex w-full flex-col gap-5 pt-2">
          <div className="flex flex-col gap-3">
            <div className="flex w-full items-start justify-between gap-4">
              <div className="flex flex-col items-start justify-center gap-0.5">
                <div className="flex flex-wrap items-center gap-0.5">
                  <span className="text-sm font-medium leading-[1.8] text-[var(--color-neutral-900)]">
                    رنگ:{" "}
                  </span>
                  <div className="flex items-center gap-1.5 text-sm font-medium leading-[1.8] text-[var(--color-neutral-900)]">
                    <span>{selectedColor.name}</span>
                    <span
                      className="size-4 rounded-full border border-[var(--color-neutral-200)]"
                      style={{ backgroundColor: selectedColor.hex }}
                      aria-hidden
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex w-full flex-wrap gap-2">
              {data.colors.map((color) => {
                const selected = color.id === selectedColorId;
                return (
                  <button
                    key={color.id}
                    type="button"
                    className="cursor-pointer py-0.5"
                    title={color.name}
                    aria-label={color.name}
                    aria-pressed={selected}
                    onClick={() => setSelectedColorId(color.id)}
                  >
                    <span
                      className={[
                        "relative ml-2 flex items-center justify-center bg-[var(--color-neutral-000)] px-2 lg:px-0",
                        selected
                          ? "rounded-full ring-2 ring-[var(--color-neutral-700)] ring-offset-2"
                          : "",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "mx-auto flex size-10 items-center justify-center rounded-full border lg:border-none",
                          selected
                            ? "border-[var(--color-neutral-300)]"
                            : "border-[var(--color-neutral-200)]",
                        ].join(" ")}
                        style={{ backgroundColor: color.hex }}
                      >
                        {selected ? (
                          <DoneCheckIcon className="size-6 text-[var(--color-neutral-900)]" />
                        ) : null}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
