export type ProfileNavItem = {
  id: string;
  href: string;
  title: string;
  description?: string;
};

/** Digikala-style account sidebar — maps to Customer Account features 83–98. */
export const PROFILE_NAV: ProfileNavItem[] = [
  { id: "dashboard", href: "/profile", title: "خلاصه حساب", description: "نمای کلی حساب کاربری" },
  { id: "personal", href: "/profile/personal-info", title: "اطلاعات حساب", description: "نام، موبایل و مشخصات" },
  { id: "addresses", href: "/profile/addresses", title: "آدرس‌ها", description: "مدیریت آدرس‌های ارسال" },
  { id: "orders", href: "/profile/orders", title: "سفارش‌ها", description: "تاریخچه خرید" },
  { id: "wishlist", href: "/profile/wishlist", title: "علاقه‌مندی‌ها", description: "محصولات ذخیره‌شده" },
  { id: "reviews", href: "/profile/reviews", title: "دیدگاه‌ها", description: "نظرات ثبت‌شده" },
  { id: "notifications", href: "/profile/notifications", title: "پیام‌ها", description: "اعلان‌ها و پیام‌ها" },
  { id: "history", href: "/profile/recently-viewed", title: "بازدیدهای اخیر", description: "محصولات دیده‌شده" },
  { id: "wallet", href: "/profile/wallet", title: "کیف پول", description: "موجودی و تراکنش‌ها" },
  { id: "gift-cards", href: "/profile/gift-cards", title: "کارت هدیه", description: "مدیریت کارت‌های هدیه" },
];

export function identityLabel(user: {
  displayName?: string | null;
  phone?: string | null;
  email?: string | null;
}) {
  return user.phone || user.email || user.displayName || "کاربر میکس پلاس";
}
