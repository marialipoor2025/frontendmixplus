import type { SellerWizardStepId } from "@/types/seller-wizard";

export type SellerWizardStepDef = {
  id: SellerWizardStepId;
  title: string;
  shortTitle: string;
  /** UI section this step fills on the product detail page. */
  pdpComponent: string;
  pdpHint: string;
};

/** One step per seller-editable product-detail section (skippable). */
export const SELLER_WIZARD_STEPS: SellerWizardStepDef[] = [
  {
    id: "basics",
    title: "عنوان و مسیر",
    shortTitle: "عنوان",
    pdpComponent: "Breadcrumb + Title",
    pdpHint: "نان‌ریزه، لینک برند/دسته و عنوان محصول",
  },
  {
    id: "gallery",
    title: "گالری تصاویر",
    shortTitle: "گالری",
    pdpComponent: "ProductGallery",
    pdpHint: "گالری دسکتاپ و موزاییک موبایل",
  },
  {
    id: "variants",
    title: "تنوع‌ها",
    shortTitle: "تنوع",
    pdpComponent: "ProductVariantInfo",
    pdpHint: "رنگ، ظرفیت و گزینه‌های انتخاب خریدار",
  },
  {
    id: "features",
    title: "هایلایت ویژگی‌ها",
    shortTitle: "ویژگی",
    pdpComponent: "ProductFeatures",
    pdpHint: "کارت‌های ویژگی کنار عنوان / باکس خرید",
  },
  {
    id: "pricing",
    title: "باکس خرید",
    shortTitle: "خرید",
    pdpComponent: "ProductBuyBox",
    pdpHint: "قیمت، فروشنده، گارانتی و ارسال",
  },
  {
    id: "specs",
    title: "جدول مشخصات",
    shortTitle: "مشخصات",
    pdpComponent: "ProductSpecs",
    pdpHint: "تب مشخصات پایین صفحه جزییات محصول",
  },
  {
    id: "intro",
    title: "معرفی محصول",
    shortTitle: "معرفی",
    pdpComponent: "ProductIntro",
    pdpHint: "متن معرفی در تب‌های پایین صفحه",
  },
  {
    id: "expertReview",
    title: "نقد تخصصی",
    shortTitle: "نقد",
    pdpComponent: "ProductExpertReview",
    pdpHint: "بخش بررسی تخصصی صفحه جزییات محصول",
  },
  {
    id: "preview",
    title: "مرور همه بخش‌ها",
    shortTitle: "انتشار",
    pdpComponent: "چک‌لیست کامل",
    pdpHint: "اطمینان از پوشش همه بخش‌های صفحه جزییات محصول سپس انتشار",
  },
];

export function stepIndex(id: SellerWizardStepId): number {
  return SELLER_WIZARD_STEPS.findIndex((s) => s.id === id);
}

export function nextStepId(id: SellerWizardStepId): SellerWizardStepId | null {
  const i = stepIndex(id);
  if (i < 0 || i >= SELLER_WIZARD_STEPS.length - 1) return null;
  return SELLER_WIZARD_STEPS[i + 1]!.id;
}

export function prevStepId(id: SellerWizardStepId): SellerWizardStepId | null {
  const i = stepIndex(id);
  if (i <= 0) return null;
  return SELLER_WIZARD_STEPS[i - 1]!.id;
}

export function parseStepId(raw: string | null | undefined): SellerWizardStepId {
  if (raw === "description") return "intro";
  const found = SELLER_WIZARD_STEPS.find((s) => s.id === raw);
  return found?.id ?? "basics";
}
