"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminProductSpecsForm } from "@/components/admin/AdminProductSpecsForm";
import { AdminSpecForm } from "@/components/admin/AdminSpecForm";
import {
  AdminButton,
  AdminOutlineButton,
  AdminPageHeader,
  AdminTable,
  RowActions,
  type AdminColumn,
} from "@/components/admin/AdminUi";
import { RequireAdmin } from "@/components/admin/RequireAdmin";
import {
  listAdminSpecDefinitions,
  replaceProductSpecs,
} from "@/lib/api/specs";
import { mockAdminProductSpecs, mockAdminSpecs } from "@/lib/mocks/admin";
import type { AdminProductSpecs, AdminSpec } from "@/types/admin";
import { paginateLocal } from "@/types/paging";

export default function AdminSpecsPage() {
  const [definitions, setDefinitions] = useState(mockAdminSpecs);
  const [productDocs, setProductDocs] = useState(mockAdminProductSpecs);
  const [source, setSource] = useState<"mock" | "api">("mock");

  const [editingDef, setEditingDef] = useState<AdminSpec | null>(null);
  const [creatingDef, setCreatingDef] = useState(false);
  const [editingProduct, setEditingProduct] =
    useState<AdminProductSpecs | null>(null);
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const live = await listAdminSpecDefinitions();
      if (!cancelled && live?.length) {
        setDefinitions(live);
        setSource("api");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const paged = useMemo(
    () => paginateLocal(definitions, page, pageSize),
    [definitions, page, pageSize],
  );

  const defColumns: AdminColumn<AdminSpec>[] = [
    { key: "name", header: "ویژگی", cell: (r) => r.name },
    { key: "group", header: "گروه", cell: (r) => r.group },
    { key: "unit", header: "واحد", cell: (r) => r.unit },
    { key: "category", header: "دسته", cell: (r) => r.category },
    {
      key: "actions",
      header: "",
      cell: (r) => (
        <RowActions
          onEdit={() => {
            setCreatingDef(false);
            setEditingDef(r);
            setCreatingProduct(false);
            setEditingProduct(null);
          }}
          onDelete={() => {
            setDefinitions((prev) => prev.filter((x) => x.id !== r.id));
            setNotice("ویژگی از دیکشنری حذف شد (mock محلی)");
            window.setTimeout(() => setNotice(null), 2000);
          }}
        />
      ),
    },
  ];

  const productColumns: AdminColumn<AdminProductSpecs & { id: string }>[] = [
    { key: "title", header: "محصول", cell: (r) => r.productTitle },
    {
      key: "key",
      header: "کلید",
      cell: (r) => <span dir="ltr">{r.productKey}</span>,
    },
    {
      key: "groups",
      header: "گروه‌ها",
      cell: (r) => `${r.groups.length.toLocaleString("fa-IR")} گروه`,
    },
    {
      key: "attrs",
      header: "ویژگی‌ها",
      cell: (r) =>
        r.groups
          .reduce((n, g) => n + g.attributes.length, 0)
          .toLocaleString("fa-IR"),
    },
    {
      key: "actions",
      header: "",
      cell: (r) => (
        <RowActions
          onEdit={() => {
            setCreatingProduct(false);
            setEditingProduct(r);
            setCreatingDef(false);
            setEditingDef(null);
          }}
          onDelete={() => {
            setProductDocs((prev) =>
              prev.filter((x) => x.productKey !== r.productKey),
            );
            setNotice("مشخصات محصول حذف شد (mock محلی)");
            window.setTimeout(() => setNotice(null), 2000);
          }}
        />
      ),
    },
  ];

  const productRows = productDocs.map((d) => ({ ...d, id: d.productKey }));

  return (
    <RequireAdmin permission="specs:manage">
      <AdminPageHeader
        title="مدیریت مشخصات"
        description={
          source === "api"
            ? "دیکشنری ویژگی‌ها از API — ویرایش گروه‌های محصول برای PDP"
            : "دیکشنری ویژگی + مشخصات گروه‌بندی‌شده محصول (مطابق بخش مشخصات PDP)"
        }
        actions={
          <>
            <AdminOutlineButton
              type="button"
              onClick={() => {
                setCreatingDef(false);
                setEditingDef(null);
                setCreatingProduct(false);
                setEditingProduct(null);
              }}
            >
              بستن فرم
            </AdminOutlineButton>
            <AdminOutlineButton
              type="button"
              onClick={() => {
                setEditingDef(null);
                setCreatingDef(true);
                setCreatingProduct(false);
                setEditingProduct(null);
              }}
            >
              ویژگی دیکشنری
            </AdminOutlineButton>
            <AdminButton
              type="button"
              onClick={() => {
                setEditingProduct(null);
                setCreatingProduct(true);
                setCreatingDef(false);
                setEditingDef(null);
              }}
            >
              مشخصات محصول
            </AdminButton>
          </>
        }
      />

      {notice ? (
        <p className="mb-3 rounded-lg bg-[var(--color-primary-soft)] px-3 py-2 text-sm text-[var(--color-primary)]">
          {notice}
        </p>
      ) : null}

      {creatingDef || editingDef ? (
        <div className="mb-4">
          <AdminSpecForm
            initial={editingDef}
            onCancel={() => {
              setCreatingDef(false);
              setEditingDef(null);
            }}
            onSave={(spec) => {
              setDefinitions((prev) => {
                const exists = prev.some((x) => x.id === spec.id);
                return exists
                  ? prev.map((x) => (x.id === spec.id ? spec : x))
                  : [spec, ...prev];
              });
              setCreatingDef(false);
              setEditingDef(null);
              setNotice("ویژگی دیکشنری ذخیره شد");
              window.setTimeout(() => setNotice(null), 2000);
            }}
          />
        </div>
      ) : null}

      {creatingProduct || editingProduct ? (
        <div className="mb-4">
          <AdminProductSpecsForm
            initial={editingProduct}
            onCancel={() => {
              setCreatingProduct(false);
              setEditingProduct(null);
            }}
            onSave={async (doc) => {
              const live = await replaceProductSpecs(doc);
              setProductDocs((prev) => {
                const exists = prev.some((x) => x.productKey === doc.productKey);
                return exists
                  ? prev.map((x) =>
                      x.productKey === doc.productKey ? doc : x,
                    )
                  : [doc, ...prev];
              });
              setCreatingProduct(false);
              setEditingProduct(null);
              setNotice(
                live
                  ? "مشخصات محصول در Catalog ذخیره شد"
                  : "مشخصات محصول ذخیره شد (mock محلی — بک‌اند مرحله بعد)",
              );
              window.setTimeout(() => setNotice(null), 2200);
            }}
          />
        </div>
      ) : null}

      <h2 className="mb-2 text-sm font-bold text-[var(--color-neutral-800)]">
        مشخصات متصل به محصول
      </h2>
      <div className="mb-6">
        <AdminTable
          columns={productColumns}
          rows={productRows}
          empty="هنوز مشخصات محصولی ثبت نشده"
        />
      </div>

      <h2 className="mb-2 text-sm font-bold text-[var(--color-neutral-800)]">
        دیکشنری ویژگی‌ها
      </h2>
      <AdminTable
        columns={defColumns}
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
