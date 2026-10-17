import { siteConfig } from "@/config/site";
import type { AdminCmsItem, AdminCmsSlot } from "@/types/admin";

type ApiCms = {
  id: string;
  title: string;
  kind: string;
  slot?: string;
  status: string;
  updatedAt: string;
  imageUrl?: string;
  href?: string;
  alt?: string;
  sortOrder?: number;
};

function apiBase() {
  return siteConfig.apiBaseUrl.replace(/\/$/, "");
}

function mapSlot(raw?: string): AdminCmsSlot {
  if (raw === "top" || raw === "mid" || raw === "bottom" || raw === "hero") {
    return raw;
  }
  return "hero";
}

function mapCms(row: ApiCms): AdminCmsItem {
  return {
    id: row.id,
    title: row.title,
    kind: row.kind === "page" || row.kind === "blog" ? row.kind : "banner",
    slot: mapSlot(row.slot),
    status: row.status === "draft" ? "draft" : "published",
    updatedAt: row.updatedAt,
    imageUrl: row.imageUrl,
    href: row.href,
    alt: row.alt,
    sortOrder: row.sortOrder,
  };
}

export async function listAdminCms(): Promise<AdminCmsItem[] | null> {
  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) {
    const { mockAdminCms } = await import("@/lib/mocks/admin");
    return mockAdminCms;
  }
  try {
    const response = await fetch(`${apiBase()}/api/admin/merchandising/cms`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return null;
    return ((await response.json()) as ApiCms[]).map(mapCms);
  } catch {
    return null;
  }
}

export async function upsertAdminCms(
  item: AdminCmsItem,
): Promise<AdminCmsItem | null> {
  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) return null;
  const isUpdate = Boolean(item.id) && !item.id.startsWith("cms-local");
  const body = {
    id: item.id || null,
    title: item.title,
    status: item.status,
    slot: item.slot ?? "hero",
    imageUrl: item.imageUrl ?? null,
    href: item.href ?? "/",
    alt: item.alt ?? item.title,
    sortOrder: item.sortOrder ?? null,
  };
  try {
    const response = await fetch(
      isUpdate
        ? `${apiBase()}/api/admin/merchandising/cms/${encodeURIComponent(item.id)}`
        : `${apiBase()}/api/admin/merchandising/cms`,
      {
        method: isUpdate ? "PUT" : "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );
    if (!response.ok) return null;
    return mapCms((await response.json()) as ApiCms);
  } catch {
    return null;
  }
}

export async function deleteAdminCms(id: string): Promise<boolean> {
  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) return false;
  try {
    const response = await fetch(
      `${apiBase()}/api/admin/merchandising/cms/${encodeURIComponent(id)}`,
      { method: "DELETE" },
    );
    return response.ok;
  } catch {
    return false;
  }
}
