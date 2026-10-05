import { siteConfig } from "@/config/site";
import { getCatalogProductBySlug } from "@/lib/api/catalog";
import { getProductMedia } from "@/lib/api/product-media";
import { getProductSpecs } from "@/lib/api/specs";
import { getProductVariants } from "@/lib/api/variants";
import { getMockProductDetail } from "@/lib/mocks/product-detail";
import type { ProductDetailPageData } from "@/types/product-detail";

/** Frontend-first PDP fetch — merges live Catalog card, variants, media, specs. */
export async function getProductDetail(
  slug: string,
): Promise<ProductDetailPageData | null> {
  const data = getMockProductDetail(slug);

  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) {
    return data;
  }

  const [liveCard, liveVariants, liveMedia, liveSpecs] = await Promise.all([
    getCatalogProductBySlug(slug).catch(() => null),
    getProductVariants(slug).catch(() => null),
    getProductMedia(slug).catch(() => null),
    getProductSpecs(slug).catch(() => null),
  ]);

  if (!data && !liveCard) return null;

  let next: ProductDetailPageData =
    data ??
    ({
      slug,
      title: liveCard!.title,
      sku: liveCard!.id,
      brand: {
        id: liveCard!.brandId,
        name: liveCard!.brandName,
        slug: liveCard!.brandId,
      },
      titleNav: [],
      variant: {
        rating: liveCard!.rating ?? 0,
        ratingCount: liveCard!.reviewCount ?? 0,
        questionCount: 0,
        commentCount: 0,
        optionGroups: [],
        selectedOptionValueIds: {},
        skus: [],
      },
      features: [],
      buyBox: {
        seller: {
          id: liveCard!.sellerId,
          name: liveCard!.sellerName,
          href: "#",
          performanceLabel: "",
        },
        otherSellerCount: 0,
        price: liveCard!.price.amount,
        originalPrice: liveCard!.originalPrice?.amount,
        discountPercent: liveCard!.discountPercent,
        warranty: "",
        delivery: { title: "", methodLabel: "", costLabel: "" },
      },
      content: {
        intro: { preview: "", full: "" },
        expertReview: { title: "", preview: "", full: "" },
        specs: [],
        comments: {
          averageRating: 0,
          ratingCount: 0,
          totalCount: 0,
          photos: [],
          topicFilters: [],
          comments: [],
        },
        questions: { totalCount: 0, questions: [] },
      },
      breadcrumb: [],
      gallery: {
        images: [
          {
            id: "main",
            url: liveCard!.imageUrl,
            alt: liveCard!.title,
          },
        ],
      },
    } satisfies ProductDetailPageData);

  if (liveCard) {
    next = {
      ...next,
      title: liveCard.title,
      slug: liveCard.slug,
      brand: {
        ...next.brand,
        id: liveCard.brandId,
        name: liveCard.brandName,
      },
      buyBox: {
        ...next.buyBox,
        seller: {
          ...next.buyBox.seller,
          id: liveCard.sellerId,
          name: liveCard.sellerName,
        },
        price: liveCard.price.amount,
        originalPrice: liveCard.originalPrice?.amount,
        discountPercent: liveCard.discountPercent,
      },
      gallery: {
        ...next.gallery,
        images:
          next.gallery.images.length > 0
            ? next.gallery.images
            : [
                {
                  id: "main",
                  url: liveCard.imageUrl,
                  alt: liveCard.title,
                },
              ],
      },
    };
  }

  if (liveVariants && liveVariants.optionGroups.length > 0) {
    next = {
      ...next,
      variant: {
        ...next.variant,
        optionGroups: liveVariants.optionGroups,
        selectedOptionValueIds: liveVariants.selectedOptionValueIds,
        skus: liveVariants.skus,
      },
    };
  }

  if (liveMedia && liveMedia.length > 0) {
    next = {
      ...next,
      gallery: {
        ...next.gallery,
        images: liveMedia.map((m) => ({
          id: m.id,
          url: m.url,
          alt: m.alt || next.title,
        })),
      },
    };
  }

  if (liveSpecs && liveSpecs.length > 0) {
    const highlightFeatures = liveSpecs
      .flatMap((group) =>
        group.attributes.map((attr, index) => ({
          id: `${group.id}-${attr.id || index}`,
          label: attr.label,
          value: attr.values.filter(Boolean).join("، "),
        })),
      )
      .filter((f) => f.label && f.value)
      .slice(0, 6);

    next = {
      ...next,
      features:
        highlightFeatures.length > 0 ? highlightFeatures : next.features,
      content: {
        ...next.content,
        specs: liveSpecs,
      },
    };
  }

  return next;
}
