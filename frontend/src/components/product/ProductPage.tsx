import { ProductBreadcrumb } from "@/components/product/ProductBreadcrumb";
import { ProductBuyBox } from "@/components/product/ProductBuyBox";
import { ProductComments } from "@/components/product/ProductComments";
import { ProductExpertReview } from "@/components/product/ProductExpertReview";
import { ProductFeatures } from "@/components/product/ProductFeatures";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInsurance } from "@/components/product/ProductInsurance";
import { ProductInfoFooter } from "@/components/product/ProductInfoFooter";
import { ProductIntro } from "@/components/product/ProductIntro";
import { ProductMiniBuyBox } from "@/components/product/ProductMiniBuyBox";
import { ProductPricePolicyLink } from "@/components/product/ProductPricePolicyLink";
import { ProductQuestions } from "@/components/product/ProductQuestions";
import { ProductRecommendationRails } from "@/components/product/ProductRecommendationRails";
import { ProductReturnNotice } from "@/components/product/ProductReturnNotice";
import { ProductScrollTabs } from "@/components/product/ProductScrollTabs";
import { ProductSellersList } from "@/components/product/ProductSellersList";
import { ProductSpecs } from "@/components/product/ProductSpecs";
import { ProductTitle } from "@/components/product/ProductTitle";
import { ProductTouchPoints } from "@/components/product/ProductTouchPoints";
import { ProductVariantInfo } from "@/components/product/ProductVariantInfo";
import { MainNav } from "@/components/layout/MainNav";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { StickyHeaderShell } from "@/components/layout/StickyHeaderShell";
import type { MainNavData } from "@/types/nav";
import type { ProductDetailPageData } from "@/types/product-detail";

type ProductPageProps = {
  data: ProductDetailPageData;
  nav: MainNavData;
};

/**
 * Product detail page shell. Sections (gallery, buy box, …) land one by one.
 */
export function ProductPage({ data, nav }: ProductPageProps) {
  const selectedColor =
    data.variant.colors.find((c) => c.id === data.variant.selectedColorId) ??
    data.variant.colors[0];
  const primaryImage = data.gallery.images[0];

  return (
    <>
      <StickyHeaderShell>
        <SiteHeader />
        <MainNav data={nav} />
      </StickyHeaderShell>

      <div className="site-container flex-1 pt-1 lg:pt-2">
        <ProductBreadcrumb items={data.breadcrumb} />

        <section className="flex flex-col pb-4 lg:flex-row lg:items-start lg:gap-4 lg:pb-0">
          <ProductGallery
            title={data.title}
            sku={data.sku}
            images={data.gallery.images}
            sale={data.gallery.sale}
          />

          <div className="min-w-0 grow px-5 pt-4 lg:px-0 lg:pt-0">
            <ProductTitle title={data.title} links={data.titleNav} />
            <ProductVariantInfo data={data.variant} productSlug={data.slug} />
            {data.insurance ? <ProductInsurance offer={data.insurance} /> : null}
            <ProductFeatures items={data.features} />
            {data.returnNotice ? (
              <ProductReturnNotice text={data.returnNotice} />
            ) : null}
            {data.touchPoints ? (
              <ProductTouchPoints data={data.touchPoints} />
            ) : null}
          </div>

          <div className="flex w-full flex-col gap-2 lg:sticky lg:top-28 lg:w-[300px] lg:shrink-0">
            <ProductBuyBox data={data.buyBox} />
            <ProductPricePolicyLink />
          </div>
        </section>

        <ProductInfoFooter />

        {data.sellers?.length ? (
          <ProductSellersList sellers={data.sellers} />
        ) : null}

        <ProductScrollTabs />

        <div className="flex items-start gap-4">
          <div className="min-w-0 grow">
            <ProductIntro data={data.content.intro} />
            <ProductExpertReview data={data.content.expertReview} />
            <ProductSpecs groups={data.content.specs} />
            <ProductComments data={data.content.comments} />
            <ProductQuestions data={data.content.questions} />
          </div>

          {primaryImage ? (
            <div className="hidden shrink-0 self-start lg:sticky lg:top-[8.25rem] lg:block">
              <ProductMiniBuyBox
                title={data.title}
                imageUrl={primaryImage.url}
                color={selectedColor}
                buyBox={data.buyBox}
                sale={data.gallery.sale}
              />
            </div>
          ) : null}
        </div>

        {data.recommendationRails?.length ? (
          <ProductRecommendationRails rails={data.recommendationRails} />
        ) : null}
      </div>

      <SiteFooter />
    </>
  );
}
