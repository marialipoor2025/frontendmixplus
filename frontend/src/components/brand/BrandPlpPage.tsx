import { ProductListingShell } from "@/components/catalog/ProductListingShell";
import {
  applyProductListing,
  parseListingSearchParams,
} from "@/lib/product-listing";
import type { Brand } from "@/types/brand";
import type { MainNavData } from "@/types/nav";
import type { Product } from "@/types/product";

type BrandPlpPageProps = {
  brand: Brand;
  nav: MainNavData;
  products: Product[];
  searchParams?: Record<string, string | string[] | undefined>;
};

/** Brand listing (PLP) for `/brand/{slug}` links. */
export function BrandPlpPage({
  brand,
  nav,
  products,
  searchParams = {},
}: BrandPlpPageProps) {
  const query = parseListingSearchParams(searchParams);
  const listing = applyProductListing(products, query);

  return (
    <ProductListingShell
      nav={nav}
      context={{
        title: `محصولات ${brand.name}`,
        breadcrumb: [
          { id: "home", title: "خانه", href: "/" },
          { id: "brands", title: "برندها", href: "/brand" },
          { id: brand.id, title: brand.name, href: `/brand/${brand.slug}` },
        ],
        basePath: `/brand/${brand.slug}`,
      }}
      listing={listing}
      emptyMessage="فعلاً محصولی از این برند نمایش داده نمی‌شود."
    />
  );
}
