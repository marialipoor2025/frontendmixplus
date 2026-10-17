"use client";

import { useMemo, useState } from "react";
import type {
  ProductSkuVariant,
  ProductVariantOptionGroup,
} from "@/types/product-detail";
import type { SellerProductDraft, SellerProductVariants } from "@/types/seller-wizard";
import { SELLER_WIZARD_STEPS } from "@/lib/seller/wizard-steps";
import {
  VARIANT_GROUP_TEMPLATES,
  cartesianSkus,
  createEmptyValue,
  createGroupFromTemplate,
  skuLabel,
} from "@/lib/seller/variant-builder";
import { PdpComponentPreview } from "../PdpComponentPreview";
import {
  WizardField,
  WizardNavButtons,
  WizardStepChrome,
  wizardInputClass,
} from "../WizardStepChrome";

type Props = {
  draft: SellerProductDraft;
  onSave: (variants: SellerProductVariants) => Promise<void> | void;
  onBack?: () => void;
  onSkip?: () => void;
};

/**
 * Digikala-style dynamic variants: sellers add any option groups (color, capacity, …)
 * and we build the full SKU matrix — not a fixed schema per product.
 * Example: فر E6500 → گروه «رنگ» با مشکی / مشکی استیل (+ قیمت هر SKU).
 */
