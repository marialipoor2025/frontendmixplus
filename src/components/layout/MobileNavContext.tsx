"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { MainNavData } from "@/types/nav";

const MobileNavContext = createContext<MainNavData | null>(null);

export function MobileNavProvider({
  data,
  children,
}: {
  data: MainNavData;
  children: ReactNode;
}) {
  return (
    <MobileNavContext.Provider value={data}>
      {children}
    </MobileNavContext.Provider>
  );
}

export function useMobileNav(): MainNavData {
  const value = useContext(MobileNavContext);
  if (!value) {
    throw new Error("useMobileNav must be used within MobileNavProvider");
  }
  return value;
}
