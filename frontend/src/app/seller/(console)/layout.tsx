"use client";

import type { ReactNode } from "react";
import { RequireSeller } from "@/components/seller/RequireSeller";
import { SellerShell } from "@/components/seller/SellerShell";

export default function SellerConsoleLayout({ children }: { children: ReactNode }) {
  return (
    <RequireSeller>
      <SellerShell>{children}</SellerShell>
    </RequireSeller>
  );
}
