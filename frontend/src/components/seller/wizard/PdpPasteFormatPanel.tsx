"use client";

import { useState } from "react";
import { splitResultToDraftPatch } from "@/lib/seller/apply-pdp-split";
import { splitPdpDescription } from "@/lib/seller/split-pdp-description";
import { toPlainText } from "@/lib/seller/to-plain-text";
import type { SellerProductDraft } from "@/types/seller-wizard";
import type { PdpSplitDraftPatch } from "@/lib/seller/apply-pdp-split";
import { WizardField, wizardInputClass } from "./WizardStepChrome";

type Props = {
  draft: SellerProductDraft;
  /** Apply formatted buckets to draft (local) so preview updates before save. */
  onApply: (patch: PdpSplitDraftPatch) => void;
  /** Seed textarea (e.g. current intro). */
  initialText?: string;
};

/**
 * Paste raw product copy → Format → split into PDP fields (features / intro /
 * expert review / specs / warranty) without inventing text.
 */
export function PdpPasteFormatPanel({ draft, onApply, initialText = "" }: Props) {
  const [raw, setRaw] = useState(initialText);
  const [message, setMessage] = useState<string | null>(null);
  const [summary, setSummary] = useState<PdpSplitDraftPatch["summary"] | null>(
    null,
  );

  function handleFormat() {
    const plain = toPlainText(raw);
    if (!plain.trim()) {
      setMessage("متنی برای فرمت کردن نیست.");
      setSummary(null);
      return;
    }
    setRaw(plain);
    const split = splitPdpDescription(plain, draft.basics.title);
    const patch = splitResultToDraftPatch(split, draft);
    onApply(patch);
    setSummary(patch.summary);
    const parts = [
      patch.summary.features ? `${patch.summary.features} ویژگی` : null,
      patch.summary.intro ? "معرفی" : null,
      patch.summary.expertReview ? "نقد تخصصی" : null,
      patch.summary.specs ? `${patch.summary.specs} مشخصه` : null,
      patch.summary.warranty ? "گارانتی" : null,
    ].filter(Boolean);
    setMessage(
      parts.length
        ? `فرمت شد و روی پیش‌نمایش اعمال شد: ${parts.join(" · ")} — هنوز ذخیره نشده.`
        : "فرمت انجام شد ولی بخش قابل نگاشتی پیدا نشد. تیترهایی مثل «معرفی محصول»، «مشخصات فنی» یا «گارانتی» را بررسی کنید.",
    );
  }

  return (
    <div className="space-y-2 rounded-lg border border-dashed border-[var(--color-neutral-300)] bg-[var(--color-neutral-50)] p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-bold text-[var(--color-neutral-800)]">
            چسباندن متن و فرمت خودکار
          </p>
          <p className="text-[11px] leading-relaxed text-[var(--color-muted)]">
            متن را بچسبانید و «فرمت» را بزنید: بولت‌ها، شماره‌گذاری و HTML حذف
            می‌شوند و محتوا با قالب صفحه محصول (کارت ویژگی، معرفی، نقد، جدول
            مشخصات، گارانتی) پر می‌شود — قبل از ذخیره در پیش‌نمایش می‌بینید.
          </p>
        </div>
        <button
          type="button"
          onClick={handleFormat}
          className="shrink-0 rounded-md bg-[var(--color-neutral-900)] px-3 py-1.5 text-xs font-semibold text-white"
        >
          فرمت
        </button>
      </div>

      <WizardField label="متن خام (HTML هم پاک می‌شود)">
        <textarea
          className={`${wizardInputClass} min-h-28 font-mono text-[11px]`}
          value={raw}
          onChange={(e) => {
            setRaw(e.target.value);
            setMessage(null);
          }}
          placeholder={`مثال:\nمعرفی محصول\n...\nقدرت مکش\n...\nمشخصات فنی\nبرند: Mixplus\nمدل: H100\nضمانت محصول\n24 ماه ضمانت رسمی`}
          dir="rtl"
        />
      </WizardField>

      {message ? (
        <p className="text-[11px] leading-relaxed text-[var(--color-neutral-700)]">
          {message}
        </p>
      ) : null}

      {summary ? (
        <ul className="flex flex-wrap gap-1.5 text-[10px]">
          <SummaryChip ok={summary.features > 0} label={`ویژگی ${summary.features}`} />
          <SummaryChip ok={summary.intro} label="معرفی" />
          <SummaryChip ok={summary.expertReview} label="نقد" />
          <SummaryChip ok={summary.specs > 0} label={`مشخصات ${summary.specs}`} />
          <SummaryChip ok={summary.warranty} label="گارانتی" />
        </ul>
      ) : null}
    </div>
  );
}

function SummaryChip({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li
      className={`rounded-full px-2 py-0.5 font-medium ${
        ok
          ? "bg-[rgb(0_160_73/0.12)] text-[var(--color-success)]"
          : "bg-[var(--color-neutral-200)] text-[var(--color-neutral-500)]"
      }`}
    >
      {ok ? "✓ " : "– "}
      {label}
    </li>
  );
}
