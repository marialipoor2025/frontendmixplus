"use client";

import type { ReactNode } from "react";

type Props = {
  title: string;
  hint: string;
  /** Kept for call-site compatibility; not shown in UI. */
  pdpComponent?: string;
  children: ReactNode;
  footer?: ReactNode;
  aside?: ReactNode;
};

/** Shared layout for each product-detail step: form + component preview. */
export function WizardStepChrome({
  title,
  hint,
  children,
  footer,
  aside,
}: Props) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-[var(--color-neutral-900)]">{title}</h2>
        <p className="mt-0.5 text-xs text-[var(--color-muted)]">{hint}</p>
      </div>

      <div
        className={
          aside
            ? "grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]"
            : "grid gap-4"
        }
      >
        <div className="space-y-4 rounded-xl border border-[var(--color-neutral-200)] bg-white p-4">
          {children}
        </div>
        {aside ? (
          <aside className="rounded-xl border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] p-3">
            <p className="mb-2 text-[10px] font-semibold text-[var(--color-neutral-700)]">
              پیش‌نمایش همین بخش در صفحه جزییات محصول
            </p>
            {aside}
          </aside>
        ) : null}
      </div>

      {footer ? (
        <div className="border-t border-[var(--color-neutral-200)] pt-3">{footer}</div>
      ) : null}
    </div>
  );
}

export function WizardField({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-[var(--color-neutral-700)]">{label}</span>
      {children}
      {hint ? <span className="block text-[10px] text-[var(--color-muted)]">{hint}</span> : null}
    </label>
  );
}

export const wizardInputClass =
  "w-full rounded-lg border border-[var(--color-neutral-200)] bg-white px-3 py-2 text-sm text-[var(--color-neutral-900)] outline-none focus:border-[var(--color-primary)]";

export function WizardNavButtons({
  onBack,
  onSaveContinue,
  onSkip,
  saving,
  continueLabel = "ذخیره و ادامه",
  skipLabel = "رد کردن این بخش",
  disableContinue,
}: {
  onBack?: () => void;
  onSaveContinue: () => void;
  onSkip?: () => void;
  saving?: boolean;
  continueLabel?: string;
  skipLabel?: string;
  disableContinue?: boolean;
}) {
  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-2">
      <div>
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="rounded-lg border border-[var(--color-neutral-200)] px-3 py-2 text-xs text-[var(--color-neutral-700)]"
          >
            مرحله قبل
          </button>
        ) : (
          <span />
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {onSkip ? (
          <button
            type="button"
            disabled={saving}
            onClick={onSkip}
            className="rounded-lg border border-amber-400 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-900 transition hover:bg-amber-100 disabled:opacity-50"
          >
            {skipLabel}
          </button>
        ) : null}
        <button
          type="button"
          disabled={saving || disableContinue}
          onClick={onSaveContinue}
          className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? "در حال ذخیره…" : continueLabel}
        </button>
      </div>
    </div>
  );
}
