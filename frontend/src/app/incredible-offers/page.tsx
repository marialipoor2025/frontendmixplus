import { ProductListingShell } from "@/components/catalog/ProductListingShell";
import { getHomePageData } from "@/lib/api/home";
import { getMainNavData } from "@/lib/api/nav";
import {
  applyProductListing,
  parseListingSearchParams,
} from "@/lib/product-listing";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata = {
  title: "پیشنهادهای ویژه",
  description: "پیشنهادهای شگفت‌انگیز و تخفیف‌های ویژه میکپلاس.",
};

export default async function IncredibleOffersPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const query = parseListingSearchParams(sp);
  const [home, nav] = await Promise.all([getHomePageData(), getMainNavData()]);
  const listing = applyProductListing(home.amazingOffers, query);

  return (
    <ProductListingShell
      nav={nav}
      context={{
        title: "پیشنهادهای ویژه",
        subtitle: "همه کالاهای شگفت‌انگیز و تخفیف‌دار",
        basePath: "/incredible-offers",
        breadcrumb: [
          { id: "home", title: "خانه", href: "/" },
          {
            id: "incredible-offers",
            title: "پیشنهادهای ویژه",
            href: "/incredible-offers",
          },
        ],
      }}
      listing={listing}
      emptyMessage="در حال حاضر پیشنهاد ویژه‌ای فعال نیست."
    />
  );
}
