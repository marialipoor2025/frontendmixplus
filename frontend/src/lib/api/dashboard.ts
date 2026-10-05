import { siteConfig } from "@/config/site";
import type { AdminStat } from "@/types/admin";

type ApiStatsResponse = {
  stats: AdminStat[];
};

function apiBase() {
  return siteConfig.apiBaseUrl.replace(/\/$/, "");
}

export async function getAdminDashboardStats(): Promise<AdminStat[] | null> {
  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) {
    const { mockAdminStats } = await import("@/lib/mocks/admin");
    return mockAdminStats;
  }
  try {
    const response = await fetch(`${apiBase()}/api/admin/dashboard/stats`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as ApiStatsResponse;
    return payload.stats ?? null;
  } catch {
    return null;
  }
}
