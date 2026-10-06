import { SELLER_WIZARD_STEPS } from "@/lib/seller/wizard-steps";
import type {
  SellerProductDraft,
  SellerWizardStepId,
  SellerWizardStepStatus,
} from "@/types/seller-wizard";

export type CompletenessItem = {
  id: string;
  label: string;
  pdpComponent: string;
  filled: boolean;
  status: SellerWizardStepStatus;
  stepId: SellerWizardStepId;
  hint?: string;
};

/** Every seller-editable PDP component — filled / skipped / empty. */
export function getWizardCompleteness(draft: SellerProductDraft): CompletenessItem[] {
  return SELLER_WIZARD_STEPS.filter((s) => s.id !== "preview").map((s) => {
    const status = draft.stepStatus[s.id] ?? "empty";
    const filled = isStepFilled(draft, s.id);
    return {
      id: `step-${s.id}`,
      label: s.title,
      pdpComponent: s.pdpComponent,
      filled,
      status: filled && status === "empty" ? "draft" : status,
      stepId: s.id,
      hint: s.pdpHint,
    };
  });
}

export function isStepFilled(
  draft: SellerProductDraft,
  id: SellerWizardStepId,
): boolean {
  switch (id) {
    case "basics":
      return Boolean(draft.basics.title.trim());
    case "gallery":
      return draft.gallery.length > 0;
    case "variants":
      return draft.variants.optionGroups.length > 0;
    case "features":
      return draft.description.features.length > 0;
    case "pricing":
      return draft.pricing.price > 0;
    case "specs":
      return draft.specs.some((g) => g.attributes.length > 0);
    case "intro":
      return Boolean(
        draft.description.intro.full.trim() ||
          draft.description.intro.preview.trim(),
      );
    case "expertReview":
      return Boolean(
        draft.description.expertReview.full.trim() ||
          draft.description.expertReview.preview.trim(),
      );
    case "preview":
      return draft.stepStatus.preview === "saved";
    default:
      return false;
  }
}
