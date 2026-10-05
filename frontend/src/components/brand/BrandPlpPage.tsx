import { ProductCard } from "@/components/home/ProductCard";
import { MainNav } from "@/components/layout/MainNav";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { StickyHeaderShell } from "@/components/layout/StickyHeaderShell";
import { ProductBreadcrumb } from "@/components/product/ProductBreadcrumb";
import type { Brand } from "@/types/brand";
import type { MainNavData } from "@/types/nav";
import type { Product } from "@/types/product";

type BrandPlpPageProps = {
  brand: Brand;
  nav: MainNavData;
  products: Product[];
};

/** Brand listing (PLP) for `/brand/{slug}` links from homepage showcase. */
export function BrandPlpPage({ brand, nav, products }: BrandPlpPageProps) {
  return (
    <>
      <StickyHeaderShell>
        <SiteHeader />
        <MainNav data={nav} />
      </StickyHeaderShell>

      <div className="site-container flex-1 pt-1 lg:pt-2">
        <ProductBreadcrumb
          items={[
            { id: "home", title: "خانه", href: "/" },
            { id: "brands", title: "برندها", href: "/brand" },
            { id: brand.id, title: brand.name, href: `/brand/${brand.slug}` },
          ]}
        />

        <section className="pb-10">
          <h1 className="mb-4 text-base font-bold text-[var(--color-neutral-900)] lg:text-lg">
            محصولات {brand.name}
          </h1>

          {products.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[var(--color-border)] px-4 py-12 text-center text-sm text-[var(--color-muted)]">
              فعلاً محصولی از این برند نمایش داده نمی‌شود.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  className="!w-full !min-w-0"
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <SiteFooter />
    </>
  );
}
