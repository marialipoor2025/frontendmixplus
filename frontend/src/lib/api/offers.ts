import { siteConfig } from "@/config/site";
import type { AdminOffer } from "@/types/admin";

type ApiOffer = {
  id: string;
  seller: string;
  product: string;
  price: number;
  stock: number;
  status: string;
};

function apiBase() {
  return siteConfig.apiBaseUrl.replace(/\/$/, "");
}

function mapOffer(row: ApiOffer): AdminOffer {
  return {
    id: row.id,
    seller: row.seller,
    product: row.product,
    price: row.price,
    stock: row.stock,
    status: row.status === "paused" ? "paused" : "active",
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
    return ((await response.json()) as ApiOffer[]).map(mapOffer);
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
    return mapOffer((await response.json()) as ApiOffer);
  } catch {
    return null;
  }
}
