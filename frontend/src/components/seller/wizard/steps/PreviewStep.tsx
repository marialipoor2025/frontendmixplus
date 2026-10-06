"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { formatPrice } from "@/lib/format";
import { getWizardCompleteness } from "@/lib/seller/wizard-completeness";
import { SELLER_WIZARD_STEPS } from "@/lib/seller/wizard-steps";
import type { SellerProductDraft, SellerWizardStepId } from "@/types/seller-wizard";
import { PdpComponentPreview } from "../PdpComponentPreview";
import { WizardNavButtons, WizardStepChrome } from "../WizardStepChrome";

type Props = {
  draft: SellerProductDraft;
  onPublish: (publish: boolean) => Promise<void> | void;
  onBack?: () => void;
  onJump: (stepId: SellerWizardStepId) => void;
};

const STATUS_LABEL: Record<string, string> = {
  empty: "خالی",
  draft: "پیش‌نویس",
  saved: "ذخیره شده",
  skipped: "رد شده",
};

export function PreviewStep({ draft, onPublish, onBack, onJump }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [focus, setFocus] = useState<Exclude<SellerWizardStepId, "preview">>(
    "basics",
  );
  const primary = draft.gallery.find((g) => g.isPrimary) ?? draft.gallery[0];
  const checklist = getWizardCompleteness(draft);
  const untouched = checklist.filter(
    (c) => c.status === "empty" && !c.filled,
  );

  async function handlePublish(publish: boolean) {
    if (publish && !draft.basics.title.trim()) {
      setError("برای انتشار حداقل عنوان محصول را وارد کنید");
      onJump("basics");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await onPublish(publish);
    } catch (err) {
      setError(err instanceof Error ? err.message : "انتشار ناموفق بود");
    } finally {
      setSaving(false);
    }
  }

  return (
    <WizardStepChrome
      title="مرور همه بخش‌های صفحه جزییات محصول"
      hint="هر بخش صفحه جزییات محصول را ببینید؛ پر، ردشده یا خالی — سپس منتشر کنید."
      pdpComponent="چک‌لیست کامل"
      aside={<PdpComponentPreview draft={draft} stepId={focus} />}
      footer={
        <WizardNavButtons
          onBack={onBack}
          onSaveContinue={() => void handlePublish(true)}
          saving={saving}
          continueLabel="انتشار محصول"
          disableContinue={draft.isLocalOnly}
        />
      }
    >
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      ) : null}

      {draft.isLocalOnly ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          محصول هنوز فقط محلی است. مرحله «عنوان و مسیر» را ذخیره کنید تا روی سرور ساخته شود.
        </p>
      ) : null}

      {untouched.length > 0 ? (
        <p className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-900">
          {untouched.length} بخش هنوز نه ذخیره شده و نه رد شده — از نوار مراحل یا دکمه‌های زیر
          بروید تا هیچ بخشی از صفحه جزییات محصول جا نماند.
        </p>
      ) : null}

      <ul className="space-y-2">
        {checklist.map((item) => {
          const meta = SELLER_WIZARD_STEPS.find((s) => s.id === item.stepId);
          const active = focus === item.stepId;
          return (
            <li
              key={item.id}
              className={[
                "rounded-lg border px-3 py-2",
                active
                  ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)]"
                  : "border-[var(--color-neutral-100)]",
              ].join(" ")}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  className="text-start"
                  onClick={() =>
                    setFocus(item.stepId as Exclude<SellerWizardStepId, "preview">)
                  }
                >
                  <p className="text-xs font-medium text-[var(--color-neutral-900)]">
                    {item.label}
                  </p>
                  <p className="text-[10px] text-[var(--color-secondary-500)]">
                    {meta?.pdpComponent}
                  </p>
                  <p className="text-[10px] text-[var(--color-muted)]">
                    {STATUS_LABEL[item.status] ?? item.status}
                    {item.filled ? " · داده دارد" : " · بدون داده"}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => onJump(item.stepId)}
                  className="rounded-lg border border-[var(--color-neutral-200)] px-2 py-1 text-[11px] text-[var(--color-primary)]"
                >
                  ویرایش / رد
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="grid gap-4 rounded-xl border border-[var(--color-neutral-100)] bg-[var(--color-neutral-50)] p-4 sm:grid-cols-[140px_1fr]">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-white">
          {primary ? (
            <Image
              src={primary.thumbUrl || primary.url}
              alt={draft.basics.title}
              fill
              className="object-contain p-2"
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-[var(--color-muted)]">
              بدون تصویر
            </div>
          )}
        </div>
        <div className="space-y-2">
          <p className="text-xs text-[var(--color-primary)]">{draft.basics.brandName}</p>
          <h3 className="text-base font-bold text-[var(--color-neutral-900)]">
            {draft.basics.title || "بدون عنوان"}
          </h3>
          <p className="text-lg font-black">
            {draft.pricing.price ? formatPrice(draft.pricing.price) : "قیمت تعیین نشده"}
          </p>
          {!draft.isLocalOnly ? (
            <Link
              href={`/product/${encodeURIComponent(draft.basics.slug)}`}
              className="inline-block text-xs font-medium text-[var(--color-primary)]"
              target="_blank"
            >
              مشاهده صفحه جزییات محصول ↗
            </Link>
          ) : null}
        </div>
      </div>

      <button
        type="button"
        disabled={saving || draft.isLocalOnly}
        onClick={() => void handlePublish(false)}
        className="rounded-lg border border-[var(--color-neutral-200)] px-4 py-2 text-sm text-[var(--color-neutral-700)] disabled:opacity-50"
      >
        ذخیره به‌عنوان پیش‌نویس (بدون انتشار)
      </button>
    </WizardStepChrome>
  );
}
