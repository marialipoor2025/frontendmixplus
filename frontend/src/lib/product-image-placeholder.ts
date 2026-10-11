/** Default catalog seed image — treat as “no image”. */
const DEFAULT_PRODUCT_PLACEHOLDER = "/placeholders/product-appliance.png";

/** Distinct soft fills so each category reads differently on rails/PLP. */
const CATEGORY_PLACEHOLDER_PALETTE = [
  { bg: "#DCEAF5", fg: "#2A6A96" },
  { bg: "#DDF0E4", fg: "#2F7A4B" },
  { bg: "#F3E6D8", fg: "#9A6230" },
  { bg: "#E8E4F4", fg: "#5B4A9A" },
  { bg: "#F5E0E3", fg: "#A04555" },
  { bg: "#E0F0F2", fg: "#2F7A82" },
  { bg: "#F0EAD8", fg: "#7A6A2E" },
  { bg: "#E4E9F5", fg: "#3D5A99" },
  { bg: "#EDE4F0", fg: "#7A3F8C" },
  { bg: "#E5F0DC", fg: "#4F7A2E" },
  { bg: "#F5E8DC", fg: "#8B5530" },
  { bg: "#DCEEF0", fg: "#2E6E78" },
  { bg: "#F2E2EA", fg: "#8C3F66" },
  { bg: "#E2EAF0", fg: "#3F5F7A" },
  { bg: "#F0ECDD", fg: "#6E6430" },
  { bg: "#E6E8F5", fg: "#454F99" },
] as const;

export type CategoryPlaceholderColors = {
  bg: string;
  fg: string;
};

export function isMissingProductImage(url: string | null | undefined): boolean {
  if (url == null) return true;
  const trimmed = url.trim();
  if (!trimmed) return true;
  if (trimmed === DEFAULT_PRODUCT_PLACEHOLDER) return true;
  if (trimmed.endsWith(DEFAULT_PRODUCT_PLACEHOLDER)) return true;
  return false;
}

function hashSeed(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return h;
}

/** Stable colors for a category (or other seed when category is unknown). */
export function categoryPlaceholderColors(
  seed: string | null | undefined,
): CategoryPlaceholderColors {
  const key = (seed ?? "product").trim() || "product";
  const index = hashSeed(key) % CATEGORY_PLACEHOLDER_PALETTE.length;
  return CATEGORY_PLACEHOLDER_PALETTE[index]!;
}

/** Prefer category id/href; fall back so colors stay stable per product. */
export function productPlaceholderSeed(product: {
  categoryId?: string | null;
  categoryHref?: string | null;
  id: string;
}): string {
  return product.categoryId || product.categoryHref || product.id;
}
