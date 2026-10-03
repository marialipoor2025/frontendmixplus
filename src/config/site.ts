export const siteConfig = {
  name: "MixPlus",
  description:
    "Marketplace for household appliances — multiple sellers, multiple brands.",
  locale: "en",
  direction: "ltr" as "ltr" | "rtl",
  /** Swap to ASP.NET Core base URL when backend is ready */
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "",
  useMocks: process.env.NEXT_PUBLIC_USE_MOCKS !== "false",
};
