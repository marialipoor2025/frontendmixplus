"use client";

import { useState } from "react";
import { ChevronLeftIcon } from "@/components/layout/icons";
import { ProductSectionTitle } from "@/components/product/ProductSectionTitle";
import type { ProductSpecGroup } from "@/types/product-detail";

type ProductSpecsProps = {
  groups: ProductSpecGroup[];
};

function SpecRow({
  label,
  values,
}: {
  label: string;
  values: string[];
}) {
  return (
    <div className="flex w-full">
      <p className="ml-4 w-[140px] shrink-0 py-2 text-[13px] leading-[2.15] text-[var(--color-neutral-500)] lg:p-2 lg:py-3">
        {label}
      </p>
      <div className="grow border-b border-[var(--color-neutral-200)] py-2 lg:py-3">
        {values.map((value) => (
          <p
            key={value}
            className="flex w-full items-center break-words text-[13px] leading-[2.15] text-[var(--color-neutral-900)]"
          >
            {values.length > 1 ? (
              <span className="ml-2 size-1.5 shrink-0 rounded-full bg-[var(--color-neutral-700)]" />
            ) : null}
            {value}
          </p>
        ))}
      </div>
    </div>
  );
}

/**
 * «مشخصات» attribute tables with expand for long groups.
 */
export function ProductSpecs({ groups }: ProductSpecsProps) {
  const [expanded, setExpanded] = useState(false);
  const hasHidden = groups.some(
    (g) => (g.previewCount ?? g.attributes.length) < g.attributes.length,
  );

  return (
    <section
      id="pdp-specs"
      className="scroll-mt-40 border-b border-[var(--color-neutral-200)] px-5 pb-5 lg:mt-4 lg:px-0"
    >
      <div className="hidden lg:block">
        <ProductSectionTitle title="مشخصات" />
      </div>

      <div className="mt-4 grow">
        {groups.map((group) => {
          const limit = group.previewCount ?? group.attributes.length;
          const rows = expanded
            ? group.attributes
            : group.attributes.slice(0, limit);

          return (
            <div
              key={group.id}
              className="flex flex-col pb-6 lg:flex-row lg:py-4"
            >
              <p className="mb-3 w-full shrink-0 text-sm font-medium leading-[1.8] text-[var(--color-neutral-700)] lg:mb-0 lg:ml-12 lg:w-40">
                {group.title}
              </p>
              <div className="w-full grow">
                {rows.map((attr) => (
                  <SpecRow
                    key={attr.id}
                    label={attr.label}
                    values={attr.values}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {hasHidden ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="inline-flex cursor-pointer items-center text-xs font-medium text-[var(--color-secondary-500)]"
        >
          <span>{expanded ? "بستن" : "مشاهده بیشتر"}</span>
          <ChevronLeftIcon
            size={18}
            className={[
              "mr-0.5 text-[var(--color-secondary-500)] transition-transform",
              expanded ? "-rotate-90" : "",
            ].join(" ")}
          />
        </button>
      ) : null}
    </section>
  );
}
