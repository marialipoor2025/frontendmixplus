"use client";

import { useMemo, useState } from "react";
import {
  AdminButton,
  AdminOutlineButton,
  AdminPageHeader,
  AdminTable,
  type AdminColumn,
} from "@/components/admin/AdminUi";
import { RequireAdmin } from "@/components/admin/RequireAdmin";
import type { AdminPermission } from "@/types/admin";
import { paginateLocal } from "@/types/paging";

type Props<T extends { id: string }> = {
  permission: AdminPermission;
  title: string;
  description: string;
  createLabel?: string;
  columns: AdminColumn<T>[];
  rows: T[];
};

/** List + mock create/edit toast for admin CRUD screens (client-paged until APIs exist). */
export function AdminResourcePage<T extends { id: string }>({
  permission,
  title,
  description,
  createLabel = "افزودن",
  columns,
  rows,
}: Props<T>) {
  const [notice, setNotice] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const paged = useMemo(
    () => paginateLocal(rows, page, pageSize),
    [rows, page, pageSize],
  );

  function flash(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2200);
  }

  const fittedColumns = columns.map((col, index) => ({
    ...col,
    widthClass:
      col.widthClass ??
      (index === 0
        ? "w-[28%]"
        : index === columns.length - 1
          ? "w-[12%]"
          : undefined),
    cell: (row: T) => {
      const content = col.cell(row);
      if (typeof content === "string" || typeof content === "number") {
        return (
          <span className="block truncate text-xs" title={String(content)}>
            {content}
          </span>
        );
      }
      return content;
    },
  }));

  return (
    <RequireAdmin permission={permission}>
      <AdminPageHeader
        title={title}
        description={description}
        actions={
          <>
            <AdminOutlineButton type="button" onClick={() => flash("خروجی mock آماده شد")}>
              خروجی
            </AdminOutlineButton>
            <AdminButton type="button" onClick={() => flash("فرم ایجاد (mock) — بک‌اند به‌زودی")}>
              {createLabel}
            </AdminButton>
          </>
        }
      />
      {notice ? (
        <div className="mb-3 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-800">
          {notice}
        </div>
      ) : null}
      <AdminTable
        columns={fittedColumns}
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
