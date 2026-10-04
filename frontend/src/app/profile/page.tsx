"use client";

import Link from "next/link";
import {
  GradientFrame,
  ProfileCard,
  ProfileShell,
} from "@/components/profile/ProfileShell";
import { identityLabel, PROFILE_NAV } from "@/components/profile/profileNav";
import { useAuth } from "@/lib/auth/useAuth";
import {
  formatIrt,
  mockNotifications,
  mockOrders,
  mockWallet,
  mockWishlist,
  orderStatusLabel,
} from "@/lib/mocks/profile";

export default function ProfileDashboardPage() {
  const { user } = useAuth();
  const unread = mockNotifications.filter((n) => !n.read).length;
  const openOrders = mockOrders.filter((o) => o.status !== "delivered" && o.status !== "cancelled");

  return (
    <ProfileShell title="خلاصه حساب">
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <ProfileCard>
          <p className="text-xs text-[var(--color-muted)]">هویت حساب</p>
          <p className="mt-2 text-sm font-bold text-[var(--color-neutral-900)]" dir="ltr">
            {user ? identityLabel(user) : "—"}
          </p>
          <Link
            href="/profile/personal-info"
            className="mt-3 inline-block text-xs font-medium text-[var(--color-icon-secondary)]"
          >
            ویرایش اطلاعات
          </Link>
        </ProfileCard>
        <ProfileCard>
          <p className="text-xs text-[var(--color-muted)]">موجودی کیف پول</p>
          <p className="mt-2 text-sm font-bold text-[var(--color-neutral-900)]">
            {formatIrt(mockWallet.balance)}
          </p>
          <Link
            href="/profile/wallet"
            className="mt-3 inline-block text-xs font-medium text-[var(--color-icon-secondary)]"
          >
            مشاهده کیف پول
          </Link>
        </ProfileCard>
        <ProfileCard>
          <p className="text-xs text-[var(--color-muted)]">اعلان‌های خوانده‌نشده</p>
          <p className="mt-2 text-sm font-bold text-[var(--color-neutral-900)]">
            {unread.toLocaleString("fa-IR")}
          </p>
          <Link
            href="/profile/notifications"
            className="mt-3 inline-block text-xs font-medium text-[var(--color-icon-secondary)]"
          >
            مشاهده پیام‌ها
          </Link>
        </ProfileCard>
      </div>

      <ProfileCard className="mb-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold">سفارش‌های جاری</h2>
          <Link href="/profile/orders" className="text-xs font-medium text-[var(--color-icon-secondary)]">
            همه سفارش‌ها
          </Link>
        </div>
        {openOrders.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">سفارش فعالی ندارید.</p>
        ) : (
          <ul className="divide-y divide-[var(--color-neutral-100)]">
            {openOrders.map((order) => (
              <li key={order.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div>
                  <p className="font-medium" dir="ltr">
                    {order.code}
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-muted)]">
                    {orderStatusLabel[order.status]} · {order.createdAt}
                  </p>
                </div>
                <Link
                  href={`/profile/orders/${order.id}`}
                  className="shrink-0 text-xs font-medium text-[var(--color-primary)]"
                >
                  جزئیات
                </Link>
              </li>
            ))}
          </ul>
        )}
      </ProfileCard>

      <ProfileCard>
        <h2 className="mb-3 text-sm font-bold">دسترسی سریع</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {PROFILE_NAV.filter((i) => i.id !== "dashboard").map((item) => (
            <GradientFrame key={item.id} radius="rounded-lg">
              <Link
                href={item.href}
                className="block rounded-[7px] bg-white px-3 py-3 transition hover:bg-[var(--color-neutral-50)]"
              >
                <p className="text-sm font-medium text-[var(--color-neutral-900)]">
                  {item.title}
                </p>
                {item.description ? (
                  <p className="mt-1 text-[11px] text-[var(--color-muted)]">
                    {item.description}
                  </p>
                ) : null}
              </Link>
            </GradientFrame>
          ))}
        </div>
        <p className="mt-4 text-xs text-[var(--color-muted)]">
          علاقه‌مندی‌ها: {mockWishlist.length.toLocaleString("fa-IR")} کالا
        </p>
      </ProfileCard>
    </ProfileShell>
  );
}
