import type { AdminPermission } from "@/types/admin";

export type AdminNavItem = {
  id: string;
  title: string;
  href: string;
  permission: AdminPermission;
};

export type AdminNavGroup = {
  id: string;
  title: string;
  items: AdminNavItem[];
};

export const ADMIN_NAV: AdminNavGroup[] = [
  {
    id: "overview",
    title: "نمای کلی",
    items: [
      { id: "dashboard", title: "داشبورد", href: "/admin", permission: "dashboard:view" },
      { id: "reports", title: "گزارش‌ها", href: "/admin/reports", permission: "reports:view" },
      { id: "audit", title: "لاگ تغییرات", href: "/admin/audit", permission: "audit:view" },
    ],
  },
  {
    id: "catalog",
    title: "کاتالوگ",
    items: [
      { id: "products", title: "محصولات", href: "/admin/products", permission: "products:manage" },
      { id: "variants", title: "تنوع‌ها", href: "/admin/variants", permission: "variants:manage" },
      { id: "specs", title: "مشخصات", href: "/admin/specs", permission: "specs:manage" },
      { id: "categories", title: "دسته‌بندی‌ها", href: "/admin/categories", permission: "categories:manage" },
      { id: "brands", title: "برندها", href: "/admin/brands", permission: "brands:manage" },
      { id: "media", title: "رسانه", href: "/admin/media", permission: "media:manage" },
      { id: "inventory", title: "موجودی", href: "/admin/inventory", permission: "inventory:manage" },
    ],
  },
  {
    id: "marketplace",
    title: "بازارگاه",
    items: [
      { id: "sellers", title: "فروشندگان", href: "/admin/sellers", permission: "sellers:manage" },
      { id: "offers", title: "آفر فروشندگان", href: "/admin/offers", permission: "offers:manage" },
      { id: "orders", title: "سفارش‌ها", href: "/admin/orders", permission: "orders:manage" },
      { id: "customers", title: "مشتریان", href: "/admin/customers", permission: "customers:manage" },
    ],
  },
  {
    id: "growth",
    title: "رشد و محتوا",
    items: [
      { id: "promotions", title: "پروموشن‌ها", href: "/admin/promotions", permission: "promotions:manage" },
      { id: "coupons", title: "کوپن‌ها", href: "/admin/coupons", permission: "coupons:manage" },
      { id: "cms", title: "مدیریت محتوا", href: "/admin/cms", permission: "cms:manage" },
      { id: "reviews", title: "نظارت بر نظرات", href: "/admin/reviews", permission: "reviews:moderate" },
    ],
  },
  {
    id: "access",
    title: "دسترسی",
    items: [
      { id: "roles", title: "نقش‌ها و دسترسی", href: "/admin/roles", permission: "roles:manage" },
    ],
  },
];
