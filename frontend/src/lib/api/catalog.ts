import { siteConfig } from "@/config/site";
import {
  getMockBrandProducts,
  getMockBrands,
  resolveMockBrand,
} from "@/lib/mocks/brand-plp";
import {
  absoluteMediaUrl,
  normalizeDiscountPricing,
} from "@/lib/media-url";
import type { Brand } from "@/types/brand";
import type { Product, ProductBadge } from "@/types/product";
import type { ProductListingQuery } from "@/types/product-listing";
import { apiClient } from "./client";

export type CatalogListQuery = {
  brandSlug?: string;
  categorySlug?: string;
  condition?: string;
  q?: string;
  sort?: string;
  /** Comma-joined brand display names (matches facet values). */
  brand?: string;
  inStock?: boolean;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  pageSize?: number;
};

type CatalogBrandDto = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
};

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
  categoryId?: string | null;
  categoryName?: string | null;
  categorySlug?: string | null;
  categoryHref?: string | null;
  skuCode?: string | null;
  imageAlt?: string | null;
};

type CatalogProductsPageDto = {
  items?: CatalogProductDto[];
  products?: CatalogProductDto[];
  total?: number;
  page?: number;
  pageSize?: number;
};

function listingToCatalogQuery(
  partial: CatalogListQuery,
  listing?: ProductListingQuery,
): CatalogListQuery {
  if (!listing) return partial;
  return {
    ...partial,
    q: listing.q ?? partial.q,
    sort: listing.sort !== "relevance" ? listing.sort : partial.sort,
    brand: listing.filters.brands.length
      ? listing.filters.brands.join(",")
      : partial.brand,
    inStock: listing.filters.inStockOnly ? true : partial.inStock,
    minPrice: listing.filters.minPrice ?? partial.minPrice,
    maxPrice: listing.filters.maxPrice ?? partial.maxPrice,
    condition: listing.filters.condition ?? partial.condition,
  };
}

function normalizeProductRows(
  payload: CatalogProductDto[] | CatalogProductsPageDto,
): CatalogProductDto[] {
  if (Array.isArray(payload)) return payload;
  return payload.items ?? payload.products ?? [];
}

function mapBrand(dto: CatalogBrandDto): Brand {
  return {
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
    logoUrl: dto.logoUrl,
  };
}

function mapProduct(dto: CatalogProductDto): Product {
  const money = normalizeDiscountPricing({
    price: Number(dto.price?.amount ?? 0),
    originalPrice: dto.originalPrice?.amount,
    discountPercent: dto.discountPercent,
  });
  const currency = dto.price?.currency || "IRT";
  return {
    id: dto.id,
    title: dto.title,
    slug: dto.slug,
    imageUrl: dto.imageUrl?.trim() ? absoluteMediaUrl(dto.imageUrl) : "",
    brandId: dto.brandId,
    brandName: dto.brandName,
    brandLogoUrl: dto.brandLogoUrl
      ? absoluteMediaUrl(dto.brandLogoUrl)
      : undefined,
    sellerId: dto.sellerId,
    sellerName: dto.sellerName,
    price: { amount: money.price, currency },
    originalPrice:
      money.originalPrice != null
        ? { amount: money.originalPrice, currency }
        : undefined,
    discountPercent: money.discountPercent,
    rating: dto.rating ?? undefined,
    reviewCount: dto.reviewCount ?? undefined,
    badges: (dto.badges as ProductBadge[] | null | undefined) ?? undefined,
    condition: dto.condition ?? undefined,
    inStock: dto.inStock,
    categoryId: dto.categoryId ?? undefined,
    categoryName: dto.categoryName ?? undefined,
    categorySlug: dto.categorySlug ?? undefined,
    categoryHref: dto.categoryHref ?? undefined,
    skuCode: dto.skuCode ?? undefined,
    imageAlt: dto.imageAlt ?? undefined,
  };
}

export async function getBrands(): Promise<Brand[]> {
  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) {
    return getMockBrands();
  }

  const rows = await apiClient<CatalogBrandDto[]>("/api/catalog/brands");
  return rows.map(mapBrand);
}

