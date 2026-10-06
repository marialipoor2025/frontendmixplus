import { apiClient } from "@/lib/api/client";
import { siteConfig } from "@/config/site";
import { getSellerMe, getSellerProduct, saveSellerProductMedia as putMedia } from "@/lib/api/seller";
import { saveDraft } from "@/lib/seller/wizard-draft";
import type { ProductMediaItem } from "@/types/admin-product";
import type { ProductSpecGroup } from "@/types/product-detail";
import {
  createEmptyDraft,
  emptyStepStatus,
  type SellerProductBasics,
  type SellerProductDescription,
  type SellerProductDraft,
  type SellerProductPricing,
  type SellerProductVariants,
} from "@/types/seller-wizard";

function apiBase() {
  return siteConfig.apiBaseUrl.replace(/\/$/, "");
}

function absoluteUrl(url: string) {
  if (!url || url.startsWith("http") || url.startsWith("blob:")) return url;
  return `${apiBase()}${url.startsWith("/") ? "" : "/"}${url}`;
}

function useLiveApi() {
  return Boolean(siteConfig.apiBaseUrl) && !siteConfig.useMocks;
}

type ApiWizardProduct = {
  id: string;
  title: string;
  slug: string;
  imageUrl: string;
  brandId: string;
  brandName: string;
  categoryId?: string | null;
  categoryName?: string | null;
  condition?: string | null;
  inStock: boolean;
  isPublished: boolean;
  price: { amount: number; currency: string };
  originalPrice?: { amount: number; currency: string } | null;
  discountPercent?: number | null;
  showWarranty?: boolean | null;
  warranty?: string | null;
  showDelivery?: boolean | null;
  deliveryTitle?: string | null;
  deliveryMethodLabel?: string | null;
  deliveryCostLabel?: string | null;
  showPricePolicy?: boolean | null;
  pricePolicyLabel?: string | null;
  showInsurance?: boolean | null;
  insuranceTitle?: string | null;
  insurancePrice?: number | null;
  insuranceOriginalPrice?: number | null;
  insuranceDiscountPercent?: number | null;
  gallery?: {
    id: string;
    url: string;
    thumbUrl: string;
    alt: string;
    isPrimary: boolean;
  }[];
  specs?: ProductSpecGroup[];
  introPreview?: string | null;
  introFull?: string | null;
  expertReviewTitle?: string | null;
  expertReviewPreview?: string | null;
  expertReviewFull?: string | null;
  features?: { id: string; label: string; value: string }[];
  variants?: SellerProductVariants;
};

function normalizeVariants(raw: unknown): SellerProductVariants {
  if (!raw || typeof raw !== "object") {
    return { optionGroups: [], skus: [] };
  }
  const v = raw as SellerProductVariants;
  return {
    optionGroups: Array.isArray(v.optionGroups) ? v.optionGroups : [],
    skus: Array.isArray(v.skus) ? v.skus : [],
  };
}

function inferStatus(
  draft: SellerProductDraft,
): SellerProductDraft["stepStatus"] {
  const s = emptyStepStatus();
  if (draft.basics.title) s.basics = "saved";
  if (draft.gallery.length) s.gallery = "saved";
  if (draft.pricing.price > 0) s.pricing = "saved";
  if (draft.variants.optionGroups.length || draft.variants.skus.length) {
    s.variants = "saved";
  }
  if (draft.specs.length) s.specs = "saved";
  if (draft.description.features.length) s.features = "saved";
  if (draft.description.intro.full || draft.description.intro.preview) {
    s.intro = "saved";
  }
  if (
    draft.description.expertReview.full ||
    draft.description.expertReview.preview
  ) {
    s.expertReview = "saved";
  }
  return s;
}

