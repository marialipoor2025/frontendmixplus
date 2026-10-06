import { siteConfig } from "@/config/site";
import type {
  ProductExpertReviewContent,
  ProductFeatureItem,
  ProductInsuranceOffer,
  ProductIntroContent,
} from "@/types/product-detail";

export type ProductPdpContent = {
  intro: ProductIntroContent;
  expertReview: ProductExpertReviewContent;
  features: ProductFeatureItem[];
  showWarranty: boolean;
  warranty: string;
  showDelivery: boolean;
  deliveryTitle: string;
  deliveryMethodLabel: string;
  deliveryCostLabel: string;
  showPricePolicy: boolean;
  pricePolicyLabel: string;
  insurance?: ProductInsuranceOffer;
  sellerId: string;
  sellerName: string;
};

type ApiPdpContent = {
  introPreview?: string;
  introFull?: string;
  expertReviewTitle?: string;
  expertReviewPreview?: string;
  expertReviewFull?: string;
  features?: { id: string; label: string; value: string }[];
  showWarranty?: boolean;
  warranty?: string;
  showDelivery?: boolean;
  deliveryTitle?: string;
  deliveryMethodLabel?: string;
  deliveryCostLabel?: string;
  showPricePolicy?: boolean;
  pricePolicyLabel?: string;
  showInsurance?: boolean;
  insuranceTitle?: string;
  insurancePrice?: number;
  insuranceOriginalPrice?: number | null;
  insuranceDiscountPercent?: number | null;
  sellerId?: string;
  sellerName?: string;
};

function apiBase() {
  return siteConfig.apiBaseUrl.replace(/\/$/, "");
}

/** Seller-authored PDP copy (intro, review, warranty, delivery). */
export async function getProductPdpContent(
  productKey: string,
): Promise<ProductPdpContent | null> {
  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) return null;
  try {
    const res = await fetch(
      `${apiBase()}/api/catalog/products/${encodeURIComponent(productKey)}/pdp-content`,
      { cache: "no-store", headers: { Accept: "application/json" } },
    );
    if (!res.ok) return null;
    const row = (await res.json()) as ApiPdpContent;
    const showInsurance = row.showInsurance === true;
    return {
      intro: {
        preview: row.introPreview ?? "",
        full: row.introFull ?? "",
      },
      expertReview: {
        title: row.expertReviewTitle || "نقد و بررسی",
        preview: row.expertReviewPreview ?? "",
        full: row.expertReviewFull ?? "",
      },
      features: (row.features ?? [])
        .filter((f) => f.label && f.value)
        .map((f) => ({
          id: f.id || `${f.label}-${f.value}`,
          label: f.label,
          value: f.value,
        })),
      showWarranty: row.showWarranty !== false,
      warranty: row.warranty ?? "",
      showDelivery: row.showDelivery !== false,
      deliveryTitle: row.deliveryTitle ?? "",
      deliveryMethodLabel: row.deliveryMethodLabel ?? "",
      deliveryCostLabel: row.deliveryCostLabel ?? "",
      showPricePolicy: row.showPricePolicy !== false,
      pricePolicyLabel:
        row.pricePolicyLabel || "فرآیند قیمت‌گذاری و نظارت بر قیمت",
      insurance:
        showInsurance && row.insuranceTitle
          ? {
              id: "seller-insurance",
              title: row.insuranceTitle,
              price: Number(row.insurancePrice ?? 0),
              originalPrice:
                row.insuranceOriginalPrice != null
                  ? Number(row.insuranceOriginalPrice)
                  : undefined,
              discountPercent:
                row.insuranceDiscountPercent != null
                  ? Number(row.insuranceDiscountPercent)
                  : undefined,
              detailsHref: "#insurance-details",
            }
          : undefined,
      sellerId: row.sellerId ?? "",
      sellerName: row.sellerName ?? "",
    };
  } catch {
    return null;
  }
}
