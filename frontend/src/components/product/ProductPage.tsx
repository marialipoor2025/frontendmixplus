import { ProductBreadcrumb } from "@/components/product/ProductBreadcrumb";
import { ProductComments } from "@/components/product/ProductComments";
import { ProductExpertReview } from "@/components/product/ProductExpertReview";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfoFooter } from "@/components/product/ProductInfoFooter";
import { ProductIntro } from "@/components/product/ProductIntro";
import { ProductMiniBuyBox } from "@/components/product/ProductMiniBuyBox";
import { ProductPurchasePanel } from "@/components/product/ProductPurchasePanel";
import { ProductQuestions } from "@/components/product/ProductQuestions";
import { ProductRecommendationRails } from "@/components/product/ProductRecommendationRails";
import { ProductScrollTabs } from "@/components/product/ProductScrollTabs";
import { ProductSellersList } from "@/components/product/ProductSellersList";
import { ProductSpecs } from "@/components/product/ProductSpecs";
import { MainNav } from "@/components/layout/MainNav";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { StickyHeaderShell } from "@/components/layout/StickyHeaderShell";
import { resolveOptionGroups } from "@/lib/product-variants";
import type { MainNavData } from "@/types/nav";
import type {
  ProductColorOption,
  ProductDetailPageData,
} from "@/types/product-detail";

type ProductPageProps = {
  data: ProductDetailPageData;
  nav: MainNavData;
};

function defaultColorOption(
  data: ProductDetailPageData,
): ProductColorOption | undefined {
  const colorGroup = resolveOptionGroups(data.variant).find(
    (g) => g.code === "color",
  );
  const selectedId =
    data.variant.selectedOptionValueIds[colorGroup?.id ?? ""] ??
    data.variant.selectedColorId;
  const value =
    colorGroup?.values.find((v) => v.id === selectedId) ?? colorGroup?.values[0];
  if (!value) return undefined;
  return {
    id: value.id,
    name: value.label,
    hex: value.swatchHex ?? "#e5e7eb",
  };
}

/**
 * Product detail page shell. Sections (gallery, buy box, …) land one by one.
 */
export function ProductPage({ data, nav }: ProductPageProps) {
  const primaryImage = data.gallery.images[0];
  const defaultColor = defaultColorOption(data);

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

          <ProductPurchasePanel data={data} />
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
            <ProductComments
              data={data.content.comments}
              productSlug={data.slug}
              productTitle={data.title}
            />
            <ProductQuestions data={data.content.questions} />
          </div>

          {primaryImage ? (
            <div className="hidden shrink-0 self-start lg:sticky lg:top-[8.25rem] lg:block">
              <ProductMiniBuyBox
                title={data.title}
                imageUrl={primaryImage.url}
                color={defaultColor}
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
