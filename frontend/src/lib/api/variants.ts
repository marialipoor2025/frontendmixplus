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

type UpsertSkuBody = {
  sku: string;
  optionValueIds: string[];
  price: number;
  originalPrice?: number | null;
  discountPercent?: number | null;
  stock: number;
};

export async function upsertAdminVariant(
  variant: AdminVariant,
): Promise<AdminVariant | null> {
  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) return null;
  if (!variant.productId.trim()) return null;

  const body: UpsertSkuBody = {
    sku: variant.sku,
    optionValueIds: [],
    price: variant.price,
    originalPrice: variant.originalPrice ?? null,
    discountPercent: null,
    stock: variant.stock,
  };

  try {
    const productKey = encodeURIComponent(variant.productId);
    const isUpdate =
      Boolean(variant.id) &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        variant.id,
      );

    const response = await fetch(
      isUpdate
        ? `${siteConfig.apiBaseUrl.replace(/\/$/, "")}/api/admin/catalog/products/${productKey}/skus/${encodeURIComponent(variant.id)}`
        : `${siteConfig.apiBaseUrl.replace(/\/$/, "")}/api/admin/catalog/products/${productKey}/skus`,
      {
        method: isUpdate ? "PUT" : "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );
    if (!response.ok) return null;

    const sku = (await response.json()) as {
      id: string;
      sku: string;
      price: number;
      originalPrice?: number | null;
      stock: number;
      inStock: boolean;
    };

    return {
      ...variant,
      id: sku.id,
      sku: sku.sku,
      price: sku.price,
      originalPrice: sku.originalPrice ?? undefined,
      stock: sku.stock,
      inStock: sku.inStock,
      attributes:
        variant.attributes ||
        variant.options
          .filter((o) => o.value)
          .map((o) => `${o.name}: ${o.value}`)
          .join(" · "),
    };
  } catch {
    return null;
  }
}

export async function deleteAdminVariant(
  productId: string,
  skuId: string,
): Promise<boolean> {
  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) return false;
  try {
    const response = await fetch(
      `${siteConfig.apiBaseUrl.replace(/\/$/, "")}/api/admin/catalog/products/${encodeURIComponent(productId)}/skus/${encodeURIComponent(skuId)}`,
      { method: "DELETE" },
    );
    return response.ok;
  } catch {
    return false;
  }
}
