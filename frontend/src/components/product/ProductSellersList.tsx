import Link from "next/link";
import {
  DeliveryExpressIcon,
  GuaranteeIcon,
  SellerBadgeSmileIcon,
  SellerShopIcon,
  TomanIcon,
} from "@/components/layout/icons";
import { formatDiscountPercent, formatPrice } from "@/lib/format";
import type { ProductSellerOffer } from "@/types/product-detail";

type ProductSellersListProps = {
  sellers: ProductSellerOffer[];
};

function formatPercent(value: number): string {
  return `${new Intl.NumberFormat("fa-IR", {
    maximumFractionDigits: 1,
  }).format(value)}٪`;
}

function SellerAvatar({ offer }: { offer: ProductSellerOffer }) {
  if (offer.isOfficial) {
    return (
      <div className="mt-1 flex size-6 items-center justify-center rounded-full bg-[var(--color-primary-500)] p-1">
        <SellerBadgeSmileIcon className="size-4 text-white" />
      </div>
    );
  }

  return (
    <div className="relative text-[var(--color-icon-high-emphasis)]">
      <SellerShopIcon className="size-6" />
    </div>
  );
}

function SellerStatsHover({ offer }: { offer: ProductSellerOffer }) {
  if (!offer.stats) return null;

  return (
    <div className="pointer-events-none absolute top-0 right-full z-20 mr-2 hidden w-80 rounded-[var(--small-radius)] border border-[var(--color-neutral-200)] bg-[var(--color-neutral-000)] px-5 py-4 opacity-0 shadow-[0_12px_24px_-8px_rgb(0_0_0_/_0.12),0_4px_8px_rgb(0_0_0_/_0.06)] transition group-hover/seller:pointer-events-auto group-hover/seller:opacity-100 lg:block">
      <div className="flex w-full items-center justify-between text-sm font-bold text-[var(--color-neutral-900)]">
        فروشگاه {offer.name}
      </div>
      <p className="mt-1 text-[13px] text-[var(--color-neutral-500)]">
        {offer.stats.memberSinceLabel}
      </p>
      <div className="my-2 text-center">
        <p
          className="text-2xl font-black"
          style={{ color: "var(--color-rating-4-5)" }}
        >
          {offer.performanceLabel}
        </p>
        <p className="text-sm font-semibold text-[var(--color-neutral-800)]">
          عملکرد کلی فروشنده
        </p>
      </div>
      <div className="mt-2 flex justify-between">
        <div className="text-center">
          <p className="text-sm font-bold text-[var(--color-neutral-500)]">
            {formatPercent(offer.stats.onTimeSupplyPercent)}
          </p>
          <p className="text-[11px] text-[var(--color-neutral-500)]">
            تامین به موقع
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-[var(--color-neutral-500)]">
            {formatPercent(offer.stats.shipCommitmentPercent)}
          </p>
          <p className="text-[11px] text-[var(--color-neutral-500)]">
            تعهد ارسال
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-[var(--color-neutral-500)]">
            {formatPercent(offer.stats.noReturnPercent)}
          </p>
          <p className="text-[11px] text-[var(--color-neutral-500)]">
            بدون مرجوعی
          </p>
        </div>
      </div>
    </div>
  );
}

function SellerRow({ offer }: { offer: ProductSellerOffer }) {
  const nameNode = (
    <p className="ml-2 text-sm font-semibold text-[var(--color-neutral-700)]">
      {offer.name}
    </p>
  );

  return (
    <div className="rounded-[var(--medium-radius)] px-4">
      <div className="flex items-center justify-center lg:justify-between">
        <div className="grow items-center lg:grid lg:grid-cols-3">
          <div className="group/seller relative flex items-center py-4">
            <SellerStatsHover offer={offer} />
            <SellerAvatar offer={offer} />
            <div className="mr-4">
              <div className="mb-2 flex items-center lg:mb-1">
                {offer.isOfficial ? (
                  nameNode
                ) : (
                  <Link href={offer.href}>{nameNode}</Link>
                )}
              </div>
              <div className="flex w-full items-center text-[13px]">
                <div className="flex items-center pr-2">
                  <p className="ml-1 text-[var(--color-neutral-500)]">عملکرد</p>
                  <p
                    className="whitespace-nowrap text-[13px] font-semibold"
                    style={{ color: "var(--color-rating-4-5)" }}
                  >
                    {offer.performanceLabel}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="py-4">
            <div className="ml-4 mr-3">
              <div className="flex items-center text-[var(--color-delivery-express)] lg:ml-3">
                <DeliveryExpressIcon className="size-[18px] fill-current" />
                <p className="mr-2 text-[13px] text-[var(--color-neutral-500)]">
                  {offer.deliveryLabel}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-start p-4">
            <GuaranteeIcon className="ml-2 size-5 text-[var(--color-neutral-700)]" />
            <p className="text-sm font-semibold text-[var(--color-neutral-700)]">
              {offer.warranty}
            </p>
          </div>
        </div>

        <div className="flex min-w-[380px] items-center justify-end py-4">
          <div className="ml-6">
            <div className="flex items-center justify-start">
              {offer.originalPrice != null && offer.discountPercent != null ? (
                <>
                  <div className="flex items-center justify-start gap-1">
                    <span className="ml-1 text-[13px] text-[var(--color-neutral-300)] line-through">
                      {formatPrice(offer.originalPrice)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="ml-0.5 text-base font-bold text-[var(--color-neutral-800)]">
                        {formatPrice(offer.price)}
                      </span>
                      <TomanIcon className="size-3.5 text-[var(--color-icon-high-emphasis)]" />
                    </div>
                    <div className="mr-1 flex shrink-0 items-center justify-center rounded-[var(--large-radius)] bg-[var(--color-hint-object-error)] px-1 text-white">
                      <span className="text-[13px] font-semibold">
                        {formatDiscountPercent(offer.discountPercent)}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-start gap-1">
                    <span className="ml-1 text-base font-bold text-[var(--color-neutral-800)]">
                      {formatPrice(offer.price)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <TomanIcon className="size-3.5 text-[var(--color-icon-high-emphasis)]" />
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="shrink-0">
            <button
              type="button"
              data-testid="add-to-cart"
              className="relative flex h-12 w-full min-w-[160px] select-none items-center justify-center rounded-[var(--medium-radius)] bg-[var(--color-primary-500)] px-4 text-sm font-medium text-white transition hover:bg-[var(--color-primary-700)]"
            >
              افزودن به سبد خرید
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Desktop multi-seller offers under the main PDP columns.
 */
export function ProductSellersList({ sellers }: ProductSellersListProps) {
  if (sellers.length === 0) return null;

  return (
    <section
      id="pdp-sellers"
      className="mt-4 border-b-4 border-[var(--color-neutral-100)] px-5 pb-5 lg:px-0"
    >
      <div className="break-words py-3">
        <div className="flex grow items-center">
          <p className="grow text-base font-bold text-[var(--color-neutral-900)]">
            <span className="relative">فروشندگان این کالا</span>
          </p>
        </div>
        <div className="mt-2 h-0.5 w-10 rounded-full bg-[var(--color-primary-500)]" />
      </div>

      <div className="divide-y divide-[var(--color-neutral-100)]">
        {sellers.map((offer) => (
          <SellerRow key={offer.id} offer={offer} />
        ))}
      </div>
    </section>
  );
}
