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
  slug: string;
  iconUrl: string;
};

export type ProductRailSection = {
  id: string;
  title: string;
  href?: string;
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
};
