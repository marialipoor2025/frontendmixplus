"use client";

import type { ReactNode } from "react";
import { DigiSellerShell } from "@/components/seller/DigiSellerShell";
import { RequireSeller } from "@/components/seller/RequireSeller";

export default function DigiSellerConsoleLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <RequireSeller>
      <DigiSellerShell>{children}</DigiSellerShell>
    </RequireSeller>
  );
}
