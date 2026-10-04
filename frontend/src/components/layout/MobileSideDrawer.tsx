"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, type ReactNode } from "react";
import { siteConfig } from "@/config/site";

type MobileSideDrawerProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Wider panel for category browser */
  wide?: boolean;
};

/**
 * Mobile drawer that slides in from the physical right edge.
 * Backdrop / Escape / close button collapse it; link clicks stay interactive.
 */
export function MobileSideDrawer({
  open,
  onClose,
  title,
  children,
  wide = false,
}: MobileSideDrawerProps) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="بستن"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      <div
        className={`animate-mobile-drawer-in absolute inset-y-0 right-0 flex h-full max-h-full flex-col bg-white shadow-xl ${
          wide ? "w-full max-w-full sm:max-w-md" : "w-[min(100%,20rem)]"
        }`}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--color-border)] px-4 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <Link
              href="/"
              onClick={onClose}
              aria-label={`لوگوی ${siteConfig.nameFa}`}
              className="shrink-0"
            >
              <Image
                src="/brand/mixplus-logo.svg"
                alt={`لوگوی ${siteConfig.nameFa}`}
                width={96}
                height={28}
                className="h-7 w-auto object-contain"
              />
            </Link>
            <span
              className="h-5 w-px shrink-0 bg-[var(--color-neutral-200)]"
              aria-hidden
            />
            <h2 className="truncate text-sm font-bold text-[var(--color-neutral-900)]">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-[var(--color-neutral-600)] transition hover:bg-[var(--color-neutral-100)]"
            aria-label="بستن منو"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