function mapApiToDraft(row: ApiWizardProduct): SellerProductDraft {
  const gallery = (row.gallery ?? []).map((g) => ({
    id: g.id,
    url: absoluteUrl(g.url),
    thumbUrl: absoluteUrl(g.thumbUrl),
    alt: g.alt,
    isPrimary: g.isPrimary,
  }));
  const draft: SellerProductDraft = {
    id: row.id,
    isLocalOnly: false,
    basics: {
      title: row.title,
      slug: row.slug,
      brandId: row.brandId,
      brandName: row.brandName,
      categoryId: row.categoryId ?? "",
      categoryName: row.categoryName ?? "",
      condition: row.condition === "used" ? "used" : "new",
      inStock: row.inStock,
      isPublished: row.isPublished,
    },
    gallery,
    pricing: {
      price: Number(row.price?.amount ?? 0),
      originalPrice: row.originalPrice ? Number(row.originalPrice.amount) : null,
      discountPercent: row.discountPercent ?? null,
      showWarranty: row.showWarranty !== false,
      warranty: row.warranty ?? "گارانتی ۱۸ ماهه شرکتی",
      showDelivery: row.showDelivery !== false,
      deliveryTitle: row.deliveryTitle ?? "ارسال فروشنده",
      deliveryMethodLabel: row.deliveryMethodLabel ?? "پست پیشتاز",
      deliveryCostLabel:
        row.deliveryCostLabel ?? "هزینه ارسال وابسته به آدرس",
      showPricePolicy: row.showPricePolicy !== false,
      pricePolicyLabel:
        row.pricePolicyLabel ?? "فرآیند قیمت‌گذاری و نظارت بر قیمت",
      showInsurance: row.showInsurance === true,
      insuranceTitle: row.insuranceTitle ?? "بیمه تجهیزات دیجیتال",
      insurancePrice: Number(row.insurancePrice ?? 0),
      insuranceOriginalPrice:
        row.insuranceOriginalPrice != null
          ? Number(row.insuranceOriginalPrice)
          : null,
      insuranceDiscountPercent: row.insuranceDiscountPercent ?? null,
    },
    variants: normalizeVariants(row.variants),
    specs: row.specs ?? [],
    description: {
      intro: {
        preview: row.introPreview ?? "",
        full: row.introFull ?? "",
      },
      expertReview: {
        title: row.expertReviewTitle ?? "نقد و بررسی",
        preview: row.expertReviewPreview ?? "",
        full: row.expertReviewFull ?? "",
      },
      features: row.features ?? [],
    },
    stepStatus: emptyStepStatus(),
    updatedAt: new Date().toISOString(),
  };
  draft.stepStatus = inferStatus(draft);
  return draft;
}

/** Load wizard state from API (falls back to thin product+gallery). */
export async function getSellerProductWizard(
  id: string,
): Promise<SellerProductDraft> {
  if (!useLiveApi()) {
    throw new Error("API در دسترس نیست");
  }

  try {
    const row = await apiClient<ApiWizardProduct>(
      `/api/seller/products/${encodeURIComponent(id)}/wizard`,
      { auth: true },
    );
    return mapApiToDraft(row);
  } catch {
    // Backward-compatible: older GET product + empty sections.
    const product = await getSellerProduct(id);
    const draft = createEmptyDraft(product.id);
    draft.isLocalOnly = false;
    draft.basics.title = product.title;
    draft.basics.slug = product.slug;
    draft.basics.inStock = product.inStock;
    draft.basics.isPublished = product.isPublished;
    draft.gallery = product.gallery;
    draft.stepStatus = inferStatus(draft);
    return draft;
  }
}

export async function createSellerProduct(
  draft: SellerProductDraft,
  basics: SellerProductBasics,
): Promise<SellerProductDraft> {
  if (!useLiveApi()) {
    return saveDraft({ ...draft, basics, isLocalOnly: true });
  }

  const me = await getSellerMe();
  const row = await apiClient<ApiWizardProduct>("/api/seller/products", {
    method: "POST",
    auth: true,
    body: JSON.stringify({
      title: basics.title,
      slug: basics.slug,
      brandId: basics.brandId,
      brandName: basics.brandName,
      categoryId: basics.categoryId || null,
      categoryName: basics.categoryName || null,
      condition: basics.condition,
      inStock: basics.inStock,
      isPublished: false,
      price: {
        amount: draft.pricing.price || 0,
        currency: "IRR",
      },
      sellerId: me.id,
      sellerName: me.name,
    }),
  });

  const mapped = mapApiToDraft(row);
  mapped.basics = { ...mapped.basics, ...basics, isPublished: false };
  return saveDraft(mapped);
}

export async function saveSellerProductBasics(
  draft: SellerProductDraft,
  basics: SellerProductBasics,
): Promise<SellerProductDraft> {
  if (draft.isLocalOnly) {
    return createSellerProduct(draft, basics);
  }
  if (!useLiveApi()) {
    return saveDraft({ ...draft, basics });
  }

  const row = await apiClient<ApiWizardProduct>(
    `/api/seller/products/${encodeURIComponent(draft.id)}/basics`,
    {
      method: "PUT",
      auth: true,
      body: JSON.stringify({
        title: basics.title,
        slug: basics.slug,
        brandId: basics.brandId,
        brandName: basics.brandName,
        categoryId: basics.categoryId || null,
        categoryName: basics.categoryName || null,
        condition: basics.condition,
        inStock: basics.inStock,
        isPublished: basics.isPublished,
      }),
    },
  );

  const mapped = mapApiToDraft(row);
  mapped.gallery = draft.gallery;
  mapped.pricing = draft.pricing;
  mapped.variants = draft.variants;
  mapped.specs = draft.specs;
  mapped.description = draft.description;
  mapped.stepStatus = draft.stepStatus;
  return saveDraft(mapped);
}

export async function saveSellerProductMedia(
  productId: string,
  gallery: ProductMediaItem[],
): Promise<SellerProductDraft> {
  await putMedia(
    productId,
    gallery.map((g) => g.id),
  );
  const draft = await getSellerProductWizard(productId);
  draft.gallery = gallery;
  return saveDraft(draft);
}

