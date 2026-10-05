import { ProductListingShell } from "@/components/catalog/ProductListingShell";
import type { ResolvedCategory } from "@/lib/category-path";
import {
  applyProductListing,
  parseListingSearchParams,
} from "@/lib/product-listing";
import type { MainNavData } from "@/types/nav";
import type { Product } from "@/types/product";

type CategoryPlpPageProps = {
  category: ResolvedCategory;
  nav: MainNavData;
  products: Product[];
  searchParams?: Record<string, string | string[] | undefined>;
};

/** Category listing (PLP) for mega-menu `/categories/...` links. */
export function CategoryPlpPage({
  category,
  nav,
  products,
  searchParams = {},
}: CategoryPlpPageProps) {
  const query = parseListingSearchParams(searchParams);
  const listing = applyProductListing(products, query);

  return (
    <ProductListingShell
      nav={nav}
      context={{
        title: category.title,
        breadcrumb: category.breadcrumb,
        basePath: category.href,
      }}
      listing={listing}
      emptyMessage="فعلاً محصولی در این دسته نمایش داده نمی‌شود."
    />
  );
}
