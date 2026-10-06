"use client";

import type { SellerProductDraft, SellerWizardStepId } from "@/types/seller-wizard";
import { SELLER_WIZARD_STEPS } from "@/lib/seller/wizard-steps";

type Props = {
  current: SellerWizardStepId;
  draft: SellerProductDraft;
  onSelect: (id: SellerWizardStepId) => void;
};

const STATUS_DOT: Record<string, string> = {
  empty: "bg-[var(--color-neutral-300)]",
  draft: "bg-amber-400",
  saved: "bg-emerald-500",
  skipped: "bg-sky-400",
};

/** Horizontal PDP-section process bar. */
export function WizardStepper({ current, draft, onSelect }: Props) {
  const currentIndex = SELLER_WIZARD_STEPS.findIndex((s) => s.id === current);

  return (
    <nav
      aria-label="مراحل ساخت محصول"
      className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-3"
    >
      <ol className="flex items-stretch gap-0 overflow-x-auto">
        {SELLER_WIZARD_STEPS.map((step, index) => {
          const active = step.id === current;
          const done = draft.stepStatus[step.id] === "saved";
          const status = draft.stepStatus[step.id];
          const reached = index <= currentIndex || done;

          return (
            <li
              key={step.id}
              className="relative flex min-w-[7.5rem] flex-1 flex-col items-center"
            >
              {index < SELLER_WIZARD_STEPS.length - 1 ? (
                <span
                  aria-hidden
                  className={[
                    "absolute top-3.5 start-1/2 z-0 h-0.5 w-full",
                    reached ? "bg-[var(--color-primary)]/40" : "bg-[var(--color-neutral-200)]",
                  ].join(" ")}
                />
              ) : null}

              <button
                type="button"
                onClick={() => onSelect(step.id)}
                className={[
                  "relative z-10 flex w-full flex-col items-center gap-1.5 rounded-lg px-1 py-1 transition",
                  active ? "bg-[var(--color-primary-soft)]" : "hover:bg-[var(--color-neutral-50)]",
                ].join(" ")}
              >
                <span
                  className={[
                    "flex size-7 items-center justify-center rounded-full text-[11px] font-bold",
                    active
                      ? "bg-[var(--color-primary)] text-white"
                      : done
                        ? "bg-emerald-500 text-white"
                        : "bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)]",
                  ].join(" ")}
                >
                  {index + 1}
                </span>
                <span className="flex max-w-full items-center justify-center gap-1 px-0.5">
                  <span
                    className={[
                      "truncate text-[11px] font-medium sm:text-xs",
                      active
                        ? "text-[var(--color-primary)]"
                        : "text-[var(--color-neutral-700)]",
                    ].join(" ")}
                  >
                    {step.shortTitle}
                  </span>
                  <span
                    className={`size-1.5 shrink-0 rounded-full ${STATUS_DOT[status] ?? STATUS_DOT.empty}`}
                    title={status}
                  />
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
