import type { ReactNode } from "react";

/** Auth routes: white full-bleed screens (no marketplace chrome). */
export default function UsersLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-dvh bg-white pb-0">{children}</div>;
}
