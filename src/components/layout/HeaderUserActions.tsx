import Link from "next/link";
import {
  CartIcon,
  NotificationIcon,
  UserIcon,
} from "@/components/layout/icons";

type HeaderUserActionsProps = {
  loginLabel?: string;
  notificationsHref?: string;
  loginHref?: string;
  cartHref?: string;
  cartCount?: number;
  emptyCartTitle?: string;
};

/**
 * Digikala-style header actions: notifications, login/register, cart.
 */
export function HeaderUserActions({
  loginLabel = "ورود | ثبت‌نام",
  notificationsHref = "/profile/notification",
  loginHref = "/users/login",
  cartHref = "/checkout/cart",
  cartCount = 0,
  emptyCartTitle = "سبد خرید شما خالی است!",
}: HeaderUserActionsProps) {
  return (
    <div className="flex shrink-0 items-center justify-end">
      <Link
        href={notificationsHref}
        aria-label="اعلان‌ها"
        className="relative flex shrink-0 cursor-pointer items-center justify-center p-2 ms-3"
      >
        <NotificationIcon className="text-[var(--color-icon-high-emphasis)]" />
      </Link>

      <Link href={loginHref} className="ms-2 shrink-0 lg:ms-0">
        <span className="relative flex h-10 select-none items-center whitespace-nowrap rounded-[var(--medium-radius)] border border-[var(--color-neutral-200)] bg-white px-3 text-sm font-medium text-[var(--color-text)] transition hover:bg-[var(--color-neutral-100)]">
          <UserIcon className="me-2 text-[var(--color-icon-high-emphasis)]" />
          {loginLabel}
        </span>
      </Link>

      <span
        className="mx-3 hidden h-6 w-px bg-[var(--color-neutral-200)] lg:block"
        aria-hidden="true"
      />

      <div className="group relative flex flex-col">
        <Link
          href={cartHref}
          aria-label="سبد خرید"
          className="relative inline-flex rounded bg-white py-2 pe-2 ps-0 lg:p-2"
        >
          <CartIcon className="text-[var(--color-icon-high-emphasis)]" />
          {cartCount > 0 ? (
            <span className="absolute end-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-primary)] px-1 text-[10px] font-bold text-white lg:end-1 lg:top-1">
              {cartCount > 99 ? "99+" : cartCount}
            </span>
          ) : null}
        </Link>

        {/* Mini-cart preview (desktop hover) — empty state for now */}
        <div className="pointer-events-none absolute end-0 top-full z-20 hidden w-[320px] max-w-[calc(100vw-2rem)] pt-2 opacity-0 transition group-hover:pointer-events-auto group-hover:opacity-100 md:block md:w-[400px] lg:w-[500px]">
          <div className="overflow-hidden rounded-md bg-white shadow-[0_16px_24px_-8px_#00000014,0_2px_8px_0_#0000000a]">
            <div className="flex items-center gap-2 rounded-t-md bg-white px-4 pb-2 pt-4">
              <p className="text-lg font-bold text-[var(--color-text)]">
                خلاصه سبد خرید شما
              </p>
            </div>
            <div className="flex flex-col items-center justify-center gap-4 px-6 py-8">
              <div
                className="flex h-[120px] w-[120px] items-center justify-center rounded-full bg-[var(--color-neutral-100)] text-[var(--color-neutral-400)]"
                aria-hidden="true"
              >
                <CartIcon className="size-12" />
              </div>
              <p className="text-center text-base font-bold text-[var(--color-text)]">
                {emptyCartTitle}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
