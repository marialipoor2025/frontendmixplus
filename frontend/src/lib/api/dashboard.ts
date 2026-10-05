import { siteConfig } from "@/config/site";
import type { AdminOrder, AdminStat } from "@/types/admin";

type ApiStatsResponse = {
  stats: AdminStat[];
  recentOrders?: AdminOrder[];
};

function apiBase() {
  return siteConfig.apiBaseUrl.replace(/\/$/, "");
}

export async function getAdminDashboardStats(): Promise<{
  stats: AdminStat[];
  recentOrders: AdminOrder[];
} | null> {
  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) {
    const { mockAdminStats, mockAdminOrders } = await import("@/lib/mocks/admin");
    return { stats: mockAdminStats, recentOrders: mockAdminOrders };
  }
  try {
    const response = await fetch(`${apiBase()}/api/admin/dashboard/stats`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as ApiStatsResponse;
    return {
      stats: payload.stats ?? [],
      recentOrders: (payload.recentOrders ?? []).map((o) => ({
        ...o,
        status:
          o.status === "processing" ||
          o.status === "shipped" ||
          o.status === "delivered" ||
          o.status === "cancelled"
            ? o.status
            : "new",
      })),
    };
  } catch {
    return null;
  }
}
