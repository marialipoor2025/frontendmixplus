"use client";

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
          type="number"
          inputMode="numeric"
          min={1}
          max={max}
          disabled={disabled}
          value={quantity}
          onChange={(e) => {
            const n = Number(e.target.value.replace(/[^\d]/g, ""));
            if (!Number.isFinite(n) || n < 1) return;
            onSetQuantity(Math.min(max, n));
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
