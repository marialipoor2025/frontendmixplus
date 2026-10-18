import { apiClient } from "@/lib/api/client";
import { siteConfig } from "@/config/site";
import { STATIC_PAGES } from "@/lib/static-pages";

export type CmsPage = {
  key: string;
  title: string;
  description: string;
  body: string;
  isPublished: boolean;
};

function enabled() {
  return !siteConfig.useMocks && Boolean(siteConfig.apiBaseUrl);
}

function fallbackFromStatic(key: string): CmsPage | null {
  const def = STATIC_PAGES[key];
  if (!def) return null;
  return {
    key,
    title: def.title,
    description: def.description,
    body: "",
    isPublished: true,
  };
}

export async function getCmsPage(key: string): Promise<CmsPage | null> {
  const normalized = key.replace(/^\/+/, "");
  if (enabled()) {
    try {
      return await apiClient<CmsPage>(
        `/api/cms/pages/${encodeURI(normalized)}`,
      );
    } catch {
      // fall through to static defaults
    }
  }
  return fallbackFromStatic(normalized);
}

export async function listAdminCmsPages(): Promise<CmsPage[] | null> {
  if (!enabled()) {
    return Object.entries(STATIC_PAGES).map(([key, def]) => ({
      key,
      title: def.title,
      description: def.description,
      body: "",
      isPublished: true,
    }));
  }
  try {
    return await apiClient<CmsPage[]>("/api/admin/cms/pages", { auth: true });
  } catch {
    return null;
  }
}

export async function upsertAdminCmsPage(page: CmsPage): Promise<CmsPage> {
  if (!enabled()) return page;
  return apiClient<CmsPage>(
    `/api/admin/cms/pages/${encodeURI(page.key)}`,
    {
      method: "PUT",
      auth: true,
      body: JSON.stringify(page),
    },
  );
}

export async function createAdminCmsPage(page: CmsPage): Promise<CmsPage> {
  if (!enabled()) return page;
  return apiClient<CmsPage>("/api/admin/cms/pages", {
    method: "POST",
    auth: true,
    body: JSON.stringify(page),
  });
}

export async function deleteAdminCmsPage(key: string): Promise<boolean> {
  if (!enabled()) return false;
  try {
    await apiClient(`/api/admin/cms/pages/${encodeURI(key)}`, {
      method: "DELETE",
      auth: true,
    });
    return true;
  } catch {
    return false;
  }
}
