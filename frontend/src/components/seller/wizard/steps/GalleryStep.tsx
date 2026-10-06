"use client";

import { useState } from "react";
import { ProductMediaManager } from "@/components/admin/ProductMediaManager";
import type { ProductMediaItem } from "@/types/admin-product";
import type { SellerProductDraft } from "@/types/seller-wizard";
import { PdpComponentPreview } from "../PdpComponentPreview";
import { WizardNavButtons, WizardStepChrome } from "../WizardStepChrome";
import { SELLER_WIZARD_STEPS } from "@/lib/seller/wizard-steps";

type Props = {
  draft: SellerProductDraft;
  onSave: (gallery: ProductMediaItem[]) => Promise<void> | void;
  onBack?: () => void;
  onSkip?: () => void;
};

export function GalleryStep({ draft, onSave, onBack, onSkip }: Props) {
  const [items, setItems] = useState<ProductMediaItem[]>(draft.gallery);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      await onSave(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ذخیره گالری ناموفق بود");
    } finally {
      setSaving(false);
    }
  }

  const stepMeta = SELLER_WIZARD_STEPS.find((s) => s.id === "gallery");
  const previewDraft = { ...draft, gallery: items };

  return (
    <WizardStepChrome
      title={stepMeta?.title ?? "گالری تصاویر"}
      hint={stepMeta?.pdpHint ?? ""}
      pdpComponent={stepMeta?.pdpComponent}
      aside={<PdpComponentPreview draft={previewDraft} stepId="gallery" />}
      footer={
        <WizardNavButtons
          onBack={onBack}
          onSkip={onSkip}
          onSaveContinue={() => void handleSave()}
          saving={saving}
        />
      }
    >
      {draft.isLocalOnly ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          ابتدا اطلاعات پایه را ذخیره کنید تا محصول روی سرور ساخته شود؛ سپس آپلود تصاویر به Media وصل می‌شود.
        </p>
      ) : null}
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      ) : null}
      <ProductMediaManager items={items} onChange={setItems} />
    </WizardStepChrome>
  );
}
