export const siteConfig = {
  /** Marketplace English name (Oriya / OryaHome). */
  name: "Oriya Market",
  /** Persian marketplace label used in UI copy (search hint, offers, etc.) */
  nameFa: "اوریا مارکت",
  description: "بازار تخصصی لوازم خانگی ایران — چند فروشنده، چند برند.",
  locale: "fa",
  direction: "rtl" as "ltr" | "rtl",
  /** Marketplace logo — Persian mark with site blue→red gradient. */
  logoSrc: "/brand/oriya-logo-fa.png",
  /** English mark kept for bilingual surfaces. */
  logoSrcEn: "/brand/oriya-logo-en.png",
  /** Swap to ASP.NET Core base URL when backend is ready */
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "",
  useMocks: process.env.NEXT_PUBLIC_USE_MOCKS !== "false",
  header: {
    searchPlaceholder: "جستجو در اوریا مارکت",
    loginLabel: "ورود | ثبت‌نام",
    emptyCartTitle: "سبد خرید شما خالی است!",
  },
};
