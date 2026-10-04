import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeftIcon,
  MixPayIcon,
  PlusBadgeIcon,
} from "@/components/layout/icons";
import { formatPrice } from "@/lib/format";
import type { ProductTouchPointsData } from "@/types/product-detail";

type ProductTouchPointsProps = {
  data: ProductTouchPointsData;
};

function BulletRow({
  label,
  colorClass,
  connected = false,
}: {
  label: string;
  colorClass: string;
  connected?: boolean;
}) {
  return (
    <div className="flex flex-row items-center justify-between">
      <div className="flex flex-row items-center justify-between">
        <div
          className="relative flex w-[18px] min-w-[18px] items-center justify-center self-stretch"
          style={connected ? undefined : { width: 24 }}
        >
          <span className={`size-[5px] rounded-full ${colorClass}`} />
          {connected ? (
            <>
              <span className="absolute top-0 block h-[calc(50%-5px)] w-px bg-[var(--color-neutral-200)]" />
              <span className="absolute bottom-0 block h-[calc(50%-5px)] w-px bg-[var(--color-neutral-200)]" />
            </>
          ) : (
            <span className="absolute top-0 block h-[calc(50%-5px)] w-px bg-[var(--color-neutral-200)]" />
          )}
        </div>
        <h3 className="mr-2 text-[11px] text-[var(--color-neutral-500)]">
          {label}
        </h3>
      </div>
    </div>
  );
}

/**
 * Plus membership + installment (MixPay) CTAs under the info column.
 */
export function ProductTouchPoints({ data }: ProductTouchPointsProps) {
  if (!data.plus && !data.finance) return null;

  return (
    <div className="-mx-5 flex flex-col gap-y-4 bg-[var(--color-neutral-100)] px-5 pt-5 lg:mx-0 lg:gap-y-3 lg:bg-[var(--color-neutral-000)] lg:px-0">
      {data.plus ? (
        <div className="relative rounded bg-[var(--color-neutral-000)] px-3 pb-4 lg:w-full lg:border lg:border-[var(--color-neutral-200)]">
          <div className="mt-2 flex flex-row items-center justify-start">
            <PlusBadgeIcon className="ml-2 size-6 text-[var(--color-plus-500)]" />
            <span className="text-sm font-semibold text-[var(--color-plus-500)]">
              ارسال <b className="font-bold">رایگان</b> سفارش‌ها برای اعضای پلاس
            </span>
          </div>
          <BulletRow
            label={data.plus.perk}
            colorClass="bg-[var(--color-plus-500)]"
          />
          <Link
            href={data.plus.href}
            className="mt-2 mr-8 flex cursor-pointer items-center border-none bg-transparent p-0 text-xs text-[var(--color-secondary-500)]"
          >
            {data.plus.ctaLabel}
            <ChevronLeftIcon
              size={24}
              className="text-[var(--color-icon-secondary)]"
            />
          </Link>
          <div
            className="pointer-events-none absolute bottom-0 left-0 z-0 leading-none"
            aria-hidden
          >
            <Image
              src="/images/product/free-delivery.png"
              alt=""
              width={96}
              height={64}
              className="inline-block w-24 object-contain"
              unoptimized
            />
          </div>
        </div>
      ) : null}

      {data.finance ? (
        <Link href={data.finance.href} target="_blank" className="block">
          <div className="rounded bg-[var(--color-neutral-000)] px-3 pb-4 lg:w-full lg:border lg:border-[var(--color-neutral-200)]">
            <div className="flex flex-row items-center justify-start">
              <MixPayIcon className="ml-2 size-6 text-[var(--color-mixpay)]" />
              <span className="w-full grow">
                <div className="flex w-full grow items-center break-words py-3">
                  <p className="grow text-sm font-bold text-[var(--color-neutral-700)]">
                    <span className="relative">{data.finance.title}</span>
                  </p>
                  <ChevronLeftIcon
                    size={24}
                    className="mr-2 shrink-0 text-[var(--color-icon-low-emphasis)]"
                  />
                </div>
              </span>
            </div>
            <BulletRow
              label={`فقط با ماهی ${formatPrice(data.finance.monthlyAmount)} تومان (${new Intl.NumberFormat("fa-IR").format(data.finance.months)} ماه)`}
              colorClass="bg-[var(--color-mixpay)]"
              connected
            />
            <BulletRow
              label={`اعتبار پیشنهادی برای خرید: ${formatPrice(data.finance.suggestedCredit)} تومان`}
              colorClass="bg-[var(--color-mixpay)]"
            />
          </div>
        </Link>
      ) : null}
    </div>
  );
}
