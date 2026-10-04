"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { ADMIN_NAV } from "@/components/admin/adminNav";
import { GradientFrame } from "@/components/profile/ProfileShell";
import { LogoutIcon } from "@/components/layout/icons";
import { NAV_ICON_CLASS } from "@/components/layout/navMenuShared";
import { hasPermission, ROLE_LABELS } from "@/lib/admin/permissions";
import { useAdminAuth } from "@/lib/admin/useAdminAuth";

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/admin";
  const router = useRouter();
  const { user, logout } = useAdminAuth();

  const groups = ADMIN_NAV.map((group) => ({
    ...group,
    items: group.items.filter((item) =>
      hasPermission(user?.permissions, item.permission),
    ),
  })).filter((group) => group.items.length > 0);

  function handleLogout() {
    logout();
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-dvh bg-[var(--color-neutral-50)]" data-admin-page>
      <header className="border-b border-[var(--color-neutral-200)] bg-white">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-4 py-3 lg:px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gradient-to-l from-[#1672dd] to-[#ed1944] px-3 py-1.5 text-sm font-black text-white">
              MixPlus
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--color-neutral-900)]">
                پنل مدیریت
              </p>
              <p className="text-[11px] text-[var(--color-muted)]">Back Office</p>
            </div>
          </div>
          <div className="text-end">
            <p className="text-xs font-medium text-[var(--color-neutral-800)]">
              {user?.displayName}
            </p>
            <p className="text-[11px] text-[var(--color-muted)]">
              {user ? ROLE_LABELS[user.role] : ""}
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1440px] gap-4 px-4 py-4 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-6 lg:px-6 lg:py-6">
        <GradientFrame>
          <aside className="rounded-[11px] bg-white p-3 lg:p-4">
            <nav aria-label="منوی پنل مدیریت" className="flex flex-col gap-4">
              {groups.map((group) => (
                <div key={group.id}>
                  <p className="mb-1.5 px-2 text-[11px] font-medium text-[var(--color-muted)]">
                    {group.title}
                  </p>
                  <div className="flex flex-col gap-0.5">
                    {group.items.map((item) => {
                      const active =
                        item.href === "/admin"
                          ? pathname === "/admin" || pathname === "/admin/"
                          : pathname.startsWith(item.href);
                      return (
                        <Link
                          key={item.id}
                          href={item.href}
                          className={[
                            "rounded-lg px-3 py-2.5 text-sm font-medium transition",
                            active
                              ? "bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
                              : "text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-50)]",
                          ].join(" ")}
                        >
                          {item.title}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            <div className="mt-4 border-t border-[var(--color-neutral-100)] pt-3">
              <GradientFrame radius="rounded-lg" className="w-full">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-[7px] bg-white px-3 py-2.5 text-sm font-bold text-[var(--color-primary)] transition hover:bg-[var(--color-primary-soft)]"
                >
                  <LogoutIcon
                    className={`${NAV_ICON_CLASS} text-[var(--color-primary)]`}
                  />
                  <span>خروج از پنل</span>
                </button>
              </GradientFrame>
            </div>
          </aside>
        </GradientFrame>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
