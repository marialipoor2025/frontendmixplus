/** Local brand marks used on product cards when `brandLogoUrl` is omitted. */
const BRAND_LOGO_BY_ID: Record<string, string> = {
  "b-samsung": "/images/brands/samsung.webp",
  "b-xiaomi": "/images/brands/xiaomi.png",
  "b-xvision": "/images/brands/x-vision.webp",
  "b-huawei": "/images/brands/huawei.webp",
};

export function resolveBrandLogoUrl(
  brandId: string,
  brandLogoUrl?: string,
): string | undefined {
  return brandLogoUrl ?? BRAND_LOGO_BY_ID[brandId];
}
