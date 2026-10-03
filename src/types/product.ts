export type Money = {
  amount: number;
  currency: string;
};

export type Product = {
  id: string;
  title: string;
  slug: string;
  imageUrl: string;
  brandId: string;
  brandName: string;
  sellerId: string;
  sellerName: string;
  price: Money;
  originalPrice?: Money;
  discountPercent?: number;
  rating?: number;
  reviewCount?: number;
  inStock: boolean;
};
