import type { Product } from "@/types/product";
import { mockHomePageData } from "./home";

export type ProfileAddress = {
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

export type ProfileOrderStatus =
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type ProfileOrder = {
  id: string;
  code: string;
  createdAt: string;
  status: ProfileOrderStatus;
  totalAmount: number;
  currency: string;
  itemCount: number;
  items: { title: string; imageUrl: string; qty: number }[];
  trackingCode?: string;
  trackingSteps?: { title: string; done: boolean; at?: string }[];
};

export type ProfileReview = {
  id: string;
  productTitle: string;
  rating: number;
  body: string;
  createdAt: string;
};

export type ProfileNotification = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
};

export type WalletTx = {
  id: string;
  title: string;
  amount: number;
  createdAt: string;
  type: "credit" | "debit";
};

export type GiftCard = {
  id: string;
  code: string;
  balance: number;
  expiresAt: string;
  status: "active" | "used" | "expired";
};

const sampleProducts = [
  ...(mockHomePageData.amazingOffers ?? []),
  ...(mockHomePageData.productRails?.[0]?.products ?? []),
].slice(0, 8);

export const mockAddresses: ProfileAddress[] = [
  {
    id: "addr-1",
    title: "منزل",
    receiverName: "کاربر میکس پلاس",
    phone: "09121234567",
    province: "تهران",
    city: "تهران",
    postalCode: "1234567890",
    addressLine: "خیابان ولیعصر، پلاک ۱۲۳، واحد ۴",
    isDefault: true,
  },
  {
    id: "addr-2",
    title: "محل کار",
    receiverName: "کاربر میکس پلاس",
    phone: "09121234567",
    province: "تهران",
    city: "تهران",
    postalCode: "1987654321",
    addressLine: "سعادت‌آباد، میدان کاج، برج آسمان، طبقه ۱۰",
    isDefault: false,
  },
];

export const mockOrders: ProfileOrder[] = [
  {
    id: "ord-1",
    code: "MP-1403-10021",
    createdAt: "1403/07/12",
    status: "shipped",
    totalAmount: 18_900_000,
    currency: "IRT",
    itemCount: 2,
    items: sampleProducts.slice(0, 2).map((p) => ({
      title: p.title,
      imageUrl: p.imageUrl,
      qty: 1,
    })),
    trackingCode: "TRK-908812",
    trackingSteps: [
      { title: "ثبت سفارش", done: true, at: "۱۲ مهر · ۱۰:۲۰" },
      { title: "آماده‌سازی", done: true, at: "۱۲ مهر · ۱۶:۴۰" },
      { title: "ارسال شده", done: true, at: "۱۳ مهر · ۰۹:۱۵" },
      { title: "تحویل", done: false },
    ],
  },
  {
    id: "ord-2",
    code: "MP-1403-09988",
    createdAt: "1403/06/28",
    status: "delivered",
    totalAmount: 7_450_000,
    currency: "IRT",
    itemCount: 1,
    items: sampleProducts.slice(2, 3).map((p) => ({
      title: p.title,
      imageUrl: p.imageUrl,
      qty: 1,
    })),
    trackingCode: "TRK-881120",
    trackingSteps: [
      { title: "ثبت سفارش", done: true },
      { title: "آماده‌سازی", done: true },
      { title: "ارسال شده", done: true },
      { title: "تحویل", done: true, at: "۳۰ شهریور" },
    ],
  },
];

export const mockWishlist: Product[] = sampleProducts.slice(0, 4);

export const mockReviews: ProfileReview[] = [
  {
    id: "rev-1",
    productTitle: sampleProducts[0]?.title ?? "محصول",
    rating: 4,
    body: "کیفیت ساخت خوب بود، بسته‌بندی مناسب رسید.",
    createdAt: "۱۴۰۳/۰۶/۱۵",
  },
];

export const mockNotifications: ProfileNotification[] = [
  {
    id: "n-1",
    title: "سفارش شما ارسال شد",
    body: "سفارش MP-1403-10021 توسط پست پیشتاز ارسال شد.",
    createdAt: "امروز · ۰۹:۲۰",
    read: false,
  },
  {
    id: "n-2",
    title: "کد تخفیف ویژه",
    body: "۱۰٪ تخفیف لوازم خانگی تا پایان هفته.",
    createdAt: "دیروز",
    read: true,
  },
];

export const mockRecentlyViewed: Product[] = sampleProducts.slice(0, 6);

export const mockWallet = {
  balance: 250_000,
  currency: "IRT",
  transactions: [
    {
      id: "w-1",
      title: "شارژ کیف پول",
      amount: 500_000,
      createdAt: "۱۰ مهر",
      type: "credit" as const,
    },
    {
      id: "w-2",
      title: "پرداخت سفارش MP-1403-09988",
      amount: 250_000,
      createdAt: "۲۸ شهریور",
      type: "debit" as const,
    },
  ] satisfies WalletTx[],
};

export const mockGiftCards: GiftCard[] = [
  {
    id: "g-1",
    code: "GIFT-MIX-7781",
    balance: 1_000_000,
    expiresAt: "1404/01/01",
    status: "active",
  },
];

export const orderStatusLabel: Record<ProfileOrderStatus, string> = {
  processing: "در حال پردازش",
  shipped: "ارسال شده",
  delivered: "تحویل شده",
  cancelled: "لغو شده",
};

export function formatIrt(amount: number) {
  return `${amount.toLocaleString("fa-IR")} تومان`;
}
