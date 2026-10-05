import { siteConfig } from "@/config/site";
import type { AdminOffer } from "@/types/admin";
import type { ProductSellerOffer } from "@/types/product-detail";

type ApiAdminOffer = {
  id: string;
  seller: string;
  product: string;
  price: number;
  stock: number;
  status: string;
};

type ApiStorefrontOffer = {
  id: string;
  name: string;
  href: string;
  isOfficial?: boolean;
  performanceLabel: string;
  deliveryLabel: string;
  warranty: string;
  price: number;
  originalPrice?: number | null;
  discountPercent?: number | null;
  stats?: {
    memberSinceLabel: string;
    onTimeSupplyPercent: number;
    shipCommitmentPercent: number;
    noReturnPercent: number;
  } | null;
};

function apiBase() {
  return siteConfig.apiBaseUrl.replace(/\/$/, "");
}

function mapAdminOffer(row: ApiAdminOffer): AdminOffer {
  return {
    id: row.id,
    seller: row.seller,
    product: row.product,
    price: row.price,
    stock: row.stock,
    status: row.status === "paused" ? "paused" : "active",
  };
}

function mapStorefrontOffer(row: ApiStorefrontOffer): ProductSellerOffer {
  return {
    id: row.id,
    name: row.name,
    href: row.href,
    isOfficial: row.isOfficial,
    performanceLabel: row.performanceLabel,
    deliveryLabel: row.deliveryLabel,
    warranty: row.warranty,
    price: row.price,
    originalPrice: row.originalPrice ?? undefined,
    discountPercent: row.discountPercent ?? undefined,
    stats: row.stats
      ? {
          memberSinceLabel: row.stats.memberSinceLabel,
          onTimeSupplyPercent: row.stats.onTimeSupplyPercent,
          shipCommitmentPercent: row.stats.shipCommitmentPercent,
          noReturnPercent: row.stats.noReturnPercent,
        }
      : undefined,
  };
}

export async function listAdminOffers(): Promise<AdminOffer[] | null> {
  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) {
    const { mockAdminOffers } = await import("@/lib/mocks/admin");
    return mockAdminOffers;
  }
  try {
    const response = await fetch(`${apiBase()}/api/admin/catalog/offers`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return null;
    return ((await response.json()) as ApiAdminOffer[]).map(mapAdminOffer);
  } catch {
    return null;
  }
}

export async function setAdminOfferStatus(
  id: string,
  status: AdminOffer["status"],
): Promise<AdminOffer | null> {
  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) return null;
  try {
    const response = await fetch(
      `${apiBase()}/api/admin/catalog/offers/${encodeURIComponent(id)}`,
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
    return mapAdminOffer((await response.json()) as ApiAdminOffer);
  } catch {
    return null;
  }
}

/** Live marketplace offers for a PDP (#39). */
export async function getProductOffers(
  productSlug: string,
): Promise<ProductSellerOffer[]> {
  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) return [];

  const res = await fetch(
    `${apiBase()}/api/catalog/products/${encodeURIComponent(productSlug)}/offers`,
    { next: { revalidate: 60 } },
  );
  if (!res.ok) return [];
  const rows = (await res.json()) as ApiStorefrontOffer[];
  return rows.map(mapStorefrontOffer);
}
