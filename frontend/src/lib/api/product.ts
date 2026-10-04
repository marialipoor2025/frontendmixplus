import { siteConfig } from "@/config/site";
import { getMockProductDetail } from "@/lib/mocks/product-detail";
import type { ProductDetailPageData } from "@/types/product-detail";

/** Frontend-first PDP fetch — live Catalog API will replace mocks later. */
export async function getProductDetail(
  slug: string,
): Promise<ProductDetailPageData | null> {
  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) {
    return getMockProductDetail(slug);
  }

  // Until backend PDP exists, fall back to mock composition from home catalog.
  return getMockProductDetail(slug);
}
