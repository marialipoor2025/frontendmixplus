import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SectionPlaceholder } from "@/components/home/SectionPlaceholder";
import type { HomePageData } from "@/types/home";

type HomePageProps = {
  data: HomePageData;
};

/**
 * Digikala-inspired homepage composition (outside-in).
 * Each section below will be replaced with a real component
 * as you share its design reference.
 */
export function HomePage({ data }: HomePageProps) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1440px] flex-1 space-y-4 px-4 py-4 md:px-6 md:py-6">
        <SectionPlaceholder
          name="TopBanner"
          description={`Promo strip. Mock: ${data.topBanner?.title ?? "none"}`}
        />
        <SectionPlaceholder
          name="MainNav / CategoryMenu"
          description="Primary category navigation under the header."
        />
        <SectionPlaceholder
          name="HeroSlider"
          description={`Main carousel. Mock slides: ${data.heroSlides.length}`}
        />
        <SectionPlaceholder
          name="CategoryGrid"
          description={`Quick category icons. Mock categories: ${data.categories.length}`}
        />
        <SectionPlaceholder
          name="AmazingOffers"
          description={`Flash / amazing deals rail. Mock products: ${data.amazingOffers.length}`}
        />
        <SectionPlaceholder
          name="MidBanners"
          description={`Secondary promo banners. Mock banners: ${data.midBanners.length}`}
        />
        <SectionPlaceholder
          name="BrandShowcase"
          description={`Multi-brand seller logos. Mock brands: ${data.brands.length}`}
        />
        <SectionPlaceholder
          name="ProductRails"
          description={`Category product carousels. Mock rails: ${data.productRails.length}`}
        />
        <SectionPlaceholder
          name="BottomBanners"
          description="Extra promotional blocks near the footer."
        />
      </main>
      <SiteFooter />
    </>
  );
}
