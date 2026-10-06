import { ProductBreadcrumb } from "@/components/product/ProductBreadcrumb";
import { ProductComments } from "@/components/product/ProductComments";
import { ProductExpertReview } from "@/components/product/ProductExpertReview";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfoFooter } from "@/components/product/ProductInfoFooter";
import { ProductIntro } from "@/components/product/ProductIntro";
import { ProductMiniBuyBox } from "@/components/product/ProductMiniBuyBox";
import { ProductMobileStickyHeader } from "@/components/product/ProductMobileStickyHeader";
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
import { Suspense } from "react";

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
 * Product detail page shell.
 * Mobile: Digikala — fixed mosaic under sticky chrome; opaque card scrolls over it.
 * Desktop: Digikala 3-column row (gallery | info | buy box), then full-width content.
 */
export function ProductPage({ data, nav }: ProductPageProps) {
  const primaryImage = data.gallery.images[0];
  const defaultColor = defaultColorOption(data);

  return (
    <>
      <div className="hidden lg:block">
        <StickyHeaderShell>
          <SiteHeader />
          <MainNav data={nav} />
        </StickyHeaderShell>
      </div>

      <ProductMobileStickyHeader
        title={data.title}
        slug={data.slug}
        imageUrl={primaryImage?.url}
        priceAmount={data.buyBox.price}
      />

      <div className="relative w-full min-w-0 flex-1 lg:pt-2">
        <div className="site-container hidden lg:block">
          <ProductBreadcrumb items={data.breadcrumb} />
        </div>

        {/*
          Digikala desktop top: three columns in one row.
          Mobile: gallery spacer + overlapping content card from PurchasePanel.
        */}
        <section className="relative mx-auto flex w-full min-w-0 max-w-[var(--page-max-width)] flex-col lg:flex-row lg:items-start lg:gap-4 lg:overflow-x-hidden lg:px-[var(--page-gutter)]">
          <ProductGallery
            title={data.title}
            slug={data.slug}
            sku={data.sku}
            images={data.gallery.images}
            sale={data.gallery.sale}
            priceAmount={data.buyBox.price}
            breadcrumb={data.breadcrumb}
          />
          <ProductPurchasePanel data={data} />
        </section>

        {/* Full-width lower PDP (sellers, tabs, intro…) — not nested in a column */}
        <div className="relative z-[2] bg-white lg:bg-transparent">
          <div className="site-container">
            <div className="hidden lg:block">
              <ProductInfoFooter />
            </div>

            {data.sellers?.length ? (
              <div className="hidden lg:block">
                <ProductSellersList sellers={data.sellers} />
              </div>
            ) : null}

            <div className="hidden lg:block">
              <ProductScrollTabs />
            </div>

            <div className="flex min-w-0 items-start gap-4">
              <div className="min-w-0 grow bg-white lg:overflow-x-hidden lg:bg-transparent">
                <ProductIntro data={data.content.intro} />
                <ProductExpertReview data={data.content.expertReview} />
                <ProductSpecs groups={data.content.specs} />
                <Suspense fallback={null}>
                  <ProductComments
                    data={data.content.comments}
                    productSlug={data.slug}
                    productTitle={data.title}
                  />
                </Suspense>
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
              <div id="pdp-suggestions" className="bg-white lg:bg-transparent">
                <ProductRecommendationRails rails={data.recommendationRails} />
              </div>
            ) : (
              <div id="pdp-suggestions" className="h-px" aria-hidden />
            )}
          </div>
        </div>
      </div>

      <div className="relative z-[2] bg-white lg:z-auto lg:bg-transparent">
        <SiteFooter />
      </div>
    </>
  );
}
