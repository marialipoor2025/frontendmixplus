import {
  createEmptyDraft,
  normalizeStepStatus,
  type SellerProductDraft,
  type SellerWizardStepId,
  type SellerWizardStepStatus,
} from "@/types/seller-wizard";

const KEY_PREFIX = "mixplus.seller.productDraft.";

function storageKey(id: string) {
  return `${KEY_PREFIX}${id}`;
}

export function loadDraft(id: string): SellerProductDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKey(id));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SellerProductDraft;
    return {
      ...parsed,
      stepStatus: normalizeStepStatus(parsed.stepStatus),
    };
  } catch {
    return null;
  }
}

export function saveDraft(draft: SellerProductDraft): SellerProductDraft {
  const next = { ...draft, updatedAt: new Date().toISOString() };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(storageKey(draft.id), JSON.stringify(next));
  }
  return next;
}

export function removeDraft(id: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(storageKey(id));
}

export function markStep(
  draft: SellerProductDraft,
  step: SellerWizardStepId,
  status: SellerWizardStepStatus,
): SellerProductDraft {
  return saveDraft({
    ...draft,
    stepStatus: { ...draft.stepStatus, [step]: status },
  });
}

export function ensureDraft(id?: string): SellerProductDraft {
  if (id) {
    return loadDraft(id) ?? createEmptyDraft(id);
  }
  const draft = createEmptyDraft();
  return saveDraft(draft);
}

export function slugifyTitle(title: string): string {
  const map: Record<string, string> = {
    آ: "a",
    ا: "a",
    ب: "b",
    پ: "p",
    ت: "t",
    ث: "s",
    ج: "j",
    چ: "ch",
    ح: "h",
    خ: "kh",
    د: "d",
    ذ: "z",
    ر: "r",
    ز: "z",
    ژ: "zh",
    س: "s",
    ش: "sh",
    ص: "s",
    ض: "z",
    ط: "t",
    ظ: "z",
    ع: "a",
    غ: "gh",
    ف: "f",
    ق: "gh",
    ک: "k",
    گ: "g",
    ل: "l",
    م: "m",
    ن: "n",
    و: "v",
    ه: "h",
    ی: "y",
    ئ: "y",
  };
  const latin = title
    .trim()
    .split("")
    .map((ch) => map[ch] ?? ch)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return latin || `product-${Date.now().toString(36)}`;
}
