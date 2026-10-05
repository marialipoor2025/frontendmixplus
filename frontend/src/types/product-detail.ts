import type { ProductRailSection } from "./home";

export type BreadcrumbItem = {
  id: string;
  title: string;
  href: string;
};

export type ProductGalleryImage = {
  id: string;
  url: string;
  alt: string;
};

/** Optional special-sale strip above the gallery. */
export type ProductGallerySale = {
  label: string;
  /** 0–100 sold share shown on the progress bar. */
  soldPercent: number;
};

/** Brand + category chips under the gallery, above the title. */
export type ProductTitleNavLink = {
  id: string;
  title: string;
  href: string;
};

export type ProductColorOption = {
  id: string;
  name: string;
  /** CSS color value for the swatch. */
  hex: string;
};

/** One selectable value inside an option group (color, capacity, …). */
export type ProductVariantOptionValue = {
  id: string;
  label: string;
  /** Present for color swatches. */
  swatchHex?: string;
  available: boolean;
};

export type ProductVariantOptionGroup = {
  id: string;
  /** Stable code: color | capacity | storage | … */
  code: string;
  name: string;
  ui: "swatch" | "chip";
  values: ProductVariantOptionValue[];
};

/** Sellable SKU = combination of option values. */
export type ProductSkuVariant = {
  id: string;
  sku: string;
  /** Option value ids that form this combination. */
  optionValueIds: string[];
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  inStock: boolean;
};

export type ProductVariantInfoData = {
  rating: number;
  /** Buyers who left a score (shown as «امتیاز N خریدار»). */
  ratingCount: number;
  commentCount: number;
  questionCount: number;
  /**
   * Option groups the shopper can pick (color, capacity, …).
   * Prefer this over legacy `colors`.
   */
  optionGroups: ProductVariantOptionGroup[];
  /** groupId → selected valueId */
  selectedOptionValueIds: Record<string, string>;
  /** All sellable combinations for this product. */
  skus: ProductSkuVariant[];
  /**
   * @deprecated Prefer `optionGroups` with `ui: "swatch"`.
   * Kept for older mocks; UI maps it into a color group when optionGroups is empty.
   */
  colors?: ProductColorOption[];
  /** @deprecated Prefer selectedOptionValueIds. */
  selectedColorId?: string;
};

export type ProductInsuranceOffer = {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  detailsHref?: string;
};

export type ProductBuyBoxData = {
  seller: {
    id: string;
    name: string;
    href: string;
    /** e.g. عالی */
    performanceLabel: string;
  };
  /** Extra sellers offering the same product. */
  otherSellerCount: number;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  /** Absolute savings tip shown above the price (تومان). */
  cheaperByAmount?: number;
  warranty: string;
  delivery: {
    title: string;
    methodLabel: string;
    costLabel: string;
  };
};

/** Highlighted attribute chip in the info column. */
export type ProductFeatureItem = {
  id: string;
  label: string;
  value: string;
};

export type ProductPlusTouchPoint = {
  perk: string;
  ctaLabel: string;
  href: string;
};

export type ProductFinanceTouchPoint = {
  title: string;
  monthlyAmount: number;
  months: number;
  suggestedCredit: number;
  href: string;
};

export type ProductTouchPointsData = {
  plus?: ProductPlusTouchPoint;
  finance?: ProductFinanceTouchPoint;
};

export type ProductSellerStats = {
  memberSinceLabel: string;
  onTimeSupplyPercent: number;
  shipCommitmentPercent: number;
  noReturnPercent: number;
};

/** One marketplace offer in the desktop sellers list. */
export type ProductSellerOffer = {
  id: string;
  name: string;
  href: string;
  /** Official MixPlus store uses the smile badge. */
  isOfficial?: boolean;
  performanceLabel: string;
  deliveryLabel: string;
  warranty: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  stats?: ProductSellerStats;
};

export type ProductIntroContent = {
  /** Collapsed preview (ends with ellipsis in UI when truncated). */
  preview: string;
  full: string;
};

export type ProductExpertReviewContent = {
  title: string;
  preview: string;
  full: string;
};

export type ProductSpecAttribute = {
  id: string;
  label: string;
  /** One or more values (bullets when length > 1). */
  values: string[];
};

export type ProductSpecGroup = {
  id: string;
  title: string;
  attributes: ProductSpecAttribute[];
  /** How many rows show before «مشاهده بیشتر». */
  previewCount?: number;
};

export type ProductCommentPhoto = {
  id: string;
  url: string;
};

export type ProductComment = {
  id: string;
  authorName: string;
  authorAvatarUrl?: string;
  isBuyer?: boolean;
  expertLabel?: string;
  dateLabel: string;
  /** 0–5; omit when the user left text only. */
  rating?: number;
  body: string;
  sellerName?: string;
  sellerHref?: string;
  colorName?: string;
  colorHex?: string;
  likes: number;
  dislikes: number;
};

export type ProductCommentsContent = {
  averageRating: number;
  ratingCount: number;
  totalCount: number;
  photos: ProductCommentPhoto[];
  topicFilters: string[];
  comments: ProductComment[];
};

export type ProductQuestion = {
  id: string;
  text: string;
};

export type ProductQuestionsContent = {
  totalCount: number;
  questions: ProductQuestion[];
};

/** Lower PDP tab panels: intro → review → specs → comments → questions. */
export type ProductContentData = {
  intro: ProductIntroContent;
  expertReview: ProductExpertReviewContent;
  specs: ProductSpecGroup[];
  comments: ProductCommentsContent;
  questions: ProductQuestionsContent;
};

/** Minimal PDP shell until remaining UI sections land. */
export type ProductDetailPageData = {
  slug: string;
  title: string;
  sku: string;
  brand: {
    id: string;
    name: string;
    slug: string;
  };
  /** e.g. brand home + «یخچال فریزر سامسونگ» */
  titleNav: ProductTitleNavLink[];
  variant: ProductVariantInfoData;
  insurance?: ProductInsuranceOffer;
  features: ProductFeatureItem[];
  /** Optional return-policy tip for the category. */
  returnNotice?: string;
  touchPoints?: ProductTouchPointsData;
  buyBox: ProductBuyBoxData;
  /** Desktop-only multi-seller offers under the main PDP block. */
  sellers?: ProductSellerOffer[];
  /** Tabbed content below sticky scroll menu. */
  content: ProductContentData;
  /** Similar / bought-together / category carousels under tab content. */
  recommendationRails?: ProductRailSection[];
  breadcrumb: BreadcrumbItem[];
  gallery: {
    images: ProductGalleryImage[];
    sale?: ProductGallerySale;
  };
};
