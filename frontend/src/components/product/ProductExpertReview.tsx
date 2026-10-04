"use client";

import { useState } from "react";
import { ChevronLeftIcon } from "@/components/layout/icons";
import { ProductSectionTitle } from "@/components/product/ProductSectionTitle";
import type { ProductExpertReviewContent } from "@/types/product-detail";

type ProductExpertReviewProps = {
  data: ProductExpertReviewContent;
};

/**
 * «بررسی تخصصی» panel under sticky PDP tabs.
 */
export function ProductExpertReview({ data }: ProductExpertReviewProps) {
  const [expanded, setExpanded] = useState(false);
  const body = expanded ? data.full : data.preview;

  return (
    <div
      id="pdp-review"
      className="scroll-mt-40 border-b border-[var(--color-neutral-200)] px-5 pb-5 lg:mt-4 lg:px-0"
    >
      <ProductSectionTitle title="بررسی تخصصی" as="p" />
      <article className="mt-3">
        <section className="mb-2 pb-6">
          <div className="break-words py-3">
            <p className="grow text-sm font-medium leading-[1.8] text-[var(--color-neutral-900)]">
              <span className="relative">{data.title}</span>
            </p>
          </div>
          <div className="mb-4 whitespace-pre-line text-[13px] leading-[2.15] text-[var(--color-neutral-800)]">
            {body}
          </div>
        </section>
      </article>
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
    </div>
  );
}