export async function getBrandBySlug(slug: string): Promise<Brand | null> {
  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) {
    return resolveMockBrand(slug);
  }

  const rows = await apiClient<CatalogBrandDto[]>("/api/catalog/brands", {
    query: { slug },
  });
  return rows[0] ? mapBrand(rows[0]) : null;
}

async function fetchCatalogProducts(
  query: CatalogListQuery,
): Promise<Product[]> {
  const payload = await apiClient<
    CatalogProductDto[] | CatalogProductsPageDto
  >("/api/catalog/products", {
    query: {
      brandSlug: query.brandSlug,
      categorySlug: query.categorySlug,
      condition: query.condition,
      q: query.q?.trim() || undefined,
      sort: query.sort || undefined,
      brand: query.brand || undefined,
      inStock: query.inStock ? true : undefined,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      page: query.page,
      pageSize: query.pageSize,
    },
  });
  return normalizeProductRows(payload).map(mapProduct);
}

export async function getProductsByBrandSlug(
  slug: string,
  q?: string,
  sort?: string,
  listing?: ProductListingQuery,
): Promise<Product[]> {
  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) {
    const brand = resolveMockBrand(slug);
    return brand ? getMockBrandProducts(brand) : [];
  }

  return fetchCatalogProducts(
    listingToCatalogQuery(
      { brandSlug: slug, q, sort },
      listing,
    ),
  );
}

/** Category PLP products — live Catalog filter by categorySlug. */
export async function getProductsByCategorySlug(
  slugParts: string[],
  q?: string,
  sort?: string,
  listing?: ProductListingQuery,
): Promise<Product[]> {
  const leaf = slugParts[slugParts.length - 1] ?? slugParts.join("-");

  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) {
    const { getMockCategoryProducts } = await import("@/lib/mocks/category-plp");
    return getMockCategoryProducts(slugParts);
  }

  try {
    const base = listingToCatalogQuery(
      { categorySlug: leaf, q, sort },
      listing,
    );
    const rows = await fetchCatalogProducts(base);
    if (rows.length > 0) return rows;

    if (slugParts.length > 1) {
      for (let i = slugParts.length - 2; i >= 0; i -= 1) {
        const ancestor = await fetchCatalogProducts({
          ...base,
          categorySlug: slugParts[i],
        });
        if (ancestor.length > 0) return ancestor;
      }

      const joined = await fetchCatalogProducts({
        ...base,
        categorySlug: slugParts.join("-"),
      });
      if (joined.length > 0) return joined;
    }

    return [];
  } catch {
    return [];
  }
}

/** Stock / used products PLP (`condition=used`). */
export async function getStockProducts(
  q?: string,
  sort?: string,
  listing?: ProductListingQuery,
): Promise<Product[]> {
  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) {
    const { mockHomePageData } = await import("@/lib/mocks/home");
    const all = [
      ...mockHomePageData.amazingOffers,
      ...mockHomePageData.productRails.flatMap((r) => r.products),
    ];
    const map = new Map<string, Product>();
    for (const p of all) {
      if (p.condition === "used") map.set(p.id, p);
    }
    let rows = [...map.values()];
    const needle = (listing?.q ?? q)?.trim().toLowerCase();
    if (needle) {
      rows = rows.filter((p) =>
        `${p.title} ${p.brandName} ${p.slug}`.toLowerCase().includes(needle),
      );
    }
    return rows;
  }

  try {
    return await fetchCatalogProducts(
      listingToCatalogQuery(
        { condition: "used", q, sort },
        listing,
      ),
    );
  } catch {
    return [];
  }
}

/** Single published product card by slug/key for PDP shell fields. */
export async function getCatalogProductBySlug(
  slug: string,
): Promise<Product | null> {
  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) return null;
  try {
    const row = await apiClient<CatalogProductDto>(
      `/api/catalog/products/${encodeURIComponent(slug)}`,
    );
    return mapProduct(row);
  } catch {
    return null;
  }
}
