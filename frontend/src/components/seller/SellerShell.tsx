"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { GradientFrame } from "@/components/profile/ProfileShell";
import { LogoutIcon } from "@/components/layout/icons";
import { NAV_ICON_CLASS } from "@/components/layout/navMenuShared";
import { CLASSIC_SELLER_NAV, isSellerNavActive } from "@/components/seller/sellerNav";
import { useAuth } from "@/lib/auth/useAuth";

/** Classic MixPlus seller console (sidebar) — kept for swap / comparison. */
export function SellerShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/seller/dashboard";
  const router = useRouter();
  const { user, logout } = useAuth();

  async function handleLogout() {
    await logout();
    router.replace("/seller/login");
    router.refresh();
  }

  return (
    <div className="min-h-dvh bg-[var(--color-neutral-50)]" data-seller-page>
      <header className="border-b border-[var(--color-neutral-200)] bg-white">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gradient-to-l from-[#1672dd] to-[#ed1944] px-3 py-1.5 text-sm font-black text-white">
              MixPlus
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--color-neutral-900)]">
                پنل فروشنده
              </p>
              <p className="text-[11px] text-[var(--color-muted)]">Seller Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/seller/digi/dashboard"
              className="hidden rounded-lg border border-[var(--color-neutral-200)] px-3 py-1.5 text-xs text-[var(--color-neutral-700)] sm:inline-flex"
            >
              پیش‌نمایش پنل دیجی
            </Link>
            <div className="text-end">
              <p className="text-xs font-medium text-[var(--color-neutral-800)]">
                {user?.displayName ?? "فروشنده"}
              </p>
              <p className="text-[11px] text-[var(--color-muted)]" dir="ltr">
                {user?.phone ?? ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="rounded-lg border border-[var(--color-neutral-200)] px-3 py-1.5 text-xs text-[var(--color-neutral-700)]"
            >
              خروج
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1100px] gap-4 px-4 py-4 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-6 lg:py-6">
        <GradientFrame>
          <aside className="rounded-[11px] bg-white p-3">
            <nav aria-label="منوی پنل فروشنده" className="flex flex-col gap-0.5">
              {CLASSIC_SELLER_NAV.map((item) => {
                const active = isSellerNavActive(pathname, item.href);
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
            </nav>
            <div className="mt-4 border-t border-[var(--color-neutral-100)] pt-3">
              <GradientFrame radius="rounded-lg" className="w-full">
                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  className="flex w-full items-center justify-center gap-2 rounded-[7px] bg-white px-3 py-2.5 text-sm font-bold text-[var(--color-primary)] transition hover:bg-[var(--color-primary-soft)]"
                >
                  <LogoutIcon
                    className={`${NAV_ICON_CLASS} text-[var(--color-primary)]`}
                  />
                  خروج از پنل
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
