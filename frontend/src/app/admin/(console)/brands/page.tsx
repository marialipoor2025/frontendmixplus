"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminBrandForm } from "@/components/admin/AdminBrandForm";
import {
  AdminButton,
  AdminOutlineButton,
  AdminPageHeader,
  AdminTable,
  RowActions,
  StatusPill,
  type AdminColumn,
} from "@/components/admin/AdminUi";
import { RequireAdmin } from "@/components/admin/RequireAdmin";
import {
  deleteAdminBrand,
  listAdminBrandsFull,
  upsertAdminBrand,
} from "@/lib/api/brands";
import { siteConfig } from "@/config/site";
import { mockAdminBrands } from "@/lib/mocks/admin";
import type { AdminBrand } from "@/types/admin";
import { paginateLocal } from "@/types/paging";

export default function AdminBrandsPage() {
  const [rows, setRows] = useState(mockAdminBrands);
  const [source, setSource] = useState<"mock" | "api">(
    siteConfig.useMocks || !siteConfig.apiBaseUrl ? "mock" : "api",
  );
  const [editing, setEditing] = useState<AdminBrand | null>(null);
  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const live = await listAdminBrandsFull();
      if (!cancelled && live) {
        setRows(live);
        if (!siteConfig.useMocks && siteConfig.apiBaseUrl) {
          setSource("api");
        }
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

  const columns: AdminColumn<AdminBrand>[] = [
    { key: "name", header: "برند", cell: (r) => r.name },
    {
      key: "slug",
      header: "اسلاگ",
      cell: (r) => <span dir="ltr">{r.slug}</span>,
    },
    { key: "count", header: "تعداد محصول", cell: (r) => r.productCount },
    {
      key: "status",
      header: "وضعیت",
      cell: (r) => (
        <StatusPill tone={r.status === "active" ? "info" : "warn"}>
          {r.status === "active" ? "فعال" : "مخفی"}
        </StatusPill>
      ),
    },
    {
      key: "actions",
      header: "",
      cell: (r) => (
        <RowActions
          onEdit={() => {
            setCreating(false);
            setEditing(r);
          }}
          onDelete={() => {
            void (async () => {
              await deleteAdminBrand(r.id);
              setRows((prev) => prev.filter((x) => x.id !== r.id));
              setNotice("برند حذف شد");
              window.setTimeout(() => setNotice(null), 2000);
            })();
          }}
        />
      ),
    },
  ];

  return (
    <RequireAdmin permission="brands:manage">
      <AdminPageHeader
        title="مدیریت برندها"
        description={
          source === "api"
            ? "برندهای Catalog از API خوانده می‌شوند"
            : "برندها (mock تا اتصال کامل API)"
        }
        actions={
          <>
            <AdminOutlineButton
              type="button"
              onClick={() => {
                setCreating(false);
                setEditing(null);
              }}
            >
              بستن فرم
            </AdminOutlineButton>
            <AdminButton
              type="button"
              onClick={() => {
                setEditing(null);
                setCreating(true);
              }}
            >
              برند جدید
            </AdminButton>
          </>
        }
      />

      {notice ? (
        <p className="mb-3 rounded-lg bg-[var(--color-primary-soft)] px-3 py-2 text-sm text-[var(--color-primary)]">
          {notice}
        </p>
      ) : null}

      {creating || editing ? (
        <div className="mb-4">
          <AdminBrandForm
            initial={editing}
            onCancel={() => {
              setCreating(false);
              setEditing(null);
            }}
            onSave={async (brand) => {
              const live = await upsertAdminBrand(brand);
              const saved = live ?? brand;
              setRows((prev) => {
                const exists = prev.some((x) => x.id === saved.id);
                return exists
                  ? prev.map((x) => (x.id === saved.id ? saved : x))
                  : [saved, ...prev];
              });
              setCreating(false);
              setEditing(null);
              setNotice(
                live
                  ? "برند در Catalog ذخیره شد"
                  : "برند ذخیره شد (mock محلی)",
              );
              window.setTimeout(() => setNotice(null), 2200);
            }}
          />
        </div>
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
