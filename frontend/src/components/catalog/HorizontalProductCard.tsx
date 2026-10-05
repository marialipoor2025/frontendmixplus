"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ProductAvailableIcon,
  RatingStarIcon,
  TomanIcon,
} from "@/components/layout/icons";
import { siteConfig } from "@/config/site";
import {
  formatDiscountPercent,
  formatPrice,
} from "@/lib/format";
import type { Product } from "@/types/product";

type HorizontalProductCardProps = {
  product: Product;
  className?: string;
};

/**
 * Digikala-style horizontal PLP card for mobile (image + meta side by side).
 */
export function HorizontalProductCard({
  product,
  className = "",
}: HorizontalProductCardProps) {
  const hasDiscount =
    Boolean(product.discountPercent) && Boolean(product.originalPrice);
  const hasRating = typeof product.rating === "number";
  const showSpecial =
    hasDiscount || product.badges?.includes("opportunity");

  return (
    <Link
      href={`/product/${product.slug}`}
      target="_self"
      className={`relative flex grow cursor-pointer flex-col items-stretch justify-start overflow-hidden bg-[var(--color-neutral-000,#fff)] py-2 ${className}`}
    >
      {showSpecial ? (
        <div className="mb-1 flex items-center justify-start">
          <span className="text-xs font-bold text-[var(--color-primary-500,#ef4056)]">
            فروش ویژه
          </span>
        </div>
      ) : null}

      <div className="relative flex grow flex-row">
        <div className="ms-0 me-3 flex shrink-0 flex-col items-center">
          <div className="relative size-[118px] overflow-hidden rounded-lg">
            <Image
              src={product.imageUrl}
              alt={product.title}
              width={118}
              height={118}
              className={`size-full object-contain ${
                product.inStock ? "" : "opacity-60"
              }`}
            />
          </div>
        </div>

        <div className="flex min-w-0 grow flex-col items-stretch justify-start">
          <h3 className="line-clamp-2 text-xs font-bold leading-[1.8] text-[var(--color-neutral-700)]">
            {product.title}
          </h3>

          <div className="mb-1 mt-1 flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center">
              {product.inStock ? (
                <>
                  <span className="me-1 flex shrink-0 text-[var(--color-blue-500,#87d3e1)]">
                    <ProductAvailableIcon className="size-[18px] text-current" />
                  </span>
                  <p className="truncate text-[10px] text-[var(--color-neutral-600)]">
                    موجود در انبار {siteConfig.nameFa}
                  </p>
                </>
              ) : (
                <p className="text-[10px] text-[var(--color-hint-object-error)]">
                  ناموجود
                </p>
              )}
            </div>

            {hasRating ? (
              <div className="flex shrink-0 items-center">
                <p className="text-xs font-bold text-[var(--color-neutral-700)]">
                  {product.rating!.toLocaleString("fa-IR", {
                    maximumFractionDigits: 1,
                  })}
                </p>
                <span className="ms-2 flex shrink-0 text-[var(--color-icon-rating-0-2,#f9bc00)]">
                  <RatingStarIcon className="size-4 text-current" />
                </span>
              </div>
            ) : null}
          </div>

          <div className="flex flex-col items-stretch justify-between pt-1">
            <div className="flex items-center justify-between gap-2">
              {hasDiscount ? (
                <div className="flex items-center justify-center rounded-lg bg-[var(--color-hint-object-error)] px-1 text-white">
                  <span className="text-xs font-bold">
                    {formatDiscountPercent(product.discountPercent!)}
                  </span>
                </div>
              ) : (
                <span />
              )}
              <div className="flex grow items-center justify-end gap-1 text-base font-bold text-[var(--color-neutral-700)]">
                <span>{formatPrice(product.price.amount)}</span>
                <TomanIcon className="fill-[var(--color-icon-high-emphasis,#424750)] text-[var(--color-icon-high-emphasis,#424750)]" />
              </div>
            </div>
            {hasDiscount && product.originalPrice ? (
              <div className="flex items-center justify-between pe-5">
                <div className="ms-auto self-end text-xs text-[var(--color-neutral-300)] line-through">
                  {formatPrice(product.originalPrice.amount)}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  );
}
