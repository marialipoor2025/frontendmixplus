export type Money = {
  amount: number;
  currency: string;
};

/** Merchandising badges (Coolblue-style labels). */
export type ProductBadge = "mixplus-choice" | "opportunity";

export type Product = {
  id: string;
  title: string;
  slug: string;
  imageUrl: string;
  brandId: string;
  brandName: string;
  brandLogoUrl?: string;
  sellerId: string;
  sellerName: string;
  price: Money;
  originalPrice?: Money;
  discountPercent?: number;
  rating?: number;
  reviewCount?: number;
  /** Optional merchandising labels shown on the product image. */
  badges?: ProductBadge[];
  /** Product condition: brand-new or used/refurbished. */
  condition?: "new" | "used";
  inStock: boolean;
};
