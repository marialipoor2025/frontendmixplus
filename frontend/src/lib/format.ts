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
