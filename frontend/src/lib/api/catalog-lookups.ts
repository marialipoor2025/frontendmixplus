import { apiClient } from "@/lib/api/client";
import { siteConfig } from "@/config/site";

export type CatalogBrandOption = {
  id: string;
  name: string;
  slug: string;
};

export type CatalogCategoryOption = {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
};

type ApiBrand = {
  id: string;
  name: string;
  slug: string;
};

type ApiCategory = {
  id: string;
  title: string;
  slug: string;
  parentId?: string | null;
};

function enabled() {
  return !siteConfig.useMocks && Boolean(siteConfig.apiBaseUrl);
}

/** Active brands from catalog for seller wizard selects. */
export async function listCatalogBrandOptions(): Promise<CatalogBrandOption[]> {
  if (!enabled()) return [];
  try {
    const rows = await apiClient<ApiBrand[]>("/api/catalog/brands");
    return (rows ?? [])
      .map((r) => ({
        id: (r.id || "").trim(),
        name: r.name?.trim() || "",
        slug: r.slug?.trim() || "",
      }))
      .filter((r) => r.id && r.name)
      .sort((a, b) => a.name.localeCompare(b.name, "fa"));
  } catch {
    return [];
  }
}

/** Active categories from catalog for seller wizard selects. */
export async function listCatalogCategoryOptions(): Promise<
  CatalogCategoryOption[]
> {
  if (!enabled()) return [];
  try {
    const rows = await apiClient<ApiCategory[]>("/api/catalog/categories");
    return (rows ?? [])
      .map((r) => ({
        id: (r.id || "").trim(),
        name: (r.title || "").trim(),
        slug: r.slug?.trim() || "",
        parentId: r.parentId ?? null,
      }))
      .filter((r) => r.id && r.name)
      .sort((a, b) => a.name.localeCompare(b.name, "fa"));
  } catch {
    return [];
  }
}
