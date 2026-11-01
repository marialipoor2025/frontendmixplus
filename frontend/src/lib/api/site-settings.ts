import { siteConfig } from "@/config/site";
import { apiClient } from "@/lib/api/client";

export type SiteSettings = {
  siteName: string;
  siteUrl: string;
  blogUrl: string;
  supportEmail: string;
  defaultCurrency: string;
};

const defaults: SiteSettings = {
  siteName: "میکس پلاس",
  siteUrl: "https://mixplusshop.ir",
  blogUrl: "https://mixplusshop.ir",
  supportEmail: "support@mixplusshop.ir",
  defaultCurrency: "IRT",
};

export async function getSiteSettings(): Promise<SiteSettings> {
  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) return defaults;
  try {
    return await apiClient<SiteSettings>("/api/merchandising/site-settings");
  } catch {
    return defaults;
  }
}

export async function saveSiteSettings(
  settings: SiteSettings,
): Promise<SiteSettings | null> {
  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) return settings;
  try {
    return await apiClient<SiteSettings>("/api/admin/merchandising/site-settings", {
      method: "PUT",
      body: JSON.stringify(settings),
    });
  } catch {
    return null;
  }
}