function withSyncedSkuPrices(
  draft: SellerProductDraft,
  pricing: SellerProductPricing,
): SellerProductDraft {
  return {
    ...draft,
    pricing,
    variants: {
      ...draft.variants,
      skus: draft.variants.skus.map((s) => ({
        ...s,
        price: pricing.price,
        originalPrice: pricing.originalPrice ?? undefined,
        discountPercent: pricing.discountPercent ?? undefined,
      })),
    },
  };
}

export async function saveSellerProductPricing(
  draft: SellerProductDraft,
  pricing: SellerProductPricing,
): Promise<SellerProductDraft> {
  if (draft.isLocalOnly || !useLiveApi()) {
    return saveDraft(withSyncedSkuPrices(draft, pricing));
  }

  await apiClient(`/api/seller/products/${encodeURIComponent(draft.id)}/pricing`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify({
      price: { amount: pricing.price, currency: "IRT" },
      originalPrice: pricing.originalPrice
        ? { amount: pricing.originalPrice, currency: "IRT" }
        : null,
      discountPercent: pricing.discountPercent,
      showWarranty: pricing.showWarranty,
      warranty: pricing.warranty,
      showDelivery: pricing.showDelivery,
      deliveryTitle: pricing.deliveryTitle,
      deliveryMethodLabel: pricing.deliveryMethodLabel,
      deliveryCostLabel: pricing.deliveryCostLabel,
      showPricePolicy: pricing.showPricePolicy,
      pricePolicyLabel: pricing.pricePolicyLabel,
      showInsurance: pricing.showInsurance,
      insuranceTitle: pricing.insuranceTitle,
      insurancePrice: pricing.insurancePrice,
      insuranceOriginalPrice: pricing.insuranceOriginalPrice,
      insuranceDiscountPercent: pricing.insuranceDiscountPercent,
      inStock: draft.basics.inStock,
    }),
  });

  return saveDraft({
    ...withSyncedSkuPrices(draft, pricing),
    isLocalOnly: false,
  });
}

export async function saveSellerProductVariants(
  draft: SellerProductDraft,
  variants: SellerProductVariants,
): Promise<SellerProductDraft> {
  if (draft.isLocalOnly || !useLiveApi()) {
    return saveDraft({ ...draft, variants });
  }

  try {
    await apiClient(
      `/api/seller/products/${encodeURIComponent(draft.id)}/variants`,
      {
        method: "PUT",
        auth: true,
        body: JSON.stringify(variants),
      },
    );
  } catch {
    // Endpoint may land after FE — keep local draft seamless.
  }
  return saveDraft({ ...draft, variants });
}

export async function saveSellerProductSpecs(
  draft: SellerProductDraft,
  specs: ProductSpecGroup[],
): Promise<SellerProductDraft> {
  if (draft.isLocalOnly || !useLiveApi()) {
    return saveDraft({ ...draft, specs });
  }

  try {
    await apiClient(`/api/seller/products/${encodeURIComponent(draft.id)}/specs`, {
      method: "PUT",
      auth: true,
      body: JSON.stringify({ groups: specs }),
    });
  } catch {
    // keep local
  }
  return saveDraft({ ...draft, specs });
}

export async function saveSellerProductDescription(
  draft: SellerProductDraft,
  description: SellerProductDescription,
): Promise<SellerProductDraft> {
  if (draft.isLocalOnly || !useLiveApi()) {
    return saveDraft({ ...draft, description });
  }

  try {
    await apiClient(
      `/api/seller/products/${encodeURIComponent(draft.id)}/content`,
      {
        method: "PUT",
        auth: true,
        body: JSON.stringify({
          introPreview: description.intro.preview,
          introFull: description.intro.full,
          expertReviewTitle: description.expertReview.title,
          expertReviewPreview: description.expertReview.preview,
          expertReviewFull: description.expertReview.full,
          features: description.features,
        }),
      },
    );
  } catch {
    // keep local
  }
  return saveDraft({ ...draft, description });
}

export async function publishSellerProduct(
  draft: SellerProductDraft,
  publish: boolean,
): Promise<SellerProductDraft> {
  if (draft.isLocalOnly) {
    throw new Error("محصول هنوز روی سرور ساخته نشده است");
  }
  if (!useLiveApi()) {
    return saveDraft({
      ...draft,
      basics: { ...draft.basics, isPublished: publish },
    });
  }

  await apiClient(
    `/api/seller/products/${encodeURIComponent(draft.id)}/publish`,
    {
      method: "PUT",
      auth: true,
      body: JSON.stringify({ isPublished: publish }),
    },
  );

  return saveDraft({
    ...draft,
    basics: { ...draft.basics, isPublished: publish },
  });
}
