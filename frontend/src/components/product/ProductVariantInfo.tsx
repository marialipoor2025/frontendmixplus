"use client";

import Link from "next/link";
import {
  ChevronLeftIcon,
  DoneCheckIcon,
  RatingStarIcon,
} from "@/components/layout/icons";
import {
  isOptionValueAvailable,
  resolveOptionGroups,
} from "@/lib/product-variants";
import type {
  ProductSkuVariant,
  ProductVariantInfoData,
} from "@/types/product-detail";

type ProductVariantInfoProps = {
  data: ProductVariantInfoData;
  productSlug: string;
  selectedOptionValueIds: Record<string, string>;
  activeSku?: ProductSkuVariant;
  onSelectOption: (groupId: string, valueId: string) => void;
};

function formatFa(n: number, digits = 1): string {
  return new Intl.NumberFormat("fa-IR", {
    maximumFractionDigits: digits,
    minimumFractionDigits: Number.isInteger(n) ? 0 : Math.min(digits, 1),
  }).format(n);
}

/**
 * PDP variant strip: rating chips + option groups (color swatches, capacity chips, …).
 */
export function ProductVariantInfo({
  data,
  productSlug,
  selectedOptionValueIds,
  activeSku,
  onSelectOption,
}: ProductVariantInfoProps) {
  const groups = resolveOptionGroups(data);

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

      {groups.map((group) => {
        const selectedId = selectedOptionValueIds[group.id];
        const selectedValue =
          group.values.find((v) => v.id === selectedId) ?? group.values[0];

        return (
          <div key={group.id} className="flex w-full flex-col gap-3 pt-2">
            <div className="flex flex-wrap items-center gap-0.5">
              <span className="text-sm font-medium leading-[1.8] text-[var(--color-neutral-900)]">
                {group.name}:{" "}
              </span>
              <span className="text-sm font-medium leading-[1.8] text-[var(--color-neutral-900)]">
                {selectedValue?.label}
              </span>
              {selectedValue?.swatchHex ? (
                <span
                  className="ms-1 size-4 rounded-full border border-[var(--color-neutral-200)]"
                  style={{ backgroundColor: selectedValue.swatchHex }}
                  aria-hidden
                />
              ) : null}
            </div>

            <div className="flex w-full flex-wrap gap-2">
              {group.values.map((value) => {
                const selected = value.id === selectedId;
                const available =
                  value.available &&
                  isOptionValueAvailable(
                    data.skus,
                    group.id,
                    value.id,
                    selectedOptionValueIds,
                  );

                if (group.ui === "swatch") {
                  return (
                    <button
                      key={value.id}
                      type="button"
                      disabled={!available}
                      className="cursor-pointer py-0.5 disabled:cursor-not-allowed disabled:opacity-40"
                      title={value.label}
                      aria-label={value.label}
                      aria-pressed={selected}
                      onClick={() => onSelectOption(group.id, value.id)}
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
                          style={{
                            backgroundColor: value.swatchHex ?? "#e5e7eb",
                          }}
                        >
                          {selected ? (
                            <DoneCheckIcon className="size-6 text-[var(--color-neutral-900)]" />
                          ) : null}
                        </span>
                      </span>
                    </button>
                  );
                }

                return (
                  <button
                    key={value.id}
                    type="button"
                    disabled={!available}
                    aria-pressed={selected}
                    onClick={() => onSelectOption(group.id, value.id)}
                    className={[
                      "rounded-lg border px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40",
                      selected
                        ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
                        : "border-[var(--color-neutral-200)] bg-white text-[var(--color-neutral-700)] hover:border-[var(--color-neutral-400)]",
                    ].join(" ")}
                  >
                    {value.label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {activeSku ? (
        <p className="text-xs text-[var(--color-neutral-500)]" dir="ltr">
          SKU: {activeSku.sku}
          {!activeSku.inStock ? " · ناموجود" : ""}
        </p>
      ) : null}
    </div>
  );
}
