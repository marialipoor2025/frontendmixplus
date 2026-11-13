"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  DIGI_SELLER_NAV,
  isSellerGroupActive,
  isSellerNavItemActive,
  type SellerNavGroup,
  type SellerNavItem,
} from "@/components/seller/sellerNav";
import { useAuth } from "@/lib/auth/useAuth";
import { siteConfig } from "@/config/site";
import "@/components/seller/digi/digi.css";

/**
 * Digikala-style seller shell: top chrome + vertical sidebar (same IA as header menus).
 */
export function DigiSellerShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/seller/digi/dashboard";
  const searchParams = useSearchParams();
  const search = searchParams?.toString() ? `?${searchParams.toString()}` : "";
  const router = useRouter();
  const { user, logout } = useAuth();
  const [openId, setOpenId] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const active = DIGI_SELLER_NAV.find((g) =>
      isSellerGroupActive(pathname, search, g),
    );
    setOpenId(active?.id ?? null);
    setProfileOpen(false);
  }, [pathname, search]);

  async function handleLogout() {
    await logout();
    router.replace("/seller/login");
    router.refresh();
  }

  return (
    <div className="min-h-dvh" data-seller-digi-page>
      <header className="digi-auth-header">
        <div className="flex items-center overflow-visible">
          <Link
            href="/seller/digi/dashboard"
            className="flex shrink-0 items-center gap-2"
            aria-label="خانه — پنل فروشنده میکس‌پلاس"
          >
            <Image
              src="/brand/mixplus-logo.svg"
              alt="میکس‌پلاس"
              width={120}
              height={36}
              priority
              unoptimized
              className="h-8 w-auto object-contain object-start sm:h-9"
            />
          </Link>
        </div>

        <div className="flex shrink-0 items-center">
          <Link
            href="/seller/dashboard"
            className="me-2 hidden text-[11px] sm:inline"
            style={{ color: "var(--color-text-low-emphasis)" }}
          >
            پنل کلاسیک
          </Link>

          <Link
            href="/seller/digi/settings"
            className="digi-auth-header__icon-btn"
            aria-label="پیام‌ها"
            title="پیام‌ها"
          >
            <MessageIcon />
          </Link>

          <Link
            href="/seller/digi/orders"
            className="digi-auth-header__icon-btn"
            aria-label="اعلان‌ها"
            title="اعلان‌ها"
          >
            <MailIcon />
            <span className="digi-auth-header__count" data-testid="icon-number">
              ۵
            </span>
          </Link>

          <div className="digi-auth-header__divider" aria-hidden />

          <Link
            href="/seller/digi/finance"
            className="digi-auth-header__icon-btn gap-1 px-3"
            title="کیف پول"
          >
            <WalletIcon />
            <span
              className="hidden text-sm sm:inline"
              style={{ color: "var(--color-neutral-700)" }}
            >
              ۰
            </span>
            <span
              className="hidden text-[11px] sm:inline"
              style={{ color: "var(--color-neutral-500)" }}
            >
              تومان
            </span>
          </Link>

          <div className="relative">
            <button
              type="button"
              data-pw="profile-menu-trigger"
              className="digi-auth-header__icon-btn gap-1 px-3"
              aria-expanded={profileOpen}
              onClick={() => setProfileOpen((v) => !v)}
            >
              <ProfileIcon />
              <ChevronIcon />
            </button>
            {profileOpen ? (
              <ul className="digi-auth-header__menu-list is-open" role="menu">
                <li>
                  <div className="border-b border-[var(--color-neutral-100)] px-4 py-2">
                    <p
                      className="text-xs font-bold"
                      style={{ color: "var(--color-text-heading)" }}
                    >
                      {user?.displayName ?? "فروشنده"}
                    </p>
                    <p
                      className="text-[11px]"
                      style={{ color: "var(--color-text-low-emphasis)" }}
                      dir="ltr"
                    >
                      {user?.phone ?? user?.email ?? ""}
                    </p>
                  </div>
                </li>
                <li>
                  <Link
                    role="menuitem"
                    href="/seller/digi/settings"
                    className="digi-auth-header__menu-item"
                  >
                    تنظیمات فروشگاه
                  </Link>
                </li>
                <li>
                  <Link
                    role="menuitem"
                    href="/seller/dashboard"
                    className="digi-auth-header__menu-item"
                  >
                    پنل کلاسیک
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    role="menuitem"
                    className="digi-auth-header__menu-item w-full text-start"
                    style={{ color: "var(--color-hint-object-error)" }}
                    onClick={() => void handleLogout()}
                  >
                    خروج
                  </button>
                </li>
              </ul>
            ) : null}
          </div>
        </div>
      </header>

      <div className="digi-shell-body">
        <aside className="digi-sidebar" aria-label="منوی پنل فروشندگان">
          <nav className="digi-sidebar__nav">
            <Link
              href="/seller/digi/dashboard"
              className={[
                "digi-sidebar__link digi-sidebar__link--top",
                pathname.startsWith("/seller/digi/dashboard")
                  ? "is-active"
                  : "",
              ].join(" ")}
            >
              خانه
            </Link>
            {DIGI_SELLER_NAV.map((group) => (
              <SidebarGroup
                key={group.id}
                group={group}
                pathname={pathname}
                search={search}
                open={openId === group.id}
                onToggle={() =>
                  setOpenId((prev) => (prev === group.id ? null : group.id))
                }
              />
            ))}
          </nav>
        </aside>

        <div className="digi-shell-content">
          <main className="digi-main mx-auto max-w-[1440px] px-3 sm:px-4 lg:px-6">
            {children}
          </main>

          <footer className="mt-10 border-t border-[var(--color-neutral-200)] bg-white">
            <div
              className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-center gap-x-5 gap-y-2 px-4 py-4 text-[11px] lg:justify-between"
              style={{ color: "var(--color-text-low-emphasis)" }}
            >
              <div className="flex flex-wrap items-center justify-center gap-x-4">
                <Link href="/seller/digi/settings">ثبت درخواست پشتیبانی</Link>
                <a href="tel:02161930600" dir="ltr">
                  ۰۲۱ - ۶۱۹۳۰۶۰۰
                </a>
              </div>
              <p>میکس‌پلاس · {siteConfig.nameFa}</p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

function SidebarGroup({
  group,
  pathname,
  search,
  open,
  onToggle,
}: {
  group: SellerNavGroup;
  pathname: string;
  search: string;
  open: boolean;
  onToggle: () => void;
}) {
  const active = isSellerGroupActive(pathname, search, group);

  if (group.href && group.items.length === 0) {
    const leaf: SellerNavItem = {
      id: group.id,
      title: group.title,
      href: group.href,
    };
    const leafActive = isSellerNavItemActive(pathname, search, leaf);
    return (
      <div className="digi-sidebar__group">
        <Link
          href={group.href}
          className={[
            "digi-sidebar__group-btn",
            leafActive ? "is-active" : "",
          ].join(" ")}
          data-active={leafActive ? "true" : "false"}
        >
          <span>{group.title}</span>
        </Link>
      </div>
    );
  }

  return (
    <div className={["digi-sidebar__group", open ? "is-open" : ""].join(" ")}>
      <button
        type="button"
        className={[
          "digi-sidebar__group-btn",
          active ? "is-active" : "",
        ].join(" ")}
        aria-expanded={open}
        data-active={active ? "true" : "false"}
        onClick={onToggle}
      >
        <span className="inline-flex items-center gap-1">
          {group.title}
          {group.updateBadge ? (
            <span className="digi-auth-header__update-badge" aria-hidden />
          ) : null}
        </span>
        <ChevronIcon />
      </button>
      {open ? (
        <ul className="digi-sidebar__list" role="list">
          {group.items.map((item) => {
            const itemActive = isSellerNavItemActive(pathname, search, item);
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={[
                    "digi-sidebar__link",
                    itemActive ? "is-active" : "",
                  ].join(" ")}
                  data-active={itemActive ? "true" : "false"}
                >
                  <span className="inline-flex items-center">
                    {item.title}
                    {item.badge ? (
                      <span className="digi-auth-header__new-badge">
                        {item.badge}
                      </span>
                    ) : null}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

function ChevronIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 10l5 5 5-5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7A2.5 2.5 0 0 1 17.5 16H9l-4 3.5V6.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="3.5"
        y="5.5"
        width="17"
        height="13"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="m4 7 8 6 8-6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="3"
        y="6"
        width="18"
        height="13"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="16.5" cy="14.5" r="1.2" fill="currentColor" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M5 19c1.8-3.1 4.1-4.4 7-4.4s5.2 1.3 7 4.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
