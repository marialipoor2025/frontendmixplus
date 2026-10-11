import { apiClient } from "@/lib/api/client";
import { siteConfig } from "@/config/site";
import type {
  AddCartItemInput,
  CartDto,
  CheckoutAddress,
  CheckoutQuote,
  OrderDto,
  PaymentDto,
  PaymentStart,
  PickupBranch,
  ShippingOption,
} from "@/types/cart";

export const CART_CHANGED_EVENT = "mixplus:cart-changed";

function enabled() {
  return !siteConfig.useMocks && Boolean(siteConfig.apiBaseUrl);
}

export function notifyCartChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(CART_CHANGED_EVENT));
}

export async function getCart(): Promise<CartDto | null> {
  if (!enabled()) return null;
  return apiClient<CartDto>("/api/cart", { auth: true });
}

export async function getCartCount(): Promise<number> {
  if (!enabled()) return 0;
  try {
    const res = await apiClient<{ count: number }>("/api/cart/count", {
      auth: true,
    });
    return res.count ?? 0;
  } catch {
    return 0;
  }
}

export async function addCartItem(input: AddCartItemInput): Promise<CartDto> {
  const cart = await apiClient<CartDto>("/api/cart/items", {
    method: "POST",
    auth: true,
    body: JSON.stringify({
      productSlug: input.productSlug,
      offerExternalKey: input.offerExternalKey,
      skuExternalKey: input.skuExternalKey,
      sellerExternalKey: input.sellerExternalKey,
      sellerName: input.sellerName,
      title: input.title,
      imageUrl: input.imageUrl,
      variantLabel: input.variantLabel,
      unitPrice: input.unitPrice,
      originalPrice: input.originalPrice,
      discountPercent: input.discountPercent,
      currency: input.currency ?? "IRT",
      quantity: input.quantity ?? 1,
      stockAvailable: input.stockAvailable,
    }),
  });
  notifyCartChanged();
  return cart;
}

export async function updateCartItemQty(
  lineId: string,
  quantity: number,
): Promise<CartDto> {
  const cart = await apiClient<CartDto>(
    `/api/cart/items/${encodeURIComponent(lineId)}`,
    {
      method: "PATCH",
      auth: true,
      body: JSON.stringify({ quantity }),
    },
  );
  notifyCartChanged();
  return cart;
}

export async function removeCartItem(lineId: string): Promise<CartDto> {
  const cart = await apiClient<CartDto>(
    `/api/cart/items/${encodeURIComponent(lineId)}`,
    { method: "DELETE", auth: true },
  );
  notifyCartChanged();
  return cart;
}

export async function revalidateCart(): Promise<CartDto> {
  const cart = await apiClient<CartDto>("/api/cart/revalidate", {
    method: "POST",
    auth: true,
  });
  notifyCartChanged();
  return cart;
}

export async function applyCartCoupon(code: string): Promise<CartDto> {
  const cart = await apiClient<CartDto>("/api/cart/coupon", {
    method: "POST",
    auth: true,
    body: JSON.stringify({ code }),
  });
  notifyCartChanged();
  return cart;
}

export async function clearCartCoupon(): Promise<CartDto> {
  const cart = await apiClient<CartDto>("/api/cart/coupon", {
    method: "DELETE",
    auth: true,
  });
  notifyCartChanged();
  return cart;
}

export async function applyCartGiftCard(code: string): Promise<CartDto> {
  const cart = await apiClient<CartDto>("/api/cart/gift-card", {
    method: "POST",
    auth: true,
    body: JSON.stringify({ code }),
  });
  notifyCartChanged();
  return cart;
}

export async function applyCartWallet(amount: number): Promise<CartDto> {
  const cart = await apiClient<CartDto>("/api/cart/wallet", {
    method: "POST",
    auth: true,
    body: JSON.stringify({ amount }),
  });
  notifyCartChanged();
  return cart;
}

export async function listCheckoutAddresses(): Promise<CheckoutAddress[]> {
  return apiClient<CheckoutAddress[]>("/api/checkout/addresses", { auth: true });
}

export async function createCheckoutAddress(
  body: Omit<CheckoutAddress, "id">,
): Promise<CheckoutAddress> {
  return apiClient<CheckoutAddress>("/api/checkout/addresses", {
    method: "POST",
    auth: true,
    body: JSON.stringify(body),
  });
}

export async function getShippingOptions(
  addressId?: string,
): Promise<ShippingOption[]> {
  const q = addressId
    ? `?addressId=${encodeURIComponent(addressId)}`
    : "";
  return apiClient<ShippingOption[]>(`/api/checkout/shipping-options${q}`, {
    auth: true,
  });
}

export async function getPickupBranches(): Promise<PickupBranch[]> {
  return apiClient<PickupBranch[]>("/api/checkout/pickup-branches", {
    auth: true,
  });
}

export async function quoteCheckout(input: {
  addressId?: string;
  shippingMethodId: string;
  pickupBranchId?: string;
  couponCode?: string;
  giftCardCode?: string;
  walletAmount?: number;
}): Promise<CheckoutQuote> {
  return apiClient<CheckoutQuote>("/api/checkout/quote", {
    method: "POST",
    auth: true,
    body: JSON.stringify(input),
  });
}

export async function startCheckoutPayment(input: {
  addressId?: string;
  shippingMethodId: string;
  pickupBranchId?: string;
  couponCode?: string;
  giftCardCode?: string;
  walletAmount?: number;
}): Promise<PaymentStart> {
  return apiClient<PaymentStart>("/api/checkout/payments", {
    method: "POST",
    auth: true,
    body: JSON.stringify(input),
  });
}

export async function getPayment(paymentId: string): Promise<PaymentDto> {
  return apiClient<PaymentDto>(
    `/api/checkout/payments/${encodeURIComponent(paymentId)}`,
    { auth: true },
  );
}

export async function paymentCallback(
  paymentId: string,
  result: "success" | "failed",
  reason?: string,
): Promise<{ payment: PaymentDto; order: OrderDto | null }> {
  const res = await apiClient<{ payment: PaymentDto; order: OrderDto | null }>(
    `/api/checkout/payments/${encodeURIComponent(paymentId)}/callback`,
    {
      method: "POST",
      auth: true,
      body: JSON.stringify({ result, reason }),
    },
  );
  notifyCartChanged();
  return res;
}

export async function retryPayment(paymentId: string): Promise<{
  paymentId: string;
  redirectUrl: string;
}> {
  return apiClient(`/api/checkout/payments/${encodeURIComponent(paymentId)}/retry`, {
    method: "POST",
    auth: true,
  });
}

export async function getOrder(orderId: string): Promise<OrderDto> {
  return apiClient<OrderDto>(
    `/api/checkout/orders/${encodeURIComponent(orderId)}`,
    { auth: true },
  );
}
