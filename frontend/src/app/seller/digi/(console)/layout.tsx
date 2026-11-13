"use client";

import { Suspense, type ReactNode } from "react";
import { DigiSellerShell } from "@/components/seller/DigiSellerShell";
import { RequireSeller } from "@/components/seller/RequireSeller";

export default function DigiSellerConsoleLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <RequireSeller>
      <Suspense fallback={<div className="min-h-dvh bg-white" />}>
        <DigiSellerShell>{children}</DigiSellerShell>
      </Suspense>
    </RequireSeller>
  );
}
