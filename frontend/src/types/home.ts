import type { Brand } from "./brand";
import type { Product } from "./product";

export type HomeBanner = {
  id: string;
  title: string;
  imageUrl: string;
  href: string;
  alt: string;
};

export type HomeCategory = {
  id: string;
  title: string;
  href: string;
  imageUrl: string;
};

export type ProductRailSection = {
  id: string;
  title: string;
  /** Digikala-style secondary line, e.g. «بر اساس سلیقه شما» */
  subtitle?: string;
  href?: string;
  /** Show «کارکرده» badge on used products (only for the used/new rail). */
  showUsedLabel?: boolean;
  /** Show rating stars on cards in this rail (default true). */
  showReviewScore?: boolean;
  /** Show merchandising badges on cards. */
  showCardLabels?: boolean;
  /** Badge placement when labels are on. */
  labelPosition?: "beside" | "top";
  products: Product[];
};

export type HomePageData = {
  topBanner?: HomeBanner;
  heroSlides: HomeBanner[];
  categories: HomeCategory[];
  amazingOffers: Product[];
  midBanners: HomeBanner[];
  brands: Brand[];
  productRails: ProductRailSection[];
  bottomBanners: HomeBanner[];
};
