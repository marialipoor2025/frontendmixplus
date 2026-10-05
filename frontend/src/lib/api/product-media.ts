import { siteConfig } from "@/config/site";

export type ProductMediaApiItem = {
  id: string;
  url: string;
  thumbUrl: string;
  alt: string;
  isPrimary: boolean;
};

type ProductGalleryApi = {
  images: ProductMediaApiItem[];
};

function apiBase() {
  return siteConfig.apiBaseUrl.replace(/\/$/, "");
}

function absolutize(url: string): string {
  if (!url) return url;
  if (url.startsWith("http") || url.startsWith("/placeholders") || url.startsWith("blob:")) {
    return url;
  }
  return `${apiBase()}${url.startsWith("/") ? "" : "/"}${url}`;
}

/** Storefront product gallery from Catalog (media asset links). */
export async function getProductMedia(
  productKey: string,
): Promise<ProductMediaApiItem[] | null> {
  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) return null;

  try {
    const response = await fetch(
      `${apiBase()}/api/catalog/products/${encodeURIComponent(productKey)}/media`,
      { cache: "no-store", headers: { Accept: "application/json" } },
    );
    if (!response.ok) return null;
    const payload = (await response.json()) as ProductGalleryApi;
    return (payload.images ?? []).map((img) => ({
      ...img,
      url: absolutize(img.url),
      thumbUrl: absolutize(img.thumbUrl),
    }));
  } catch {
    return null;
  }
}
