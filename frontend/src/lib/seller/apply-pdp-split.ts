import type { ProductSpecGroup } from "@/types/product-detail";
import type {
  SellerProductDescription,
  SellerProductDraft,
  SellerProductPricing,
  SellerWizardStepStatus,
} from "@/types/seller-wizard";
import { cleanPdpLine } from "./to-plain-text";
import type { SplitPdpResult } from "./split-pdp-description";

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`;
}

export type PdpSplitDraftPatch = {
  description: SellerProductDescription;
  specs: ProductSpecGroup[];
  pricing: SellerProductPricing;
  stepStatus: Partial<Record<string, SellerWizardStepStatus>>;
  summary: {
    features: number;
    intro: boolean;
    expertReview: boolean;
    specs: number;
    warranty: boolean;
  };
};

/** Map splitter output onto seller draft fields (local preview before save). */
export function splitResultToDraftPatch(
  split: SplitPdpResult,
  draft: SellerProductDraft,
): PdpSplitDraftPatch {
  const description: SellerProductDescription = {
    features: split.features.map((f, i) => ({
      id: f.id || `f-${i + 1}`,
      label: cleanPdpLine(f.label),
      value: cleanPdpLine(f.value),
    })),
    intro: {
      preview: split.introPreview,
      full: split.introFull,
    },
    expertReview: {
      title: cleanPdpLine(split.expertReviewTitle) || "نقد و بررسی",
      preview: split.expertReviewPreview,
      full: split.expertReviewFull,
    },
  };

  const specs: ProductSpecGroup[] = split.specs.length
    ? [
        {
          id: uid("g-fmt"),
          title: "مشخصات کلی",
          previewCount: Math.min(8, Math.max(5, split.specs.length)),
          attributes: split.specs.map((s, i) => ({
            id: s.id || `a-fmt-${i + 1}`,
            label: cleanPdpLine(s.label),
            values: [cleanPdpLine(s.value)],
            unit: "",
          })),
        },
      ]
    : draft.specs;

  const pricing: SellerProductPricing = split.warranty
    ? {
        ...draft.pricing,
        showWarranty: true,
        warranty: cleanPdpLine(split.warranty),
      }
    : draft.pricing;

  const stepStatus: PdpSplitDraftPatch["stepStatus"] = {};
  if (description.features.length) stepStatus.features = "draft";
  if (description.intro.full.trim()) stepStatus.intro = "draft";
  if (description.expertReview.full.trim()) stepStatus.expertReview = "draft";
  if (split.specs.length) stepStatus.specs = "draft";
  if (split.warranty) stepStatus.pricing = "draft";

  return {
    description,
    specs,
    pricing,
    stepStatus,
    summary: {
      features: description.features.length,
      intro: Boolean(description.intro.full.trim()),
      expertReview: Boolean(description.expertReview.full.trim()),
      specs: split.specs.length,
      warranty: Boolean(split.warranty),
    },
  };
}
