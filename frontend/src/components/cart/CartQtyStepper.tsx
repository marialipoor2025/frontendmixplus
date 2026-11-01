"use client";

import { useEffect, useState } from "react";

type CartQtyStepperProps = {
  quantity: number;
  max?: number;
  disabled?: boolean;
  onDecrease: () => void;
  onIncrease: () => void;
  /** When set, quantity is editable via typed number. */
  onSetQuantity?: (qty: number) => void;
  className?: string;
  size?: "sm" | "md";
};

/**
 * Inline − / qty / + control for cart lines and PDP after ATC.
 * Draft text while focused so users can erase and retype (1 → 2, not 12).
 */
export function CartQtyStepper({
  quantity,
  max = 99,
  disabled = false,
  onDecrease,
  onIncrease,
  onSetQuantity,
  className = "",
  size = "md",
}: CartQtyStepperProps) {
  const pad = size === "sm" ? "px-2 py-1 text-xs" : "px-2.5 py-1.5 text-sm";
  const minW = size === "sm" ? "min-w-7" : "min-w-9";
  const [draft, setDraft] = useState(String(quantity));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setDraft(String(quantity));
  }, [quantity, focused]);

  function commitDraft(raw: string) {
    const digits = raw.replace(/[^\d]/g, "");
    if (!digits) {
      setDraft(String(quantity));
      return;
    }
    const n = Number(digits);
    if (!Number.isFinite(n) || n < 1) {
      setDraft(String(quantity));
      return;
    }
    const next = Math.min(max, n);
    setDraft(String(next));
    if (next !== quantity) onSetQuantity?.(next);
  }

  return (
    <div
      className={`inline-flex items-center rounded-md border border-[var(--color-neutral-200)] bg-white ${className}`}
    >
      <button
        type="button"
        disabled={disabled || quantity <= 0}
        onClick={onDecrease}
        className={`${pad} font-medium text-[var(--color-neutral-800)] disabled:opacity-40`}
        aria-label={quantity <= 1 ? "حذف از سبد" : "کاهش تعداد"}
      >
        {quantity <= 1 ? "×" : "−"}
      </button>
      {onSetQuantity ? (
        <input
          type="text"
          inputMode="numeric"
          disabled={disabled}
          value={focused ? draft : String(quantity)}
          onFocus={(e) => {
            setFocused(true);
            setDraft(String(quantity));
            e.currentTarget.select();
          }}
          onBlur={() => {
            setFocused(false);
            commitDraft(draft);
          }}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^\d]/g, "");
            setDraft(raw);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.currentTarget.blur();
            }
          }}
          className={`${minW} border-x border-[var(--color-neutral-200)] bg-transparent text-center font-medium outline-none disabled:opacity-40 ${pad}`}
          aria-label="تعداد"
        />
      ) : (
        <span
          className={`${minW} border-x border-[var(--color-neutral-200)] text-center font-medium ${pad}`}
        >
          {new Intl.NumberFormat("fa-IR").format(quantity)}
        </span>
      )}
      <button
        type="button"
        disabled={disabled || quantity >= max}
        onClick={onIncrease}
        className={`${pad} font-medium text-[var(--color-neutral-800)] disabled:opacity-40`}
        aria-label="افزایش تعداد"
      >
        +
      </button>
    </div>
  );
}
