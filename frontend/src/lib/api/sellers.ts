import { siteConfig } from "@/config/site";
import type { AdminSeller } from "@/types/admin";

type ApiSeller = {
  id: string;
  name: string;
  slug: string;
  status: string;
  rating: number;
  offers: number;
};

function apiBase() {
  return siteConfig.apiBaseUrl.replace(/\/$/, "");
}

function mapSeller(row: ApiSeller): AdminSeller {
  const status =
    row.status === "pending" || row.status === "suspended"
      ? row.status
      : "approved";
  return {
    id: row.id,
    name: row.name,
    status,
    offers: row.offers ?? 0,
    rating: row.rating ?? 0,
  };
}

export async function listAdminSellers(): Promise<AdminSeller[] | null> {
  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) {
    const { mockAdminSellers } = await import("@/lib/mocks/admin");
    return mockAdminSellers;
  }
  try {
    const response = await fetch(`${apiBase()}/api/admin/sellers`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return null;
    return ((await response.json()) as ApiSeller[]).map(mapSeller);
  } catch {
    return null;
  }
}

export async function upsertAdminSeller(
  seller: AdminSeller & { slug?: string },
): Promise<AdminSeller | null> {
  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) return null;

  const isUpdate = Boolean(seller.id) && !seller.id.startsWith("s-");
  const body = {
    id: seller.id || null,
    name: seller.name,
    slug: seller.slug ?? undefined,
    status: seller.status,
    rating: seller.rating,
  };

  try {
    const response = await fetch(
      isUpdate
        ? `${apiBase()}/api/admin/sellers/${encodeURIComponent(seller.id)}`
        : `${apiBase()}/api/admin/sellers`,
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
    return mapSeller((await response.json()) as ApiSeller);
  } catch {
    return null;
  }
}

export async function deleteAdminSeller(id: string): Promise<boolean> {
  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) return false;
  try {
    const response = await fetch(
      `${apiBase()}/api/admin/sellers/${encodeURIComponent(id)}`,
      { method: "DELETE" },
    );
    return response.ok;
  } catch {
    return false;
  }
}
