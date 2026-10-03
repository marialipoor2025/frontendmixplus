import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/home/ProductCard";
import { ScrollHorizontalWrapper } from "@/components/home/ScrollHorizontalWrapper";
import { ChevronLeftIcon } from "@/components/layout/icons";
import type { ProductRailSection } from "@/types/home";

type ProductRailProps = {
  rail: ProductRailSection;
};

function SeeAllCard({
  href,
  previewImages,
}: {
  href: string;
  previewImages: string[];
}) {
  return (
    <Link
      href={href}
      aria-label="مشاهده همه"
      className="flex min-w-[140px] shrink-0 flex-col items-center justify-center gap-3 lg:min-w-[164px]"
    >
      <span className="relative flex h-[100px] w-[100px] items-center justify-center">
        {previewImages.slice(0, 3).map((src, index) => (
          <span
            key={`${src}-${index}`}
            className="absolute overflow-hidden rounded-md border border-[var(--color-neutral-200)] bg-[var(--color-neutral-000)] shadow-sm"
            style={{
              width: 56,
              height: 56,
              transform: `translate(${(index - 1) * 14}px, ${(index - 1) * 6}px) rotate(${(index - 1) * 8}deg)`,
              zIndex: index,
            }}
          >
            <Image
              src={src}
              alt=""
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
  const previewImages = rail.products.map((p) => p.imageUrl);

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
            {rail.products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                showUsedLabel={rail.showUsedLabel}
              />
            ))}
            {rail.href && rail.products.length > 0 ? (
              <SeeAllCard href={seeAllHref} previewImages={previewImages} />
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
