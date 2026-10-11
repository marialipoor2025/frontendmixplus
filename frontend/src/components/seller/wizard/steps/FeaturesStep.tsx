"use client";

import { useEffect, useState } from "react";
import type { PdpSplitDraftPatch } from "@/lib/seller/apply-pdp-split";
import type {
  SellerProductDraft,
  SellerProductDescription,
} from "@/types/seller-wizard";
import { PdpComponentPreview } from "../PdpComponentPreview";
import { PdpPasteFormatPanel } from "../PdpPasteFormatPanel";
import {
  WizardNavButtons,
  WizardStepChrome,
  wizardInputClass,
} from "../WizardStepChrome";

type Props = {
  draft: SellerProductDraft;
  onSave: (description: SellerProductDescription) => Promise<void> | void;
  /** Apply Format result to draft (intro/expert/specs/warranty) before save. */
  onApplyFormat: (patch: PdpSplitDraftPatch) => void;
  onBack?: () => void;
  onSkip?: () => void;
};

export function FeaturesStep({
  draft,
  onSave,
  onApplyFormat,
  onBack,
  onSkip,
}: Props) {
  const [features, setFeatures] = useState(draft.description.features);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFeatures(draft.description.features);
  }, [draft.description.features, draft.updatedAt]);

  const previewDraft = {
    ...draft,
    description: { ...draft.description, features },
  };

  async function handleSave() {
    const cleaned = features.filter((f) => f.label.trim() && f.value.trim());
    setError(null);
    setSaving(true);
    try {
      await onSave({ ...draft.description, features: cleaned });
    } catch (err) {
      setError(err instanceof Error ? err.message : "ذخیره ناموفق بود");
    } finally {
      setSaving(false);
    }
  }

  function handleApplyFormat(patch: PdpSplitDraftPatch) {
    setFeatures(patch.description.features);
    onApplyFormat(patch);
  }

  return (
    <WizardStepChrome
      title="هایلایت ویژگی‌ها"
      hint="کارت‌های ویژگی که کنار عنوان و در ستون خرید صفحه جزییات محصول دیده می‌شوند. با «فرمت» می‌توانید متن کامل را بچسبانید و بین بخش‌های PDP تقسیم کنید."
      pdpComponent="ProductFeatures"
      aside={
        <PdpComponentPreview draft={previewDraft} stepId="features" />
      }
      footer={
        <WizardNavButtons
          onBack={onBack}
          onSkip={onSkip}
          onSaveContinue={() => void handleSave()}
          saving={saving}
        />
      }
    >
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      ) : null}

      <PdpPasteFormatPanel
        draft={draft}
        onApply={handleApplyFormat}
        initialText={
          draft.description.intro.full ||
          draft.description.expertReview.full ||
          ""
        }
      />

      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-[var(--color-neutral-700)]">
          ردیف‌های ویژگی
        </p>
        <button
          type="button"
          className="text-xs text-[var(--color-primary)]"
          onClick={() =>
            setFeatures((prev) => [
              ...prev,
              { id: `f-${Date.now()}`, label: "", value: "" },
            ])
          }
        >
          + ویژگی
        </button>
      </div>

      {features.map((f) => (
        <div key={f.id} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <input
            className={wizardInputClass}
            placeholder="برچسب (مثلاً ارتفاع)"
            value={f.label}
            onChange={(e) =>
              setFeatures((prev) =>
                prev.map((x) =>
                  x.id === f.id ? { ...x, label: e.target.value } : x,
                ),
              )
            }
          />
          <input
            className={wizardInputClass}
            placeholder="مقدار (مثلاً ۸۰ سانتی‌متر)"
            value={f.value}
            onChange={(e) =>
              setFeatures((prev) =>
                prev.map((x) =>
                  x.id === f.id ? { ...x, value: e.target.value } : x,
                ),
              )
            }
          />
          <button
            type="button"
            className="text-xs text-red-600"
            onClick={() =>
              setFeatures((prev) => prev.filter((x) => x.id !== f.id))
            }
          >
            حذف
          </button>
        </div>
      ))}

      {features.length === 0 ? (
        <p className="text-xs text-[var(--color-muted)]">
          هنوز ویژگی‌ای نیست — متن را بالا بچسبانید و «فرمت» را بزنید، یا چند ردیف
          دستی اضافه کنید.
        </p>
      ) : null}
    </WizardStepChrome>
  );
}
