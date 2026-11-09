import Link from "next/link";
import type { ReactNode } from "react";
import {
  AdminCard,
  AdminOutlineButton,
  AdminPageHeader,
} from "@/components/admin/AdminUi";

export function SellerModulePlaceholder({
  title,
  description,
  moduleOwner,
  highlights,
  primaryHref,
  primaryLabel,
}: {
  title: string;
  description: string;
  moduleOwner: string;
  highlights: string[];
  primaryHref?: string;
  primaryLabel?: string;
}) {
  return (
    <div className="space-y-4" dir="rtl">
      <AdminPageHeader
        title={title}
        description={description}
        actions={
          primaryHref && primaryLabel ? (
            <Link href={primaryHref}>
              <AdminOutlineButton type="button">{primaryLabel}</AdminOutlineButton>
            </Link>
          ) : undefined
        }
      />
      <AdminCard>
        <p className="text-xs text-[var(--color-muted)]">مالک ماژول بک‌اند</p>
        <p className="mt-1 text-sm font-bold text-[var(--color-neutral-900)]">
          {moduleOwner}
        </p>
        <ul className="mt-4 space-y-2 text-sm leading-7 text-[var(--color-neutral-700)]">
          {highlights.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </AdminCard>
    </div>
  );
}

export function SellerStatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
}) {
  return (
    <AdminCard>
      <p className="text-xs text-[var(--color-muted)]">{label}</p>
      <p className="mt-2 text-xl font-bold text-[var(--color-neutral-900)]">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-[11px] text-[var(--color-muted)]">{hint}</p>
      ) : null}
    </AdminCard>
  );
}
