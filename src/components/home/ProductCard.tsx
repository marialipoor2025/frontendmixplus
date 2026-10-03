import Image from "next/image";
import Link from "next/link";
import { TomanIcon } from "@/components/layout/icons";
import { resolveBrandLogoUrl } from "@/lib/brand-logos";
import {
  formatDiscountPercent,
  formatPrice,
  formatReviewCount,
} from "@/lib/format";
import type { Product, ProductBadge } from "@/types/product";

type ProductCardProps = {
  product: Product;
  className?: string;
  /** When true, show «کارکرده» only for used products. */
  showUsedLabel?: boolean;
};

/**
 * Flip to `true` later to restore merchandising / stock / used labels on cards.
 */
const SHOW_PRODUCT_LABELS = false;

/** Two-line labels (Coolblue Choice style). */
const BADGE_LINES: Record<ProductBadge, [string, string?]> = {
  "mixplus-choice": ["انتخاب", "میکپلاس"],
  opportunity: ["فرصت", "خرید"],
};

/** Responsive widths matching the card at each breakpoint (Next Image optimizer). */
const PRODUCT_IMAGE_SIZES =
  "(min-width: 1024px) 200px, (min-width: 640px) 172px, 148px";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-hidden>
      {Array.from({ length: 5 }, (_, index) => {
        const filled = index + 1 <= Math.round(rating);
        return (
          <span
            key={index}
            className={`flex size-3 items-center justify-center rounded-full text-[7px] leading-none sm:size-3.5 sm:text-[8px] ${
              filled
                ? "bg-[var(--color-success)] text-white"
                : "bg-[var(--color-neutral-200)] text-[var(--color-neutral-400)]"
            }`}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}

/**
 * Soft-edged arrow badge: rounded body + gentle tip.
 */
function ArrowBadge({
  lines,
  tone,
}: {
  lines: [string, string?];
  tone: "choice" | "opportunity";
}) {
  const fill =
    tone === "choice"
      ? "var(--color-offers-blue)"
      : "var(--color-secondary-700)";

  return (
    <span className="inline-flex max-w-full items-stretch">
      <span
        className="flex min-h-[1.55rem] flex-col justify-center rounded-s-lg py-0.5 pe-1 ps-1.5 text-[9px] font-semibold leading-[1.2] text-white sm:min-h-[1.7rem] sm:text-[10px]"
        style={{ background: fill }}
      >
        <span className="whitespace-nowrap">{lines[0]}</span>
        {lines[1] ? (
          <span className="whitespace-nowrap">{lines[1]}</span>
        ) : null}
      </span>
      <svg
        aria-hidden
        viewBox="0 0 8 24"
        className="h-auto w-[7px] shrink-0 self-stretch sm:w-[8px]"
        preserveAspectRatio="none"
      >
        <path d="M0 0 C4 6 8 10 8 12 C8 14 4 18 0 24 Z" fill={fill} />
      </svg>
    </span>
  );
}

function UsedLabel() {
  return (
    <span className="inline-flex max-w-full rounded-full bg-[rgb(13_68_133/0.1)] px-1.5 py-0.5 text-[9px] font-semibold leading-none text-[var(--color-secondary-700)] sm:text-[10px]">
      کارکرده
    </span>
  );
}

function StockLabel({ inStock }: { inStock: boolean }) {
  return (
    <span
      className={`inline-flex max-w-full rounded-full px-1.5 py-0.5 text-[9px] font-semibold leading-none sm:text-[10px] ${
        inStock
          ? "bg-[rgb(0_160_73/0.12)] text-[var(--color-success)]"
          : "bg-[rgb(211_47_47/0.1)] text-[var(--color-hint-object-error)]"
      }`}
    >
      {inStock ? "موجود" : "ناموجود"}
    </span>
  );
}

/**
 * Shared marketplace product card:
 * brand, image, title, reviews, price (+ optional labels when enabled).
 */
export function ProductCard({
  product,
  className = "",
  showUsedLabel = false,
}: ProductCardProps) {
  const hasDiscount =
    Boolean(product.discountPercent) && Boolean(product.originalPrice);
  const brandLogoUrl = resolveBrandLogoUrl(
    product.brandId,
    product.brandLogoUrl,
  );
  const badges = product.badges ?? [];
  const hasReviews =
    typeof product.rating === "number" &&
    typeof product.reviewCount === "number";
  const showBadgeColumn = SHOW_PRODUCT_LABELS && badges.length > 0;
  const isUsed =
    SHOW_PRODUCT_LABELS && showUsedLabel && product.condition === "used";

  return (
    <Link
      href={`/product/${product.slug}`}
      target="_self"
      className={`box-content flex w-[160px] min-w-[140px] shrink-0 flex-col justify-between overflow-hidden rounded-md border border-[var(--color-neutral-200)] bg-[var(--color-neutral-000)] lg:min-w-[164px] ${className}`}
    >
      <div className="flex items-center justify-end gap-1 px-2 pt-2">
        {SHOW_PRODUCT_LABELS ? (
          <span className="me-auto flex min-w-0 flex-wrap items-center gap-1">
            {isUsed ? <UsedLabel /> : null}
            <StockLabel inStock={product.inStock} />
          </span>
        ) : null}
        <span className="flex min-w-0 max-w-full items-center justify-end gap-1">
          {brandLogoUrl ? (
            <Image
              src={brandLogoUrl}
              alt=""
              width={16}
              height={16}
              className="size-4 shrink-0 object-contain"
            />
          ) : null}
          <span className="truncate text-[10px] font-bold leading-none text-[var(--color-neutral-500)] sm:text-[11px]">
            {product.brandName}
          </span>
        </span>
      </div>

      <div
        dir="ltr"
        className="flex items-start gap-1 px-1.5 pt-1 sm:gap-1.5 sm:px-2"
      >
        {showBadgeColumn ? (
          <div className="flex w-[clamp(3rem,20%,4.25rem)] shrink-0 flex-col items-start gap-1 pt-0.5">
            {badges.map((badge) => (
              <ArrowBadge
                key={badge}
                lines={BADGE_LINES[badge]}
                tone={badge === "mixplus-choice" ? "choice" : "opportunity"}
              />
            ))}
          </div>
        ) : null}

        <div
          className={`relative aspect-square min-w-0 flex-1 ${
            showBadgeColumn ? "" : "w-full"
          }`}
        >
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            sizes={PRODUCT_IMAGE_SIZES}
            className={`object-contain p-1 sm:p-1.5 ${
              product.inStock ? "" : "opacity-60"
            }`}
          />
        </div>
      </div>

      <div className="flex h-full w-full flex-col items-start justify-between gap-1 p-2 pt-1">
        <p className="line-clamp-2 h-[3.6em] w-full overflow-hidden text-ellipsis break-words text-xs font-medium leading-[1.8] text-[var(--color-icon-high-emphasis)]">
          {product.title}
        </p>

        {hasReviews ? (
          <div className="flex w-full items-center gap-1.5">
            <StarRating rating={product.rating!} />
            <span className="truncate text-[10px] text-[var(--color-icon-secondary)] sm:text-[11px]">
              {formatReviewCount(product.reviewCount!)}
            </span>
          </div>
        ) : null}

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
              <div className="flex items-center justify-start gap-1">
                <span className="me-1 text-base font-bold leading-6 text-[var(--color-neutral-800)]">
                  {formatPrice(product.price.amount)}
                </span>
              </div>
              <div className="flex items-center">
                <span className="flex" aria-hidden>
                  <TomanIcon className="fill-[var(--color-icon-high-emphasis)] text-[var(--color-icon-high-emphasis)]" />
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
