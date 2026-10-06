"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { GradientFrame } from "@/components/profile/ProfileShell";
import { formatPrice } from "@/lib/format";
import type { PagedResult } from "@/types/paging";

export function AdminCard({
  children,
  className = "",
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <GradientFrame className={className}>
      <div
        className={[
          "rounded-[11px] bg-white",
          padded ? "p-4 lg:p-5" : "",
        ].join(" ")}
      >
        {children}
      </div>
    </GradientFrame>
  );
}

export function AdminButton({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={[
        "inline-flex items-center justify-center rounded-lg bg-gradient-to-l from-[#1672dd] to-[#ed1944] px-4 py-2.5 text-xs font-bold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export function AdminOutlineButton({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <GradientFrame radius="rounded-lg" className={`inline-flex max-w-full ${className}`}>
      <button
        {...props}
        className="inline-flex max-w-full items-center justify-center rounded-[7px] bg-white px-3 py-1.5 text-xs font-medium text-[var(--color-neutral-800)] transition hover:bg-[var(--color-neutral-50)] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {children}
      </button>
    </GradientFrame>
  );
}

export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-base font-bold text-[var(--color-neutral-900)] lg:text-lg">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-xs text-[var(--color-muted)] lg:text-sm">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export type AdminColumn<T> = {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  /** Tailwind width utility, e.g. w-[28%] or w-28 */
  widthClass?: string;
  className?: string;
  /** Prevent wrap / keep compact cells */
  nowrap?: boolean;
};

export function AdminPagination({
  page,
  pageSize,
  totalCount,
  totalPages,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
}: {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
}) {
  const from = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalCount);

  return (
    <div className="flex flex-col gap-3 border-t border-[var(--color-neutral-100)] px-4 py-3 text-xs text-[var(--color-muted)] sm:flex-row sm:items-center sm:justify-between lg:px-5">
      <p>
        نمایش {from.toLocaleString("fa-IR")} تا {to.toLocaleString("fa-IR")} از{" "}
        {totalCount.toLocaleString("fa-IR")} مورد
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {onPageSizeChange ? (
          <label className="flex items-center gap-1.5">
            <span>در هر صفحه</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="rounded-md border border-[var(--color-border)] bg-white px-2 py-1 text-xs text-[var(--color-neutral-800)]"
            >
              {pageSizeOptions.map((n) => (
                <option key={n} value={n}>
                  {n.toLocaleString("fa-IR")}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <div className="flex items-center gap-1">
          <AdminOutlineButton
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            قبلی
          </AdminOutlineButton>
          <span className="min-w-16 px-2 text-center text-[var(--color-neutral-700)]">
            {page.toLocaleString("fa-IR")} /{" "}
            {Math.max(totalPages, 1).toLocaleString("fa-IR")}
          </span>
          <AdminOutlineButton
            type="button"
            disabled={totalPages === 0 || page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            بعدی
          </AdminOutlineButton>
        </div>
      </div>
    </div>
  );
}

export function AdminTable<T extends { id: string }>({
  columns,
  rows,
  empty = "موردی یافت نشد",
  paging,
}: {
  columns: AdminColumn<T>[];
  rows: T[];
  empty?: string;
  paging?: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
  };
}) {
  if (!rows.length) {
    return (
      <AdminCard padded={false}>
        <p className="px-4 py-10 text-center text-sm text-[var(--color-muted)] lg:px-5">
          {empty}
        </p>
        {paging ? <AdminPagination {...paging} /> : null}
      </AdminCard>
    );
  }

  return (
    <AdminCard className="overflow-hidden" padded={false}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] table-fixed border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--color-neutral-100)] bg-[var(--color-neutral-50)] text-[var(--color-muted)]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={[
                    "px-3 py-3 text-start text-xs font-medium lg:px-4",
                    col.widthClass ?? "",
                    col.nowrap ? "whitespace-nowrap" : "",
                    col.className ?? "",
                  ].join(" ")}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-[var(--color-neutral-100)] last:border-0"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={[
                      "max-w-0 px-3 py-2.5 align-middle text-[var(--color-neutral-800)] lg:px-4",
                      col.widthClass ?? "",
                      col.nowrap ? "whitespace-nowrap" : "",
                      col.className ?? "",
                    ].join(" ")}
                  >
                    <div className="min-w-0 overflow-hidden">{col.cell(row)}</div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {paging ? <AdminPagination {...paging} /> : null}
    </AdminCard>
  );
}

export function StatusPill({
  tone,
  children,
}: {
  tone: "success" | "warn" | "muted" | "danger" | "info";
  children: ReactNode;
}) {
  const tones = {
    success: "bg-emerald-50 text-emerald-700",
    warn: "bg-amber-50 text-amber-800",
    muted: "bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)]",
    danger: "bg-red-50 text-red-700",
    info: "bg-sky-50 text-sky-800",
  };
  return (
    <span
      className={`inline-flex max-w-full truncate rounded-md px-2 py-0.5 text-[11px] font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function priceCell(amount: number) {
  return (
    <span dir="ltr" className="block truncate tabular-nums">
      {formatPrice(amount)}
    </span>
  );
}

export function RowActions({
  onEdit,
  onDelete,
}: {
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  return (
    <div className="flex gap-2">
      {onEdit ? (
        <AdminOutlineButton type="button" onClick={onEdit}>
          ویرایش
        </AdminOutlineButton>
      ) : null}
      {onDelete ? (
        <AdminOutlineButton type="button" onClick={onDelete}>
          حذف
        </AdminOutlineButton>
      ) : null}
    </div>
  );
}

export type { PagedResult };
