"use client";

import {
  formatFaMeasure,
  formatFaMoney,
  toLatinDigits,
} from "@/lib/format/persian";
import { wizardInputClass } from "./WizardStepChrome";

function parseMoneyInput(raw: string): number {
  const latin = toLatinDigits(raw)
    .replace(/[^\d]/g, "")
    .replace(/^0+(?=\d)/, "");
  if (!latin) return 0;
  return Number(latin);
}

type Props = {
  value: number;
  onChange: (amount: number) => void;
  placeholder?: string;
};

/** Money field: Persian digits + thousand separators while editing. */
export function MoneyInput({ value, onChange, placeholder = "۰" }: Props) {
  const display = value > 0 ? formatFaMoney(value) : "";

  return (
    <input
      className={wizardInputClass}
      dir="ltr"
      inputMode="numeric"
      value={display}
      placeholder={placeholder}
      onChange={(e) => onChange(parseMoneyInput(e.target.value))}
    />
  );
}

export { formatFaMeasure };
