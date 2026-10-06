import { siteConfig } from "@/config/site";
import { getCatalogProductBySlug } from "@/lib/api/catalog";
import { getProductOffers } from "@/lib/api/offers";
import { getProductPdpContent } from "@/lib/api/pdp-content";
import { getProductMedia } from "@/lib/api/product-media";
import { getProductSpecs } from "@/lib/api/specs";
import { getProductReviews } from "@/lib/api/reviews";
import { getProductVariants } from "@/lib/api/variants";
import { formatFaMeasure } from "@/lib/format/persian";
import { normalizeDiscountPricing } from "@/lib/media-url";
import type { ProductComment } from "@/types/product-detail";
import { getMockProductDetail } from "@/lib/mocks/product-detail";
import type {
  BreadcrumbItem,
  ProductDetailPageData,
  ProductTitleNavLink,
} from "@/types/product-detail";

function brandSlugFromId(brandId: string, brandName: string): string {
  const fromId = brandId.replace(/^b-/, "").trim();
  if (fromId) return fromId;
  return brandName.trim().toLowerCase().replace(/\s+/g, "-") || "brand";
}

function buildLiveNav(
  liveCard: NonNullable<Awaited<ReturnType<typeof getCatalogProductBySlug>>>,
): { breadcrumb: BreadcrumbItem[]; titleNav: ProductTitleNavLink[] } {
  const brandSlug = brandSlugFromId(liveCard.brandId, liveCard.brandName);
  const categoryHref =
    liveCard.categoryHref ||
    (liveCard.categorySlug
      ? `/categories/${liveCard.categorySlug}`
      : undefined);
  const categoryTitle = liveCard.categoryName?.trim();

  const breadcrumb: BreadcrumbItem[] = [
    { id: "home", title: siteConfig.nameFa, href: "/" },
    { id: "appliances", title: "لوازم خانگی برقی", href: "/categories" },
  ];
  if (categoryTitle && categoryHref) {
    breadcrumb.push({
      id: liveCard.categoryId || "category",
      title: categoryTitle,
      href: categoryHref,
    });
  }

  const titleNav: ProductTitleNavLink[] = [
    {
      id: "brand",
      title: liveCard.brandName,
      href: `/brand/${brandSlug}`,
    },
  ];
  if (categoryTitle && categoryHref) {
    titleNav.push({
      id: "category-brand",
      title: `${categoryTitle} ${liveCard.brandName}`,
      href: `${categoryHref}/${brandSlug}`,
    });
  }

  return { breadcrumb, titleNav };
}

