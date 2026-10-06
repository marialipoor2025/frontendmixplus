"use client";

import { useMemo, useState } from "react";
import { ProductBreadcrumb } from "@/components/product/ProductBreadcrumb";
import { ProductBuyBox } from "@/components/product/ProductBuyBox";
import { ProductExpertReview } from "@/components/product/ProductExpertReview";
import { ProductFeatures } from "@/components/product/ProductFeatures";
import { ProductInsurance } from "@/components/product/ProductInsurance";
import { ProductIntro } from "@/components/product/ProductIntro";
import { ProductPricePolicyLink } from "@/components/product/ProductPricePolicyLink";
import { ProductSpecs } from "@/components/product/ProductSpecs";
import { ProductTitle } from "@/components/product/ProductTitle";
import { ProductVariantInfo } from "@/components/product/ProductVariantInfo";
import { draftToPdpPreview } from "@/lib/seller/draft-to-pdp-preview";
import {
  findSkuForSelection,
  resolveOptionGroups,
  resolveSelectedOptionValueIds,
} from "@/lib/product-variants";
import type { SellerProductDraft, SellerWizardStepId } from "@/types/seller-wizard";
import Image from "next/image";

type Props = {
  draft: SellerProductDraft;
  /** Which PDP component to spotlight. */
  stepId: Exclude<SellerWizardStepId, "preview">;
  /** Optional live form overrides for current step editing. */
  override?: Partial<SellerProductDraft>;
};

/**
 * Renders the real PDP UI component for the active wizard step.
 */
export function PdpComponentPreview({ draft, stepId, override }: Props) {
  const merged = useMemo(
    () => ({ ...draft, ...override }) as SellerProductDraft,
    [draft, override],
  );
  const data = useMemo(() => draftToPdpPreview(merged), [merged]);
  const groups = useMemo(() => resolveOptionGroups(data.variant), [data.variant]);
  const [selected, setSelected] = useState(() =>
    resolveSelectedOptionValueIds(data.variant, groups),
  );
  const activeSku = useMemo(
    () => findSkuForSelection(data.variant.skus, selected),
    [data.variant.skus, selected],
  );

  // Pricing step must always reflect draft buy-box money — SKU prices can lag.
  const buyBox =
    stepId === "pricing"
      ? data.buyBox
      : {
          ...data.buyBox,
          price: activeSku?.price ?? data.buyBox.price,
          originalPrice: activeSku?.originalPrice ?? data.buyBox.originalPrice,
          discountPercent:
            activeSku?.discountPercent ?? data.buyBox.discountPercent,
        };

  return (
    <div className="max-h-[28rem] overflow-auto rounded-lg bg-white p-2 shadow-sm ring-1 ring-[var(--color-neutral-200)]">
      {stepId === "basics" ? (
        <div className="space-y-3">
          <ProductBreadcrumb items={data.breadcrumb} />
          <ProductTitle title={data.title} links={data.titleNav} />
        </div>
      ) : null}

      {stepId === "gallery" ? (
        data.gallery.images.length ? (
          <div className="grid grid-cols-2 gap-2">
            {data.gallery.images.slice(0, 4).map((img) => (
              <div
                key={img.id}
                className="relative aspect-square overflow-hidden rounded-lg bg-[var(--color-neutral-50)]"
              >
                <Image
                  src={img.url}
                  alt={img.alt}
                  fill
                  className="object-contain p-1"
                  unoptimized
                />
              </div>
            ))}
          </div>
        ) : (
          <EmptyHint text="گالری خالی است — در صفحه جزییات محصول تصویر جایگزین دیده می‌شود" />
        )
      ) : null}

      {stepId === "variants" ? (
        groups.length ? (
          <ProductVariantInfo
            data={data.variant}
            productSlug={data.slug}
            selectedOptionValueIds={selected}
            activeSku={activeSku}
            onSelectOption={(g, v) =>
              setSelected((prev) => ({ ...prev, [g]: v }))
            }
          />
        ) : (
          <EmptyHint text="بدون تنوع — بخش انتخاب گزینه در صفحه جزییات محصول مخفی می‌ماند" />
        )
      ) : null}

      {stepId === "features" ? (
        data.features.length ? (
          <ProductFeatures items={data.features} />
        ) : (
          <EmptyHint text="بدون ویژگی هایلایت — کارت ویژگی‌ها در صفحه جزییات محصول نیست" />
        )
      ) : null}

      {stepId === "pricing" ? (
        <div className="mx-auto flex w-full max-w-[300px] flex-col gap-2">
          {data.insurance ? (
            <ProductInsurance offer={data.insurance} />
          ) : null}
          <ProductBuyBox data={buyBox} />
          {data.showPricePolicy !== false ? (
            <ProductPricePolicyLink label={data.pricePolicyLabel} />
          ) : null}
        </div>
      ) : null}

      {stepId === "specs" ? (
        data.content.specs.length ? (
          <ProductSpecs groups={data.content.specs} />
        ) : (
          <EmptyHint text="جدول مشخصات خالی است" />
        )
      ) : null}

      {stepId === "intro" ? (
        data.content.intro.preview || data.content.intro.full ? (
          <ProductIntro data={data.content.intro} />
        ) : (
          <EmptyHint text="متن معرفی خالی است — بخش معرفی در صفحه جزییات محصول نیست" />
        )
      ) : null}

      {stepId === "expertReview" ? (
        data.content.expertReview.preview || data.content.expertReview.full ? (
          <ProductExpertReview data={data.content.expertReview} />
        ) : (
          <EmptyHint text="نقد تخصصی خالی است — بخش بررسی در صفحه جزییات محصول نیست" />
        )
      ) : null}
    </div>
  );
}

function EmptyHint({ text }: { text: string }) {
  return (
    <p className="rounded-lg border border-dashed border-amber-300 bg-amber-50 px-3 py-4 text-center text-[11px] text-amber-900">
      {text}
    </p>
  );
}
