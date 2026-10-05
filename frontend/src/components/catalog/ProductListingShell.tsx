import { ProductListingFilters } from "@/components/catalog/ProductListingFilters";
import { ProductListingPagination } from "@/components/catalog/ProductListingPagination";
import { ProductListingToolbar } from "@/components/catalog/ProductListingToolbar";
import { ProductCard } from "@/components/home/ProductCard";
import { MainNav } from "@/components/layout/MainNav";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { StickyHeaderShell } from "@/components/layout/StickyHeaderShell";
import { ProductBreadcrumb } from "@/components/product/ProductBreadcrumb";
import type { MainNavData } from "@/types/nav";
import type {
  ProductListingContext,
  ProductListingResult,
} from "@/types/product-listing";

type ProductListingShellProps = {
  nav: MainNavData;
  context: ProductListingContext;
  listing: ProductListingResult;
  emptyMessage?: string;
};

/** Shared PLP chrome for category, brand, and search listings. */
export function ProductListingShell({
  nav,
  context,
  listing,
  emptyMessage = "محصولی با این فیلترها پیدا نشد.",
}: ProductListingShellProps) {
  return (
    <>
      <StickyHeaderShell>
        <SiteHeader />
        <MainNav data={nav} />
      </StickyHeaderShell>

      <div className="site-container flex-1 pt-1 lg:pt-2">
        {context.breadcrumb?.length ? (
          <ProductBreadcrumb items={context.breadcrumb} />
        ) : null}

        <section className="pb-10">
          <h1 className="mb-1 text-base font-bold text-[var(--color-neutral-900)] lg:text-lg">
            {context.title}
          </h1>
          {context.subtitle ? (
            <p className="mb-4 text-sm text-[var(--color-neutral-500)]">
              {context.subtitle}
            </p>
          ) : (
            <div className="mb-4" />
          )}

          <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
            <ProductListingFilters
              basePath={context.basePath}
              query={listing.query}
              facets={listing.facets}
            />

            <div>
              <ProductListingToolbar
                basePath={context.basePath}
                query={listing.query}
                total={listing.total}
              />

              {listing.items.length === 0 ? (
                <p className="rounded-xl border border-dashed border-[var(--color-border)] px-4 py-12 text-center text-sm text-[var(--color-muted)]">
                  {emptyMessage}
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                  {listing.items.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      className="!w-full !min-w-0"
                    />
                  ))}
                </div>
              )}

              <ProductListingPagination
                basePath={context.basePath}
                query={listing.query}
                pageCount={listing.pageCount}
              />
            </div>
          </div>
        </section>
      </div>

      <SiteFooter />
    </>
  );
}
