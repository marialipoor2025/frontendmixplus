import { siteConfig } from "@/config/site";
import { getCatalogProductBySlug } from "@/lib/api/catalog";
import { getProductOffers } from "@/lib/api/offers";
import { getProductMedia } from "@/lib/api/product-media";
import { getProductSpecs } from "@/lib/api/specs";
import { getProductReviews } from "@/lib/api/reviews";
import { getProductVariants } from "@/lib/api/variants";
import type { ProductComment } from "@/types/product-detail";
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

  const [liveCard, liveVariants, liveMedia, liveSpecs, liveReviews, liveOffers] =
    await Promise.all([
      getCatalogProductBySlug(slug).catch(() => null),
      getProductVariants(slug).catch(() => null),
      getProductMedia(slug).catch(() => null),
      getProductSpecs(slug).catch(() => null),
      getProductReviews(slug).catch(() => [] as ProductComment[]),
      getProductOffers(slug).catch(() => []),
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
        originalPrice:
          liveCard.originalPrice?.amount ??
          next.buyBox.originalPrice ??
          Math.round(liveCard.price.amount * 1.19),
        discountPercent:
          liveCard.discountPercent ?? next.buyBox.discountPercent ?? 19,
        cheaperByAmount: next.buyBox.cheaperByAmount ?? 227_500,
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

  if (liveReviews.length > 0) {
    const mockComments = next.content.comments.comments;
    const mergedComments = [...liveReviews, ...mockComments];
    const ratings = mergedComments
      .map((c) => c.rating)
      .filter((r): r is number => r != null);
    const averageRating =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
        : next.content.comments.averageRating;

    next = {
      ...next,
      content: {
        ...next.content,
        comments: {
          ...next.content.comments,
          comments: mergedComments,
          totalCount: mergedComments.length,
          ratingCount: Math.max(
            next.content.comments.ratingCount,
            ratings.length,
          ),
          averageRating,
        },
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

  if (liveOffers.length > 0) {
    const primary = liveOffers[0]!;
    next = {
      ...next,
      sellers: liveOffers,
      buyBox: {
        ...next.buyBox,
        seller: {
          ...next.buyBox.seller,
          id: primary.id,
          name: primary.name,
          href: primary.href,
          performanceLabel: primary.performanceLabel,
        },
        otherSellerCount: Math.max(0, liveOffers.length - 1),
        price: primary.price,
        originalPrice: primary.originalPrice,
        discountPercent: primary.discountPercent,
        warranty: primary.warranty || next.buyBox.warranty,
        delivery: {
          ...next.buyBox.delivery,
          methodLabel: primary.deliveryLabel || next.buyBox.delivery.methodLabel,
        },
      },
    };
  }

  return next;
}
