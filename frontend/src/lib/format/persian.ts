const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

export function toLatinDigits(value: string): string {
  return value.replace(/[۰-۹]/g, (d) => String(FA_DIGITS.indexOf(d)));
}

export function toFaDigits(value: string): string {
  return toLatinDigits(value).replace(/\d/g, (d) => FA_DIGITS[Number(d)] ?? d);
}

/** Format a measure/value string with Persian digits (keeps trailing unit text). */
export function formatFaMeasure(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const match = trimmed.match(/^(\d+(?:[.,]\d+)?)(.*)$/);
  if (!match) return toFaDigits(trimmed);
  const num = Number(match[1]!.replace(",", "."));
  const rest = match[2] ?? "";
  if (!Number.isFinite(num)) return trimmed;
  return `${new Intl.NumberFormat("fa-IR").format(num)}${rest}`;
}

export function formatFaMoney(amount: number): string {
  if (!Number.isFinite(amount) || amount <= 0) return "";
  return new Intl.NumberFormat("fa-IR").format(Math.round(amount));
}
