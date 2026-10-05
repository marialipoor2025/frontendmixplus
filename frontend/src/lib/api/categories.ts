import { siteConfig } from "@/config/site";
import type { AdminCategory } from "@/types/admin";

type ApiCategory = {
  id: string;
  title: string;
  slug: string;
  href: string;
  imageUrl?: string | null;
  parentId?: string | null;
  parentTitle?: string | null;
  sortOrder: number;
  isActive: boolean;
  productCount?: number;
};

function apiBase() {
  return siteConfig.apiBaseUrl.replace(/\/$/, "");
}

function mapCategory(row: ApiCategory): AdminCategory {
  return {
    id: row.id,
    name: row.title,
    slug: row.slug,
    href: row.href,
    imageUrl: row.imageUrl ?? undefined,
    parentId: row.parentId ?? null,
    parent: row.parentTitle?.trim() || "—",
    sortOrder: row.sortOrder,
    isActive: row.isActive,
    productCount: row.productCount ?? 0,
  };
}

export async function listAdminCategories(): Promise<AdminCategory[] | null> {
  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) {
    const { mockAdminCategories } = await import("@/lib/mocks/admin");
    return mockAdminCategories;
  }
  try {
    const response = await fetch(`${apiBase()}/api/admin/catalog/categories`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return null;
    const rows = (await response.json()) as ApiCategory[];
    return rows.map(mapCategory);
  } catch {
    return null;
  }
}

export async function upsertAdminCategory(
  category: AdminCategory,
): Promise<AdminCategory | null> {
  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) return null;

  const body = {
    id: category.id || null,
    title: category.name,
    slug: category.slug,
    href: category.href,
    imageUrl: category.imageUrl ?? null,
    parentId: category.parentId ?? null,
    sortOrder: category.sortOrder,
    isActive: category.isActive,
  };

  try {
    const isUpdate = Boolean(category.id) && !category.id.startsWith("c-");
    const response = await fetch(
      isUpdate
        ? `${apiBase()}/api/admin/catalog/categories/${encodeURIComponent(category.id)}`
        : `${apiBase()}/api/admin/catalog/categories`,
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
    return mapCategory((await response.json()) as ApiCategory);
  } catch {
    return null;
  }
}

export async function deleteAdminCategory(id: string): Promise<boolean> {
  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) return false;
  try {
    const response = await fetch(
      `${apiBase()}/api/admin/catalog/categories/${encodeURIComponent(id)}`,
      { method: "DELETE" },
    );
    return response.ok;
  } catch {
    return false;
  }
}
