import type { ReactNode } from "react";

/** Seller portal: no marketplace chrome (header/footer/bottom-nav). */
export default function SellerRootLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-dvh bg-[var(--color-neutral-50)]">{children}</div>;
}
