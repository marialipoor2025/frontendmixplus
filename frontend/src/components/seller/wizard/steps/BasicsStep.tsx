"use client";

import { useState } from "react";
import type { SellerProductBasics, SellerProductDraft } from "@/types/seller-wizard";
import { slugifyTitle } from "@/lib/seller/wizard-draft";
import { PdpComponentPreview } from "../PdpComponentPreview";
import {
  WizardField,
  WizardNavButtons,
  WizardStepChrome,
  wizardInputClass,
} from "../WizardStepChrome";
import { SELLER_WIZARD_STEPS } from "@/lib/seller/wizard-steps";

type Props = {
  draft: SellerProductDraft;
  onSave: (basics: SellerProductBasics) => Promise<void> | void;
  onBack?: () => void;
  onSkip?: () => void;
};

const BRAND_SUGGESTIONS = [
  { id: "b-samsung", name: "سامسونگ" },
  { id: "b-xiaomi", name: "شیائومی" },
  { id: "b-lg", name: "ال‌جی" },
  { id: "b-philips", name: "فیلیپس" },
  { id: "b-bosch", name: "بوش" },
];

const CATEGORY_SUGGESTIONS = [
  { id: "cat-builtin", name: "لوازم توکار" },
  { id: "cat-cooking", name: "لوازم پخت و پز" },
  { id: "cat-fridge", name: "یخچال فریزر" },
  { id: "cat-washer", name: "ماشین لباسشویی" },
  { id: "cat-dishwasher", name: "ماشین ظرفشویی" },
  { id: "cat-tv", name: "تلویزیون" },
];

export function BasicsStep({ draft, onSave, onBack, onSkip }: Props) {
  const [form, setForm] = useState<SellerProductBasics>(draft.basics);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(Boolean(draft.basics.slug));

  function patch(p: Partial<SellerProductBasics>) {
    setForm((prev) => {
      const next = { ...prev, ...p };
      if (!slugTouched && p.title != null) {
        next.slug = slugifyTitle(p.title);
      }
      return next;
    });
  }

  async function handleSave() {
    if (!form.title.trim()) {
      setError("عنوان محصول الزامی است");
      return;
    }
    if (!form.slug.trim()) {
      setError("اسلاگ الزامی است");
      return;
    }
    if (!form.brandName.trim()) {
      setError("برند را انتخاب یا وارد کنید");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const brandId = form.brandId || `b-${slugifyTitle(form.brandName)}`;
      await onSave({
        ...form,
        title: form.title.trim(),
        slug: form.slug.trim().toLowerCase(),
        brandId,
        brandName: form.brandName.trim(),
        categoryId: form.categoryId || (form.categoryName ? `c-${slugifyTitle(form.categoryName)}` : ""),
        categoryName: form.categoryName.trim(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "ذخیره ناموفق بود");
    } finally {
      setSaving(false);
    }
  }

  const stepMeta = SELLER_WIZARD_STEPS.find((s) => s.id === "basics");
  const previewDraft = { ...draft, basics: form };

  return (
    <WizardStepChrome
      title={stepMeta?.title ?? "عنوان و مسیر"}
      hint={stepMeta?.pdpHint ?? ""}
      pdpComponent={stepMeta?.pdpComponent}
      aside={<PdpComponentPreview draft={previewDraft} stepId="basics" />}
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

      <WizardField label="عنوان محصول">
        <input
          className={wizardInputClass}
          value={form.title}
          onChange={(e) => patch({ title: e.target.value })}
          placeholder="مثلاً جاروبرقی رباتیک شیائومی S10"
        />
      </WizardField>

      <WizardField label="اسلاگ (آدرس صفحه)" hint="فقط حروف لاتین، عدد و خط تیره">
        <input
          className={wizardInputClass}
          dir="ltr"
          value={form.slug}
          onChange={(e) => {
            setSlugTouched(true);
            patch({ slug: e.target.value });
          }}
          placeholder="xiaomi-vacuum-s10"
        />
      </WizardField>

      <WizardField label="برند">
        <input
          className={wizardInputClass}
          list="seller-brand-suggestions"
          value={form.brandName}
          onChange={(e) => {
            const name = e.target.value;
            const match = BRAND_SUGGESTIONS.find((b) => b.name === name);
            patch({ brandName: name, brandId: match?.id ?? "" });
          }}
          placeholder="نام برند"
        />
        <datalist id="seller-brand-suggestions">
          {BRAND_SUGGESTIONS.map((b) => (
            <option key={b.id} value={b.name} />
          ))}
        </datalist>
      </WizardField>

      <WizardField label="دسته‌بندی">
        <input
          className={wizardInputClass}
          list="seller-category-suggestions"
          value={form.categoryName}
          onChange={(e) => {
            const name = e.target.value;
            const match = CATEGORY_SUGGESTIONS.find((c) => c.name === name);
            patch({ categoryName: name, categoryId: match?.id ?? "" });
          }}
          placeholder="مثلاً لوازم خانگی"
        />
        <datalist id="seller-category-suggestions">
          {CATEGORY_SUGGESTIONS.map((c) => (
            <option key={c.id} value={c.name} />
          ))}
        </datalist>
      </WizardField>

      <div className="grid gap-3 sm:grid-cols-3">
        <WizardField label="وضعیت کالا">
          <select
            className={wizardInputClass}
            value={form.condition}
            onChange={(e) =>
              patch({ condition: e.target.value === "used" ? "used" : "new" })
            }
          >
            <option value="new">نو</option>
            <option value="used">دست دوم</option>
          </select>
        </WizardField>
        <label className="flex items-end gap-2 pb-2 text-sm">
          <input
            type="checkbox"
            checked={form.inStock}
            onChange={(e) => patch({ inStock: e.target.checked })}
          />
          موجود در انبار
        </label>
        <label className="flex items-end gap-2 pb-2 text-sm">
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(e) => patch({ isPublished: e.target.checked })}
          />
          انتشار پس از تکمیل
        </label>
      </div>
    </WizardStepChrome>
  );
}
