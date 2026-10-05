import { ProductListingShell } from "@/components/catalog/ProductListingShell";
import { getMainNavData } from "@/lib/api/nav";
import { mockHomePageData } from "@/lib/mocks/home";
import {
  applyProductListing,
  parseListingSearchParams,
} from "@/lib/product-listing";
import type { Product } from "@/types/product";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function collectMockProducts(): Product[] {
  const all = [
    ...mockHomePageData.amazingOffers,
    ...mockHomePageData.productRails.flatMap((r) => r.products),
  ];
  const map = new Map<string, Product>();
  for (const p of all) map.set(p.id, p);
  return [...map.values()];
}

/** Lightweight fuzzy-ish match for Phase-2 frontend until Search module ships. */
function searchProducts(products: Product[], q: string): Product[] {
  const needle = q.trim().toLowerCase();
  if (!needle) return products;

  const tokens = needle.split(/\s+/).filter(Boolean);
  return products.filter((p) => {
    const hay = `${p.title} ${p.slug} ${p.brandName}`.toLowerCase();
    if (hay.includes(needle)) return true;
    // tolerate 1-char typos by checking token prefixes / includes
    return tokens.every((token) => {
      if (hay.includes(token)) return true;
      if (token.length < 3) return false;
      return hay.split(/[\s\-_/]+/).some((word) => {
        if (word.startsWith(token.slice(0, Math.max(3, token.length - 1)))) {
          return true;
        }
        let distance = 0;
        const a = token;
        const b = word.slice(0, token.length + 1);
        if (Math.abs(a.length - b.length) > 1) return false;
        let i = 0;
        let j = 0;
        while (i < a.length && j < b.length) {
          if (a[i] === b[j]) {
            i++;
            j++;
            continue;
          }
          distance++;
          if (distance > 1) return false;
          if (a.length > b.length) i++;
          else if (b.length > a.length) j++;
          else {
            i++;
            j++;
          }
        }
        distance += a.length - i + (b.length - j);
        return distance <= 1;
      });
    });
  });
}

export async function generateMetadata({ searchParams }: PageProps) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  return { title: q ? `جستجو: ${q}` : "جستجو" };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const query = parseListingSearchParams(sp);
  const matched = searchProducts(collectMockProducts(), query.q ?? "");
  const listing = applyProductListing(matched, query);
  const nav = await getMainNavData();

  return (
    <ProductListingShell
      nav={nav}
      context={{
        title: query.q ? `نتایج جستجو برای «${query.q}»` : "جستجو در میکپلاس",
        subtitle: "فیلتر و مرتب‌سازی نتایج جستجو",
        basePath: "/search",
      }}
      listing={listing}
      emptyMessage="نتیجه‌ای پیدا نشد. عبارت دیگری را امتحان کنید."
    />
  );
}
