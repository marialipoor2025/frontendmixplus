import { apiClient } from "@/lib/api/client";
import { siteConfig } from "@/config/site";
import type { ProductMediaItem } from "@/types/admin-product";
import type { PagedResult } from "@/types/paging";

export type SellerMe = {
  id: string;
  name: string;
  slug?: string;
  status: string;
  isActive: boolean;
};

export type SellerProductListItem = {
  id: string;
  title: string;
  slug: string;
  imageUrl: string;
  brandName: string;
  isPublished: boolean;
  inStock: boolean;
  mediaCount: number;
  price: { amount: number; currency: string };
};

export type SellerProduct = {
  id: string;
  title: string;
  slug: string;
  imageUrl: string;
  isPublished: boolean;
  inStock: boolean;
  gallery: ProductMediaItem[];
};

export type SellerProductSortBy =
  | "title"
  | "slug"
  | "price"
  | "stock"
  | "status"
  | "media";

export type ListSellerProductsParams = {
  q?: string;
  isPublished?: boolean;
  inStock?: boolean;
  sortBy?: SellerProductSortBy;
  sortDir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
};

type ApiMedia = {
  id: string;
  url: string;
  thumbUrl: string;
  alt: string;
  isPrimary: boolean;
};

type ApiPagedProducts = {
  items: SellerProductListItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

function apiBase() {
  return siteConfig.apiBaseUrl.replace(/\/$/, "");
}

function absoluteUrl(url: string) {
  if (!url || url.startsWith("http") || url.startsWith("blob:")) return url;
  return `${apiBase()}${url.startsWith("/") ? "" : "/"}${url}`;
}

export async function getSellerMe(): Promise<SellerMe> {
  return apiClient<SellerMe>("/api/seller/me", { auth: true });
}

export async function updateSellerProfile(input: {
  name: string;
  slug?: string;
}): Promise<SellerMe> {
  return apiClient<SellerMe>("/api/seller/me", {
    method: "PUT",
    auth: true,
    body: JSON.stringify({
      name: input.name,
      slug: input.slug || null,
    }),
  });
}

/**
 * Soft lookup for portal gate: null = not registered yet; throws on inactive/auth errors.
 */
export async function tryGetSellerMe(): Promise<SellerMe | null> {
  try {
    return await getSellerMe();
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (
      message.includes("یافت نشد") ||
      message.includes("seller_not_registered")
    ) {
      return null;
    }
    throw err;
  }
}

/** Self-serve shop creation for any authenticated phone/email user. */
export async function registerSeller(shopName: string): Promise<SellerMe> {
  return apiClient<SellerMe>("/api/seller/register", {
    method: "POST",
    auth: true,
    body: JSON.stringify({ shopName }),
  });
}

export async function listSellerProducts(
  params?: ListSellerProductsParams,
): Promise<PagedResult<SellerProductListItem>> {
  const result = await apiClient<ApiPagedProducts>("/api/seller/products", {
    auth: true,
    query: {
      q: params?.q,
      isPublished: params?.isPublished,
      inStock: params?.inStock,
      sortBy: params?.sortBy,
      sortDir: params?.sortDir,
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 10,
    },
  });

  return {
    items: (result.items ?? []).map((row) => ({
      ...row,
      brandName: row.brandName ?? "",
      price: row.price ?? { amount: 0, currency: "IRR" },
      imageUrl: absoluteUrl(row.imageUrl),
    })),
    page: result.page,
    pageSize: result.pageSize,
    totalCount: result.totalCount,
    totalPages: result.totalPages,
  };
}

/** Quick publish / unpublish from seller dashboard. */
export async function setSellerProductPublished(
  id: string,
  isPublished: boolean,
): Promise<void> {
  await apiClient(`/api/seller/products/${encodeURIComponent(id)}/publish`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify({ isPublished }),
  });
}

export async function getSellerProduct(id: string): Promise<SellerProduct> {
  const row = await apiClient<{
    id: string;
    title: string;
    slug: string;
    imageUrl: string;
    isPublished: boolean;
    inStock: boolean;
    gallery: ApiMedia[];
  }>(`/api/seller/products/${encodeURIComponent(id)}`, { auth: true });

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    imageUrl: absoluteUrl(row.imageUrl),
    isPublished: row.isPublished,
    inStock: row.inStock,
    gallery: (row.gallery ?? []).map((g) => ({
      id: g.id,
      url: absoluteUrl(g.url),
      thumbUrl: absoluteUrl(g.thumbUrl),
      alt: g.alt,
      isPrimary: g.isPrimary,
    })),
  };
}

export async function saveSellerProductMedia(
  id: string,
  mediaIds: string[],
): Promise<SellerProduct> {
  const row = await apiClient<{
    id: string;
    title: string;
    slug: string;
    imageUrl: string;
    isPublished: boolean;
    inStock: boolean;
    gallery: ApiMedia[];
  }>(`/api/seller/products/${encodeURIComponent(id)}/media`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify({ mediaIds }),
  });

  // Best-effort: copy originals into Digikala products mirror folder/{slug}.
  if (mediaIds.length > 0 && row.slug) {
    try {
      await apiClient("/api/media/mirror", {
        method: "POST",
        auth: true,
        body: JSON.stringify({
          assetIds: mediaIds,
          productSlug: row.slug,
        }),
      });
    } catch {
      /* non-blocking */
    }
  }

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    imageUrl: absoluteUrl(row.imageUrl),
    isPublished: row.isPublished,
    inStock: row.inStock,
    gallery: (row.gallery ?? []).map((g) => ({
      id: g.id,
      url: absoluteUrl(g.url),
      thumbUrl: absoluteUrl(g.thumbUrl),
      alt: g.alt,
      isPrimary: g.isPrimary,
    })),
  };
}
