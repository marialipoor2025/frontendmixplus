"use client";

import { useMemo, useState } from "react";
import { ProductBuyBox } from "@/components/product/ProductBuyBox";
import { ProductFeatures } from "@/components/product/ProductFeatures";
import { ProductInsurance } from "@/components/product/ProductInsurance";
import { ProductMobileBuyBar } from "@/components/product/ProductMobileBuyBar";
import { ProductMobileContent } from "@/components/product/ProductMobileContent";
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
 * Mobile: Digikala overlapping content card + sticky buy bar.
 * Desktop: middle info column + sticky buy box (siblings in Digikala 3-col row).
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

  // Seller buy-box (product card) is authoritative; SKU rows can lag after price edits.
  const buyBox = {
    ...data.buyBox,
    price: data.buyBox.price || activeSku?.price || 0,
    originalPrice: data.buyBox.originalPrice ?? activeSku?.originalPrice,
    discountPercent:
      data.buyBox.discountPercent ?? activeSku?.discountPercent,
  };

  const onSelectOption = (groupId: string, valueId: string) =>
    setSelected((prev) => ({ ...prev, [groupId]: valueId }));

  const inStock = activeSku?.inStock ?? true;

  return (
    <>
      {/* —— Mobile Digikala content card (slides up over pinned mosaic) —— */}
      <div
        id="content"
        className="relative z-[2] -mt-8 w-full min-w-0 lg:hidden"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-10 h-10 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.18)_100%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 left-0 z-[1] h-5 w-5 bg-[radial-gradient(circle_at_100%_100%,rgba(0,0,0,0)_58%,rgba(0,0,0,0.28)_100%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 right-0 z-[1] h-5 w-5 bg-[radial-gradient(circle_at_0%_100%,rgba(0,0,0,0)_58%,rgba(0,0,0,0.28)_100%)]"
        />

        <div className="relative overflow-hidden rounded-t-[var(--large-radius)] bg-white shadow-[0_-2px_12px_rgba(3,10,22,0.10)]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-10 bg-[linear-gradient(180deg,rgba(0,0,0,0.05)_0%,rgba(0,0,0,0)_100%)]"
          />
          <div
            id="pdp-mobile-sticky-sentinel"
            className="pointer-events-none absolute top-0 h-px w-full"
            aria-hidden
          />
          <div className="relative z-[2] pb-3">
            <ProductMobileContent
              data={data}
              selectedOptionValueIds={selected}
              activeSku={activeSku}
              buyBox={buyBox}
              onSelectOption={onSelectOption}
            />
          </div>
        </div>
      </div>
      <ProductMobileBuyBar buyBox={buyBox} inStock={inStock} />

      {/* —— Digikala desktop: info column (center) —— */}
      <div className="hidden min-w-0 grow basis-0 px-0 pt-0 lg:block">
        <ProductTitle title={data.title} links={data.titleNav} />
        <ProductVariantInfo
          data={data.variant}
          productSlug={data.slug}
          selectedOptionValueIds={selected}
          activeSku={activeSku}
          onSelectOption={onSelectOption}
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

      {/* —— Digikala desktop: sticky buy box (start / left in RTL) —— */}
      <div className="hidden w-[300px] shrink-0 flex-col gap-2 lg:sticky lg:top-28 lg:flex">
        <ProductBuyBox data={buyBox} />
        {!inStock ? (
          <p className="rounded-lg border border-[var(--color-hint-object-error)]/30 bg-red-50 px-3 py-2 text-center text-xs font-medium text-[var(--color-hint-object-error)]">
            این ترکیب در حال حاضر موجود نیست
          </p>
        ) : null}
        {data.showPricePolicy !== false ? (
          <ProductPricePolicyLink label={data.pricePolicyLabel} />
        ) : null}
      </div>
    </>
  );
}
