"use client";

import { useState } from "react";
import { ChevronLeftIcon } from "@/components/layout/icons";
import { ProductRichText } from "@/components/product/ProductRichText";
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
  const full = data.full?.trim() ?? "";
  const preview =
    data.preview?.trim() ||
    (full.length > 220 ? `${full.slice(0, 220).trimEnd()}…` : full);
  const body = expanded ? full || preview : preview;
  if (!preview && !full) return null;
  const canExpand = Boolean(full && full !== preview);

  return (
    <div
      id="pdp-review"
      className="scroll-mt-40 border-b border-[var(--color-neutral-200)] px-5 pb-5 lg:mt-4 lg:px-0"
    >
      <ProductSectionTitle title="بررسی تخصصی" as="p" />
      <article className="mt-3">
        <section className="mb-2 pb-6">
          {data.title?.trim() ? (
            <div className="break-words py-3">
              <p className="grow text-sm font-medium leading-[1.8] text-[var(--color-neutral-900)]">
                <span className="relative">{data.title}</span>
              </p>
            </div>
          ) : null}
          <ProductRichText text={body} className="mb-4" />
        </section>
      </article>
      {canExpand ? (
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
    </div>
  );
}
