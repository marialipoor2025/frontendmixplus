"use client";

import { useState } from "react";
import type { SellerProductDraft, SellerProductDescription } from "@/types/seller-wizard";
import { PdpComponentPreview } from "../PdpComponentPreview";
import {
  WizardField,
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

export function ExpertReviewStep({ draft, onSave, onBack, onSkip }: Props) {
  const [title, setTitle] = useState(
    draft.description.expertReview.title || "نقد و بررسی",
  );
  const [full, setFull] = useState(draft.description.expertReview.full);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const expertReview = {
    title: title.trim() || "نقد و بررسی",
    full,
    preview:
      full.trim().length > 160 ? `${full.trim().slice(0, 160)}…` : full.trim(),
  };
  const previewDraft = {
    ...draft,
    description: { ...draft.description, expertReview },
  };

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      await onSave({ ...draft.description, expertReview });
    } catch (err) {
      setError(err instanceof Error ? err.message : "ذخیره ناموفق بود");
    } finally {
      setSaving(false);
    }
  }

  return (
    <WizardStepChrome
      title="نقد تخصصی"
      hint="بخش «بررسی تخصصی» در تب‌های پایین صفحه جزییات محصول."
      pdpComponent="ProductExpertReview"
      aside={
        <PdpComponentPreview draft={previewDraft} stepId="expertReview" />
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
      <WizardField label="عنوان نقد">
        <input
          className={wizardInputClass}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </WizardField>
      <WizardField label="متن نقد و بررسی">
        <textarea
          className={`${wizardInputClass} min-h-36`}
          value={full}
          onChange={(e) => setFull(e.target.value)}
          placeholder="متن نقد کارشناسی برای صفحه جزییات محصول"
        />
      </WizardField>
    </WizardStepChrome>
  );
}