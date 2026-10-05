"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AdminButton,
  AdminOutlineButton,
  AdminPageHeader,
  AdminTable,
  RowActions,
  type AdminColumn,
} from "@/components/admin/AdminUi";
import { RequireAdmin } from "@/components/admin/RequireAdmin";
import { siteConfig } from "@/config/site";
import { mockAdminInventory } from "@/lib/mocks/admin";
import type { AdminInventoryRow } from "@/types/admin";
import { paginateLocal } from "@/types/paging";

type ApiInventory = {
  id: string;
  sku: string;
  title: string;
  warehouse: string;
  onHand: number;
  reserved: number;
};

function apiBase() {
  return siteConfig.apiBaseUrl.replace(/\/$/, "");
}

async function listInventory(): Promise<AdminInventoryRow[] | null> {
  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) return null;
  try {
    const response = await fetch(`${apiBase()}/api/admin/catalog/inventory`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return null;
    const rows = (await response.json()) as ApiInventory[];
    return rows.map((r) => ({
      id: r.id,
      sku: r.sku,
      title: r.title,
      warehouse: r.warehouse,
      onHand: r.onHand,
      reserved: r.reserved,
    }));
  } catch {
    return null;
  }
}

async function adjustInventory(id: string, onHand: number): Promise<boolean> {
  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) return false;
  try {
    const response = await fetch(
      `${apiBase()}/api/admin/catalog/inventory/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ onHand }),
      },
    );
    return response.ok;
  } catch {
    return false;
  }
}

export default function AdminInventoryPage() {
  const [rows, setRows] = useState(mockAdminInventory);
  const [source, setSource] = useState<"mock" | "api">("mock");
  const [editing, setEditing] = useState<AdminInventoryRow | null>(null);
  const [onHand, setOnHand] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const live = await listInventory();
      if (!cancelled && live) {
        setRows(live);
        setSource("api");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const paged = useMemo(
    () => paginateLocal(rows, page, pageSize),
    [rows, page, pageSize],
  );

  const columns: AdminColumn<AdminInventoryRow>[] = [
    {
      key: "sku",
      header: "SKU",
      cell: (r) => <span dir="ltr">{r.sku}</span>,
    },
    { key: "title", header: "عنوان", cell: (r) => r.title },
    { key: "wh", header: "انبار", cell: (r) => r.warehouse },
    { key: "onHand", header: "موجودی", cell: (r) => r.onHand },
    { key: "reserved", header: "رزرو", cell: (r) => r.reserved },
    {
      key: "actions",
      header: "",
      cell: (r) => (
        <RowActions
          onEdit={() => {
            setEditing(r);
            setOnHand(String(r.onHand));
          }}
        />
      ),
    },
  ];

  return (
    <RequireAdmin permission="inventory:manage">
      <AdminPageHeader
        title="مدیریت موجودی"
        description={
          source === "api"
            ? "موجودی SKU از Catalog خوانده می‌شود"
            : "موجودی انبار و رزرو (mock تا اتصال API)"
        }
      />

      {notice ? (
        <p className="mb-3 rounded-lg bg-[var(--color-primary-soft)] px-3 py-2 text-sm text-[var(--color-primary)]">
          {notice}
        </p>
      ) : null}

      {editing ? (
        <form
          className="mb-4 space-y-3 rounded-xl border border-[var(--color-neutral-200)] bg-white p-4"
          onSubmit={(e) => {
            e.preventDefault();
            void (async () => {
              const next = Math.max(0, Number(onHand) || 0);
              const live = await adjustInventory(editing.id, next);
              setRows((prev) =>
                prev.map((x) =>
                  x.id === editing.id ? { ...x, onHand: next } : x,
                ),
              );
              setEditing(null);
              setNotice(
                live
                  ? "موجودی در Catalog به‌روز شد"
                  : "موجودی به‌روز شد (mock محلی)",
              );
              window.setTimeout(() => setNotice(null), 2000);
            })();
          }}
        >
          <h3 className="text-sm font-bold">تعدیل موجودی · {editing.sku}</h3>
          <label className="block space-y-1 text-sm">
            <span className="text-[var(--color-neutral-600)]">موجودی روی دست</span>
            <input
              required
              dir="ltr"
              type="number"
              min={0}
              value={onHand}
              onChange={(e) => setOnHand(e.target.value)}
              className="w-full max-w-xs rounded-lg border border-[var(--color-neutral-200)] px-3 py-2"
            />
          </label>
          <div className="flex gap-2">
            <AdminButton type="submit">ذخیره</AdminButton>
            <AdminOutlineButton type="button" onClick={() => setEditing(null)}>
              انصراف
            </AdminOutlineButton>
          </div>
        </form>
      ) : null}

      <AdminTable
        columns={columns}
        rows={paged.items}
        paging={{
          page: paged.page,
          pageSize: paged.pageSize,
          totalCount: paged.totalCount,
          totalPages: paged.totalPages,
          onPageChange: setPage,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setPage(1);
          },
        }}
      />
    </RequireAdmin>
  );
}
