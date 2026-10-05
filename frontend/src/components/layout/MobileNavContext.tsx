"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { MainNavData } from "@/types/nav";

type MobileNavContextValue = {
  data: MainNavData;
  categoryImages: Record<string, string>;
};

const MobileNavContext = createContext<MobileNavContextValue | null>(null);

export function MobileNavProvider({
  data,
  categoryImages = {},
  children,
}: {
  data: MainNavData;
  categoryImages?: Record<string, string>;
  children: ReactNode;
}) {
  return (
    <MobileNavContext.Provider value={{ data, categoryImages }}>
      {children}
    </MobileNavContext.Provider>
  );
}

export function useMobileNav(): MainNavData {
  const value = useContext(MobileNavContext);
  if (!value) {
    throw new Error("useMobileNav must be used within MobileNavProvider");
  }
  return value.data;
}

export function useCategoryImages(): Record<string, string> {
  const value = useContext(MobileNavContext);
  if (!value) {
    throw new Error("useCategoryImages must be used within MobileNavProvider");
  }
  return value.categoryImages;
}
