import { ProductListingShell } from "@/components/catalog/ProductListingShell";
import { siteConfig } from "@/config/site";
import { getStockProducts } from "@/lib/api/catalog";
import { getMainNavData } from "@/lib/api/nav";
import {
  applyProductListing,
  parseListingSearchParams,
} from "@/lib/product-listing";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata = {
  title: "کالاهای استوک",
};

/** PLP of all published stock / used products. */
export default async function StockPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const query = parseListingSearchParams(sp);
  // Stock page is always used/stock condition.
  query.filters.condition = "used";

  const qRaw = sp.q;
  const q = Array.isArray(qRaw) ? qRaw[0] : qRaw;
  const sortRaw = sp.sort;
  const sort = Array.isArray(sortRaw) ? sortRaw[0] : sortRaw;

  const [nav, products] = await Promise.all([
    getMainNavData(),
    getStockProducts(q, sort),
  ]);

  const listing = applyProductListing(products, query);

  return (
    <ProductListingShell
      nav={nav}
      context={{
        title: "کالاهای استوک",
        subtitle: "فرصت‌های خرید اقتصادی از کالاهای استوک و کارکرده",
        breadcrumb: [
          { id: "home", title: siteConfig.nameFa, href: "/" },
          { id: "stock", title: "کالاهای استوک", href: "/stock" },
        ],
        basePath: "/stock",
      }}
      listing={listing}
      emptyMessage="فعلاً کالای استوکی برای نمایش نیست."
    />
  );
}
