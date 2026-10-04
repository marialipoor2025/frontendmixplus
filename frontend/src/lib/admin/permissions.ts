import type { AdminPermission, AdminRole } from "@/types/admin";

const ALL: AdminPermission[] = [
  "dashboard:view",
  "products:manage",
  "variants:manage",
  "specs:manage",
  "categories:manage",
  "brands:manage",
  "media:manage",
  "inventory:manage",
  "sellers:manage",
  "offers:manage",
  "orders:manage",
  "customers:manage",
  "promotions:manage",
  "coupons:manage",
  "cms:manage",
  "reviews:moderate",
  "reports:view",
  "audit:view",
  "roles:manage",
];

const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  super_admin: ALL,
  catalog_manager: [
    "dashboard:view",
    "products:manage",
    "variants:manage",
    "specs:manage",
    "categories:manage",
    "brands:manage",
    "media:manage",
    "inventory:manage",
    "promotions:manage",
    "coupons:manage",
    "cms:manage",
  ],
  ops_manager: [
    "dashboard:view",
    "inventory:manage",
    "sellers:manage",
    "offers:manage",
    "orders:manage",
    "promotions:manage",
    "coupons:manage",
    "reports:view",
    "audit:view",
  ],
  support: [
    "dashboard:view",
    "orders:manage",
    "customers:manage",
    "reviews:moderate",
    "reports:view",
  ],
};

export function permissionsForRole(role: AdminRole): AdminPermission[] {
  return ROLE_PERMISSIONS[role];
}

export function hasPermission(
  granted: AdminPermission[] | undefined,
  needed: AdminPermission,
): boolean {
  return Boolean(granted?.includes(needed));
}

export const ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: "مدیر کل",
  catalog_manager: "مدیر کاتالوگ",
  ops_manager: "مدیر عملیات",
  support: "پشتیبانی",
};