/** Frontend-first PDP fetch — merges live Catalog card, variants, media, specs. */
export async function getProductDetail(
  slug: string,
): Promise<ProductDetailPageData | null> {
  const data = getMockProductDetail(slug);

  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) {
    return data;
  }

  const [
    liveCard,
    liveVariants,
    liveMedia,
    liveSpecs,
    liveReviews,
    liveOffers,
    livePdpContent,
  ] = await Promise.all([
    getCatalogProductBySlug(slug).catch(() => null),
    getProductVariants(slug).catch(() => null),
    getProductMedia(slug).catch(() => null),
    getProductSpecs(slug).catch(() => null),
    getProductReviews(slug).catch(() => [] as ProductComment[]),
    getProductOffers(slug).catch(() => []),
    getProductPdpContent(slug).catch(() => null),
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
    const nav = buildLiveNav(liveCard);
    const brandSlug = brandSlugFromId(liveCard.brandId, liveCard.brandName);
    next = {
      ...next,
      title: liveCard.title,
      slug: liveCard.slug,
      brand: {
        ...next.brand,
        id: liveCard.brandId,
        name: liveCard.brandName,
        slug: brandSlug,
      },
      breadcrumb:
        next.breadcrumb.length > 0 ? next.breadcrumb : nav.breadcrumb,
      titleNav: next.titleNav.length > 0 ? next.titleNav : nav.titleNav,
      buyBox: {
        ...next.buyBox,
        seller: {
          ...next.buyBox.seller,
          id: liveCard.sellerId,
          name: liveCard.sellerName,
        },
        ...(() => {
          const money = normalizeDiscountPricing({
            price: liveCard.price.amount,
            originalPrice:
              liveCard.originalPrice?.amount ?? next.buyBox.originalPrice,
            discountPercent:
              liveCard.discountPercent ?? next.buyBox.discountPercent,
          });
          return {
            price: money.price,
            originalPrice: money.originalPrice,
            discountPercent: money.discountPercent,
          };
        })(),
        // Only show multi-seller savings tip when we actually have competing offers.
        cheaperByAmount: next.buyBox.cheaperByAmount,
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
    const specs = liveSpecs.map((group) => ({
      ...group,
      attributes: group.attributes.map((attr) => ({
        ...attr,
        values: attr.values.map((v) => formatFaMeasure(v)),
      })),
    }));

    const highlightFeatures = specs
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
        specs,
      },
    };
  }

  // Single-seller (or primary) PDP copy from seller-managed content JSON.
  if (livePdpContent) {
    const hasSellerCopy =
      Boolean(livePdpContent.intro.preview || livePdpContent.intro.full) ||
      Boolean(
        livePdpContent.expertReview.preview || livePdpContent.expertReview.full,
      ) ||
      livePdpContent.features.length > 0 ||
      Boolean(livePdpContent.warranty) ||
      Boolean(
        livePdpContent.deliveryMethodLabel || livePdpContent.deliveryTitle,
      ) ||
      livePdpContent.showWarranty === false ||
      livePdpContent.showDelivery === false ||
      livePdpContent.showPricePolicy === false ||
      Boolean(livePdpContent.insurance);

    if (hasSellerCopy) {
      next = {
        ...next,
        features:
          livePdpContent.features.length > 0
            ? livePdpContent.features.map((f) => ({
                ...f,
                value: formatFaMeasure(f.value),
              }))
            : next.features,
        insurance: livePdpContent.insurance ?? next.insurance,
        showPricePolicy: livePdpContent.showPricePolicy,
        pricePolicyLabel: livePdpContent.pricePolicyLabel,
        buyBox: {
          ...next.buyBox,
          showWarranty: livePdpContent.showWarranty,
          warranty: livePdpContent.showWarranty
            ? livePdpContent.warranty || next.buyBox.warranty
            : "",
          showDelivery: livePdpContent.showDelivery,
          delivery: livePdpContent.showDelivery
            ? {
                title:
                  livePdpContent.deliveryTitle || next.buyBox.delivery.title,
                methodLabel:
                  livePdpContent.deliveryMethodLabel ||
                  next.buyBox.delivery.methodLabel,
                costLabel:
                  livePdpContent.deliveryCostLabel ||
                  next.buyBox.delivery.costLabel,
              }
            : { title: "", methodLabel: "", costLabel: "" },
        },
        content: {
          ...next.content,
          intro: {
            preview:
              livePdpContent.intro.preview || next.content.intro.preview,
            full: livePdpContent.intro.full || next.content.intro.full,
          },
          expertReview: {
            title:
              livePdpContent.expertReview.title ||
              next.content.expertReview.title,
            preview:
              livePdpContent.expertReview.preview ||
              next.content.expertReview.preview,
            full:
              livePdpContent.expertReview.full ||
              next.content.expertReview.full,
          },
        },
      };
    }
  }

  if (liveOffers.length > 0) {
    const primary = liveOffers[0]!;
    const prices = liveOffers.map((o) => o.price).filter((p) => p > 0);
    const minPrice = prices.length ? Math.min(...prices) : primary.price;
    const maxPrice = prices.length ? Math.max(...prices) : primary.price;
    const cheaperByAmount =
      liveOffers.length > 1 && maxPrice > minPrice
        ? Math.round(maxPrice - minPrice)
        : undefined;

    next = {
      ...next,
      sellers: liveOffers.length > 1 ? liveOffers : undefined,
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
        ...(() => {
          const money = normalizeDiscountPricing({
            price: primary.price,
            originalPrice:
              primary.originalPrice ?? next.buyBox.originalPrice,
            discountPercent:
              primary.discountPercent ?? next.buyBox.discountPercent,
          });
          return {
            price: money.price,
            originalPrice: money.originalPrice,
            discountPercent: money.discountPercent,
          };
        })(),
        cheaperByAmount,
        warranty: primary.warranty || next.buyBox.warranty,
        delivery: {
          ...next.buyBox.delivery,
          methodLabel:
            primary.deliveryLabel || next.buyBox.delivery.methodLabel,
          title: next.buyBox.delivery.title,
          costLabel: next.buyBox.delivery.costLabel,
        },
      },
    };
  }

  // Keep SKU money aligned with product buy-box so variant selection can't show stale prices.
  if (next.variant.skus.length > 0 && next.buyBox.price > 0) {
    next = {
      ...next,
      variant: {
        ...next.variant,
        skus: next.variant.skus.map((s) => ({
          ...s,
          price: next.buyBox.price,
          originalPrice: next.buyBox.originalPrice,
          discountPercent: next.buyBox.discountPercent,
        })),
      },
    };
  }

  return next;
}
