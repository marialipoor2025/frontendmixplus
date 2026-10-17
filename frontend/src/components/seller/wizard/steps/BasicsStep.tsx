"use client";

import { useEffect, useState } from "react";
import type { SellerProductBasics, SellerProductDraft } from "@/types/seller-wizard";
import { slugifyTitle } from "@/lib/seller/wizard-draft";
import {
  listCatalogBrandOptions,
  listCatalogCategoryOptions,
  type CatalogBrandOption,
  type CatalogCategoryOption,
} from "@/lib/api/catalog-lookups";
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

const CUSTOM = "__custom__";

export function BasicsStep({ draft, onSave, onBack, onSkip }: Props) {
  const [form, setForm] = useState<SellerProductBasics>(draft.basics);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(Boolean(draft.basics.slug));
  const [brands, setBrands] = useState<CatalogBrandOption[]>([]);
  const [categories, setCategories] = useState<CatalogCategoryOption[]>([]);
  const [lookupsLoading, setLookupsLoading] = useState(true);
  const [brandMode, setBrandMode] = useState<"pick" | "custom">("pick");
  const [categoryMode, setCategoryMode] = useState<"pick" | "custom">("pick");

  useEffect(() => {
    let cancelled = false;
    setLookupsLoading(true);
    void Promise.all([
      listCatalogBrandOptions(),
      listCatalogCategoryOptions(),
    ]).then(([b, c]) => {
      if (cancelled) return;
      setBrands(b);
      setCategories(c);

      const brandMatch = b.find(
        (x) =>
          x.id === draft.basics.brandId || x.name === draft.basics.brandName,
      );
      const catMatch = c.find(
        (x) =>
          x.id === draft.basics.categoryId ||
          x.name === draft.basics.categoryName,
      );
      setBrandMode(
        draft.basics.brandName && !brandMatch ? "custom" : "pick",
      );
      setCategoryMode(
        draft.basics.categoryName && !catMatch ? "custom" : "pick",
      );
      if (brandMatch) {
        setForm((prev) => ({
          ...prev,
          brandId: brandMatch.id,
          brandName: brandMatch.name,
        }));
      }
      if (catMatch) {
        setForm((prev) => ({
          ...prev,
          categoryId: catMatch.id,
          categoryName: catMatch.name,
        }));
      }
      setLookupsLoading(false);
    });
    return () => {
      cancelled = true;
    };
    // Only on mount / draft id change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.id]);

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
      setError("برند را از لیست انتخاب یا وارد کنید");
      return;
    }
    if (!form.categoryName.trim()) {
      setError("دسته‌بندی را از لیست انتخاب یا وارد کنید");
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
        categoryId:
          form.categoryId ||
          (form.categoryName ? `c-${slugifyTitle(form.categoryName)}` : ""),
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
  const brandSelectValue =
    brandMode === "custom"
      ? CUSTOM
      : brands.some((b) => b.id === form.brandId)
        ? form.brandId
        : "";
  const categorySelectValue =
    categoryMode === "custom"
      ? CUSTOM
      : categories.some((c) => c.id === form.categoryId)
        ? form.categoryId
        : "";

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
          placeholder="مثلاً فر برقی میکس پلاس مدل E6500"
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
          placeholder="mixplus-electric-oven-e6500"
        />
      </WizardField>

      <WizardField
        label="برند"
        hint={
          lookupsLoading
            ? "در حال بارگذاری برندها…"
            : `${brands.length} برند ثبت‌شده در کاتالوگ`
        }
      >
        <select
          className={wizardInputClass}
          value={brandSelectValue}
          disabled={lookupsLoading}
          onChange={(e) => {
            const v = e.target.value;
            if (v === CUSTOM) {
              setBrandMode("custom");
              patch({ brandId: "", brandName: form.brandName || "" });
              return;
            }
            setBrandMode("pick");
            const match = brands.find((b) => b.id === v);
            patch({
              brandId: match?.id ?? "",
              brandName: match?.name ?? "",
            });
          }}
        >
          <option value="">انتخاب برند…</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
          <option value={CUSTOM}>سایر (ورود دستی)</option>
        </select>
        {brandMode === "custom" ? (
          <input
            className={`${wizardInputClass} mt-2`}
            value={form.brandName}
            onChange={(e) =>
              patch({ brandName: e.target.value, brandId: "" })
            }
            placeholder="نام برند جدید"
          />
        ) : null}
      </WizardField>

      <WizardField
        label="دسته‌بندی"
        hint={
          lookupsLoading
            ? "در حال بارگذاری دسته‌ها…"
            : `${categories.length} دسته ثبت‌شده در کاتالوگ`
        }
      >
        <select
          className={wizardInputClass}
          value={categorySelectValue}
          disabled={lookupsLoading}
          onChange={(e) => {
            const v = e.target.value;
            if (v === CUSTOM) {
              setCategoryMode("custom");
              patch({ categoryId: "", categoryName: form.categoryName || "" });
              return;
            }
            setCategoryMode("pick");
            const match = categories.find((c) => c.id === v);
            patch({
              categoryId: match?.id ?? "",
              categoryName: match?.name ?? "",
            });
          }}
        >
          <option value="">انتخاب دسته‌بندی…</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
          <option value={CUSTOM}>سایر (ورود دستی)</option>
        </select>
        {categoryMode === "custom" ? (
          <input
            className={`${wizardInputClass} mt-2`}
            value={form.categoryName}
            onChange={(e) =>
              patch({ categoryName: e.target.value, categoryId: "" })
            }
            placeholder="نام دسته جدید — مثلاً فر توکار"
          />
        ) : null}
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
