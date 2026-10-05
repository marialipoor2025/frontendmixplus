import { mockHomePageData } from "@/lib/mocks/home";
import type { Product } from "@/types/product";

export type SearchSuggestion = {
  id: string;
  label: string;
  href: string;
  kind: "product" | "brand" | "query";
};

function allProducts(): Product[] {
  const all = [
    ...mockHomePageData.amazingOffers,
    ...mockHomePageData.productRails.flatMap((r) => r.products),
  ];
  const map = new Map<string, Product>();
  for (const p of all) map.set(p.id, p);
  return [...map.values()];
}

/** Client-side autocomplete suggestions until Search suggest API exists. */
export function getSearchSuggestions(query: string, limit = 8): SearchSuggestion[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  const suggestions: SearchSuggestion[] = [];
  const brands = new Set<string>();

  for (const product of allProducts()) {
    if (suggestions.length >= limit) break;
    const hay = `${product.title} ${product.brandName}`.toLowerCase();
    if (!hay.includes(q)) continue;

    if (!brands.has(product.brandName) && product.brandName.toLowerCase().includes(q)) {
      brands.add(product.brandName);
      const brand = mockHomePageData.brands.find(
        (b) => b.name === product.brandName,
      );
      suggestions.push({
        id: `brand-${product.brandId}`,
        label: product.brandName,
        href: brand ? `/brand/${brand.slug}` : `/search?q=${encodeURIComponent(product.brandName)}`,
        kind: "brand",
      });
    }

    suggestions.push({
      id: product.id,
      label: product.title,
      href: `/product/${product.slug}`,
      kind: "product",
    });
  }

  if (suggestions.length < limit) {
    suggestions.unshift({
      id: `q-${q}`,
      label: `جستجو برای «${query.trim()}»`,
      href: `/search?q=${encodeURIComponent(query.trim())}`,
      kind: "query",
    });
  }

  return suggestions.slice(0, limit);
}
