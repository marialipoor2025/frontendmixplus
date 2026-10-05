import { siteConfig } from "@/config/site";
import { apiClient } from "@/lib/api/client";
import type { Product, ProductBadge } from "@/types/product";
import type { SearchSuggestion } from "@/lib/search-suggest";

type CatalogProductDto = {
  id: string;
  title: string;
  slug: string;
  imageUrl: string;
  brandId: string;
  brandName: string;
  brandLogoUrl?: string | null;
  sellerId: string;
  sellerName: string;
  price: { amount: number; currency: string };
  originalPrice?: { amount: number; currency: string } | null;
  discountPercent?: number | null;
  rating?: number | null;
  reviewCount?: number | null;
  badges?: string[] | null;
  condition?: "new" | "used" | null;
  inStock: boolean;
};

type SuggestDto = {
  id: string;
  label: string;
  href: string;
  kind: "product" | "brand" | "query";
};

function mapProduct(dto: CatalogProductDto): Product {
  return {
    id: dto.id,
    title: dto.title,
    slug: dto.slug,
    imageUrl: dto.imageUrl,
    brandId: dto.brandId,
    brandName: dto.brandName,
    brandLogoUrl: dto.brandLogoUrl ?? undefined,
    sellerId: dto.sellerId,
    sellerName: dto.sellerName,
    price: dto.price,
    originalPrice: dto.originalPrice ?? undefined,
    discountPercent: dto.discountPercent ?? undefined,
    rating: dto.rating ?? undefined,
    reviewCount: dto.reviewCount ?? undefined,
    badges: (dto.badges as ProductBadge[] | null | undefined) ?? undefined,
    condition: dto.condition ?? undefined,
    inStock: dto.inStock,
  };
}

/** Live Search module query; falls back to null for mock path. */
export async function searchProductsApi(q: string): Promise<Product[] | null> {
  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) return null;
  if (!q.trim()) return [];

  try {
    const rows = await apiClient<CatalogProductDto[]>("/api/search", {
      query: { q: q.trim(), limit: 48 },
    });
    return rows.map(mapProduct);
  } catch {
    return null;
  }
}

export async function fetchSearchSuggestions(
  q: string,
  limit = 8,
): Promise<SearchSuggestion[] | null> {
  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) return null;
  if (q.trim().length < 2) return [];

  try {
    const rows = await apiClient<SuggestDto[]>("/api/search/suggest", {
      query: { q: q.trim(), limit },
    });
    return rows.map((r) => ({
      id: r.id,
      label: r.label,
      href: r.href,
      kind: r.kind,
    }));
  } catch {
    return null;
  }
}
