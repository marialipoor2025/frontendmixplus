"use client";

import Link from "next/link";
import {
  BottomNavCartIcon,
  LoginUserIcon,
  WishlistHeartIcon,
} from "@/components/layout/icons";
import { identityLabel } from "@/components/profile/profileNav";
import { useAuth } from "@/lib/auth/useAuth";

type HeaderUserActionsProps = {
  loginLabel?: string;
  loginHref?: string;
  cartHref?: string;
  wishlistHref?: string;
  cartCount?: number;
  emptyCartTitle?: string;
};

/**
 * Barghchi-style header actions: cart, wishlist, login/profile.
 */
export function HeaderUserActions({
  loginLabel = "ورود | ثبت نام",
  loginHref = "/users/login",
  cartHref = "/checkout/cart/",
  wishlistHref = "/profile/wishlist",
  cartCount = 0,
  emptyCartTitle = "سبد خرید شما خالی است!",
}: HeaderUserActionsProps) {
  const { ready, isAuthenticated, user } = useAuth();
  const accountHref = isAuthenticated ? "/profile" : loginHref;
  const accountLabel =
    ready && isAuthenticated && user ? identityLabel(user) : loginLabel;

  return (
    <div className="flex shrink-0 items-center gap-3 xl:gap-4">
      <div className="group relative">
        <Link
          href={cartHref}
          aria-label="سبد خرید"
          className="relative flex size-11 items-center justify-center rounded-full bg-[rgb(22_114_221_/_0.1)]"
        >
          <span className="absolute -end-1.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-[var(--color-primary)] text-[10px] font-bold text-white">
            {cartCount > 99 ? "99+" : cartCount}
          </span>
          <BottomNavCartIcon className="text-[#2B3674]" />
        </Link>

        <div className="pointer-events-none absolute end-0 top-full z-20 hidden w-80 pt-2 opacity-0 transition group-hover:pointer-events-auto group-hover:opacity-100 lg:block">
          <div className="rounded-md bg-white p-3 shadow-md">
            <div className="flex items-center justify-between text-sm text-[var(--color-neutral-400)]">
              <div className="flex items-center gap-2">
                <span>{cartCount}</span>
                <span>عدد</span>
              </div>
              <Link
                href={cartHref}
                className="flex items-center gap-1 text-sm font-bold text-[var(--color-icon-secondary)]"
              >
                مشاهده سبد خرید
              </Link>
            </div>
            <div className="mt-5 h-10" />
            <div className="mt-6 border-b border-[var(--color-neutral-200)]" />
            <div className="mt-2 flex w-full flex-col items-center gap-3">
              <div className="flex w-full items-center justify-between text-sm font-medium">
                <span className="text-[var(--color-neutral-400)]">جمع کل</span>
                <span>۰</span>
              </div>
              <p className="w-full text-center text-xs text-[var(--color-muted)]">
                {emptyCartTitle}
              </p>
              <Link
                href={cartHref}
                className="inline-flex w-full items-center justify-center rounded-md bg-[var(--color-primary)] py-2 text-sm text-white"
              >
                سبد خرید
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Link
        href={wishlistHref}
        aria-label="علاقه‌مندی‌ها"
        className="flex items-center justify-center text-[#2B3674] transition hover:text-[var(--color-primary)]"
      >
        <WishlistHeartIcon />
      </Link>

      <Link
        href={accountHref}
        className="flex max-w-[10rem] items-center gap-2 text-sm font-medium text-[var(--color-icon-secondary)]"
        title={accountLabel}
      >
        <LoginUserIcon className="shrink-0 text-[#2B3674]" />
        <span className="truncate text-[var(--color-neutral-900)]" dir="ltr">
          {accountLabel}
        </span>
      </Link>
    </div>
  );
}
