import { siteConfig } from "@/config/site";
import type { AdminBrand } from "@/types/admin";

type ApiBrand = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  isActive: boolean;
  productCount: number;
};

function apiBase() {
  return siteConfig.apiBaseUrl.replace(/\/$/, "");
}

function mapBrand(row: ApiBrand): AdminBrand {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    logoUrl: row.logoUrl,
    productCount: row.productCount,
    status: row.isActive ? "active" : "hidden",
  };
}

export async function listAdminBrandsFull(): Promise<AdminBrand[] | null> {
  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) {
    const { mockAdminBrands } = await import("@/lib/mocks/admin");
    return mockAdminBrands;
  }
  try {
    const response = await fetch(`${apiBase()}/api/admin/catalog/brands`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return null;
    return ((await response.json()) as ApiBrand[]).map(mapBrand);
  } catch {
    return null;
  }
}

export async function upsertAdminBrand(
  brand: AdminBrand,
): Promise<AdminBrand | null> {
  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) return null;

  const body = {
    id: brand.id || null,
    name: brand.name,
    slug: brand.slug,
    logoUrl: brand.logoUrl ?? null,
    isActive: brand.status === "active",
  };

  try {
    const isUpdate = Boolean(brand.id) && !brand.id.startsWith("b-");
    const response = await fetch(
      isUpdate
        ? `${apiBase()}/api/admin/catalog/brands/${encodeURIComponent(brand.id)}`
        : `${apiBase()}/api/admin/catalog/brands`,
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
    return mapBrand((await response.json()) as ApiBrand);
  } catch {
    return null;
  }
}

export async function deleteAdminBrand(id: string): Promise<boolean> {
  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) return false;
  try {
    const response = await fetch(
      `${apiBase()}/api/admin/catalog/brands/${encodeURIComponent(id)}`,
      { method: "DELETE" },
    );
    return response.ok;
  } catch {
    return false;
  }
}
