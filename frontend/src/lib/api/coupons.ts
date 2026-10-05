import { siteConfig } from "@/config/site";
import type { AdminCoupon } from "@/types/admin";

type ApiCoupon = {
  id: string;
  code: string;
  discount: string;
  usage: number;
  limit: number;
  status: string;
};

function apiBase() {
  return siteConfig.apiBaseUrl.replace(/\/$/, "");
}

function mapCoupon(row: ApiCoupon): AdminCoupon {
  return {
    id: row.id,
    code: row.code,
    discount: row.discount,
    usage: row.usage,
    limit: row.limit,
    status: row.status === "expired" ? "expired" : "active",
  };
}

export async function listAdminCoupons(): Promise<AdminCoupon[] | null> {
  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) {
    const { mockAdminCoupons } = await import("@/lib/mocks/admin");
    return mockAdminCoupons;
  }
  try {
    const response = await fetch(`${apiBase()}/api/admin/promotions/coupons`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return null;
    return ((await response.json()) as ApiCoupon[]).map(mapCoupon);
  } catch {
    return null;
  }
}

export async function upsertAdminCoupon(
  coupon: AdminCoupon,
): Promise<AdminCoupon | null> {
  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) return null;
  const isUpdate = Boolean(coupon.id) && !coupon.id.startsWith("cp-local");
  const body = {
    id: coupon.id || null,
    code: coupon.code,
    discount: coupon.discount,
    limit: coupon.limit,
    status: coupon.status,
  };
  try {
    const response = await fetch(
      isUpdate
        ? `${apiBase()}/api/admin/promotions/coupons/${encodeURIComponent(coupon.id)}`
        : `${apiBase()}/api/admin/promotions/coupons`,
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
    return mapCoupon((await response.json()) as ApiCoupon);
  } catch {
    return null;
  }
}

export async function deleteAdminCoupon(id: string): Promise<boolean> {
  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) return false;
  try {
    const response = await fetch(
      `${apiBase()}/api/admin/promotions/coupons/${encodeURIComponent(id)}`,
      { method: "DELETE" },
    );
    return response.ok;
  } catch {
    return false;
  }
}
