"use client";

import { useEffect, useState } from "react";
import {
  AdminCard,
  AdminPageHeader,
  StatusPill,
} from "@/components/admin/AdminUi";
import { RequireAdmin } from "@/components/admin/RequireAdmin";
import { ROLE_LABELS, permissionsForRole } from "@/lib/admin/permissions";
import { listAdminRoles, type AdminRoleDto } from "@/lib/api/roles";
import { siteConfig } from "@/config/site";
import type { AdminRole } from "@/types/admin";

const FALLBACK_ROLES: AdminRole[] = [
  "super_admin",
  "catalog_manager",
  "ops_manager",
  "support",
];

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<AdminRoleDto[] | null>(null);
  const [source, setSource] = useState<"mock" | "api">("mock");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const live = await listAdminRoles();
      if (!cancelled && live) {
        setRoles(live);
        if (!siteConfig.useMocks && siteConfig.apiBaseUrl) {
          setSource("api");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const cards: AdminRoleDto[] =
    roles ??
    FALLBACK_ROLES.map((id) => ({
      id,
      label: ROLE_LABELS[id],
      permissions: permissionsForRole(id),
    }));

  return (
    <RequireAdmin permission="roles:manage">
      <AdminPageHeader
        title="نقش‌ها و دسترسی‌ها"
        description={
          source === "api"
            ? "تعاریف RBAC از Identity API"
            : "کنترل سطح دسترسی مدیران (RBAC) — فعلاً روی فرانت تعریف شده است"
        }
      />
      <div className="grid gap-3 lg:grid-cols-2">
        {cards.map((role) => (
          <AdminCard key={role.id}>
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-[var(--color-neutral-900)]">
                {role.label}
              </h2>
              <StatusPill tone="info">{role.permissions.length} مجوز</StatusPill>
            </div>
            <ul className="flex flex-wrap gap-1.5">
              {role.permissions.map((p) => (
                <li key={p}>
                  <span
                    className="inline-flex rounded-md bg-[var(--color-neutral-50)] px-2 py-1 text-[11px] text-[var(--color-neutral-700)]"
                    dir="ltr"
                  >
                    {p}
                  </span>
                </li>
              ))}
            </ul>
          </AdminCard>
        ))}
      </div>
    </RequireAdmin>
  );
}
