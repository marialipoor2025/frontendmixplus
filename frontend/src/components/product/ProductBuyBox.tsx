import Link from "next/link";
import {
  ChevronLeftIcon,
  GuaranteeIcon,
  InfoFilledIcon,
  ProductAvailableIcon,
  SellerBadgeSmileIcon,
  TomanIcon,
} from "@/components/layout/icons";
import { formatDiscountPercent, formatPrice } from "@/lib/format";
import type { ProductBuyBoxData } from "@/types/product-detail";

type ProductBuyBoxProps = {
  data: ProductBuyBoxData;
};

function formatOtherSellers(count: number): string {
  return `${new Intl.NumberFormat("fa-IR").format(count)} فروشنده دیگر`;
}

/**
 * Sticky-style PDP buy box: seller, price, add-to-cart, warranty, delivery.
 */
export function ProductBuyBox({ data }: ProductBuyBoxProps) {
  return (
    <aside
      data-testid="buy-box"
      className="flex w-full flex-col items-stretch bg-[var(--color-neutral-000)] lg:rounded-[var(--medium-radius)] lg:border lg:border-[var(--color-neutral-200)]"
    >
      <div className="flex w-full select-none items-center justify-between break-words px-5 pt-4 pb-2">
        <h3 className="grow text-sm font-medium text-[var(--color-neutral-900)]">
          فروشنده
        </h3>
        {data.otherSellerCount > 0 ? (
          <button
            type="button"
            className="cursor-pointer text-[13px] text-[var(--color-secondary-500)]"
          >
            {formatOtherSellers(data.otherSellerCount)}
          </button>
        ) : null}
      </div>

      <Link href={data.seller.href} className="w-full px-4" target="_blank">
        <div className="flex w-full grow pb-4 pt-0">
          <div className="ml-4">
            <div className="mt-1 flex size-6 items-center justify-center rounded-full bg-[var(--color-primary-500)] p-1">
              <SellerBadgeSmileIcon className="size-4 text-white" />
            </div>
          </div>
          <div className="flex w-full">
            <div>
              <div className="mb-2 flex items-center lg:mb-1">
                <p className="ml-2 text-sm font-semibold text-[var(--color-neutral-700)]">
                  {data.seller.name}
                </p>
              </div>
              <div className="flex w-full items-center text-[13px]">
                <div className="flex items-center pr-2">
                  <p className="ml-1 text-[var(--color-neutral-500)]">عملکرد</p>
                  <p
                    className="whitespace-nowrap text-[13px] font-semibold"
                    style={{ color: "var(--color-rating-4-5)" }}
                  >
                    {data.seller.performanceLabel}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>

      <div className="relative w-full lg:px-4 lg:pb-2">
        <div className="border-t border-[var(--color-neutral-200)] lg:pt-4">
          {data.cheaperByAmount != null && data.cheaperByAmount > 0 ? (
            <button
              type="button"
              className="mb-2.5 flex w-full items-center justify-between rounded-md bg-[#1672DD1F] px-2 py-2 text-right"
            >
              <span className="flex items-center gap-2 whitespace-nowrap">
                <InfoFilledIcon className="mb-0.5 size-[18px] text-[var(--color-info-icon)]" />
                <span className="flex items-center justify-center text-[11px] leading-[1.8] text-[var(--color-neutral-850)]">
                  این کالا را «
                  <span className="text-[11px] font-semibold leading-[1.8]">
                    {formatPrice(data.cheaperByAmount)} تومان
                  </span>
                  » ارزان‌تر بخرید
                </span>
              </span>
              <ChevronLeftIcon
                size={18}
                className="text-[var(--color-icon-low-emphasis)]"
              />
            </button>
          ) : null}

          <div className="mb-1 flex items-center">
            <div className="relative mr-auto flex flex-col items-end justify-start">
              {data.originalPrice != null &&
              data.originalPrice > data.price &&
              data.discountPercent != null &&
              data.discountPercent > 0 ? (
                <div className="flex w-full items-center justify-end gap-1">
                  <span className="ml-1 text-[13px] text-[var(--color-neutral-300)] line-through">
                    {formatPrice(data.originalPrice)}
                  </span>
                  <div className="mr-1 mb-1 flex shrink-0 items-center justify-center rounded-[var(--large-radius)] bg-[var(--color-hint-object-error)] px-1 text-white">
                    <span className="text-[13px] font-semibold">
                      {formatDiscountPercent(data.discountPercent)}
                    </span>
                  </div>
                </div>
              ) : null}
              <div className="flex flex-row items-center">
                <span className="ml-1 text-base font-bold text-[var(--color-neutral-800)] lg:text-lg">
                  {formatPrice(data.price)}
                </span>
                <TomanIcon className="size-3.5 text-[var(--color-icon-high-emphasis)]" />
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <button
              type="button"
              data-testid="add-to-cart"
              className="relative flex h-12 w-full select-none items-center justify-center rounded-[var(--medium-radius)] bg-[var(--color-primary-500)] text-sm font-medium text-white transition hover:bg-[var(--color-primary-700)]"
            >
              افزودن به سبد خرید
            </button>
          </div>
        </div>
      </div>

      {data.showWarranty !== false && data.warranty ? (
        <div className="flex w-full items-center px-4">
          <div className="flex grow items-center py-3">
            <div className="ml-4">
              <GuaranteeIcon className="size-6 text-[var(--color-icon-high-emphasis)]" />
            </div>
            <p className="text-xs font-medium text-[var(--color-neutral-700)] lg:text-[13px]">
              {data.warranty}
            </p>
          </div>
        </div>
      ) : null}

      {data.showDelivery !== false &&
      (data.delivery.methodLabel || data.delivery.title) ? (
        <div className="relative w-full cursor-pointer px-4">
          <div className="border-t border-[var(--color-neutral-200)] py-3">
            <div className="mb-2 flex flex-row items-center justify-start">
              <ProductAvailableIcon className="ml-3 mr-px size-6 text-[var(--color-icon-secondary)]" />
              <p className="text-xs font-medium text-[var(--color-neutral-700)] lg:text-[13px]">
                {data.delivery.title || "روش و هزینه تحویل"}
              </p>
              <ChevronLeftIcon
                size={24}
                className="mr-auto text-[var(--color-icon-low-emphasis)]"
              />
            </div>
            <ul className="flex flex-col">
              <li className="ml-3 flex items-center">
                <div
                  className="relative ml-3 flex min-w-6 items-center justify-center self-stretch"
                  style={{ width: 24 }}
                >
                  <span className="size-[5px] rounded-full bg-[var(--color-icon-secondary)]" />
                </div>
                <div className="mr-1 flex items-center truncate">
                  <span className="text-[13px] text-[var(--color-neutral-500)]">
                    {data.delivery.methodLabel}
                  </span>
                  <span className="text-[13px] font-semibold text-[var(--color-neutral-650)]">
                    <span className="text-[var(--color-neutral-500)]"> • </span>
                    <span className="inline-flex items-center truncate whitespace-nowrap">
                      {data.delivery.costLabel}
                    </span>
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
