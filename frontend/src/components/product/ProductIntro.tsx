"use client";

import { useState } from "react";
import { ChevronLeftIcon } from "@/components/layout/icons";
import { ProductRichText } from "@/components/product/ProductRichText";
import { ProductSectionTitle } from "@/components/product/ProductSectionTitle";
import type { ProductIntroContent } from "@/types/product-detail";

type ProductIntroProps = {
  data: ProductIntroContent;
};

/**
 * «معرفی» panel — short product description with expand.
 */
export function ProductIntro({ data }: ProductIntroProps) {
  const [expanded, setExpanded] = useState(false);
  const full = data.full?.trim() ?? "";
  const preview =
    data.preview?.trim() ||
    (full.length > 220 ? `${full.slice(0, 220).trimEnd()}…` : full);
  const text = expanded ? full || preview : preview;
  if (!preview && !full) return null;
  const canExpand = Boolean(full && full !== preview);

  return (
    <article
      id="pdp-intro"
      className="scroll-mt-40 border-b border-[var(--color-neutral-200)] px-5 pb-5 lg:mt-4 lg:px-0"
    >
      <ProductSectionTitle title="معرفی" />
      <ProductRichText text={text} />
      {canExpand ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 mb-3 inline-flex cursor-pointer items-center text-xs font-medium text-[var(--color-secondary-500)]"
        >
          <span>{expanded ? "بستن" : "بیشتر"}</span>
          <ChevronLeftIcon
            size={18}
            className={[
              "mr-0.5 text-[var(--color-secondary-500)] transition-transform",
              expanded ? "-rotate-90" : "",
            ].join(" ")}
          />
        </button>
      ) : null}
    </article>
  );
}
