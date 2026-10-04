import { AmazingOffers } from "@/components/home/AmazingOffers";
import { BottomBanners } from "@/components/home/BottomBanners";
import { BrandShowcase } from "@/components/home/BrandShowcase";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { HeroSlider } from "@/components/home/HeroSlider";
import { MidBanners } from "@/components/home/MidBanners";
import { ProductRails } from "@/components/home/ProductRail";
import { SiteFeatures } from "@/components/home/SiteFeatures";
import { MainNav } from "@/components/layout/MainNav";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { StickyHeaderShell } from "@/components/layout/StickyHeaderShell";
import type { HomePageData } from "@/types/home";
import type { MainNavData } from "@/types/nav";

type HomePageProps = {
  data: HomePageData;
  nav: MainNavData;
};

/**
 * Digikala-inspired homepage composition (outside-in).
 * Each section below will be replaced with a real component
 * as you share its design reference.
 */
export function HomePage({ data, nav }: HomePageProps) {
  return (
    <>
      <StickyHeaderShell>
        <SiteHeader />
        <MainNav data={nav} />
      </StickyHeaderShell>
      <main className="site-container flex-1 space-y-6 py-6">
        <HeroSlider slides={data.heroSlides} />
        <SiteFeatures />
        <AmazingOffers products={data.amazingOffers} />
        <CategoriesSection categories={data.categories} />
        <MidBanners banners={data.midBanners} />
        <ProductRails rails={data.productRails} />
        <BrandShowcase brands={data.brands} />
        <BottomBanners banners={data.bottomBanners} />
      </main>
      <SiteFooter />
    </>
  );
}
