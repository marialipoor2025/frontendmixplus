"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminCategoryForm } from "@/components/admin/AdminCategoryForm";
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
  deleteAdminCategory,
  listAdminCategories,
  upsertAdminCategory,
} from "@/lib/api/categories";
import { mockAdminCategories } from "@/lib/mocks/admin";
import type { AdminCategory } from "@/types/admin";
import { paginateLocal } from "@/types/paging";

export default function AdminCategoriesPage() {
  const [rows, setRows] = useState(mockAdminCategories);
  const [source, setSource] = useState<"mock" | "api">("mock");
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const live = await listAdminCategories();
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

  const columns: AdminColumn<AdminCategory>[] = [
    { key: "name", header: "دسته", cell: (r) => r.name },
    { key: "parent", header: "والد", cell: (r) => r.parent },
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
        <StatusPill tone={r.isActive ? "info" : "warn"}>
          {r.isActive ? "فعال" : "غیرفعال"}
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
              await deleteAdminCategory(r.id);
              setRows((prev) => prev.filter((x) => x.id !== r.id));
              setNotice("دسته حذف شد");
              window.setTimeout(() => setNotice(null), 2000);
            })();
          }}
        />
      ),
    },
  ];

  return (
    <RequireAdmin permission="categories:manage">
      <AdminPageHeader
        title="مدیریت دسته‌بندی‌ها"
        description={
          source === "api"
            ? "ساختار سلسله‌مراتبی دسته‌ها از Catalog API"
            : "ساختار سلسله‌مراتبی دسته‌ها (mock تا اتصال API)"
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
              دسته جدید
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
          <AdminCategoryForm
            initial={editing}
            parents={rows}
            onCancel={() => {
              setCreating(false);
              setEditing(null);
            }}
            onSave={async (category) => {
              const live = await upsertAdminCategory(category);
              const saved = live ?? category;
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
                  ? "دسته در Catalog ذخیره شد"
                  : "دسته ذخیره شد (mock محلی — بک‌اند مرحله بعد)",
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
