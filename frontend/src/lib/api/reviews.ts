import { siteConfig } from "@/config/site";
import type { AdminReview } from "@/types/admin";

type ApiReview = {
  id: string;
  product: string;
  customer: string;
  rating: number;
  excerpt: string;
  status: string;
};

function apiBase() {
  return siteConfig.apiBaseUrl.replace(/\/$/, "");
}

function mapReview(row: ApiReview): AdminReview {
  const status =
    row.status === "approved" || row.status === "rejected"
      ? row.status
      : "pending";
  return {
    id: row.id,
    product: row.product,
    customer: row.customer,
    rating: row.rating,
    excerpt: row.excerpt,
    status,
  };
}

export async function listAdminReviews(): Promise<AdminReview[] | null> {
  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) {
    const { mockAdminReviews } = await import("@/lib/mocks/admin");
    return mockAdminReviews;
  }
  try {
    const response = await fetch(`${apiBase()}/api/admin/catalog/reviews`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return null;
    return ((await response.json()) as ApiReview[]).map(mapReview);
  } catch {
    return null;
  }
}

export async function setAdminReviewStatus(
  id: string,
  status: AdminReview["status"],
): Promise<AdminReview | null> {
  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) return null;
  try {
    const response = await fetch(
      `${apiBase()}/api/admin/catalog/reviews/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      },
    );
    if (!response.ok) return null;
    return mapReview((await response.json()) as ApiReview);
  } catch {
    return null;
  }
}

export async function createAdminReview(
  review: Omit<AdminReview, "id"> & { id?: string },
): Promise<AdminReview | null> {
  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) return null;
  try {
    const response = await fetch(`${apiBase()}/api/admin/catalog/reviews`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(review),
    });
    if (!response.ok) return null;
    return mapReview((await response.json()) as ApiReview);
  } catch {
    return null;
  }
}
