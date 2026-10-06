import type { ProductMediaItem } from "@/types/admin-product";
import type {
  ProductExpertReviewContent,
  ProductIntroContent,
  ProductSpecGroup,
  ProductVariantOptionGroup,
  ProductSkuVariant,
} from "@/types/product-detail";

/**
 * One wizard step per seller-fillable PDP UI component.
 * Shopper UGC (comments/questions) and platform chrome are reviewed on preview only.
 */
export type SellerWizardStepId =
  | "basics"
  | "gallery"
  | "variants"
  | "features"
  | "pricing"
  | "specs"
  | "intro"
  | "expertReview"
  | "preview";

export type SellerWizardStepStatus = "empty" | "draft" | "saved" | "skipped";

export type SellerProductBasics = {
  title: string;
  slug: string;
  brandId: string;
  brandName: string;
  categoryId: string;
  categoryName: string;
  condition: "new" | "used";
  inStock: boolean;
  isPublished: boolean;
};

export type SellerProductPricing = {
  price: number;
  originalPrice: number | null;
  discountPercent: number | null;
  showWarranty: boolean;
  warranty: string;
  showDelivery: boolean;
  deliveryTitle: string;
  deliveryMethodLabel: string;
  deliveryCostLabel: string;
  showPricePolicy: boolean;
  pricePolicyLabel: string;
  showInsurance: boolean;
  insuranceTitle: string;
  insurancePrice: number;
  insuranceOriginalPrice: number | null;
  insuranceDiscountPercent: number | null;
};

export type SellerProductVariants = {
  optionGroups: ProductVariantOptionGroup[];
  skus: ProductSkuVariant[];
};

export type SellerProductDescription = {
  intro: ProductIntroContent;
  expertReview: ProductExpertReviewContent;
  features: { id: string; label: string; value: string }[];
};

/** Full draft shaped like editable PDP sections. */
export type SellerProductDraft = {
  /** Server product key when persisted; `draft-…` while local-only. */
  id: string;
  isLocalOnly: boolean;
  basics: SellerProductBasics;
  gallery: ProductMediaItem[];
  pricing: SellerProductPricing;
  variants: SellerProductVariants;
  specs: ProductSpecGroup[];
  description: SellerProductDescription;
  stepStatus: Record<SellerWizardStepId, SellerWizardStepStatus>;
  updatedAt: string;
};

export function emptyBasics(): SellerProductBasics {
  return {
    title: "",
    slug: "",
    brandId: "",
    brandName: "",
    categoryId: "",
    categoryName: "",
    condition: "new",
    inStock: true,
    isPublished: false,
  };
}

export function emptyPricing(): SellerProductPricing {
  return {
    price: 0,
    originalPrice: null,
    discountPercent: null,
    showWarranty: true,
    warranty: "گارانتی ۱۸ ماهه شرکتی",
    showDelivery: true,
    deliveryTitle: "ارسال فروشنده",
    deliveryMethodLabel: "پست پیشتاز",
    deliveryCostLabel: "هزینه ارسال وابسته به آدرس",
    showPricePolicy: true,
    pricePolicyLabel: "فرآیند قیمت‌گذاری و نظارت بر قیمت",
    showInsurance: false,
    insuranceTitle: "بیمه تجهیزات دیجیتال",
    insurancePrice: 0,
    insuranceOriginalPrice: null,
    insuranceDiscountPercent: null,
  };
}

export function emptyVariants(): SellerProductVariants {
  return { optionGroups: [], skus: [] };
}

export function emptyDescription(): SellerProductDescription {
  return {
    intro: { preview: "", full: "" },
    expertReview: { title: "نقد و بررسی", preview: "", full: "" },
    features: [],
  };
}

export function emptyStepStatus(): Record<
  SellerWizardStepId,
  SellerWizardStepStatus
> {
  return {
    basics: "empty",
    gallery: "empty",
    variants: "empty",
    features: "empty",
    pricing: "empty",
    specs: "empty",
    intro: "empty",
    expertReview: "empty",
    preview: "empty",
  };
}

/** Normalize older drafts that used a single `description` step. */
export function normalizeStepStatus(
  raw: Partial<Record<string, SellerWizardStepStatus>> | null | undefined,
): Record<SellerWizardStepId, SellerWizardStepStatus> {
  const next = emptyStepStatus();
  if (!raw) return next;
  const legacy = raw.description;
  for (const key of Object.keys(next) as SellerWizardStepId[]) {
    if (raw[key]) next[key] = raw[key]!;
  }
  if (legacy) {
    if (next.features === "empty") next.features = legacy;
    if (next.intro === "empty") next.intro = legacy;
    if (next.expertReview === "empty") next.expertReview = legacy;
  }
  return next;
}

export function createEmptyDraft(id?: string): SellerProductDraft {
  const draftId = id ?? `draft-${Date.now().toString(36)}`;
  return {
    id: draftId,
    isLocalOnly: draftId.startsWith("draft-"),
    basics: emptyBasics(),
    gallery: [],
    pricing: emptyPricing(),
    variants: emptyVariants(),
    specs: [],
    description: emptyDescription(),
    stepStatus: emptyStepStatus(),
    updatedAt: new Date().toISOString(),
  };
}
