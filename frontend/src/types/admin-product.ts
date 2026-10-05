import type { Money, Product, ProductBadge } from "@/types/product";

/** One gallery asset attached to a product (order = display order). */
export type ProductMediaItem = {
  id: string;
  url: string;
  thumbUrl?: string;
  alt: string;
  isPrimary: boolean;
};

/** Admin product = homepage card fields + publish flag. */
export type AdminProduct = Product & {
  isPublished: boolean;
  /** Optional multi-image gallery; primary drives `imageUrl`. */
  gallery?: ProductMediaItem[];
  categoryId?: string | null;
  categoryName?: string | null;
};

export type UpsertAdminProductInput = {
  id?: string;
  title: string;
  slug: string;
  imageUrl: string;
  /** Ordered media ids for PDP gallery (backend product↔media link). */
  mediaIds?: string[];
  gallery?: ProductMediaItem[];
  brandId: string;
  brandName: string;
  brandLogoUrl?: string;
  sellerId: string;
  sellerName: string;
  categoryId?: string | null;
  price: Money;
  originalPrice?: Money | null;
  discountPercent?: number | null;
  rating?: number | null;
  reviewCount?: number | null;
  badges?: ProductBadge[] | null;
  condition?: "new" | "used" | null;
  inStock: boolean;
  isPublished: boolean;
};

export type AdminBrandOption = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
};

export type AdminSellerOption = {
  id: string;
  name: string;
  slug: string;
  rating?: number | null;
};
