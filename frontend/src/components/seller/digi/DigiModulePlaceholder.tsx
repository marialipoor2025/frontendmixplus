import Link from "next/link";
import { DigiButton, DigiCard, DigiPageHeader } from "@/components/seller/digi/digiUi";

export function DigiModulePlaceholder({
  title,
  description,
  highlights,
  primaryHref,
  primaryLabel,
}: {
  title: string;
  description: string;
  highlights: string[];
  primaryHref?: string;
  primaryLabel?: string;
}) {
  return (
    <div className="space-y-4" dir="rtl">
      <DigiPageHeader
        title={title}
        description={description}
        actions={
          primaryHref && primaryLabel ? (
            <Link href={primaryHref}>
              <DigiButton variant="outline">{primaryLabel}</DigiButton>
            </Link>
          ) : undefined
        }
      />
      <DigiCard>
        <p className="text-xs font-medium text-[var(--digi-primary)]">
          به‌زودی در پنل فروشندگان
        </p>
        <ul className="mt-3 space-y-2 text-sm leading-7 text-[var(--digi-text)]">
          {highlights.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--digi-primary)]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-[var(--digi-muted)]">
          فعلاً تمرکز روی ثبت کالا، موجودی و سفارش‌هاست تا فروشندگان بتوانند فروش
          را شروع کنند.
        </p>
      </DigiCard>
    </div>
  );
}
