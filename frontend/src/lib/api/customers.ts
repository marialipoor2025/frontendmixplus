import { siteConfig } from "@/config/site";
import type { AdminCustomer } from "@/types/admin";

type ApiCustomer = {
  id: string;
  name: string;
  phone: string;
  orders: number;
  status: string;
};

function apiBase() {
  return siteConfig.apiBaseUrl.replace(/\/$/, "");
}

function mapCustomer(row: ApiCustomer): AdminCustomer {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    orders: row.orders ?? 0,
    status: row.status === "blocked" ? "blocked" : "active",
  };
}

export async function listAdminCustomers(): Promise<AdminCustomer[] | null> {
  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) {
    const { mockAdminCustomers } = await import("@/lib/mocks/admin");
    return mockAdminCustomers;
  }
  try {
    const response = await fetch(`${apiBase()}/api/admin/customers`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return null;
    return ((await response.json()) as ApiCustomer[]).map(mapCustomer);
  } catch {
    return null;
  }
}

export async function setAdminCustomerBlocked(
  id: string,
  blocked: boolean,
): Promise<AdminCustomer | null> {
  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) return null;
  try {
    const response = await fetch(
      `${apiBase()}/api/admin/customers/${encodeURIComponent(id)}/block`,
      {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ blocked }),
      },
    );
    if (!response.ok) return null;
    return mapCustomer((await response.json()) as ApiCustomer);
  } catch {
    return null;
  }
}
