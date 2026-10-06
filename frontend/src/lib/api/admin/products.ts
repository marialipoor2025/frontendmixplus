import { apiClient } from "@/lib/api/client";
import { siteConfig } from "@/config/site";
import type {
  AdminBrandOption,
  AdminProduct,
  AdminSellerOption,
  UpsertAdminProductInput,
} from "@/types/admin-product";
import type { PagedResult } from "@/types/paging";
import { paginateLocal } from "@/types/paging";
import type { ProductBadge } from "@/types/product";

type ApiMoney = { amount: number; currency: string };

type ApiAdminProduct = {
  id: string;
  title: string;
  slug: string;
  imageUrl: string;
  brandId: string;
  brandName: string;
  brandLogoUrl?: string | null;
  sellerId: string;
  sellerName: string;
  categoryId?: string | null;
  categoryName?: string | null;
  price: ApiMoney;
  originalPrice?: ApiMoney | null;
  discountPercent?: number | null;
  rating?: number | null;
  reviewCount?: number | null;
  badges?: string[] | null;
  condition?: string | null;
  inStock: boolean;
  isPublished: boolean;
  gallery?: {
    id: string;
    url: string;
    thumbUrl: string;
    alt: string;
    isPrimary: boolean;
  }[] | null;
};

function mapProduct(row: ApiAdminProduct): AdminProduct {
  const badges = (row.badges ?? []).filter(
    (b): b is ProductBadge => b === "mixplus-choice" || b === "opportunity",
  );
  const gallery = (row.gallery ?? []).map((g) => ({
    id: g.id,
    url: g.url,
    thumbUrl: g.thumbUrl,
    alt: g.alt,
    isPrimary: g.isPrimary,
  }));
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    imageUrl: row.imageUrl,
    brandId: row.brandId,
    brandName: row.brandName,
    brandLogoUrl: row.brandLogoUrl ?? undefined,
    sellerId: row.sellerId,
    sellerName: row.sellerName,
    categoryId: row.categoryId ?? undefined,
    categoryName: row.categoryName ?? undefined,
    price: { amount: Number(row.price.amount), currency: row.price.currency },
    originalPrice: row.originalPrice
      ? {
          amount: Number(row.originalPrice.amount),
          currency: row.originalPrice.currency,
        }
      : undefined,
    discountPercent: row.discountPercent ?? undefined,
    rating: row.rating == null ? undefined : Number(row.rating),
    reviewCount: row.reviewCount ?? undefined,
    badges: badges.length ? badges : undefined,
    condition: row.condition === "used" ? "used" : "new",
    inStock: row.inStock,
    isPublished: row.isPublished,
    gallery: gallery.length ? gallery : undefined,
  };
}

function useLiveApi() {
  return Boolean(siteConfig.apiBaseUrl) && !siteConfig.useMocks;
}

type ApiPagedProducts = {
  items: ApiAdminProduct[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export async function listAdminProducts(params?: {
  q?: string;
  isPublished?: boolean;
  page?: number;
  pageSize?: number;
}): Promise<PagedResult<AdminProduct>> {
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 10;

  if (!useLiveApi()) {
    const { mockAdminCatalogProducts } = await import("@/lib/mocks/admin-products");
    const filtered = mockAdminCatalogProducts.filter((p) => {
      if (params?.isPublished != null && p.isPublished !== params.isPublished) return false;
      if (params?.q) {
        const q = params.q.trim().toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.slug.includes(q) ||
          p.brandName.toLowerCase().includes(q)
        );
      }
      return true;
    });
    return paginateLocal(filtered, page, pageSize);
  }

  const result = await apiClient<ApiPagedProducts>("/api/admin/catalog/products", {
    query: {
      q: params?.q,
      isPublished: params?.isPublished,
      page,
      pageSize,
    },
  });

  return {
    items: result.items.map(mapProduct),
    page: result.page,
    pageSize: result.pageSize,
    totalCount: result.totalCount,
    totalPages: result.totalPages,
  };
}

export async function getAdminProduct(id: string): Promise<AdminProduct> {
  if (!useLiveApi()) {
    const { mockAdminCatalogProducts } = await import("@/lib/mocks/admin-products");
    const found = mockAdminCatalogProducts.find((p) => p.id === id);
    if (!found) throw new Error("محصول یافت نشد");
    return found;
  }
  return mapProduct(await apiClient<ApiAdminProduct>(`/api/admin/catalog/products/${id}`));
}

function toApiBody(input: UpsertAdminProductInput) {
  const mediaIds = (input.mediaIds ?? []).filter((id) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      id,
    ),
  );
  const { gallery: _gallery, ...rest } = input;
  return { ...rest, mediaIds };
}

export async function createAdminProduct(
  input: UpsertAdminProductInput,
): Promise<AdminProduct> {
  if (!useLiveApi()) {
    throw new Error("برای ایجاد محصول، API را روشن کنید (USE_MOCKS=false)");
  }
  const row = await apiClient<ApiAdminProduct>("/api/admin/catalog/products", {
    method: "POST",
    body: JSON.stringify(toApiBody(input)),
  });
  return mapProduct(row);
}

export async function updateAdminProduct(
  id: string,
  input: UpsertAdminProductInput,
): Promise<AdminProduct> {
  if (!useLiveApi()) {
    throw new Error("برای ویرایش محصول، API را روشن کنید (USE_MOCKS=false)");
  }
  const row = await apiClient<ApiAdminProduct>(`/api/admin/catalog/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(toApiBody(input)),
  });
  return mapProduct(row);
}

export async function setAdminProductStatus(
  id: string,
  isPublished: boolean,
): Promise<AdminProduct> {
  if (!useLiveApi()) {
    throw new Error("برای تغییر وضعیت، API را روشن کنید (USE_MOCKS=false)");
  }
  const row = await apiClient<ApiAdminProduct>(
    `/api/admin/catalog/products/${id}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ isPublished }),
    },
  );
  return mapProduct(row);
}

export async function listAdminBrands(): Promise<AdminBrandOption[]> {
  if (!useLiveApi()) {
    const { mockAdminBrandOptions } = await import("@/lib/mocks/admin-products");
    return mockAdminBrandOptions;
  }
  return apiClient<AdminBrandOption[]>("/api/catalog/brands");
}

export async function listAdminSellers(): Promise<AdminSellerOption[]> {
  if (!useLiveApi()) {
    const { mockAdminSellerOptions } = await import("@/lib/mocks/admin-products");
    return mockAdminSellerOptions;
  }
  return apiClient<AdminSellerOption[]>("/api/sellers");
}
