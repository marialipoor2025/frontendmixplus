import { siteConfig } from "@/config/site";
import { getProductMedia } from "@/lib/api/product-media";
import { getProductSpecs } from "@/lib/api/specs";
import { getProductVariants } from "@/lib/api/variants";
import { getMockProductDetail } from "@/lib/mocks/product-detail";
import type { ProductDetailPageData } from "@/types/product-detail";

/** Frontend-first PDP fetch — merges live Catalog variants, media, specs when available. */
export async function getProductDetail(
  slug: string,
): Promise<ProductDetailPageData | null> {
  const data = getMockProductDetail(slug);
  if (!data) return null;

  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) {
    return data;
  }

  const [liveVariants, liveMedia, liveSpecs] = await Promise.all([
    getProductVariants(slug).catch(() => null),
    getProductMedia(slug).catch(() => null),
    getProductSpecs(slug).catch(() => null),
  ]);

  let next = data;

  if (liveVariants && liveVariants.optionGroups.length > 0) {
    next = {
      ...next,
      variant: {
        ...next.variant,
        optionGroups: liveVariants.optionGroups,
        selectedOptionValueIds: liveVariants.selectedOptionValueIds,
        skus: liveVariants.skus,
      },
    };
  }

  if (liveMedia && liveMedia.length > 0) {
    next = {
      ...next,
      gallery: {
        ...next.gallery,
        images: liveMedia.map((m) => ({
          id: m.id,
          url: m.url,
          alt: m.alt || next.title,
        })),
      },
    };
  }

  if (liveSpecs && liveSpecs.length > 0) {
    next = {
      ...next,
      content: {
        ...next.content,
        specs: liveSpecs,
      },
    };
  }

  return next;
}
