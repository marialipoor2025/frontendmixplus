import { ProductRecommendationCard } from "@/components/product/ProductRecommendationCard";
import { ScrollHorizontalWrapper } from "@/components/home/ScrollHorizontalWrapper";
import type { ProductRailSection } from "@/types/home";

type ProductRecommendationRailProps = {
  rail: ProductRailSection;
  /** Hide the mobile gray separator under the last rail. */
  isLast?: boolean;
};

function ProductRecommendationRail({
  rail,
  isLast = false,
}: ProductRecommendationRailProps) {
  if (rail.products.length === 0) return null;

  return (
    <div>
      <div className="lg:mb-[7px] lg:overflow-hidden lg:rounded-lg lg:border lg:border-[var(--color-neutral-200)] lg:bg-[var(--color-neutral-000)] lg:pb-6">
        <div className="px-4 pb-4 text-base font-bold leading-[1.5] text-[var(--color-neutral-850)] lg:px-6 lg:pt-4">
          {rail.title}
        </div>
        <div className="w-full">
          <ScrollHorizontalWrapper>
            <div className="flex w-max gap-3 px-3 lg:px-3">
              <div className="w-1 shrink-0 lg:w-0" aria-hidden />
              {rail.products.map((product) => (
                <ProductRecommendationCard key={product.id} product={product} />
              ))}
              <div className="w-1 shrink-0 lg:w-0" aria-hidden />
            </div>
          </ScrollHorizontalWrapper>
        </div>
      </div>
      {!isLast ? (
        <div className="my-4 h-2 bg-[var(--color-neutral-100)] lg:hidden" />
      ) : null}
    </div>
  );
}

type ProductRecommendationRailsProps = {
  rails: ProductRailSection[];
};

/**
 * PDP recommendation carousels: similar, bought-together, category rails.
 */
export function ProductRecommendationRails({
  rails,
}: ProductRecommendationRailsProps) {
  const visible = rails.filter((r) => r.products.length > 0);
  if (visible.length === 0) return null;

  return (
    <div className="flex flex-col py-5 lg:gap-4">
      {visible.map((rail, index) => (
        <ProductRecommendationRail
          key={rail.id}
          rail={rail}
          isLast={index === visible.length - 1}
        />
      ))}
    </div>
  );
}
