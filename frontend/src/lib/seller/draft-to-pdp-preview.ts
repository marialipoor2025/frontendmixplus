import { siteConfig } from "@/config/site";
import { formatFaMeasure } from "@/lib/format/persian";
import type {
  BreadcrumbItem,
  ProductDetailPageData,
  ProductTitleNavLink,
} from "@/types/product-detail";
import type { SellerProductDraft } from "@/types/seller-wizard";

/** Build a shopper-shaped PDP payload from the seller draft for live previews. */
export function draftToPdpPreview(draft: SellerProductDraft): ProductDetailPageData {
  const brandSlug =
    draft.basics.brandId.replace(/^b-/, "") ||
    draft.basics.brandName.trim().toLowerCase().replace(/\s+/g, "-") ||
    "brand";
  const categoryHref = draft.basics.categoryId
    ? `/categories/${draft.basics.categoryId.replace(/^cat-/, "")}`
    : "/categories";
  const categoryTitle = draft.basics.categoryName || "دسته‌بندی";

  const breadcrumb: BreadcrumbItem[] = [
    { id: "home", title: siteConfig.nameFa, href: "/" },
    { id: "appliances", title: "لوازم خانگی برقی", href: "/categories" },
  ];
  if (draft.basics.categoryName) {
    breadcrumb.push({
      id: draft.basics.categoryId || "category",
      title: categoryTitle,
      href: categoryHref,
    });
  }

  const titleNav: ProductTitleNavLink[] = [];
  if (draft.basics.brandName) {
    titleNav.push({
      id: "brand",
      title: draft.basics.brandName,
      href: `/brand/${brandSlug}`,
    });
  }
  if (draft.basics.categoryName) {
    titleNav.push({
      id: "category-brand",
      title: `${categoryTitle} ${draft.basics.brandName}`,
      href: `${categoryHref}/${brandSlug}`,
    });
  }

  const features =
    draft.description.features.length > 0
      ? draft.description.features.map((f) => ({
          ...f,
          value: formatFaMeasure(f.value),
        }))
      : draft.specs
          .flatMap((g) =>
            g.attributes.map((a, i) => ({
              id: `${g.id}-${a.id || i}`,
              label: a.label,
              value: formatFaMeasure(a.values.filter(Boolean).join("، ")),
            })),
          )
          .filter((f) => f.label && f.value)
          .slice(0, 6);

  const selected: Record<string, string> = {};
  for (const g of draft.variants.optionGroups) {
    if (g.values[0]) selected[g.id] = g.values[0].id;
  }

  return {
    slug: draft.basics.slug || "preview",
    title: draft.basics.title || "عنوان محصول",
    sku: draft.id,
    brand: {
      id: draft.basics.brandId || "brand",
      name: draft.basics.brandName || "برند",
      slug: brandSlug,
    },
    titleNav,
    breadcrumb,
    variant: {
      rating: 0,
      ratingCount: 0,
      questionCount: 0,
      commentCount: 0,
      optionGroups: draft.variants.optionGroups,
      selectedOptionValueIds: selected,
      skus: draft.variants.skus,
    },
    features,
    insurance:
      draft.pricing.showInsurance && draft.pricing.insuranceTitle
        ? {
            id: "seller-insurance",
            title: draft.pricing.insuranceTitle,
            price: draft.pricing.insurancePrice || 0,
            originalPrice: draft.pricing.insuranceOriginalPrice ?? undefined,
            discountPercent:
              draft.pricing.insuranceDiscountPercent ?? undefined,
            detailsHref: "#insurance-details",
          }
        : undefined,
    showPricePolicy: draft.pricing.showPricePolicy !== false,
    pricePolicyLabel:
      draft.pricing.pricePolicyLabel || "فرآیند قیمت‌گذاری و نظارت بر قیمت",
    buyBox: {
      seller: {
        id: "seller",
        name: "فروشگاه شما",
        href: "#",
        performanceLabel: "عالی",
      },
      otherSellerCount: 0,
      price: draft.pricing.price || 0,
      originalPrice: draft.pricing.originalPrice ?? undefined,
      discountPercent:
        draft.pricing.discountPercent ??
        (draft.pricing.originalPrice != null &&
        draft.pricing.originalPrice > draft.pricing.price &&
        draft.pricing.price > 0
          ? Math.round(
              (1 - draft.pricing.price / draft.pricing.originalPrice) * 100,
            )
          : undefined),
      showWarranty: draft.pricing.showWarranty !== false,
      warranty: draft.pricing.showWarranty === false ? "" : draft.pricing.warranty,
      showDelivery: draft.pricing.showDelivery !== false,
      delivery: {
        title:
          draft.pricing.showDelivery === false
            ? ""
            : draft.pricing.deliveryTitle || "روش و هزینه تحویل",
        methodLabel:
          draft.pricing.showDelivery === false
            ? ""
            : draft.pricing.deliveryMethodLabel,
        costLabel:
          draft.pricing.showDelivery === false
            ? ""
            : draft.pricing.deliveryCostLabel,
      },
    },
    content: {
      intro: draft.description.intro,
      expertReview: draft.description.expertReview,
      specs: draft.specs.map((g) => ({
        ...g,
        attributes: g.attributes.map((a) => ({
          ...a,
          values: a.values.map((v) => formatFaMeasure(v)),
        })),
      })),
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
    gallery: {
      images: draft.gallery.map((g) => ({
        id: g.id,
        url: g.url,
        alt: g.alt || draft.basics.title,
      })),
    },
  };
}
