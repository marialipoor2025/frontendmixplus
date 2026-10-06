import { siteConfig } from "@/config/site";

/** Make Catalog/Media paths loadable from the Next app (absolute API host). */
export function absoluteMediaUrl(url: string): string {
  if (!url) return url;
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("blob:") ||
    url.startsWith("data:") ||
    url.startsWith("/placeholders/") ||
    url.startsWith("/brand/")
  ) {
    return url;
  }
  const base = (siteConfig.apiBaseUrl || "").replace(/\/$/, "");
  if (!base) return url;
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
}

/**
 * Heal inverted list/sale amounts (list must be &gt; sale when a discount exists).
 * Older seller saves sometimes stored the base price in `price` and a stale smaller original.
 */
export function normalizeDiscountPricing(input: {
  price: number;
  originalPrice?: number | null;
  discountPercent?: number | null;
}): {
  price: number;
  originalPrice?: number;
  discountPercent?: number;
} {
  let price = Number(input.price) || 0;
  let originalPrice =
    input.originalPrice != null && input.originalPrice > 0
      ? Number(input.originalPrice)
      : undefined;
  let discountPercent =
    input.discountPercent != null && input.discountPercent > 0
      ? Math.min(99, Math.round(Number(input.discountPercent)))
      : undefined;

  if (
    originalPrice != null &&
    discountPercent != null &&
    originalPrice < price
  ) {
    const list = price;
    price = Math.round(list * (1 - discountPercent / 100));
    originalPrice = list;
  }

  if (
    originalPrice == null ||
    discountPercent == null ||
    originalPrice <= price
  ) {
    return { price };
  }

  return { price, originalPrice, discountPercent };
}
