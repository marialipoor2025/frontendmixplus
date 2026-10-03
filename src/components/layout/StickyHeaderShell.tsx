import type { ReactNode } from "react";

type StickyHeaderShellProps = {
  children: ReactNode;
};

/**
 * Sticky header wrapper with a soft fade into page content
 * (instead of a hard 1px separator line).
 */
export function StickyHeaderShell({ children }: StickyHeaderShellProps) {
  return (
    <div className="sticky top-0 z-40 bg-[var(--color-neutral-000)] shadow-[0_4px_12px_-6px_rgb(0_0_0_/_0.12)]">
      {children}
    </div>
  );
}
