/** Local brand marks used on product cards when `brandLogoUrl` is omitted. */
const BRAND_LOGO_BY_ID: Record<string, string> = {
  "b-samsung": "/images/brands/samsung.webp",
  "b-xiaomi": "/images/brands/xiaomi.png",
  "b-xvision": "/images/brands/x-vision.webp",
  "b-huawei": "/images/brands/huawei.webp",
  /** MixPlus is a seller/brand on Oriya marketplace — not the marketplace mark. */
  "b-mixplus": "/brand/mixplus-logo.svg",
  "b-digi-mixplus": "/brand/mixplus-logo.svg",
};

export function resolveBrandLogoUrl(
  brandId: string,
  brandLogoUrl?: string,
): string | undefined {
  return brandLogoUrl?.trim() || BRAND_LOGO_BY_ID[brandId];
}
