import { siteConfig } from "@/config/site";
import { mockMainNavData } from "@/lib/mocks/nav";
import type { MainNavData } from "@/types/nav";
import { apiClient } from "./client";

export async function getMainNavData(): Promise<MainNavData> {
  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) {
    return mockMainNavData;
  }

  return apiClient<MainNavData>("/api/nav");
}
