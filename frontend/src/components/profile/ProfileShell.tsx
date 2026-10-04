"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { LogoutIcon } from "@/components/layout/icons";
import { NAV_ICON_CLASS } from "@/components/layout/navMenuShared";
import { ProfileNavIcon } from "@/components/profile/ProfileNavIcon";
import { identityLabel, PROFILE_NAV } from "@/components/profile/profileNav";
import { useAuth } from "@/lib/auth/useAuth";

type ProfileShellProps = {
  title?: string;
  children: ReactNode;
};

/** Thin MixPlus gradient frame for cards / buttons / panels. */
export function GradientFrame({
  children,
  className = "",
  radius = "rounded-xl",
}: {
  children: ReactNode;
  className?: string;
  radius?: string;
}) {
  return (
    <div
      className={`${radius} bg-gradient-to-l from-[#1672dd] to-[#ed1944] p-px ${className}`}
    >
      {children}
    </div>
  );
}

export function ProfileShell({ title, children }: ProfileShellProps) {
  const pathname = usePathname() || "/profile";
  const router = useRouter();
  const { user, logout } = useAuth();
  const label = user ? identityLabel(user) : "";

  function handleLogout() {
    logout();
    router.replace("/users/login");
    router.refresh();
  }

  return (
    <div className="site-container bg-white py-4 lg:py-8">
      <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-6">
        <GradientFrame>
          <aside className="rounded-[11px] bg-white p-3 lg:p-4">
            <div className="mb-3 border-b border-[var(--color-neutral-100)] px-2 pb-3">
              <p className="text-xs font-medium text-[var(--color-muted)]">حساب کاربری</p>
              <p className="mt-1 text-sm font-bold text-[var(--color-neutral-900)]" dir="ltr">
                {label}
              </p>
              {user?.displayName && user.phone ? (
                <p className="mt-0.5 text-xs text-[var(--color-muted)]">{user.displayName}</p>
              ) : null}
            </div>

            <nav aria-label="منوی حساب کاربری" className="flex flex-col gap-0.5">
              {PROFILE_NAV.map((item) => {
                const active =
                  item.href === "/profile"
                    ? pathname === "/profile" || pathname === "/profile/"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={[
                      "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                      active
                        ? "bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
                        : "text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-50)]",
                    ].join(" ")}
                  >
                    <ProfileNavIcon
                      id={item.id}
                      className={[
                        NAV_ICON_CLASS,
                        active
                          ? "text-[var(--color-primary)]"
                          : "text-[var(--color-neutral-500)]",
                      ].join(" ")}
                    />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
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
                  <span>خروج از حساب</span>
                </button>
              </GradientFrame>
            </div>
          </aside>
        </GradientFrame>

        <section className="min-w-0">
          {title ? (
            <h1 className="mb-4 text-base font-bold text-[var(--color-neutral-900)] lg:text-lg">
              {title}
            </h1>
          ) : null}
          {children}
        </section>
      </div>
    </div>
  );
}

export function ProfileCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <GradientFrame className={className}>
      <div className="rounded-[11px] bg-white p-4 lg:p-5">{children}</div>
    </GradientFrame>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <ProfileCard>
      <p className="py-10 text-center text-sm text-[var(--color-muted)]">{message}</p>
    </ProfileCard>
  );
}

/** Filled MixPlus gradient CTA. */
export function ProfileButton({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={[
        "inline-flex items-center justify-center rounded-lg bg-gradient-to-l from-[#1672dd] to-[#ed1944] px-4 py-2.5 text-xs font-bold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70",
        className,
      ].join(" ")}
    />
  );
}

/** Outline button with thin MixPlus gradient border. */
export function ProfileOutlineButton({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <GradientFrame radius="rounded-lg" className={`inline-flex ${className}`}>
      <button
        {...props}
        className="inline-flex items-center justify-center rounded-[7px] bg-white px-4 py-2 text-xs font-medium text-[var(--color-neutral-800)] transition hover:bg-[var(--color-neutral-50)] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {children}
      </button>
    </GradientFrame>
  );
}

