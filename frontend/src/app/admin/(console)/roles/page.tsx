"use client";

import {
  AdminCard,
  AdminPageHeader,
  StatusPill,
} from "@/components/admin/AdminUi";
import { RequireAdmin } from "@/components/admin/RequireAdmin";
import { ROLE_LABELS, permissionsForRole } from "@/lib/admin/permissions";
import type { AdminRole } from "@/types/admin";

const ROLES: AdminRole[] = [
  "super_admin",
  "catalog_manager",
  "ops_manager",
  "support",
];

export default function AdminRolesPage() {
  return (
    <RequireAdmin permission="roles:manage">
      <AdminPageHeader
        title="نقش‌ها و دسترسی‌ها"
        description="کنترل سطح دسترسی مدیران (RBAC) — فعلاً روی فرانت تعریف شده است"
      />
      <div className="grid gap-3 lg:grid-cols-2">
        {ROLES.map((role) => {
          const perms = permissionsForRole(role);
          return (
            <AdminCard key={role}>
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-sm font-bold text-[var(--color-neutral-900)]">
                  {ROLE_LABELS[role]}
                </h2>
                <StatusPill tone="info">{perms.length} مجوز</StatusPill>
              </div>
              <ul className="flex flex-wrap gap-1.5">
                {perms.map((p) => (
                  <li key={p}>
                    <span className="inline-flex rounded-md bg-[var(--color-neutral-50)] px-2 py-1 text-[11px] text-[var(--color-neutral-700)]" dir="ltr">
                      {p}
                    </span>
                  </li>
                ))}
              </ul>
            </AdminCard>
          );
        })}
      </div>
    </RequireAdmin>
  );
}
