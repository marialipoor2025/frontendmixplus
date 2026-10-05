"use client";

import { useEffect } from "react";
import {
  CompareIcon,
  ListIcon,
  NotificationOutlineIcon,
  PriceChartIcon,
  ShareIcon,
  WishlistHeartIcon,
} from "@/components/layout/icons";

type ProductMobileMoreSheetProps = {
  open: boolean;
  onClose: () => void;
  onShare: () => void;
  onWishlist: () => void;
  wished: boolean;
};

const ACTIONS = [
  {
    id: "favorite",
    label: (wished: boolean) =>
      wished ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها",
    icon: WishlistHeartIcon,
  },
  { id: "share", label: () => "اشتراک‌گذاری کالا", icon: ShareIcon },
  {
    id: "amazing-notif",
    label: () => "اطلاع‌رسانی شگفت‌انگیز",
    icon: NotificationOutlineIcon,
  },
  { id: "price-chart", label: () => "نمودار قیمت", icon: PriceChartIcon },
  { id: "compare", label: () => "مقایسه کالا", icon: CompareIcon },
  { id: "list", label: () => "افزودن به لیست", icon: ListIcon },
] as const;

/**
 * Digikala-style «more» bottom sheet opened from the PDP sticky header dots.
 */
export function ProductMobileMoreSheet({
  open,
  onClose,
  onShare,
  onWishlist,
  wished,
}: ProductMobileMoreSheetProps) {
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  function handleAction(id: (typeof ACTIONS)[number]["id"]) {
    if (id === "share") {
      onShare();
      onClose();
      return;
    }
    if (id === "favorite") {
      onWishlist();
      onClose();
      return;
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[60] lg:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="بستن"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="گزینه‌های بیشتر"
        className="absolute inset-x-0 bottom-0 rounded-t-2xl bg-white pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-xl"
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-[var(--color-neutral-200)]" />
        </div>
        <ul className="px-2 py-2">
          {ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <li key={action.id}>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3.5 text-right text-[13px] font-medium text-[var(--color-neutral-800)] transition hover:bg-[var(--color-neutral-50)]"
                  onClick={() => handleAction(action.id)}
                >
                  {action.id === "favorite" ? (
                    <WishlistHeartIcon
                      className={`size-6 ${
                        wished
                          ? "text-[var(--color-hint-object-error)]"
                          : "text-[var(--color-icon-high-emphasis)]"
                      }`}
                      filled={wished}
                    />
                  ) : (
                    <Icon className="size-6 text-[var(--color-icon-high-emphasis)]" />
                  )}
                  <span>{action.label(wished)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
