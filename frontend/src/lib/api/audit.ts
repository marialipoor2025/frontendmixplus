import { siteConfig } from "@/config/site";
import type { AdminAuditLog } from "@/types/admin";

type ApiAudit = {
  id: string;
  actor: string;
  action: string;
  entity: string;
  at: string;
};

function apiBase() {
  return siteConfig.apiBaseUrl.replace(/\/$/, "");
}

function mapAudit(row: ApiAudit): AdminAuditLog {
  return {
    id: row.id,
    actor: row.actor,
    action: row.action,
    entity: row.entity,
    at: row.at,
  };
}

export async function listAdminAuditLogs(): Promise<AdminAuditLog[] | null> {
  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) {
    const { mockAdminAuditLogs } = await import("@/lib/mocks/admin");
    return mockAdminAuditLogs;
  }
  try {
    const response = await fetch(`${apiBase()}/api/admin/audit`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return null;
    return ((await response.json()) as ApiAudit[]).map(mapAudit);
  } catch {
    return null;
  }
}

export async function createAdminAuditLog(input: {
  actor: string;
  action: string;
  entity: string;
}): Promise<AdminAuditLog | null> {
  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) return null;
  try {
    const response = await fetch(`${apiBase()}/api/admin/audit`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });
    if (!response.ok) return null;
    return mapAudit((await response.json()) as ApiAudit);
  } catch {
    return null;
  }
}
