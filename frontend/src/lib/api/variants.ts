import { siteConfig } from "@/config/site";
import type { AdminVariant } from "@/types/admin";
import type {
  ProductSkuVariant,
  ProductVariantInfoData,
  ProductVariantOptionGroup,
} from "@/types/product-detail";
import { apiClient } from "./client";

type ApiVariantsDto = {
  optionGroups: {
    id: string;
    code: string;
    name: string;
    ui: "swatch" | "chip" | string;
    values: {
      id: string;
      label: string;
      swatchHex?: string | null;
      available: boolean;
    }[];
  }[];
  selectedOptionValueIds: Record<string, string>;
  skus: {
    id: string;
    sku: string;
    optionValueIds: string[];
    price: number;
    originalPrice?: number | null;
    discountPercent?: number | null;
    inStock: boolean;
    stock: number;
  }[];
};

type ApiAdminVariantDto = {
  id: string;
  productId: string;
  productTitle: string;
  sku: string;
  attributes: string;
  price: number;
  stock: number;
  inStock: boolean;
};

export async function getProductVariants(
  productKey: string,
): Promise<Pick<
  ProductVariantInfoData,
  "optionGroups" | "selectedOptionValueIds" | "skus"
> | null> {
  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) return null;

  try {
    const dto = await apiClient<ApiVariantsDto>(
      `/api/catalog/products/${encodeURIComponent(productKey)}/variants`,
    );
    return {
      optionGroups: dto.optionGroups.map(
        (g): ProductVariantOptionGroup => ({
          id: g.id,
          code: g.code,
          name: g.name,
          ui: g.ui === "swatch" ? "swatch" : "chip",
          values: g.values.map((v) => ({
            id: v.id,
            label: v.label,
            swatchHex: v.swatchHex ?? undefined,
            available: v.available,
          })),
        }),
      ),
      selectedOptionValueIds: dto.selectedOptionValueIds ?? {},
      skus: dto.skus.map(
        (s): ProductSkuVariant => ({
          id: s.id,
          sku: s.sku,
          optionValueIds: s.optionValueIds,
          price: s.price,
          originalPrice: s.originalPrice ?? undefined,
          discountPercent: s.discountPercent ?? undefined,
          inStock: s.inStock,
        }),
      ),
    };
  } catch {
    return null;
  }
}

export async function listAdminVariants(): Promise<AdminVariant[] | null> {
  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) return null;

  try {
    const rows = await apiClient<ApiAdminVariantDto[]>(
      "/api/admin/catalog/variants",
    );
    return rows.map((r) => ({
      id: r.id,
      productId: r.productId,
      productTitle: r.productTitle,
      sku: r.sku,
      attributes: r.attributes,
      options: [],
      price: r.price,
      stock: r.stock,
      inStock: r.inStock,
    }));
  } catch {
    return null;
  }
}
