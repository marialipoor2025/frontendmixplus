import type { Money, Product, ProductBadge } from "@/types/product";

/** Admin product = homepage card fields + publish flag. */
export type AdminProduct = Product & {
  isPublished: boolean;
};

export type UpsertAdminProductInput = {
  id?: string;
  title: string;
  slug: string;
  imageUrl: string;
  brandId: string;
  brandName: string;
  brandLogoUrl?: string;
  sellerId: string;
  sellerName: string;
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
