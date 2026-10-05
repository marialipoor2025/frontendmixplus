import { apiClient } from "@/lib/api/client";
import { siteConfig } from "@/config/site";

export const WISHLIST_CHANGED_EVENT = "mixplus:wishlist-changed";

export type WishlistItemDto = {
  id: string;
  productSlug: string;
  title: string;
  imageUrl: string;
  price: { amount: number; currency: string };
};

export type AddWishlistInput = {
  productSlug: string;
  title: string;
  imageUrl: string;
  priceAmount: number;
  priceCurrency?: string;
};

function enabled() {
  return !siteConfig.useMocks && Boolean(siteConfig.apiBaseUrl);
}

export function notifyWishlistChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(WISHLIST_CHANGED_EVENT));
}

export async function listWishlist(): Promise<WishlistItemDto[]> {
  if (!enabled()) return [];
  return apiClient<WishlistItemDto[]>("/api/wishlist", { auth: true });
}

export async function getWishlistCount(): Promise<number> {
  if (!enabled()) return 0;
  try {
    const res = await apiClient<{ count: number }>("/api/wishlist/count", {
      auth: true,
    });
    return res.count ?? 0;
  } catch {
    return 0;
  }
}

export async function isInWishlist(productSlug: string): Promise<boolean> {
  if (!enabled()) return false;
  try {
    const res = await apiClient<{ inWishlist: boolean }>(
      `/api/wishlist/contains/${encodeURIComponent(productSlug)}`,
      { auth: true },
    );
    return Boolean(res.inWishlist);
  } catch {
    return false;
  }
}

export async function addToWishlist(
  input: AddWishlistInput,
): Promise<WishlistItemDto> {
  const item = await apiClient<WishlistItemDto>("/api/wishlist", {
    method: "POST",
    auth: true,
    body: JSON.stringify({
      productSlug: input.productSlug,
      title: input.title,
      imageUrl: input.imageUrl,
      priceAmount: input.priceAmount,
      priceCurrency: input.priceCurrency ?? "IRT",
    }),
  });
  notifyWishlistChanged();
  return item;
}

export async function removeFromWishlist(productSlug: string): Promise<void> {
  await apiClient<void>(`/api/wishlist/${encodeURIComponent(productSlug)}`, {
    method: "DELETE",
    auth: true,
  });
  notifyWishlistChanged();
}
