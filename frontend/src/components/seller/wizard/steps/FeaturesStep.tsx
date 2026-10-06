"use client";

import { useState } from "react";
import type { SellerProductDraft, SellerProductDescription } from "@/types/seller-wizard";
import { PdpComponentPreview } from "../PdpComponentPreview";
import {
  WizardNavButtons,
  WizardStepChrome,
  wizardInputClass,
} from "../WizardStepChrome";

type Props = {
  draft: SellerProductDraft;
  onSave: (description: SellerProductDescription) => Promise<void> | void;
  onBack?: () => void;
  onSkip?: () => void;
};

export function FeaturesStep({ draft, onSave, onBack, onSkip }: Props) {
  const [features, setFeatures] = useState(draft.description.features);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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

  return (
    <WizardStepChrome
      title="هایلایت ویژگی‌ها"
      hint="کارت‌های ویژگی که کنار عنوان و در ستون خرید صفحه جزییات محصول دیده می‌شوند."
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
          هنوز ویژگی‌ای نیست — می‌توانید رد کنید یا چند ردیف اضافه کنید.
        </p>
      ) : null}
    </WizardStepChrome>
  );
}
