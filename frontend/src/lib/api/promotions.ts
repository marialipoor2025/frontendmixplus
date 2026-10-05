import { siteConfig } from "@/config/site";
import type { AdminPromotion } from "@/types/admin";

type ApiPromotion = {
  id: string;
  title: string;
  type: string;
  status: string;
  endsAt: string;
  isActive: boolean;
  startsAtUtc?: string | null;
  endsAtUtc?: string | null;
  productKeys?: string[];
};

function apiBase() {
  return siteConfig.apiBaseUrl.replace(/\/$/, "");
}

function mapPromotion(row: ApiPromotion): AdminPromotion {
  const status =
    row.status === "scheduled" || row.status === "ended"
      ? row.status
      : "active";
  return {
    id: row.id,
    title: row.title,
    type: row.type === "percent" || row.type === "fixed" ? row.type : "campaign",
    status,
    endsAt: row.endsAt || "—",
  };
}

export async function listAdminPromotions(): Promise<AdminPromotion[] | null> {
  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) {
    const { mockAdminPromotions } = await import("@/lib/mocks/admin");
    return mockAdminPromotions;
  }
  try {
    const response = await fetch(`${apiBase()}/api/admin/promotions`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return null;
    return ((await response.json()) as ApiPromotion[]).map(mapPromotion);
  } catch {
    return null;
  }
}

export async function upsertAdminPromotion(
  promo: AdminPromotion,
): Promise<AdminPromotion | null> {
  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) return null;

  const isUpdate = Boolean(promo.id) && !promo.id.startsWith("pr-local");
  const body = {
    id: promo.id || null,
    title: promo.title,
    isActive: promo.status !== "ended",
    startsAtUtc:
      promo.status === "scheduled"
        ? new Date(Date.now() + 86400000).toISOString()
        : new Date().toISOString(),
    endsAtUtc: null as string | null,
    productKeys: [] as string[],
  };

  try {
    const response = await fetch(
      isUpdate
        ? `${apiBase()}/api/admin/promotions/${encodeURIComponent(promo.id)}`
        : `${apiBase()}/api/admin/promotions`,
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
    return mapPromotion((await response.json()) as ApiPromotion);
  } catch {
    return null;
  }
}

export async function deleteAdminPromotion(id: string): Promise<boolean> {
  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) return false;
  try {
    const response = await fetch(
      `${apiBase()}/api/admin/promotions/${encodeURIComponent(id)}`,
      { method: "DELETE" },
    );
    return response.ok;
  } catch {
    return false;
  }
}
