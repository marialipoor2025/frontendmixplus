import Image from "next/image";
import {
  GuaranteeIcon,
  ProductAvailableIcon,
  SellerBadgeSmileIcon,
  TomanIcon,
} from "@/components/layout/icons";
import { formatDiscountPercent, formatPrice } from "@/lib/format";
import { siteConfig } from "@/config/site";
import type {
  ProductBuyBoxData,
  ProductColorOption,
  ProductGallerySale,
} from "@/types/product-detail";

type ProductMiniBuyBoxProps = {
  title: string;
  imageUrl: string;
  color?: ProductColorOption;
  buyBox: ProductBuyBoxData;
  sale?: ProductGallerySale;
};

/**
 * Compact sticky buy box shown beside lower PDP content (desktop).
 */
export function ProductMiniBuyBox({
  title,
  imageUrl,
  color,
  buyBox,
  sale,
}: ProductMiniBuyBoxProps) {
  return (
    <aside
      data-testid="mini-buy-box"
      className="mt-5 mb-2 w-[300px] rounded-[var(--global-radius)] border border-[var(--color-neutral-200)] bg-[linear-gradient(#f0f0f180,#f0f0f180),#fff] p-4 text-[13px] leading-[2.17]"
    >
      {sale ? (
        <div className="flex items-center py-2 text-sm font-bold">
          <div style={{ color: "rgb(230, 18, 61)" }}>{sale.label}</div>
        </div>
      ) : null}

      <div className="mb-3 flex border-b border-[var(--color-neutral-200)] pb-3">
        <div className="size-20 shrink-0 overflow-hidden rounded leading-none">
          <Image
            src={imageUrl}
            alt={title}
            width={80}
            height={80}
            className="inline-block size-20 object-contain"
            unoptimized
          />
        </div>
        <div className="mr-5 flex flex-col">
          <p className="line-clamp-2 text-[13px] text-[var(--color-neutral-800)]">
            {title}
          </p>
          {color ? (
            <div className="mt-auto flex items-center">
              <div
                className="size-3.5 rounded-full border border-[var(--color-neutral-200)]"
                style={{ background: color.hex }}
              />
              <p className="mr-2 text-[13px] text-[var(--color-neutral-700)]">
                {color.name}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mb-2 flex items-center">
        <div className="ml-2 flex items-center justify-center">
          <div className="mt-1 flex size-6 items-center justify-center rounded-full bg-[var(--color-primary-500)] p-1">
            <SellerBadgeSmileIcon className="size-4 text-white" />
          </div>
        </div>
        <div className="text-[13px] text-[var(--color-neutral-700)]">
          {buyBox.seller.name}
        </div>
      </div>

      <div className="mb-2 flex items-center">
        <div className="ml-2 flex items-center justify-center">
          <GuaranteeIcon className="size-[18px] text-[var(--color-icon-high-emphasis)]" />
        </div>
        <div className="text-[13px] text-[var(--color-neutral-700)]">
          {buyBox.warranty}
        </div>
      </div>

      <div className="mb-2 flex items-center">
        <div className="ml-2 flex items-center justify-center">
          <ProductAvailableIcon className="size-[18px] text-[var(--color-icon-low-emphasis)]" />
        </div>
        <div className="text-[13px] text-[var(--color-neutral-700)]">
          موجود در انبار {siteConfig.nameFa}
        </div>
      </div>

      <div className="relative mt-1 w-full">
        <div className="mb-1 flex items-center">
          <div className="relative mr-auto flex flex-col items-end justify-start">
            {buyBox.originalPrice != null && buyBox.discountPercent != null ? (
              <div className="flex w-full items-center justify-end gap-1">
                <span
                  className="ml-1 text-[13px] text-[var(--color-neutral-300)] line-through"
                  data-testid="price-no-discount"
                >
                  {formatPrice(buyBox.originalPrice)}
                </span>
                <div className="mr-1 mb-1 flex shrink-0 items-center justify-center rounded-[var(--large-radius)] bg-[var(--color-hint-object-error)] px-1 text-white">
                  <span
                    className="text-[13px] font-semibold"
                    data-testid="price-discount-percent"
                  >
                    {formatDiscountPercent(buyBox.discountPercent)}
                  </span>
                </div>
              </div>
            ) : null}
            <div className="flex flex-row items-center">
              <span
                className="ml-1 text-base font-bold text-[var(--color-neutral-800)]"
                data-testid="price-final"
              >
                {formatPrice(buyBox.price)}
              </span>
              <TomanIcon className="size-3.5 text-[var(--color-icon-high-emphasis)]" />
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <button
            type="button"
            data-testid="add-to-cart"
            data-cro-id="pdp-mini-add-to-cart"
            className="relative flex h-12 w-full select-none items-center justify-center rounded-[var(--medium-radius)] bg-[var(--color-primary-500)] text-sm font-medium text-white transition hover:bg-[var(--color-primary-700)]"
          >
            افزودن به سبد خرید
          </button>
        </div>
      </div>
    </aside>
  );
}
