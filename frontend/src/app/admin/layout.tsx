import type { ReactNode } from "react";

/** Admin routes: no marketplace chrome (header/footer/bottom-nav). */
export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-dvh bg-[var(--color-neutral-50)]">{children}</div>;
}