export function VariantsStep({ draft, onSave, onBack, onSkip }: Props) {
  const [groups, setGroups] = useState<ProductVariantOptionGroup[]>(
    draft.variants.optionGroups,
  );
  const [skus, setSkus] = useState<ProductSkuVariant[]>(draft.variants.skus);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const comboCount = useMemo(() => {
    if (groups.length === 0) return 0;
    return groups.reduce(
      (acc, g) => acc * Math.max(g.values.length, 0),
      groups.every((g) => g.values.length === 0) ? 0 : 1,
    );
  }, [groups]);

  function rebuildSkus(nextGroups: ProductVariantOptionGroup[]) {
    setSkus((prev) =>
      cartesianSkus(nextGroups, {
        slugBase: draft.basics.slug || "p",
        defaultPrice: draft.pricing.price || 0,
        defaultOriginalPrice: draft.pricing.originalPrice,
        defaultDiscountPercent: draft.pricing.discountPercent,
        previous: prev,
      }),
    );
  }

  function addTemplate(templateId: string) {
    const template = VARIANT_GROUP_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;
    setGroups((prev) => {
      const next = [...prev, createGroupFromTemplate(template)];
      rebuildSkus(next);
      return next;
    });
  }

  function removeGroup(id: string) {
    setGroups((prev) => {
      const next = prev.filter((g) => g.id !== id);
      rebuildSkus(next);
      return next;
    });
  }

  function updateGroup(
    id: string,
    patch: Partial<Pick<ProductVariantOptionGroup, "name" | "code" | "ui">>,
  ) {
    setGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...patch } : g)),
    );
  }

  function addValue(groupId: string) {
    setGroups((prev) => {
      const next = prev.map((g) =>
        g.id !== groupId
          ? g
          : { ...g, values: [...g.values, createEmptyValue(g.ui)] },
      );
      rebuildSkus(next);
      return next;
    });
  }

  function removeValue(groupId: string, valueId: string) {
    setGroups((prev) => {
      const next = prev.map((g) =>
        g.id !== groupId
          ? g
          : { ...g, values: g.values.filter((v) => v.id !== valueId) },
      );
      rebuildSkus(next);
      return next;
    });
  }

  function patchValue(
    groupId: string,
    valueId: string,
    patch: { label?: string; swatchHex?: string; available?: boolean },
  ) {
    setGroups((prev) =>
      prev.map((g) =>
        g.id !== groupId
          ? g
          : {
              ...g,
              values: g.values.map((v) =>
                v.id === valueId ? { ...v, ...patch } : v,
              ),
            },
      ),
    );
  }

  async function handleSave() {
    setError(null);
    if (groups.some((g) => !g.name.trim())) {
      setError("نام همه گروه‌های گزینه را وارد کنید");
      return;
    }
    if (groups.some((g) => g.values.length === 0)) {
      setError("هر گروه باید حداقل یک مقدار داشته باشد — یا گروه را حذف کنید");
      return;
    }
    if (groups.length > 0 && skus.length === 0) {
      rebuildSkus(groups);
    }
    setSaving(true);
    try {
      const nextSkus =
        groups.length === 0
          ? []
          : cartesianSkus(groups, {
              slugBase: draft.basics.slug || "p",
              defaultPrice: draft.pricing.price || 0,
              defaultOriginalPrice: draft.pricing.originalPrice,
              defaultDiscountPercent: draft.pricing.discountPercent,
              previous: skus,
            });
      await onSave({ optionGroups: groups, skus: nextSkus });
    } catch (err) {
      setError(err instanceof Error ? err.message : "ذخیره ناموفق بود");
    } finally {
      setSaving(false);
    }
  }

  const stepMeta = SELLER_WIZARD_STEPS.find((s) => s.id === "variants");
  const previewDraft = {
    ...draft,
    variants: { optionGroups: groups, skus },
  };

  return (
    <WizardStepChrome
      title={stepMeta?.title ?? "تنوع‌ها"}
      hint={
        stepMeta?.pdpHint ??
        "مثل صفحه دیجی‌کالا: هر محصول گروه‌های خودش را دارد (رنگ، ظرفیت، …)"
      }
      pdpComponent={stepMeta?.pdpComponent}
      aside={<PdpComponentPreview draft={previewDraft} stepId="variants" />}
      footer={
        <WizardNavButtons
          onBack={onBack}
          onSkip={onSkip}
          onSaveContinue={() => void handleSave()}
          saving={saving}
          continueLabel={
            groups.length === 0 ? "ادامه بدون تنوع" : "ذخیره تنوع و ادامه"
          }
        />
      }
    >
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      ) : null}

      <div className="rounded-lg border border-[var(--color-neutral-100)] bg-[var(--color-neutral-50)] px-3 py-2.5 text-xs leading-6 text-[var(--color-neutral-600)]">
        برای هر کالا فقط گزینه‌هایی را اضافه کنید که خریدار در PDP می‌بیند. مثال
        فر برقی E6500: یک گروه «رنگ» با مقادیر مشکی و مشکی استیل — سپس برای هر
        ترکیب، قیمت و موجودی جداگانه تنظیم می‌شود. اگر محصول تک‌مدل است، این مرحله
        را خالی بگذارید و رد شوید.
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="w-full text-[11px] font-medium text-[var(--color-neutral-500)]">
          افزودن گروه گزینه:
        </span>
        {VARIANT_GROUP_TEMPLATES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => addTemplate(t.id)}
            className="rounded-lg border border-[var(--color-neutral-200)] bg-white px-3 py-1.5 text-xs hover:border-[var(--color-primary)]"
          >
            + {t.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => rebuildSkus(groups)}
          className="rounded-lg border border-[var(--color-primary)]/30 bg-[var(--color-primary-soft)] px-3 py-1.5 text-xs text-[var(--color-primary)] disabled:opacity-40"
          disabled={groups.length === 0}
        >
          بازتولید SKUها
          {comboCount > 0 ? ` (${comboCount})` : ""}
        </button>
      </div>

      {groups.length === 0 ? (
        <p className="text-center text-sm text-[var(--color-muted)]">
          هنوز گروهی اضافه نشده — از دکمه‌های بالا شروع کنید یا رد شوید.
        </p>
      ) : null}

      {groups.map((group, groupIndex) => (
        <div
          key={group.id}
          className="space-y-2 rounded-lg border border-[var(--color-neutral-100)] bg-white p-3 shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-bold text-[var(--color-neutral-800)]">
              گروه {groupIndex + 1}
            </p>
            <button
              type="button"
              className="text-xs text-red-600"
              onClick={() => removeGroup(group.id)}
            >
              حذف گروه
            </button>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <WizardField label="نام نمایشی (PDP)">
              <input
                className={wizardInputClass}
                value={group.name}
                onChange={(e) => updateGroup(group.id, { name: e.target.value })}
                placeholder="رنگ"
              />
            </WizardField>
            <WizardField label="کد داخلی">
              <input
                className={wizardInputClass}
                dir="ltr"
                value={group.code}
                onChange={(e) =>
                  updateGroup(group.id, {
                    code: e.target.value.trim().toLowerCase() || "custom",
                  })
                }
                placeholder="color"
              />
            </WizardField>
            <WizardField label="نمایش در PDP">
              <select
                className={wizardInputClass}
                value={group.ui}
                onChange={(e) =>
                  updateGroup(group.id, {
                    ui: e.target.value === "swatch" ? "swatch" : "chip",
                  })
                }
              >
                <option value="swatch">نمونه رنگ (swatch)</option>
                <option value="chip">چیپ متنی</option>
              </select>
            </WizardField>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-medium text-[var(--color-neutral-500)]">
              مقادیر ({group.values.length})
            </p>
            {group.values.map((val) => (
              <div
                key={val.id}
                className="grid gap-2 sm:grid-cols-[1fr_90px_auto_auto] sm:items-center"
              >
                <input
                  className={wizardInputClass}
                  value={val.label}
                  onChange={(e) => {
                    patchValue(group.id, val.id, { label: e.target.value });
                  }}
                  onBlur={() => rebuildSkus(groups)}
                  placeholder="مثلاً مشکی استیل"
                />
                {group.ui === "swatch" ? (
                  <input
                    type="color"
                    className="h-10 w-full rounded-lg border border-[var(--color-neutral-200)]"
                    value={val.swatchHex || "#cccccc"}
                    onChange={(e) =>
                      patchValue(group.id, val.id, {
                        swatchHex: e.target.value,
                      })
                    }
                  />
                ) : (
                  <span className="hidden sm:block" />
                )}
                <label className="flex items-center gap-1 text-[11px] text-[var(--color-neutral-600)]">
                  <input
                    type="checkbox"
                    checked={val.available}
                    onChange={(e) =>
                      patchValue(group.id, val.id, {
                        available: e.target.checked,
                      })
                    }
                  />
                  موجود
                </label>
                <button
                  type="button"
                  className="text-xs text-red-600"
                  onClick={() => removeValue(group.id, val.id)}
                >
                  حذف
                </button>
              </div>
            ))}
            <button
              type="button"
              className="text-xs font-medium text-[var(--color-primary)]"
              onClick={() => addValue(group.id)}
            >
              + مقدار جدید
            </button>
          </div>
        </div>
      ))}

      {skus.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-medium text-[var(--color-neutral-700)]">
            ترکیب‌های قابل فروش (SKU) — {skus.length} ردیف
          </p>
          <div className="max-h-72 overflow-y-auto rounded-lg border border-[var(--color-neutral-100)]">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-[var(--color-neutral-50)] text-[var(--color-neutral-500)]">
                <tr>
                  <th className="px-2 py-2 text-start font-medium">ترکیب</th>
                  <th className="px-2 py-2 text-start font-medium" dir="ltr">
                    SKU
                  </th>
                  <th className="px-2 py-2 text-start font-medium">قیمت</th>
                  <th className="px-2 py-2 text-start font-medium">موجود</th>
                </tr>
              </thead>
              <tbody>
                {skus.map((sku) => (
                  <tr
                    key={sku.id}
                    className="border-t border-[var(--color-neutral-100)]"
                  >
                    <td className="px-2 py-1.5">{skuLabel(sku, groups)}</td>
                    <td className="px-2 py-1.5" dir="ltr">
                      <input
                        className="w-full min-w-[8rem] rounded border border-[var(--color-neutral-200)] px-1.5 py-1"
                        value={sku.sku}
                        onChange={(e) =>
                          setSkus((prev) =>
                            prev.map((s) =>
                              s.id === sku.id
                                ? { ...s, sku: e.target.value }
                                : s,
                            ),
                          )
                        }
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        type="number"
                        className="w-28 rounded border border-[var(--color-neutral-200)] px-1.5 py-1"
                        value={sku.price}
                        onChange={(e) =>
                          setSkus((prev) =>
                            prev.map((s) =>
                              s.id === sku.id
                                ? { ...s, price: Number(e.target.value) || 0 }
                                : s,
                            ),
                          )
                        }
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        type="checkbox"
                        checked={sku.inStock}
                        onChange={(e) =>
                          setSkus((prev) =>
                            prev.map((s) =>
                              s.id === sku.id
                                ? { ...s, inStock: e.target.checked }
                                : s,
                            ),
                          )
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </WizardStepChrome>
  );
}
