import { siteConfig } from "@/config/site";
import { mockHomePageData } from "@/lib/mocks/home";
import type { HomePageData } from "@/types/home";
import { apiClient } from "./client";

/**
 * Home page data source.
 * - Mock mode (default): returns local fixtures
 * - Live mode: GET /api/home from ASP.NET Core
 */
export async function getHomePageData(): Promise<HomePageData> {
  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) {
    return mockHomePageData;
  }

  return apiClient<HomePageData>("/api/home");
}
