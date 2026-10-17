import { siteConfig } from "@/config/site";
import {
  absoluteMediaUrl,
  normalizeDiscountPricing,
} from "@/lib/media-url";
import { mockHomePageData } from "@/lib/mocks/home";
import type { HomePageData } from "@/types/home";
import type { Product } from "@/types/product";
import { apiClient } from "./client";

function mapHomeProduct(p: Product): Product {
  const money = normalizeDiscountPricing({
    price: Number(p.price?.amount ?? 0),
    originalPrice: p.originalPrice?.amount,
    discountPercent: p.discountPercent,
  });
  const currency = p.price?.currency || "IRT";
  const imageUrl = p.imageUrl?.trim() ? absoluteMediaUrl(p.imageUrl) : "";
  return {
    ...p,
    imageUrl,
    brandLogoUrl: p.brandLogoUrl
      ? absoluteMediaUrl(p.brandLogoUrl)
      : undefined,
    price: { amount: money.price, currency },
    originalPrice:
      money.originalPrice != null
        ? { amount: money.originalPrice, currency }
        : undefined,
    discountPercent: money.discountPercent,
  };
}

function mapHomeData(data: HomePageData): HomePageData {
  return {
    ...data,
    topBanner: data.topBanner
      ? { ...data.topBanner, imageUrl: absoluteMediaUrl(data.topBanner.imageUrl) }
      : undefined,
    heroSlides: data.heroSlides.map((b) => ({
      ...b,
      imageUrl: absoluteMediaUrl(b.imageUrl),
    })),
    categories: data.categories.map((c) => ({
      ...c,
      imageUrl: absoluteMediaUrl(c.imageUrl),
    })),
    amazingOffers: data.amazingOffers.map(mapHomeProduct),
    midBanners: data.midBanners.map((b) => ({
      ...b,
      imageUrl: absoluteMediaUrl(b.imageUrl),
    })),
    brands: data.brands.map((b) => ({
      ...b,
      logoUrl: absoluteMediaUrl(b.logoUrl),
    })),
    productRails: data.productRails.map((rail) => ({
      ...rail,
      products: rail.products.map(mapHomeProduct),
    })),
    bottomBanners: data.bottomBanners.map((b) => ({
      ...b,
      imageUrl: absoluteMediaUrl(b.imageUrl),
    })),
  };
}

/**
 * Fill empty marketing slots with seeded defaults so the homepage never looks blank.
 */
function withMarketingDefaults(data: HomePageData): HomePageData {
  const defaults = mockHomePageData;
  return {
    ...data,
    topBanner: data.topBanner ?? defaults.topBanner,
    heroSlides:
      data.heroSlides.length > 0 ? data.heroSlides : defaults.heroSlides,
    midBanners:
      data.midBanners.length > 0 ? data.midBanners : defaults.midBanners,
    bottomBanners:
      data.bottomBanners.length > 0
        ? data.bottomBanners
        : defaults.bottomBanners,
  };
}

/**
 * Home page data source.
 * - Mock mode (default): returns local fixtures
 * - Live mode: GET /api/home from ASP.NET Core
 */
export async function getHomePageData(): Promise<HomePageData> {
  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) {
    return mockHomePageData;
  }

  const data = await apiClient<HomePageData>("/api/home");
  return withMarketingDefaults(mapHomeData(data));
}
