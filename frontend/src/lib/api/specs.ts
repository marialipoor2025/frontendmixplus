import { siteConfig } from "@/config/site";
import type { AdminProductSpecs, AdminSpec } from "@/types/admin";
import type { ProductSpecGroup } from "@/types/product-detail";

type ApiSpecGroup = {
  id: string;
  title: string;
  previewCount?: number | null;
  attributes: {
    id: string;
    label: string;
    values: string[];
  }[];
};

type ApiProductSpecs = {
  groups: ApiSpecGroup[];
};

function apiBase() {
  return siteConfig.apiBaseUrl.replace(/\/$/, "");
}

function mapGroup(g: ApiSpecGroup): ProductSpecGroup {
  return {
    id: g.id,
    title: g.title,
    previewCount: g.previewCount ?? undefined,
    attributes: g.attributes.map((a) => ({
      id: a.id,
      label: a.label,
      values: a.values,
    })),
  };
}

/** Storefront PDP specs from Catalog. */
export async function getProductSpecs(
  productKey: string,
): Promise<ProductSpecGroup[] | null> {
  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) return null;
  try {
    const response = await fetch(
      `${apiBase()}/api/catalog/products/${encodeURIComponent(productKey)}/specs`,
      { cache: "no-store", headers: { Accept: "application/json" } },
    );
    if (!response.ok) return null;
    const payload = (await response.json()) as ApiProductSpecs;
    if (!payload.groups?.length) return null;
    return payload.groups.map(mapGroup);
  } catch {
    return null;
  }
}

/** Admin: list reusable attribute definitions (optional live API). */
export async function listAdminSpecDefinitions(): Promise<AdminSpec[] | null> {
  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) return null;
  try {
    const response = await fetch(`${apiBase()}/api/admin/catalog/spec-definitions`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return null;
    return (await response.json()) as AdminSpec[];
  } catch {
    return null;
  }
}

/** Admin: replace product specs groups. */
export async function replaceProductSpecs(
  doc: AdminProductSpecs,
): Promise<boolean> {
  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) return false;
  try {
    const response = await fetch(
      `${apiBase()}/api/admin/catalog/products/${encodeURIComponent(doc.productKey)}/specs`,
      {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          groups: doc.groups.map((g) => ({
            id: g.id,
            title: g.title,
            previewCount: g.previewCount ?? null,
            attributes: g.attributes.map((a) => ({
              id: a.id,
              label: a.label,
              values: a.values,
            })),
          })),
        }),
      },
    );
    return response.ok;
  } catch {
    return false;
  }
}
