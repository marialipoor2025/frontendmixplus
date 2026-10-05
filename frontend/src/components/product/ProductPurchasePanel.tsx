"use client";

import { useMemo, useState } from "react";
import { ProductBuyBox } from "@/components/product/ProductBuyBox";
import { ProductFeatures } from "@/components/product/ProductFeatures";
import { ProductInsurance } from "@/components/product/ProductInsurance";
import { ProductPricePolicyLink } from "@/components/product/ProductPricePolicyLink";
import { ProductReturnNotice } from "@/components/product/ProductReturnNotice";
import { ProductTitle } from "@/components/product/ProductTitle";
import { ProductTouchPoints } from "@/components/product/ProductTouchPoints";
import { ProductVariantInfo } from "@/components/product/ProductVariantInfo";
import {
  findSkuForSelection,
  resolveOptionGroups,
  resolveSelectedOptionValueIds,
} from "@/lib/product-variants";
import type { ProductDetailPageData } from "@/types/product-detail";

type ProductPurchasePanelProps = {
  data: ProductDetailPageData;
};

/**
 * Client panel that keeps option selection in sync with buy-box price/stock.
 */
export function ProductPurchasePanel({ data }: ProductPurchasePanelProps) {
  const groups = useMemo(() => resolveOptionGroups(data.variant), [data.variant]);
  const [selected, setSelected] = useState(() =>
    resolveSelectedOptionValueIds(data.variant, groups),
  );

  const activeSku = useMemo(
    () => findSkuForSelection(data.variant.skus, selected),
    [data.variant.skus, selected],
  );

  const buyBox = {
    ...data.buyBox,
    price: activeSku?.price ?? data.buyBox.price,
    originalPrice: activeSku?.originalPrice ?? data.buyBox.originalPrice,
    discountPercent: activeSku?.discountPercent ?? data.buyBox.discountPercent,
  };

  return (
    <>
      <div className="min-w-0 grow px-5 pt-4 lg:px-0 lg:pt-0">
        <ProductTitle title={data.title} links={data.titleNav} />
        <ProductVariantInfo
          data={data.variant}
          productSlug={data.slug}
          selectedOptionValueIds={selected}
          activeSku={activeSku}
          onSelectOption={(groupId, valueId) =>
            setSelected((prev) => ({ ...prev, [groupId]: valueId }))
          }
        />
        {data.insurance ? <ProductInsurance offer={data.insurance} /> : null}
        <ProductFeatures items={data.features} />
        {data.returnNotice ? (
          <ProductReturnNotice text={data.returnNotice} />
        ) : null}
        {data.touchPoints ? (
          <ProductTouchPoints data={data.touchPoints} />
        ) : null}
      </div>

      <div className="flex w-full flex-col gap-2 lg:sticky lg:top-28 lg:w-[300px] lg:shrink-0">
        <ProductBuyBox data={buyBox} />
        {!activeSku?.inStock ? (
          <p className="rounded-lg border border-[var(--color-hint-object-error)]/30 bg-red-50 px-3 py-2 text-center text-xs font-medium text-[var(--color-hint-object-error)]">
            این ترکیب در حال حاضر موجود نیست
          </p>
        ) : null}
        <ProductPricePolicyLink />
      </div>
    </>
  );
}
