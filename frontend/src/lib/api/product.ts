import { siteConfig } from "@/config/site";
import { getProductVariants } from "@/lib/api/variants";
import { getMockProductDetail } from "@/lib/mocks/product-detail";
import type { ProductDetailPageData } from "@/types/product-detail";

/** Frontend-first PDP fetch — merges live Catalog variants when available. */
export async function getProductDetail(
  slug: string,
): Promise<ProductDetailPageData | null> {
  const data = getMockProductDetail(slug);
  if (!data) return null;

  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) {
    return data;
  }

  const liveVariants = await getProductVariants(slug).catch(() => null);

  if (!liveVariants || liveVariants.optionGroups.length === 0) {
    return data;
  }

  return {
    ...data,
    variant: {
      ...data.variant,
      optionGroups: liveVariants.optionGroups,
      selectedOptionValueIds: liveVariants.selectedOptionValueIds,
      skus: liveVariants.skus,
    },
  };
}
