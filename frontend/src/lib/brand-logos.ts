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

/** Slug → local showcase logo (supports mixed extensions). */
const BRAND_LOGO_BY_SLUG: Record<string, string> = {
  beko: "/images/brands/beko.svg",
  delonghi: "/images/brands/delonghi.png",
  elica: "/images/brands/elica.svg",
  faber: "/images/brands/faber.avif",
  gorenje: "/images/brands/gorenje.webp",
  hisense: "/images/brands/hisense.png",
  lg: "/images/brands/lg.jpg",
  midea: "/images/brands/midea.webp",
  neff: "/images/brands/neff.webp",
  ninja: "/images/brands/ninja.png",
  panasonic: "/images/brands/panasonic.svg",
  sharp: "/images/brands/sharp.svg",
  siemens: "/images/brands/siemens.png",
  smeg: "/images/brands/smeg.png",
  teka: "/images/brands/teka.svg",
  toshiba: "/images/brands/toshiba.webp",
  samsung: "/images/brands/samsung-wordmark.webp",
  huawei: "/images/brands/huawei-mark.webp",
  alton: "/images/brands/alton.webp",
  bimax: "/images/brands/bimax.svg",
  datees: "/images/brands/datees.webp",
  derakhshan: "/images/brands/derakhshan.png",
  dorsa: "/images/brands/dorsa.png",
  "ilia-steel": "/images/brands/ilia-steel.webp",
  can: "/images/brands/can.png",
  "steel-alborz": "/images/brands/steel-alborz.png",
  pakshoma: "/images/brands/pakshoma.svg",
  snowa: "/images/brands/snowa.png",
  technogaz: "/images/brands/technogaz.png",
  tecnogas: "/images/brands/tecnogas.png",
};

export function resolveBrandLogoUrl(
  brandId: string,
  brandLogoUrl?: string,
  brandSlug?: string,
): string | undefined {
  if (brandLogoUrl?.trim()) return brandLogoUrl.trim();
  if (brandSlug && BRAND_LOGO_BY_SLUG[brandSlug.toLowerCase()]) {
    return BRAND_LOGO_BY_SLUG[brandSlug.toLowerCase()];
  }
  return BRAND_LOGO_BY_ID[brandId];
}
