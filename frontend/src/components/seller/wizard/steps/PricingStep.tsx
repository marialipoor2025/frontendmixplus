"use client";

import { useState, type ReactNode } from "react";
import type { SellerProductDraft, SellerProductPricing } from "@/types/seller-wizard";
import { emptyPricing } from "@/types/seller-wizard";
import { formatFaMoney } from "@/lib/format/persian";
import { SELLER_WIZARD_STEPS } from "@/lib/seller/wizard-steps";
import { MoneyInput } from "../MoneyInput";
import { PdpComponentPreview } from "../PdpComponentPreview";
import {
  WizardField,
  WizardNavButtons,
  WizardStepChrome,
  wizardInputClass,
} from "../WizardStepChrome";

type Props = {
  draft: SellerProductDraft;
  onSave: (pricing: SellerProductPricing) => Promise<void> | void;
  onBack?: () => void;
  onSkip?: () => void;
};

function clampDiscount(n: number): number {
  return Math.max(0, Math.min(99, Math.round(n)));
}

/** Base (list) price shown in the «قیمت» field. */
function baseFromPricing(p: Pick<SellerProductPricing, "price" | "originalPrice">) {
  return p.originalPrice != null && p.originalPrice > 0
    ? p.originalPrice
    : p.price;
}

/** Sale price after discount from base + %. */
function saleFrom(base: number, discountPercent: number | null): number {
  if (base <= 0) return 0;
  if (discountPercent == null || discountPercent <= 0) return base;
  return Math.round(base * (1 - clampDiscount(discountPercent) / 100));
}

/** Apply base + % → store as API shape: price=sale, originalPrice=list when discounted. */
function withBaseAndDiscount(
  prev: SellerProductPricing,
  base: number,
  discountPercent: number | null,
): SellerProductPricing {
  const pct =
    discountPercent != null && !Number.isNaN(discountPercent) && discountPercent > 0
      ? clampDiscount(discountPercent)
      : null;
  const safeBase = Math.max(0, base);
  const sale = saleFrom(safeBase, pct);
  return {
    ...prev,
    originalPrice: pct != null && safeBase > 0 ? safeBase : null,
    discountPercent: pct,
    price: sale,
  };
}

function insuranceBase(p: SellerProductPricing): number {
  return p.insuranceOriginalPrice != null && p.insuranceOriginalPrice > 0
    ? p.insuranceOriginalPrice
    : p.insurancePrice;
}

function withInsuranceBaseAndDiscount(
  prev: SellerProductPricing,
  base: number,
  discountPercent: number | null,
): SellerProductPricing {
  const pct =
    discountPercent != null && !Number.isNaN(discountPercent) && discountPercent > 0
      ? clampDiscount(discountPercent)
      : null;
  const safeBase = Math.max(0, base);
  const sale = saleFrom(safeBase, pct);
  return {
    ...prev,
    insuranceOriginalPrice: pct != null && safeBase > 0 ? safeBase : null,
    insuranceDiscountPercent: pct,
    insurancePrice: sale,
  };
}

function normalizePricing(p: SellerProductPricing): SellerProductPricing {
  const defaults = emptyPricing();
  const merged: SellerProductPricing = {
    ...defaults,
    ...p,
    showWarranty: p.showWarranty ?? defaults.showWarranty,
    showDelivery: p.showDelivery ?? defaults.showDelivery,
    showPricePolicy: p.showPricePolicy ?? defaults.showPricePolicy,
    showInsurance: p.showInsurance ?? defaults.showInsurance,
    pricePolicyLabel: p.pricePolicyLabel || defaults.pricePolicyLabel,
    insuranceTitle: p.insuranceTitle || defaults.insuranceTitle,
    insurancePrice: p.insurancePrice ?? 0,
    insuranceOriginalPrice: p.insuranceOriginalPrice ?? null,
    insuranceDiscountPercent: p.insuranceDiscountPercent ?? null,
  };
  // Normalize so sale/list stay consistent with % for live preview.
  return withBaseAndDiscount(
    withInsuranceBaseAndDiscount(
      merged,
      insuranceBase(merged),
      merged.insuranceDiscountPercent,
    ),
    baseFromPricing(merged),
    merged.discountPercent,
  );
}

