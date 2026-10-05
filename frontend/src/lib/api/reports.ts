import { siteConfig } from "@/config/site";
import type { AdminReportRow } from "@/types/admin";

function apiBase() {
  return siteConfig.apiBaseUrl.replace(/\/$/, "");
}

export async function listAdminReports(): Promise<AdminReportRow[] | null> {
  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) {
    const { mockAdminReports } = await import("@/lib/mocks/admin");
    return mockAdminReports;
  }
  try {
    const response = await fetch(`${apiBase()}/api/admin/reports`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return null;
    return (await response.json()) as AdminReportRow[];
  } catch {
    return null;
  }
}
