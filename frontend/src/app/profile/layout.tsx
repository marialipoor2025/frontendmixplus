import type { ReactNode } from "react";
import { RequireAuth } from "@/components/profile/RequireAuth";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { StickyHeaderShell } from "@/components/layout/StickyHeaderShell";

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <StickyHeaderShell>
        <SiteHeader />
      </StickyHeaderShell>
      <main className="flex-1 bg-white">
        <RequireAuth>{children}</RequireAuth>
      </main>
    </>
  );
}
