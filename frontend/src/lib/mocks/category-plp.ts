import { mockHomePageData } from "@/lib/mocks/home";
import type { Product } from "@/types/product";

function uniqueProducts(items: Product[]) {
  const map = new Map<string, Product>();
  for (const p of items) map.set(p.id, p);
  return [...map.values()];
}

/** Temporary PLP products from homepage mocks until Catalog PLP API exists. */
export function getMockCategoryProducts(slugParts: string[]): Product[] {
  const all = uniqueProducts([
    ...mockHomePageData.amazingOffers,
    ...mockHomePageData.productRails.flatMap((r) => r.products),
  ]);

  const path = slugParts.join(" ").toLowerCase();
  const keywords = slugParts.flatMap((s) => s.split("-")).filter(Boolean);

  const scored = all
    .map((p) => {
      const hay = `${p.title} ${p.slug} ${p.brandName}`.toLowerCase();
      let score = 0;
      for (const k of keywords) {
        if (hay.includes(k)) score += 1;
      }
      if (path.includes("side") && (hay.includes("ساید") || hay.includes("side"))) {
        score += 3;
      }
      if (
        (path.includes("refrigerator") || path.includes("fridge")) &&
        (hay.includes("یخچال") || hay.includes("fridge") || hay.includes("refrigerator"))
      ) {
        score += 2;
      }
      return { p, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.p);

  // Fallback: show a few home products so the page never looks empty.
  return scored.length > 0 ? scored : all.slice(0, 8);
}
