import { siteConfig } from "@/config/site";
import {
  getMockBrandProducts,
  getMockBrands,
  resolveMockBrand,
} from "@/lib/mocks/brand-plp";
import type { Brand } from "@/types/brand";
import type { Product, ProductBadge } from "@/types/product";
import { apiClient } from "./client";

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
};

function mapBrand(dto: CatalogBrandDto): Brand {
  return {
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
    logoUrl: dto.logoUrl,
  };
}

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

export async function getProductsByBrandSlug(
  slug: string,
  q?: string,
  sort?: string,
): Promise<Product[]> {
  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) {
    const brand = resolveMockBrand(slug);
    return brand ? getMockBrandProducts(brand) : [];
  }

  const rows = await apiClient<CatalogProductDto[]>("/api/catalog/products", {
    query: {
      brandSlug: slug,
      q: q?.trim() || undefined,
      sort: sort || undefined,
    },
  });
  return rows.map(mapProduct);
}

/** Category PLP products — live Catalog filter by categorySlug, mock fallback. */
export async function getProductsByCategorySlug(
  slugParts: string[],
  q?: string,
  sort?: string,
): Promise<Product[]> {
  const leaf = slugParts[slugParts.length - 1] ?? slugParts.join("-");

  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) {
    const { getMockCategoryProducts } = await import("@/lib/mocks/category-plp");
    return getMockCategoryProducts(slugParts);
  }

  try {
    const rows = await apiClient<CatalogProductDto[]>("/api/catalog/products", {
      query: {
        categorySlug: leaf,
        q: q?.trim() || undefined,
        sort: sort || undefined,
      },
    });
    if (rows.length > 0) return rows.map(mapProduct);

    if (slugParts.length > 1) {
      // Try each ancestor leaf → root so nested paths still resolve.
      for (let i = slugParts.length - 2; i >= 0; i -= 1) {
        const ancestor = await apiClient<CatalogProductDto[]>(
          "/api/catalog/products",
          {
            query: {
              categorySlug: slugParts[i],
              q: q?.trim() || undefined,
              sort: sort || undefined,
            },
          },
        );
        if (ancestor.length > 0) return ancestor.map(mapProduct);
      }

      const joined = await apiClient<CatalogProductDto[]>(
        "/api/catalog/products",
        {
          query: {
            categorySlug: slugParts.join("-"),
            q: q?.trim() || undefined,
            sort: sort || undefined,
          },
        },
      );
      if (joined.length > 0) return joined.map(mapProduct);
    }

    const { getMockCategoryProducts } = await import("@/lib/mocks/category-plp");
    return getMockCategoryProducts(slugParts);
  } catch {
    const { getMockCategoryProducts } = await import("@/lib/mocks/category-plp");
    return getMockCategoryProducts(slugParts);
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
