import { siteConfig } from "@/config/site";
import type { AdminOrder } from "@/types/admin";

type ApiOrder = {
  id: string;
  customer: string;
  total: number;
  status: string;
  createdAt: string;
};

function apiBase() {
  return siteConfig.apiBaseUrl.replace(/\/$/, "");
}

function mapOrder(row: ApiOrder): AdminOrder {
  const status =
    row.status === "processing" ||
    row.status === "shipped" ||
    row.status === "delivered" ||
    row.status === "cancelled"
      ? row.status
      : "new";
  return {
    id: row.id,
    customer: row.customer,
    total: row.total,
    status,
    createdAt: row.createdAt,
  };
}

export async function listAdminOrders(): Promise<AdminOrder[] | null> {
  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) {
    const { mockAdminOrders } = await import("@/lib/mocks/admin");
    return mockAdminOrders;
  }
  try {
    const response = await fetch(`${apiBase()}/api/admin/orders`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return null;
    return ((await response.json()) as ApiOrder[]).map(mapOrder);
  } catch {
    return null;
  }
}

export async function createAdminOrder(
  order: Omit<AdminOrder, "id" | "createdAt"> & { id?: string },
): Promise<AdminOrder | null> {
  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) return null;
  try {
    const response = await fetch(`${apiBase()}/api/admin/orders`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(order),
    });
    if (!response.ok) return null;
    return mapOrder((await response.json()) as ApiOrder);
  } catch {
    return null;
  }
}

export async function setAdminOrderStatus(
  id: string,
  status: AdminOrder["status"],
): Promise<AdminOrder | null> {
  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) return null;
  try {
    const response = await fetch(
      `${apiBase()}/api/admin/orders/${encodeURIComponent(id)}/status`,
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
    return mapOrder((await response.json()) as ApiOrder);
  } catch {
    return null;
  }
}
