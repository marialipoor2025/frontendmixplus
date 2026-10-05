"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AdminCard,
  AdminOutlineButton,
  AdminPageHeader,
} from "@/components/admin/AdminUi";
import { RequireAdmin } from "@/components/admin/RequireAdmin";
import { hasPermission } from "@/lib/admin/permissions";
import { useAdminAuth } from "@/lib/admin/useAdminAuth";
import { getAdminDashboardStats } from "@/lib/api/dashboard";
import { mockAdminOrders, mockAdminStats } from "@/lib/mocks/admin";
import type { AdminStat } from "@/types/admin";
import { formatPrice } from "@/lib/format";
import { siteConfig } from "@/config/site";

export default function AdminDashboardPage() {
  const { user } = useAdminAuth();
  const [stats, setStats] = useState<AdminStat[]>(mockAdminStats);
  const [source, setSource] = useState<"mock" | "api">("mock");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const live = await getAdminDashboardStats();
      if (!cancelled && live) {
        setStats(live);
        if (!siteConfig.useMocks && siteConfig.apiBaseUrl) {
          setSource("api");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <RequireAdmin permission="dashboard:view">
      <AdminPageHeader
        title="داشبورد"
        description={
          source === "api"
            ? "آمار زنده از Catalog، Identity، Sellers و Promotions"
            : "نمای کلی فعالیت کسب‌وکار و موارد نیازمند اقدام"
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <AdminCard key={stat.id}>
            <p className="text-xs text-[var(--color-muted)]">{stat.label}</p>
            <p className="mt-2 text-xl font-bold text-[var(--color-neutral-900)]">
              {stat.value}
            </p>
            {stat.hint ? (
              <p className="mt-1 text-[11px] text-[var(--color-muted)]">
                {stat.hint}
              </p>
            ) : null}
          </AdminCard>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <AdminCard>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-[var(--color-neutral-900)]">
              سفارش‌های اخیر
            </h2>
            {hasPermission(user?.permissions, "orders:manage") ? (
              <Link href="/admin/orders">
                <AdminOutlineButton type="button">همه سفارش‌ها</AdminOutlineButton>
              </Link>
            ) : null}
          </div>
          <ul className="divide-y divide-[var(--color-neutral-100)]">
            {mockAdminOrders.map((order) => (
              <li
                key={order.id}
                className="flex items-center justify-between gap-3 py-2.5 text-sm"
              >
                <div>
                  <p className="font-medium text-[var(--color-neutral-800)]">
                    {order.id}
                  </p>
                  <p className="text-xs text-[var(--color-muted)]">
                    {order.customer}
                  </p>
                </div>
                <div className="text-end">
                  <p dir="ltr" className="tabular-nums font-medium">
                    {formatPrice(order.total)}
                  </p>
                  <p className="text-[11px] text-[var(--color-muted)]">
                    {order.createdAt}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </AdminCard>

        <AdminCard>
          <h2 className="mb-3 text-sm font-bold text-[var(--color-neutral-900)]">
            میانبرهای عملیاتی
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              {
                href: "/admin/products",
                label: "مدیریت محصولات",
                perm: "products:manage" as const,
              },
              {
                href: "/admin/orders",
                label: "پردازش سفارش",
                perm: "orders:manage" as const,
              },
              {
                href: "/admin/promotions",
                label: "کمپین‌ها",
                perm: "promotions:manage" as const,
              },
              {
                href: "/admin/reviews",
                label: "نظارت نظرات",
                perm: "reviews:moderate" as const,
              },
            ]
              .filter((item) => hasPermission(user?.permissions, item.perm))
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg border border-[var(--color-border)] px-3 py-3 text-sm font-medium text-[var(--color-neutral-800)] transition hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-soft)]"
                >
                  {item.label}
                </Link>
              ))}
          </div>
          <p className="mt-4 text-xs text-[var(--color-muted)]">
            {source === "api"
              ? "آمار داشبورد از API زنده است؛ سفارش‌ها هنوز mock هستند."
              : "داده‌های فعلی mock هستند؛ پس از ماژول بک‌اند به API واقعی وصل می‌شوند."}
          </p>
        </AdminCard>
      </div>
    </RequireAdmin>
  );
}
