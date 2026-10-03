export const siteConfig = {
  name: "MixPlus",
  description:
    "مارکت‌پلیس لوازم خانگی — چند فروشنده، چند برند.",
  locale: "fa",
  direction: "rtl" as "ltr" | "rtl",
  /** Swap to ASP.NET Core base URL when backend is ready */
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "",
  useMocks: process.env.NEXT_PUBLIC_USE_MOCKS !== "false",
  header: {
    searchPlaceholder: "جستجو",
    loginLabel: "ورود | ثبت‌نام",
    emptyCartTitle: "سبد خرید شما خالی است!",
  },
};
