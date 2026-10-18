import { apiClient } from "@/lib/api/client";
import { siteConfig } from "@/config/site";

export type AdminRail = {
  id: string;
  title: string;
  subtitle?: string | null;
  href?: string | null;
  showUsedLabel: boolean;
  showReviewScore: boolean;
  showCardLabels: boolean;
  labelPosition: "beside" | "top" | string;
  sortOrder: number;
  isActive: boolean;
  productKeys: string[];
};

function enabled() {
  return !siteConfig.useMocks && Boolean(siteConfig.apiBaseUrl);
}

export async function listAdminRails(): Promise<AdminRail[] | null> {
  if (!enabled()) return null;
  try {
    return await apiClient<AdminRail[]>("/api/admin/merchandising/rails", {
      auth: true,
    });
  } catch {
    return null;
  }
}

export async function upsertAdminRail(rail: AdminRail): Promise<AdminRail> {
  const body = {
    id: rail.id || null,
    title: rail.title,
    subtitle: rail.subtitle || null,
    href: rail.href || null,
    showUsedLabel: rail.showUsedLabel,
    showReviewScore: rail.showReviewScore,
    showCardLabels: rail.showCardLabels,
    labelPosition: rail.labelPosition || "beside",
    sortOrder: rail.sortOrder,
    isActive: rail.isActive,
    productKeys: rail.productKeys ?? [],
  };

  if (rail.id) {
    return apiClient<AdminRail>(
      `/api/admin/merchandising/rails/${encodeURIComponent(rail.id)}`,
      {
        method: "PUT",
        auth: true,
        body: JSON.stringify(body),
      },
    );
  }

  return apiClient<AdminRail>("/api/admin/merchandising/rails", {
    method: "POST",
    auth: true,
    body: JSON.stringify(body),
  });
}

export async function deleteAdminRail(id: string): Promise<boolean> {
  if (!enabled()) return false;
  try {
    await apiClient(`/api/admin/merchandising/rails/${encodeURIComponent(id)}`, {
      method: "DELETE",
      auth: true,
    });
    return true;
  } catch {
    return false;
  }
}
