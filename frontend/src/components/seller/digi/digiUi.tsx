"use client";

import Link from "next/link";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import { formatPrice } from "@/lib/format";

export function DigiPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-lg font-bold text-[var(--digi-text-strong)]">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-sm text-[var(--digi-muted)]">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}

export function DigiCard({
  children,
  className = "",
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-[var(--digi-radius)] border border-[var(--digi-border)] bg-[var(--digi-surface)] shadow-[var(--digi-shadow)]",
        padded ? "p-4 lg:p-5" : "",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

type DigiButtonVariant = "primary" | "outline" | "ghost" | "danger";

export function DigiButton({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: DigiButtonVariant;
}) {
  const variants: Record<DigiButtonVariant, string> = {
    primary:
      "border border-transparent bg-[var(--digi-primary)] text-white hover:bg-[var(--digi-primary-hover)] disabled:opacity-60",
    outline:
      "border border-[var(--digi-border-strong)] bg-white text-[var(--digi-text)] hover:border-[var(--digi-primary)] hover:text-[var(--digi-primary)] disabled:opacity-60",
    ghost:
      "border border-transparent bg-transparent text-[var(--digi-primary)] hover:bg-[var(--digi-primary-soft)] disabled:opacity-60",
    danger:
      "border border-transparent bg-[var(--digi-danger)] text-white hover:opacity-90 disabled:opacity-60",
  };

  return (
    <button
      type="button"
      className={[
        "digi-focus inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition",
        variants[variant],
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}

export function DigiBadge({
  tone = "muted",
  children,
}: {
  tone?: "success" | "warn" | "muted" | "danger" | "info";
  children: ReactNode;
}) {
  const tones = {
    success: "bg-[var(--digi-success-soft)] text-[var(--digi-success)]",
    warn: "bg-[var(--digi-warn-soft)] text-amber-900",
    muted: "bg-[var(--color-neutral-100)] text-[var(--digi-muted)]",
    danger: "bg-[var(--digi-danger-soft)] text-[var(--digi-danger)]",
    info: "bg-[var(--digi-primary-soft)] text-[var(--digi-primary)]",
  };
  return (
    <span
      className={`inline-flex max-w-full truncate rounded-md px-2 py-0.5 text-[11px] font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function DigiSearchInput({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={[
        "digi-focus w-full rounded-lg border border-[var(--digi-border)] bg-white px-3 py-2.5 text-sm text-[var(--digi-text)] outline-none placeholder:text-[var(--digi-muted)] focus:border-[var(--digi-primary)] sm:max-w-xs",
        className,
      ].join(" ")}
      {...props}
    />
  );
}

export function DigiSelect({
  className = "",
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={[
        "digi-focus rounded-lg border border-[var(--digi-border)] bg-white px-3 py-2.5 text-sm text-[var(--digi-text)] outline-none focus:border-[var(--digi-primary)]",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </select>
  );
}

export function DigiAlert({
  tone = "danger",
  children,
}: {
  tone?: "danger" | "warn" | "info";
  children: ReactNode;
}) {
  const tones = {
    danger:
      "border-[var(--digi-danger)]/30 bg-[var(--digi-danger-soft)] text-[var(--digi-danger)]",
    warn: "border-amber-200 bg-[var(--digi-warn-soft)] text-amber-900",
    info: "border-[var(--digi-primary-border)] bg-[var(--digi-primary-soft)] text-[var(--digi-primary)]",
  };
  return (
    <p className={`rounded-lg border px-3 py-2 text-sm ${tones[tone]}`}>
      {children}
    </p>
  );
}

export function DigiEmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-14 text-center">
      <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-[var(--digi-primary-soft)] text-[var(--digi-primary)]">
        <span className="text-lg font-bold" aria-hidden>
          ∅
        </span>
      </div>
      <p className="text-sm font-bold text-[var(--digi-text-strong)]">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-xs text-[var(--digi-muted)]">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function DigiStatCard({
  label,
  value,
  hint,
  href,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  href?: string;
}) {
  const body = (
    <>
      <p className="text-xs text-[var(--digi-muted)]">{label}</p>
      <p className="mt-2 text-xl font-bold tabular-nums text-[var(--digi-text-strong)]">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-[11px] text-[var(--digi-muted)]">{hint}</p>
      ) : null}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block rounded-[var(--digi-radius)] border border-[var(--digi-border)] bg-[var(--digi-surface)] p-4 shadow-[var(--digi-shadow)] transition hover:border-[var(--digi-primary)]"
      >
        {body}
      </Link>
    );
  }

  return <DigiCard>{body}</DigiCard>;
}

export type DigiColumn<T> = {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  widthClass?: string;
  nowrap?: boolean;
};

export function DigiPagination({
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
    <div className="flex flex-col gap-3 border-t border-[var(--digi-border)] px-4 py-3 text-xs text-[var(--digi-muted)] sm:flex-row sm:items-center sm:justify-between lg:px-5">
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
              className="rounded-md border border-[var(--digi-border)] bg-white px-2 py-1"
            >
              {pageSizeOptions.map((n) => (
                <option key={n} value={n}>
                  {n.toLocaleString("fa-IR")}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <DigiButton
          variant="outline"
          className="!px-2.5 !py-1 text-xs"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          قبلی
        </DigiButton>
        <span className="tabular-nums">
          {page.toLocaleString("fa-IR")} / {Math.max(totalPages, 1).toLocaleString("fa-IR")}
        </span>
        <DigiButton
          variant="outline"
          className="!px-2.5 !py-1 text-xs"
          disabled={page >= totalPages || totalPages === 0}
          onClick={() => onPageChange(page + 1)}
        >
          بعدی
        </DigiButton>
      </div>
    </div>
  );
}

export function DigiTable<T extends { id: string }>({
  columns,
  rows,
  empty = "موردی یافت نشد",
  emptyDescription,
  emptyAction,
  paging,
}: {
  columns: DigiColumn<T>[];
  rows: T[];
  empty?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
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
      <DigiCard padded={false}>
        <DigiEmptyState
          title={empty}
          description={emptyDescription}
          action={emptyAction}
        />
        {paging ? <DigiPagination {...paging} /> : null}
      </DigiCard>
    );
  }

  return (
    <DigiCard className="overflow-hidden" padded={false}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] table-fixed border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--digi-border)] bg-[var(--digi-bg)] text-[var(--digi-muted)]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={[
                    "px-3 py-3 text-start text-xs font-medium lg:px-4",
                    col.widthClass ?? "",
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
                className="border-b border-[var(--digi-border)] last:border-b-0 hover:bg-[var(--digi-primary-soft)]/40"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={[
                      "px-3 py-3 align-middle text-[var(--digi-text)] lg:px-4",
                      col.nowrap ? "whitespace-nowrap" : "",
                      col.widthClass ?? "",
                    ].join(" ")}
                  >
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {paging ? <DigiPagination {...paging} /> : null}
    </DigiCard>
  );
}

export function digiPriceCell(amount: number) {
  return (
    <span dir="ltr" className="block truncate tabular-nums">
      {formatPrice(amount)}
    </span>
  );
}
