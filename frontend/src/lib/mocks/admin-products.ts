import { mockHomePageData } from "@/lib/mocks/home";
import type {
  AdminBrandOption,
  AdminProduct,
  AdminSellerOption,
} from "@/types/admin-product";

function uniqueById<T extends { id: string }>(items: T[]): T[] {
  const map = new Map<string, T>();
  for (const item of items) map.set(item.id, item);
  return [...map.values()];
}

const fromHome = uniqueById([
  ...mockHomePageData.amazingOffers,
  ...mockHomePageData.productRails.flatMap((r) => r.products),
]);

export const mockAdminCatalogProducts: AdminProduct[] = fromHome.map((p, index) => ({
  ...p,
  isPublished: index % 5 !== 4,
}));

export const mockAdminBrandOptions: AdminBrandOption[] = uniqueById(
  mockAdminCatalogProducts.map((p) => ({
    id: p.brandId,
    name: p.brandName,
    slug: p.brandId,
    logoUrl: p.brandLogoUrl ?? "",
  })),
);

export const mockAdminSellerOptions: AdminSellerOption[] = uniqueById(
  mockAdminCatalogProducts.map((p) => ({
    id: p.sellerId,
    name: p.sellerName,
    slug: p.sellerId,
  })),
);
