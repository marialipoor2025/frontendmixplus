import { siteConfig } from "@/config/site";
import type { AdminPermission, AdminRole } from "@/types/admin";

export type AdminRoleDto = {
  id: AdminRole;
  label: string;
  permissions: AdminPermission[];
};

function apiBase() {
  return siteConfig.apiBaseUrl.replace(/\/$/, "");
}

export async function listAdminRoles(): Promise<AdminRoleDto[] | null> {
  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) return null;
  try {
    const response = await fetch(`${apiBase()}/api/admin/roles`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return null;
    return (await response.json()) as AdminRoleDto[];
  } catch {
    return null;
  }
}
