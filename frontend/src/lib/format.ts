/** Format amount with Persian digits and thousand separators. */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("fa-IR").format(amount);
}

/** Format discount percent for Digikala-style badge (e.g. ۳٪). */
export function formatDiscountPercent(percent: number): string {
  return `${new Intl.NumberFormat("fa-IR").format(percent)}٪`;
}

/** Format review count with Persian digits (e.g. ۲۱۴ دیدگاه). */
export function formatReviewCount(count: number): string {
  return `${new Intl.NumberFormat("fa-IR").format(count)} دیدگاه`;
}

/** Persian digits only (e.g. ۱۲۳۴). */
export function formatFaNumber(value: number): string {
  return new Intl.NumberFormat("fa-IR").format(value);
}

const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

/** Replace Latin digits in any string with Persian digits (e.g. ۱۴ کالا). */
export function toFaDigits(value: string): string {
  return value.replace(/\d/g, (d) => FA_DIGITS[Number(d)] ?? d);
}

/** e.g. ۲ محصول — never English «2 product». */
export function formatProductCount(count: number): string {
  return `${formatFaNumber(count)} محصول`;
}

/** e.g. ۳ فروشنده — never English «3 seller». */
export function formatSellerCount(count: number): string {
  return `${formatFaNumber(count)} فروشنده`;
}
