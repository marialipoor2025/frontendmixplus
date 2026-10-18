import Link from "next/link";
import { ProductCard } from "@/components/home/ProductCard";
import { ScrollHorizontalWrapper } from "@/components/home/ScrollHorizontalWrapper";
import { ChevronLeftIcon } from "@/components/layout/icons";
import { ProductCardImage } from "@/components/product/ProductCardImage";
import { productPlaceholderSeed } from "@/lib/product-image-placeholder";
import type { ProductRailSection } from "@/types/home";
import type { Product } from "@/types/product";

type ProductRailProps = {
  rail: ProductRailSection;
};

function SeeAllCard({
  href,
  previewProducts,
  railSeed,
}: {
  href: string;
  previewProducts: Product[];
  railSeed: string;
}) {
  return (
    <Link
      href={href}
      aria-label="مشاهده همه"
      className="flex min-w-[140px] shrink-0 flex-col items-center justify-center gap-3 lg:min-w-[164px]"
    >
      <span className="relative flex h-[100px] w-[100px] items-center justify-center">
        {previewProducts.slice(0, 3).map((product, index) => (
          <span
            key={`${product.id}-${index}`}
            className="absolute overflow-hidden rounded-md border border-[var(--color-neutral-200)] bg-[var(--color-neutral-000)] shadow-sm"
            style={{
              width: 56,
              height: 56,
              transform: `translate(${(index - 1) * 14}px, ${(index - 1) * 6}px) rotate(${(index - 1) * 8}deg)`,
              zIndex: index,
            }}
          >
            <ProductCardImage
              src={product.imageUrl}
              alt=""
              seed={productPlaceholderSeed(product) || railSeed}
              fill={false}
              width={56}
              height={56}
              className="h-full w-full object-contain"
            />
          </span>
        ))}
      </span>
      <span className="text-xs font-medium text-[var(--color-neutral-700)]">
        مشاهده همه
      </span>
    </Link>
  );
}

/**
 * Shared Digikala product-rail template (same as یخچال فریزر):
 * title + subtitle + «مشاهده همه» + horizontal cards + nav arrows + see-all slide.
 */
export function ProductRail({ rail }: ProductRailProps) {
  const seeAllHref = rail.href ?? "#";
  const railSeed = rail.href ?? rail.id;

  return (
    <section className="w-full" aria-label={rail.title}>
      <div className="flex w-full flex-col gap-3">
        <div className="flex w-full items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-0.5">
            <h2 className="truncate text-base font-bold leading-[150%] text-[var(--color-text)]">
              {rail.title}
            </h2>
            {rail.subtitle ? (
              <p className="text-xs leading-[180%] text-[var(--color-neutral-500)]">
                {rail.subtitle}
              </p>
            ) : null}
          </div>

          {rail.href ? (
            <Link
              href={seeAllHref}
              className="inline-flex shrink-0 items-center gap-0.5 text-xs font-medium text-[var(--color-neutral-700)]"
            >
              <span>مشاهده همه</span>
              <ChevronLeftIcon className="text-[var(--color-icon-high-emphasis)]" />
            </Link>
          ) : null}
        </div>

        <ScrollHorizontalWrapper>
          <div className="flex w-max gap-3 pe-1">
            {rail.products.map((product) => {
              const withCategory: Product = {
                ...product,
                categoryId: product.categoryId ?? railSeed,
                categoryHref: product.categoryHref ?? rail.href,
              };
              return (
                <ProductCard
                  key={product.id}
                  product={withCategory}
                  showUsedLabel={rail.showUsedLabel}
                  showReviewScore={rail.showReviewScore !== false}
                  showCardLabels={Boolean(rail.showCardLabels)}
                  labelPosition={rail.labelPosition === "top" ? "top" : "beside"}
                />
              );
            })}
            {rail.href && rail.products.length > 0 ? (
              <SeeAllCard
                href={seeAllHref}
                previewProducts={rail.products.map((product) => ({
                  ...product,
                  categoryId: product.categoryId ?? railSeed,
                  categoryHref: product.categoryHref ?? rail.href,
                }))}
                railSeed={railSeed}
              />
            ) : null}
          </div>
        </ScrollHorizontalWrapper>
      </div>
    </section>
  );
}

type ProductRailsProps = {
  rails: ProductRailSection[];
};

/** Renders every rail with the same refrigerator-section template. */
export function ProductRails({ rails }: ProductRailsProps) {
  if (rails.length === 0) return null;

  return (
    <div className="flex w-full flex-col gap-6">
      {rails.map((rail) => (
        <ProductRail key={rail.id} rail={rail} />
      ))}
    </div>
  );
}
