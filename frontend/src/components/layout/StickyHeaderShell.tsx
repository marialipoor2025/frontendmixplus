"use client";

import type { ReactNode } from "react";

type StickyHeaderShellProps = {
  children: ReactNode;
};

/** Sticky header wrapper with a soft fade into page content. */
export function StickyHeaderShell({ children }: StickyHeaderShellProps) {
  return (
    <div
      data-sticky-header
      className="sticky top-0 z-40 bg-[var(--color-neutral-000)] shadow-[0_4px_12px_-6px_rgb(0_0_0_/_0.12)]"
    >
      {children}
    </div>
  );
}
