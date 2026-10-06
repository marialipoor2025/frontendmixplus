import { apiClient } from "@/lib/api/client";
import { permissionsForRole } from "@/lib/admin/permissions";
import type { AdminRole, AdminUser } from "@/types/admin";

type StaffMeDto = {
  id: string;
  email: string;
  displayName: string;
  phone?: string;
  role: string;
};

function asAdminRole(role: string): AdminRole {
  if (
    role === "catalog_manager" ||
    role === "ops_manager" ||
    role === "support" ||
    role === "super_admin"
  ) {
    return role;
  }
  return "super_admin";
}

/** After OTP verify — confirm phone is listed as admin staff. */
export async function getAdminStaffMe(
  accessToken: string,
): Promise<AdminUser> {
  const row = await apiClient<StaffMeDto>("/api/admin/staff/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const role = asAdminRole(row.role);
  return {
    id: row.id,
    email: row.email,
    displayName: row.displayName,
    role,
    permissions: permissionsForRole(role),
  };
}
