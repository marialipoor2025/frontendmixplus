"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminVariantForm } from "@/components/admin/AdminVariantForm";
import {
  AdminButton,
  AdminOutlineButton,
  AdminPageHeader,
  AdminTable,
  RowActions,
  priceCell,
  type AdminColumn,
} from "@/components/admin/AdminUi";
import { RequireAdmin } from "@/components/admin/RequireAdmin";
import { listAdminVariants } from "@/lib/api/variants";
import { mockAdminVariants } from "@/lib/mocks/admin";
import type { AdminVariant } from "@/types/admin";
import { paginateLocal } from "@/types/paging";

export default function AdminVariantsPage() {
  const [rows, setRows] = useState(mockAdminVariants);
  const [source, setSource] = useState<"mock" | "api">("mock");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const live = await listAdminVariants();
      if (!cancelled && live) {
        setRows(live);
        setSource("api");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  const [editing, setEditing] = useState<AdminVariant | null>(null);
  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const paged = useMemo(
    () => paginateLocal(rows, page, pageSize),
    [rows, page, pageSize],
  );

  const columns: AdminColumn<AdminVariant>[] = [
    { key: "product", header: "محصول", cell: (r) => r.productTitle },
    {
      key: "sku",
      header: "SKU",
      cell: (r) => <span dir="ltr">{r.sku}</span>,
    },
    { key: "attrs", header: "ویژگی‌ها", cell: (r) => r.attributes },
    { key: "price", header: "قیمت", cell: (r) => priceCell(r.price) },
    {
      key: "stock",
      header: "موجودی",
      cell: (r) =>
        r.inStock ? (
          r.stock
        ) : (
          <span className="text-[var(--color-hint-object-error)]">ناموجود</span>
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
            setRows((prev) => prev.filter((x) => x.id !== r.id));
            setNotice("تنوع حذف شد (mock محلی)");
            window.setTimeout(() => setNotice(null), 2000);
          }}
        />
      ),
    },
  ];

  return (
    <RequireAdmin permission="variants:manage">
      <AdminPageHeader
        title="مدیریت تنوع‌ها"
        description={
          source === "api"
            ? "داده‌ها از Catalog API خوانده می‌شوند"
            : "تنوع رنگ، ظرفیت و سایر ترکیب‌های فروش (mock تا اتصال کامل API)"
        }
        actions={
          <>
            <AdminOutlineButton
              type="button"
              onClick={() => {
                setEditing(null);
                setCreating(false);
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
              تنوع جدید
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
          <AdminVariantForm
            initial={editing}
            onCancel={() => {
              setCreating(false);
              setEditing(null);
            }}
            onSave={(variant) => {
              setRows((prev) => {
                const exists = prev.some((x) => x.id === variant.id);
                return exists
                  ? prev.map((x) => (x.id === variant.id ? variant : x))
                  : [variant, ...prev];
              });
              setCreating(false);
              setEditing(null);
              setNotice("تنوع ذخیره شد (mock محلی — بک‌اند مرحله بعد)");
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
