import Image from "next/image";
import Link from "next/link";
import { TomanIcon } from "@/components/layout/icons";
import { formatDiscountPercent, formatPrice } from "@/lib/format";
import type { Product } from "@/types/product";

type ProductRecommendationCardProps = {
  product: Product;
};

/**
 * Compact PDP recommendation card (similar / bought-together rails).
 * Image + 2-line title + price with optional discount.
 */
export function ProductRecommendationCard({
  product,
}: ProductRecommendationCardProps) {
  const hasDiscount =
    Boolean(product.discountPercent) && Boolean(product.originalPrice);

  return (
    <Link
      href={`/product/${product.slug}`}
      target="_self"
      data-rail-item
      className="box-content flex h-60 w-[140px] min-w-[140px] shrink-0 flex-col justify-between overflow-hidden rounded-md border border-[var(--color-neutral-200)] bg-[var(--color-neutral-000)] lg:h-[17rem] lg:w-[164px] lg:min-w-[164px] lg:border-[var(--color-neutral-100)]"
    >
      <div className="flex w-full items-center justify-center">
        <div
          className="relative size-[140px] lg:size-[164px]"
          role="img"
          aria-label={product.title}
        >
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            sizes="(min-width: 1024px) 164px, 140px"
            className="object-contain"
          />
        </div>
      </div>

      <div className="flex h-full w-full flex-col items-start justify-between gap-1 p-2 pt-1">
        <p className="line-clamp-2 h-8 w-full text-xs font-medium leading-[1.8] text-[var(--color-icon-high-emphasis)] lg:h-[50px] lg:text-[13px]">
          {product.title}
        </p>

        <div className="flex w-full items-end justify-end lg:h-11">
          {hasDiscount && product.originalPrice ? (
            <div className="flex flex-col items-start pt-0.5">
              <div className="flex items-center justify-start gap-1">
                <span className="flex h-4 shrink-0 items-center justify-center rounded-full bg-[var(--color-hint-object-error)] px-1 text-[11px] font-bold leading-none text-white">
                  {formatDiscountPercent(product.discountPercent!)}
                </span>
                <span className="text-xs leading-4 text-[var(--color-neutral-300)] line-through">
                  {formatPrice(product.originalPrice.amount)}
                </span>
              </div>
              <div className="flex items-center">
                <span className="me-1 text-base font-bold leading-6 text-[var(--color-neutral-800)]">
                  {formatPrice(product.price.amount)}
                </span>
                <span className="flex" aria-hidden>
                  <TomanIcon className="fill-[var(--color-icon-high-emphasis)] text-[var(--color-icon-high-emphasis)]" />
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-row items-center justify-start">
              <span className="me-1 text-base font-bold leading-6 text-[var(--color-neutral-800)]">
                {formatPrice(product.price.amount)}
              </span>
              <span className="flex" aria-hidden>
                <TomanIcon className="fill-[var(--color-icon-high-emphasis)] text-[var(--color-icon-high-emphasis)]" />
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
