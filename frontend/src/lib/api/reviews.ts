import { siteConfig } from "@/config/site";
import type { AdminReview } from "@/types/admin";
import type { ProductComment } from "@/types/product-detail";

export type SubmitProductReviewInput = {
  rating: number;
  body: string;
  isAnonymous: boolean;
  customerName: string;
};

type ApiReview = {
  id: string;
  product: string;
  customer: string;
  rating: number;
  excerpt: string;
  status: string;
};

type ApiStorefrontReview = {
  id: string;
  authorName: string;
  rating: number;
  body: string;
  dateLabel: string;
  isAnonymous?: boolean;
  isPending?: boolean;
};

function apiBase() {
  return siteConfig.apiBaseUrl.replace(/\/$/, "");
}

function mapAdminReview(row: ApiReview): AdminReview {
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

function mapStorefrontReview(row: ApiStorefrontReview): ProductComment {
  return {
    id: row.id,
    authorName: row.authorName,
    dateLabel: row.dateLabel,
    rating: row.rating,
    body: row.body,
    likes: 0,
    dislikes: 0,
    expertLabel: row.isPending ? "در انتظار تایید" : undefined,
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
    return ((await response.json()) as ApiReview[]).map(mapAdminReview);
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
    return mapAdminReview((await response.json()) as ApiReview);
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
    return mapAdminReview((await response.json()) as ApiReview);
  } catch {
    return null;
  }
}

/** Approved storefront reviews for a product PDP. */
export async function getProductReviews(
  productSlug: string,
): Promise<ProductComment[]> {
  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) return [];

  const res = await fetch(
    `${apiBase()}/api/catalog/products/${encodeURIComponent(productSlug)}/reviews`,
    { next: { revalidate: 60 } },
  );
  if (!res.ok) return [];
  const rows = (await res.json()) as ApiStorefrontReview[];
  return rows.map(mapStorefrontReview);
}

/** Submit a new product review (pending moderation). */
export async function submitProductReview(
  productSlug: string,
  input: SubmitProductReviewInput,
): Promise<{ ok: true; message: string } | { ok: false; error: string }> {
  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) {
    return {
      ok: true,
      message: "دیدگاه شما ثبت شد و پس از بررسی نمایش داده می‌شود.",
    };
  }

  const res = await fetch(
    `${apiBase()}/api/catalog/products/${encodeURIComponent(productSlug)}/reviews`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rating: input.rating,
        body: input.body,
        isAnonymous: input.isAnonymous,
        customerName: input.customerName,
      }),
    },
  );

  if (!res.ok) {
    const payload = (await res.json().catch(() => null)) as {
      error?: string;
    } | null;
    return { ok: false, error: payload?.error ?? "ثبت دیدگاه ناموفق بود." };
  }

  const payload = (await res.json()) as { message?: string };
  return {
    ok: true,
    message:
      payload.message ??
      "دیدگاه شما ثبت شد و پس از بررسی نمایش داده می‌شود.",
  };
}
