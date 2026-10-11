export type CartMoney = { amount: number; currency: string };

export type CartLine = {
  id: string;
  productSlug: string;
  offerExternalKey: string;
  skuExternalKey: string;
  sellerExternalKey: string;
  sellerName: string;
  title: string;
  imageUrl: string;
  variantLabel?: string | null;
  unitPrice: number;
  originalPrice?: number | null;
  discountPercent?: number | null;
  currency: string;
  quantity: number;
  stockAvailable: number;
  inStock: boolean;
  lineTotal: number;
};

export type CartDto = {
  id: string;
  updatedAt: string;
  items: CartLine[];
  itemCount: number;
  currency: string;
  subtotal: number;
  couponCode?: string | null;
  couponLabel?: string | null;
  couponDiscount: number;
  giftCardCode?: string | null;
  giftCardBalance: number;
  giftCardApplied: number;
  walletBalance: number;
  walletApplied: number;
  payableBeforeShipping: number;
  hasStockIssues: boolean;
};

export type CheckoutAddress = {
  id: string;
  title: string;
  receiverName: string;
  phone: string;
  province: string;
  city: string;
  postalCode: string;
  addressLine: string;
  isDefault: boolean;
};

export type ShippingOption = {
  id: string;
  title: string;
  description: string;
  cost: number;
  minDays: number;
  maxDays: number;
  kind: "delivery" | "pickup" | string;
};

export type PickupBranch = {
  id: string;
  title: string;
  address: string;
  hours: string;
};

export type CheckoutQuote = {
  subtotal: number;
  shippingCost: number;
  shippingMethodId: string;
  shippingLabel: string;
  pickupBranchId?: string | null;
  pickupBranchLabel?: string | null;
  couponCode?: string | null;
  couponLabel?: string | null;
  couponDiscount: number;
  giftCardCode?: string | null;
  giftCardApplied: number;
  walletBalance: number;
  walletApplied: number;
  payableTotal: number;
  currency: string;
  itemCount: number;
  address?: CheckoutAddress | null;
};

export type PaymentStart = {
  paymentId: string;
  paymentKey: string;
  amount: number;
  currency: string;
  status: string;
  gateway: string;
  redirectUrl: string;
  summary: CheckoutQuote;
};

export type PaymentDto = {
  id: string;
  key: string;
  amount: number;
  currency: string;
  status: string;
  gateway: string;
  failureReason?: string | null;
  orderId?: string | null;
  createdAt: string;
  completedAt?: string | null;
  redirectUrl: string;
};

export type OrderDto = {
  id: string;
  code: string;
  status: string;
  customerName: string;
  subtotal: number;
  shipping: number;
  discount: number;
  giftCard: number;
  wallet: number;
  totalAmount: number;
  currency: string;
  couponCode?: string | null;
  shippingMethod: string;
  shippingLabel: string;
  pickupBranchId?: string | null;
  pickupBranchLabel?: string | null;
  paymentMethod: string;
  createdAt: string;
  itemCount: number;
  items: {
    id: string;
    productSlug: string;
    title: string;
    imageUrl: string;
    sellerName: string;
    variantLabel?: string | null;
    unitPrice: number;
    quantity: number;
    currency: string;
  }[];
};

export type AddCartItemInput = {
  productSlug: string;
  offerExternalKey: string;
  skuExternalKey?: string;
  sellerExternalKey?: string;
  sellerName?: string;
  title: string;
  imageUrl: string;
  variantLabel?: string;
  unitPrice: number;
  originalPrice?: number;
  discountPercent?: number;
  currency?: string;
  quantity?: number;
  stockAvailable?: number;
};
