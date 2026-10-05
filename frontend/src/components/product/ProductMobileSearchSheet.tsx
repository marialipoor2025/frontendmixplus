"use client";

import { useEffect, useRef } from "react";
import { HeaderSearch } from "@/components/layout/HeaderSearch";
import { siteConfig } from "@/config/site";

type ProductMobileSearchSheetProps = {
  open: boolean;
  onClose: () => void;
};

/**
 * Digikala-style full-screen search overlay from the PDP sticky header.
 */
export function ProductMobileSearchSheet({
  open,
  onClose,
}: ProductMobileSearchSheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    // Focus the search input once mounted.
    const t = window.setTimeout(() => {
      const input = panelRef.current?.querySelector<HTMLInputElement>("input");
      input?.focus();
    }, 50);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-white lg:hidden">
      <div
        ref={panelRef}
        className="flex items-center gap-2 border-b border-[var(--color-neutral-100)] px-3 py-3"
      >
        <button
          type="button"
          className="flex size-10 shrink-0 items-center justify-center text-[var(--color-icon-high-emphasis)]"
          aria-label="بستن جستجو"
          onClick={onClose}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={22}
            height={22}
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <path
              d="M6.4 6.4 17.6 17.6M17.6 6.4 6.4 17.6"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <div className="min-w-0 flex-1">
          <HeaderSearch brandName={siteConfig.nameFa} />
        </div>
      </div>
      <p className="px-4 py-4 text-[13px] text-[var(--color-neutral-500)]">
        نام کالا، برند یا دسته‌بندی مورد نظر را جستجو کنید.
      </p>
    </div>
  );
}
