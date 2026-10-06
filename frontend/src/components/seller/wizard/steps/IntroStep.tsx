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

export function IntroStep({ draft, onSave, onBack, onSkip }: Props) {
  const [full, setFull] = useState(draft.description.intro.full);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const intro = {
    full,
    preview:
      full.trim().length > 160 ? `${full.trim().slice(0, 160)}…` : full.trim(),
  };
  const previewDraft = {
    ...draft,
    description: { ...draft.description, intro },
  };

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      await onSave({ ...draft.description, intro });
    } catch (err) {
      setError(err instanceof Error ? err.message : "ذخیره ناموفق بود");
    } finally {
      setSaving(false);
    }
  }

  return (
    <WizardStepChrome
      title="معرفی محصول"
      hint="متن تب «معرفی» در پایین صفحه جزییات محصول."
      pdpComponent="ProductIntro"
      aside={<PdpComponentPreview draft={previewDraft} stepId="intro" />}
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
      <WizardField label="متن کامل معرفی">
        <textarea
          className={`${wizardInputClass} min-h-36`}
          value={full}
          onChange={(e) => setFull(e.target.value)}
          placeholder="توضیح کامل برای بخش معرفی صفحه جزییات محصول"
        />
      </WizardField>
    </WizardStepChrome>
  );
}
