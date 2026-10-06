"use client";

import { useState } from "react";
import type {
  ProductSkuVariant,
  ProductVariantOptionGroup,
} from "@/types/product-detail";
import type { SellerProductDraft, SellerProductVariants } from "@/types/seller-wizard";
import { SELLER_WIZARD_STEPS } from "@/lib/seller/wizard-steps";
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

function uid(_prefix?: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function VariantsStep({ draft, onSave, onBack, onSkip }: Props) {
  const [groups, setGroups] = useState<ProductVariantOptionGroup[]>(
    draft.variants.optionGroups,
  );
  const [skus, setSkus] = useState<ProductSkuVariant[]>(draft.variants.skus);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function addGroup() {
    setGroups((prev) => [
      ...prev,
      {
        id: uid("og"),
        code: "color",
        name: "رنگ",
        ui: "swatch",
        values: [
          {
            id: uid("ov"),
            label: "مشکی",
            swatchHex: "#111111",
            available: true,
          },
        ],
      },
    ]);
  }

  function removeGroup(id: string) {
    setGroups((prev) => prev.filter((g) => g.id !== id));
    setSkus([]);
  }

  function addValue(groupId: string) {
    setGroups((prev) =>
      prev.map((g) =>
        g.id !== groupId
          ? g
          : {
              ...g,
              values: [
                ...g.values,
                {
                  id: uid("ov"),
                  label: "گزینه جدید",
                  available: true,
                  swatchHex: g.ui === "swatch" ? "#cccccc" : undefined,
                },
              ],
            },
      ),
    );
  }

  function buildSkusFromGroups() {
    if (groups.length === 0) {
      setSkus([]);
      return;
    }
    // Cartesian of first two groups (enough for color × capacity UX).
    const g0 = groups[0]!;
    const g1 = groups[1];
    const rows: ProductSkuVariant[] = [];
    for (const v0 of g0.values) {
      if (g1) {
        for (const v1 of g1.values) {
          rows.push({
            id: uid("sku"),
            sku: `${draft.basics.slug || "p"}-${v0.label}-${v1.label}`
              .replace(/\s+/g, "-")
              .toLowerCase(),
            optionValueIds: [v0.id, v1.id],
            price: draft.pricing.price || 0,
            originalPrice: draft.pricing.originalPrice ?? undefined,
            discountPercent: draft.pricing.discountPercent ?? undefined,
            inStock: true,
          });
        }
      } else {
        rows.push({
          id: uid("sku"),
          sku: `${draft.basics.slug || "p"}-${v0.label}`
            .replace(/\s+/g, "-")
            .toLowerCase(),
          optionValueIds: [v0.id],
          price: draft.pricing.price || 0,
          inStock: true,
        });
      }
    }
    setSkus(rows);
  }

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      await onSave({ optionGroups: groups, skus });
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
      hint={stepMeta?.pdpHint ?? ""}
      pdpComponent={stepMeta?.pdpComponent}
      aside={<PdpComponentPreview draft={previewDraft} stepId="variants" />}
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

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={addGroup}
          className="rounded-lg border border-[var(--color-neutral-200)] px-3 py-1.5 text-xs"
        >
          + گروه گزینه
        </button>
        <button
          type="button"
          onClick={buildSkusFromGroups}
          className="rounded-lg border border-[var(--color-neutral-200)] px-3 py-1.5 text-xs"
          disabled={groups.length === 0}
        >
          ساخت خودکار SKU
        </button>
      </div>

      {groups.map((group) => (
        <div
          key={group.id}
          className="space-y-2 rounded-lg border border-[var(--color-neutral-100)] bg-[var(--color-neutral-50)] p-3"
        >
          <div className="flex flex-wrap items-end gap-2">
            <WizardField label="نام گروه">
              <input
                className={wizardInputClass}
                value={group.name}
                onChange={(e) =>
                  setGroups((prev) =>
                    prev.map((g) =>
                      g.id === group.id ? { ...g, name: e.target.value } : g,
                    ),
                  )
                }
              />
            </WizardField>
            <WizardField label="نوع UI">
              <select
                className={wizardInputClass}
                value={group.ui}
                onChange={(e) =>
                  setGroups((prev) =>
                    prev.map((g) =>
                      g.id === group.id
                        ? {
                            ...g,
                            ui: e.target.value === "swatch" ? "swatch" : "chip",
                          }
                        : g,
                    ),
                  )
                }
              >
                <option value="swatch">رنگ (swatch)</option>
                <option value="chip">چیپ</option>
              </select>
            </WizardField>
            <button
              type="button"
              className="mb-0.5 text-xs text-red-600"
              onClick={() => removeGroup(group.id)}
            >
              حذف گروه
            </button>
          </div>

          {group.values.map((val) => (
            <div key={val.id} className="grid gap-2 sm:grid-cols-[1fr_100px_auto]">
              <input
                className={wizardInputClass}
                value={val.label}
                onChange={(e) =>
                  setGroups((prev) =>
                    prev.map((g) =>
                      g.id !== group.id
                        ? g
                        : {
                            ...g,
                            values: g.values.map((v) =>
                              v.id === val.id
                                ? { ...v, label: e.target.value }
                                : v,
                            ),
                          },
                    ),
                  )
                }
              />
              {group.ui === "swatch" ? (
                <input
                  type="color"
                  className="h-10 w-full rounded-lg border border-[var(--color-neutral-200)]"
                  value={val.swatchHex || "#cccccc"}
                  onChange={(e) =>
                    setGroups((prev) =>
                      prev.map((g) =>
                        g.id !== group.id
                          ? g
                          : {
                              ...g,
                              values: g.values.map((v) =>
                                v.id === val.id
                                  ? { ...v, swatchHex: e.target.value }
                                  : v,
                              ),
                            },
                      ),
                    )
                  }
                />
              ) : (
                <span />
              )}
              <button
                type="button"
                className="text-xs text-red-600"
                onClick={() =>
                  setGroups((prev) =>
                    prev.map((g) =>
                      g.id !== group.id
                        ? g
                        : {
                            ...g,
                            values: g.values.filter((v) => v.id !== val.id),
                          },
                    ),
                  )
                }
              >
                حذف
              </button>
            </div>
          ))}
          <button
            type="button"
            className="text-xs text-[var(--color-primary)]"
            onClick={() => addValue(group.id)}
          >
            + مقدار
          </button>
        </div>
      ))}

      {skus.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-medium text-[var(--color-neutral-700)]">
            SKUها ({skus.length})
          </p>
          <ul className="max-h-48 space-y-1 overflow-y-auto text-xs">
            {skus.map((sku) => (
              <li
                key={sku.id}
                className="flex items-center justify-between gap-2 rounded border border-[var(--color-neutral-100)] px-2 py-1.5"
                dir="ltr"
              >
                <span>{sku.sku}</span>
                <input
                  type="number"
                  className="w-28 rounded border border-[var(--color-neutral-200)] px-2 py-1"
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
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </WizardStepChrome>
  );
}
