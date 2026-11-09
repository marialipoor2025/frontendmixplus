"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import {
  DIGI_SELLER_NAV,
  isSellerGroupActive,
  isSellerNavActive,
  type SellerNavGroup,
} from "@/components/seller/sellerNav";
import { useAuth } from "@/lib/auth/useAuth";
import "@/components/seller/digi/digi.css";

/**
 * Digikala AuthenticatedHeaderDesktop — structure + tokens from live seller panel.
 */
export function DigiSellerShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/seller/digi/dashboard";
  const router = useRouter();
  const { user, logout } = useAuth();
  const [openId, setOpenId] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setOpenId(null);
    setMobileOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!headerRef.current?.contains(e.target as Node)) {
        setOpenId(null);
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  async function handleLogout() {
    await logout();
    router.replace("/seller/login");
    router.refresh();
  }

  return (
    <div className="min-h-dvh" data-seller-digi-page>
      <header ref={headerRef} className="digi-auth-header">
        {/* Left cluster in RTL = logo + menus (Digikala: d-flex ai-center) */}
        <div className="flex items-center overflow-visible">
          <Link
            href="/seller/digi/dashboard"
            className="ms-8 flex shrink-0 flex-col leading-none"
            aria-label="خانه — مرکز فروشندگان"
          >
            <span
              className="text-[17px] font-black tracking-tight"
              style={{ color: "var(--color-text-heading)" }}
            >
              mixplus
            </span>
            <span
              className="text-[9px] font-bold uppercase tracking-[0.14em]"
              style={{ color: "var(--color-text-primary)" }}
            >
              Seller Center
            </span>
          </Link>

          <nav
            aria-label="منوی پنل فروشندگان"
            className="ms-2 hidden items-center lg:flex"
          >
            {DIGI_SELLER_NAV.map((group) => (
              <HeaderMenu
                key={group.id}
                group={group}
                pathname={pathname}
                open={openId === group.id}
                onOpen={() =>
                  setOpenId((prev) => (prev === group.id ? null : group.id))
                }
              />
            ))}
          </nav>
        </div>

        {/* Right actions — questions, notifications, wallet, profile */}
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
              onClick={() => {
                setOpenId(null);
                setProfileOpen((v) => !v);
              }}
            >
              <ProfileIcon />
              <ChevronIcon />
            </button>
            {profileOpen ? (
              <ul
                className="digi-auth-header__menu-list is-open"
                role="menu"
              >
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

          <button
            type="button"
            className="digi-auth-header__icon-btn ms-1 border border-[var(--color-neutral-200)] lg:hidden"
            aria-expanded={mobileOpen}
            aria-label="منو"
            onClick={() => setMobileOpen((v) => !v)}
          >
            ☰
          </button>
        </div>
      </header>

      {mobileOpen ? (
        <div
          className="fixed inset-x-0 z-30 max-h-[70vh] space-y-2 overflow-y-auto border-b border-[var(--color-neutral-200)] bg-white px-4 py-3 lg:hidden"
          style={{ top: "var(--authenticated-header-height)" }}
        >
          <Link
            href="/seller/digi/dashboard"
            className="block rounded-lg px-3 py-2 text-sm font-medium"
          >
            خانه
          </Link>
          {DIGI_SELLER_NAV.map((group) => (
            <div
              key={group.id}
              className="rounded-lg border border-[var(--color-neutral-200)] p-2"
            >
              <p
                className="px-2 text-[11px] font-bold"
                style={{ color: "var(--color-text-low-emphasis)" }}
              >
                {group.title}
              </p>
              {group.href && group.items.length === 0 ? (
                <Link
                  href={group.href}
                  className="mt-1 block rounded-lg px-2 py-2 text-sm"
                >
                  {group.title}
                </Link>
              ) : (
                <div className="mt-1 flex flex-col">
                  {group.items.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      className="rounded-lg px-2 py-2 text-sm"
                      style={{
                        color: isSellerNavActive(pathname, item.href)
                          ? "var(--color-text-primary)"
                          : "var(--color-text-high-emphasis)",
                      }}
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null}

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
          <p>MixPlus Seller Center</p>
        </div>
      </footer>
    </div>
  );
}

function HeaderMenu({
  group,
  pathname,
  open,
  onOpen,
}: {
  group: SellerNavGroup;
  pathname: string;
  open: boolean;
  onOpen: () => void;
}) {
  const menuId = useId();
  const active = isSellerGroupActive(pathname, group);

  if (group.href && group.items.length === 0) {
    return (
      <div className="digi-header-menu">
        <Link
          href={group.href}
          className="digi-auth-header__nav-btn"
          data-active={active ? "true" : "false"}
        >
          <span className="me-2">{group.title}</span>
        </Link>
      </div>
    );
  }

  return (
    <div
      className={[
        "digi-header-menu",
        open ? "digi-header-menu--open" : "",
      ].join(" ")}
    >
      <button
        type="button"
        className="digi-auth-header__nav-btn"
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="menu"
        data-active={active || open ? "true" : "false"}
        onClick={onOpen}
      >
        <span className="me-2">{group.title}</span>
        {group.updateBadge ? (
          <span className="digi-auth-header__update-badge" aria-hidden />
        ) : null}
        <ChevronIcon />
      </button>
      {/* Always mounted — Digikala hover reveal via CSS */}
      <ul id={menuId} className="digi-auth-header__menu-list" role="menu">
        {group.items.map((item) => (
          <li key={item.id} className="text-[var(--color-neutral-500)]">
            <Link
              role="menuitem"
              href={item.href}
              className="digi-auth-header__menu-item"
              data-active={
                isSellerNavActive(pathname, item.href) ? "true" : "false"
              }
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
        ))}
      </ul>
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