function PercentInput({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  return (
    <div className="relative">
      <input
        type="number"
        min={0}
        max={99}
        className={`${wizardInputClass} pl-9`}
        dir="ltr"
        value={value ?? ""}
        onChange={(e) =>
          onChange(e.target.value === "" ? null : Number(e.target.value))
        }
      />
      <span
        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-[var(--color-neutral-500)]"
        aria-hidden
      >
        ٪
      </span>
    </div>
  );
}

function AfterDiscountDisplay({ amount }: { amount: number }) {
  return (
    <div
      className={`${wizardInputClass} flex items-center bg-[var(--color-neutral-50)] text-[var(--color-neutral-800)]`}
      dir="ltr"
    >
      {amount > 0 ? formatFaMoney(amount) : "—"}
    </div>
  );
}

export function PricingStep({ draft, onSave, onBack, onSkip }: Props) {
  const [form, setForm] = useState<SellerProductPricing>(() =>
    normalizePricing(draft.pricing),
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function patch(p: Partial<SellerProductPricing>) {
    setForm((prev) => ({ ...prev, ...p }));
  }

  const listPrice = baseFromPricing(form);
  const salePrice = form.price;
  const insuranceList = insuranceBase(form);
  const insuranceSale = form.insurancePrice;

  async function handleSave() {
    if (!form.price || form.price <= 0) {
      setError("قیمت باید بیشتر از صفر باشد");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await onSave(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ذخیره ناموفق بود");
    } finally {
      setSaving(false);
    }
  }

  const stepMeta = SELLER_WIZARD_STEPS.find((s) => s.id === "pricing");
  const previewDraft = { ...draft, pricing: form };
  const defaults = emptyPricing();
  const previewKey = [
    form.price,
    form.originalPrice ?? 0,
    form.discountPercent ?? 0,
    form.insurancePrice,
    form.insuranceOriginalPrice ?? 0,
    form.insuranceDiscountPercent ?? 0,
    form.showWarranty,
    form.showDelivery,
    form.showInsurance,
    form.showPricePolicy,
    form.warranty,
    form.deliveryTitle,
    form.deliveryMethodLabel,
    form.deliveryCostLabel,
    form.insuranceTitle,
    form.pricePolicyLabel,
  ].join("|");

  return (
    <WizardStepChrome
      title={stepMeta?.title ?? "باکس خرید"}
      hint={stepMeta?.pdpHint ?? ""}
      pdpComponent={stepMeta?.pdpComponent}
      aside={
        <PdpComponentPreview
          key={previewKey}
          draft={previewDraft}
          stepId="pricing"
        />
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

      <div className="grid gap-3 sm:grid-cols-3">
        <WizardField label="قیمت (تومان)">
          <MoneyInput
            value={listPrice}
            onChange={(base) =>
              setForm((prev) =>
                withBaseAndDiscount(prev, base, prev.discountPercent),
              )
            }
          />
        </WizardField>
        <WizardField label="درصد تخفیف">
          <PercentInput
            value={form.discountPercent}
            onChange={(pct) =>
              setForm((prev) =>
                withBaseAndDiscount(prev, baseFromPricing(prev), pct),
              )
            }
          />
        </WizardField>
        <WizardField label="قیمت پس از تخفیف">
          <AfterDiscountDisplay amount={salePrice} />
        </WizardField>
      </div>

      <ToggleBlock
        enabled={form.showWarranty}
        title="گارانتی"
        onToggle={(on) =>
          patch({
            showWarranty: on,
            warranty: on
              ? form.warranty || defaults.warranty
              : form.warranty,
          })
        }
      >
        <WizardField label="متن گارانتی">
          <input
            className={wizardInputClass}
            value={form.warranty}
            onChange={(e) => patch({ warranty: e.target.value })}
            placeholder={defaults.warranty}
          />
        </WizardField>
      </ToggleBlock>

      <ToggleBlock
        enabled={form.showDelivery}
        title="ارسال فروشنده"
        onToggle={(on) =>
          patch({
            showDelivery: on,
            deliveryTitle: on
              ? form.deliveryTitle || defaults.deliveryTitle
              : form.deliveryTitle,
            deliveryMethodLabel: on
              ? form.deliveryMethodLabel || defaults.deliveryMethodLabel
              : form.deliveryMethodLabel,
            deliveryCostLabel: on
              ? form.deliveryCostLabel || defaults.deliveryCostLabel
              : form.deliveryCostLabel,
          })
        }
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <WizardField label="عنوان ارسال">
            <input
              className={wizardInputClass}
              value={form.deliveryTitle}
              onChange={(e) => patch({ deliveryTitle: e.target.value })}
            />
          </WizardField>
          <WizardField label="روش ارسال">
            <input
              className={wizardInputClass}
              value={form.deliveryMethodLabel}
              onChange={(e) => patch({ deliveryMethodLabel: e.target.value })}
            />
          </WizardField>
          <WizardField label="هزینه ارسال">
            <input
              className={wizardInputClass}
              value={form.deliveryCostLabel}
              onChange={(e) => patch({ deliveryCostLabel: e.target.value })}
            />
          </WizardField>
        </div>
      </ToggleBlock>

      <ToggleBlock
        enabled={form.showPricePolicy}
        title="لینک نظارت بر قیمت"
        onToggle={(on) =>
          patch({
            showPricePolicy: on,
            pricePolicyLabel: on
              ? form.pricePolicyLabel || defaults.pricePolicyLabel
              : form.pricePolicyLabel,
          })
        }
      >
        <WizardField label="متن لینک">
          <input
            className={wizardInputClass}
            value={form.pricePolicyLabel}
            onChange={(e) => patch({ pricePolicyLabel: e.target.value })}
            placeholder={defaults.pricePolicyLabel}
          />
        </WizardField>
      </ToggleBlock>

      <ToggleBlock
        enabled={form.showInsurance}
        title="بیمه"
        onToggle={(on) =>
          patch({
            showInsurance: on,
            insuranceTitle: on
              ? form.insuranceTitle || defaults.insuranceTitle
              : form.insuranceTitle,
          })
        }
      >
        <WizardField label="عنوان بیمه">
          <input
            className={wizardInputClass}
            value={form.insuranceTitle}
            onChange={(e) => patch({ insuranceTitle: e.target.value })}
          />
        </WizardField>
        <div className="grid gap-3 sm:grid-cols-3">
          <WizardField label="قیمت بیمه (تومان)">
            <MoneyInput
              value={insuranceList}
              onChange={(base) =>
                setForm((prev) =>
                  withInsuranceBaseAndDiscount(
                    prev,
                    base,
                    prev.insuranceDiscountPercent,
                  ),
                )
              }
            />
          </WizardField>
          <WizardField label="درصد تخفیف">
            <PercentInput
              value={form.insuranceDiscountPercent}
              onChange={(pct) =>
                setForm((prev) =>
                  withInsuranceBaseAndDiscount(
                    prev,
                    insuranceBase(prev),
                    pct,
                  ),
                )
              }
            />
          </WizardField>
          <WizardField label="قیمت بیمه پس از تخفیف">
            <AfterDiscountDisplay amount={insuranceSale} />
          </WizardField>
        </div>
      </ToggleBlock>
    </WizardStepChrome>
  );
}

function ToggleBlock({
  enabled,
  title,
  onToggle,
  children,
}: {
  enabled: boolean;
  title: string;
  onToggle: (on: boolean) => void;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2 rounded-lg border border-[var(--color-neutral-100)] p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-[var(--color-neutral-800)]">
          {title}
        </p>
        <div className="flex items-center gap-2">
          {enabled ? (
            <button
              type="button"
              className="text-xs text-red-600"
              onClick={() => onToggle(false)}
            >
              حذف از صفحه جزییات محصول
            </button>
          ) : (
            <button
              type="button"
              className="text-xs font-medium text-[var(--color-primary)]"
              onClick={() => onToggle(true)}
            >
              افزودن
            </button>
          )}
        </div>
      </div>
      {enabled ? (
        children
      ) : (
        <p className="text-[11px] text-[var(--color-neutral-400)]">
          در پیش‌نمایش و صفحه جزییات محصول نمایش داده نمی‌شود
        </p>
      )}
    </div>
  );
}
