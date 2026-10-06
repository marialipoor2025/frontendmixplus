"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import {
  ChevronLeftIcon,
  DoneCheckIcon,
  GuaranteeIcon,
  InfoFilledIcon,
  PlusBadgeIcon,
  ProductAvailableIcon,
  RatingStarIcon,
  SellerBadgeSmileIcon,
  ShareIcon,
  TomanIcon,
  WishlistHeartIcon,
} from "@/components/layout/icons";
import { ProductShareSheet } from "@/components/product/ProductShareSheet";
import {
  addToWishlist,
  isInWishlist,
  removeFromWishlist,
} from "@/lib/api/wishlist";
import { useAuth } from "@/lib/auth/useAuth";
import { formatDiscountPercent, formatPrice } from "@/lib/format";
import {
  isOptionValueAvailable,
  resolveOptionGroups,
} from "@/lib/product-variants";
import type {
  ProductBuyBoxData,
  ProductDetailPageData,
  ProductFeatureItem,
  ProductGallerySale,
  ProductInsuranceOffer,
  ProductSkuVariant,
  ProductTouchPointsData,
  ProductVariantInfoData,
} from "@/types/product-detail";

type ProductMobileContentProps = {
  data: ProductDetailPageData;
  selectedOptionValueIds: Record<string, string>;
  activeSku?: ProductSkuVariant;
  buyBox: ProductBuyBoxData;
  onSelectOption: (groupId: string, valueId: string) => void;
};

function formatFa(n: number, digits = 1): string {
  return new Intl.NumberFormat("fa-IR", {
    maximumFractionDigits: digits,
    minimumFractionDigits: Number.isInteger(n) ? 0 : Math.min(digits, 1),
  }).format(n);
}

function Divider({ thick = false }: { thick?: boolean }) {
  return (
    <div
      className={
        thick
          ? "relative z-[2] h-2 w-full bg-[var(--color-neutral-100)]"
          : "relative z-[2] h-px w-full bg-[var(--color-neutral-100)]"
      }
    />
  );
}

function SaleStrip({ sale }: { sale: ProductGallerySale }) {
  return (
    <div className="relative w-full overflow-hidden">
      {/* Digikala top edge — single full-width MixPlus gradient (no second progress stub) */}
      <div
        className="h-1 w-full bg-gradient-to-l from-[#1672dd] to-[#ed1944]"
        aria-hidden
      />
      <div className="flex w-full items-center justify-between bg-[rgb(255_242_245)] px-4 py-2.5 text-[13px]">
        <span className="font-semibold text-[var(--color-primary-500)]">
          {sale.label}
        </span>
        <span className="text-[11px] text-[var(--color-neutral-500)]">
          <span className="text-xs font-semibold text-[var(--color-primary-500)]">
            {formatFa(sale.soldPercent, 0)}%
          </span>{" "}
          فروش رفته
        </span>
      </div>
    </div>
  );
}

function MobileInsurance({ offer }: { offer: ProductInsuranceOffer }) {
  const inputId = useId();
  const [checked, setChecked] = useState(false);

  return (
    <div className="flex w-full flex-col items-start gap-3 px-4 py-5">
      <h4 className="text-sm font-medium leading-[1.8] text-[var(--color-neutral-850)]">
        {offer.title}
      </h4>
      <div className="my-px flex w-full cursor-pointer gap-3 rounded-md border border-[var(--color-neutral-200)] px-3 py-2.5">
        <div className="flex grow items-center justify-center gap-3">
          <label
            htmlFor={inputId}
            className="flex cursor-pointer items-center p-[3px]"
          >
            <input
              id={inputId}
              type="checkbox"
              className="sr-only"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
            />
            <span
              className={[
                "inline-flex size-[18px] shrink-0 items-center justify-center rounded-[var(--small-radius)] border-2",
                checked
                  ? "border-[var(--color-secondary-500)] bg-[var(--color-secondary-500)]"
                  : "border-[var(--color-neutral-300)] bg-white",
              ].join(" ")}
            >
              {checked ? (
                <svg width={10} height={10} viewBox="0 0 10 10" fill="none">
                  <path
                    d="M1.5 5.2 3.8 7.5 8.5 2.5"
                    stroke="white"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : null}
            </span>
          </label>
          <div className="flex grow flex-col items-start gap-0.5">
            <span className="text-[13px] font-semibold leading-[2.15] text-[var(--color-neutral-700)]">
              {offer.title}
            </span>
            <div className="flex gap-1">
              {offer.discountPercent != null && offer.originalPrice != null ? (
                <span className="flex items-center gap-1">
                  <span className="rounded-md bg-[var(--color-primary-500)] px-1.5 py-0.5 text-[11px] font-semibold text-white">
                    {formatDiscountPercent(offer.discountPercent)}
                  </span>
                  <span className="text-[13px] text-[var(--color-neutral-300)] line-through">
                    {formatPrice(offer.originalPrice)}
                  </span>
                </span>
              ) : null}
              <span className="flex items-center gap-0.5 text-sm font-medium">
                {formatPrice(offer.price)}
                <TomanIcon className="size-3.5 text-[var(--color-icon-high-emphasis)]" />
              </span>
            </div>
          </div>
        </div>
        <Link
          href={offer.detailsHref ?? "#insurance-details"}
          className="inline-flex shrink-0 items-center text-[13px] font-medium text-[var(--color-primary-500)]"
        >
          جزئیات
          <ChevronLeftIcon size={18} />
        </Link>
      </div>
    </div>
  );
}

function MobileSpecsChips({ features }: { features: ProductFeatureItem[] }) {
  if (features.length === 0) return null;
  return (
    <div className="flex w-full flex-col items-center justify-center gap-3 py-5">
      <div className="flex w-full items-center justify-between px-4">
        <span className="text-sm font-medium leading-[1.8] text-[var(--color-neutral-850)]">
          مشخصات کالا
        </span>
        <a
          href="#pdp-specs"
          className="inline-flex items-center gap-0.5 text-[13px] font-medium text-[var(--color-icon-high-emphasis)]"
        >
          مشاهده همه
          <ChevronLeftIcon size={18} />
        </a>
      </div>
      <ul className="hide-scrollbar flex w-full touch-pan-x justify-start gap-2 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <li className="pr-2" aria-hidden />
        {features.map((item) => (
          <li
            key={item.id}
            className="rounded-md border border-[var(--color-neutral-200)] px-3 py-2"
          >
            <div className="flex flex-col items-start justify-center gap-1">
              <span className="flex items-center whitespace-nowrap text-[11px] text-[var(--color-neutral-600)]">
                {item.label}
                <ChevronLeftIcon size={16} />
              </span>
              <span className="max-w-[50vw] truncate text-[13px] font-semibold whitespace-nowrap text-[var(--color-neutral-850)]">
                {item.value}
              </span>
            </div>
          </li>
        ))}
        <li className="pr-2" aria-hidden />
      </ul>
    </div>
  );
}

function MobileVariants({
  data,
  selectedOptionValueIds,
  onSelectOption,
}: {
  data: ProductVariantInfoData;
  selectedOptionValueIds: Record<string, string>;
  onSelectOption: (groupId: string, valueId: string) => void;
}) {
  const groups = resolveOptionGroups(data);
  if (groups.length === 0) return null;

  return (
    <div
      id="pdp-variant"
      className="flex w-full flex-col items-center justify-center gap-3 py-3"
    >
      {groups.map((group) => {
        const selectedId = selectedOptionValueIds[group.id];
        const selectedValue =
          group.values.find((v) => v.id === selectedId) ?? group.values[0];

        return (
          <div
            key={group.id}
            className="flex w-full flex-col items-center justify-center gap-3 pt-2"
          >
            <div className="flex w-full items-start justify-between gap-2 px-4">
              <div className="flex flex-wrap items-center gap-0.5">
                <span className="text-sm font-medium leading-[1.8]">
                  {group.name}:
                </span>
                <div className="flex items-center gap-1.5 text-sm font-medium leading-[1.8]">
                  <span>{selectedValue?.label}</span>
                  {selectedValue?.swatchHex ? (
                    <span
                      className="size-4 rounded-full border border-[var(--color-neutral-200)]"
                      style={{ backgroundColor: selectedValue.swatchHex }}
                      aria-hidden
                    />
                  ) : null}
                </div>
              </div>
            </div>
            <div className="hide-scrollbar flex w-full max-w-full touch-pan-x gap-2 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="pr-2" aria-hidden />
              {group.values.map((value) => {
                const selected = value.id === selectedId;
                const available =
                  value.available &&
                  isOptionValueAvailable(
                    data.skus,
                    group.id,
                    value.id,
                    selectedOptionValueIds,
                  );
                return (
                  <button
                    key={value.id}
                    type="button"
                    disabled={!available}
                    aria-pressed={selected}
                    onClick={() => onSelectOption(group.id, value.id)}
                    className="cursor-pointer py-0.5 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <div
                      className={[
                        "flex min-w-[48px] select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-md border py-1.5 pr-2 pl-3",
                        selected
                          ? "border-[var(--color-icon-high-emphasis)]"
                          : "border-[var(--color-neutral-200)]",
                      ].join(" ")}
                    >
                      {value.swatchHex || group.ui === "swatch" ? (
                        <span
                          className="flex size-5 items-center justify-center rounded-full border border-[var(--color-neutral-200)]"
                          style={{
                            backgroundColor: value.swatchHex ?? "#e5e7eb",
                          }}
                        >
                          {selected ? (
                            <DoneCheckIcon className="size-4 text-[var(--color-icon-black)]" />
                          ) : null}
                        </span>
                      ) : null}
                      <span className="whitespace-nowrap text-[13px] leading-[1.8] text-[var(--color-neutral-650)]">
                        {value.label}
                      </span>
                    </div>
                  </button>
                );
              })}
              <div className="pr-2" aria-hidden />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MobileSeller({ buyBox }: { buyBox: ProductBuyBoxData }) {
  return (
    <div id="PdpSeller" className="flex w-full flex-col pb-3">
      <div className="flex w-full items-center justify-between px-4 pt-5">
        <span className="text-sm font-medium leading-[1.8] text-[var(--color-neutral-850)]">
          فروشنده
        </span>
        {buyBox.otherSellerCount > 0 ? (
          <a
            href="#pdp-sellers"
            className="inline-flex items-center gap-0.5 text-[13px] font-medium text-[var(--color-icon-high-emphasis)]"
          >
            انتخاب از {formatFa(buyBox.otherSellerCount, 0)} فروشنده دیگر
            <ChevronLeftIcon size={18} />
          </a>
        ) : null}
      </div>

      <Link
        href={buyBox.seller.href}
        className="flex items-center justify-start gap-3 px-4 py-0.5"
      >
        <div className="flex rounded-full bg-[var(--color-primary-500)] p-2">
          <SellerBadgeSmileIcon className="size-5 text-white" />
        </div>
        <div className="flex w-full grow flex-col gap-1 border-b border-[var(--color-neutral-100)] py-3">
          <div className="flex w-full items-center justify-start">
            <span className="truncate text-[13px] font-semibold text-[var(--color-neutral-900)]">
              {buyBox.seller.name}
            </span>
            <ChevronLeftIcon size={16} />
          </div>
          <div className="flex flex-wrap gap-1.5">
            <div className="flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-[var(--color-neutral-200)] py-0.5 pr-2 pl-0.5 text-[13px] text-[var(--color-neutral-900)]">
              عملکرد
              <span
                className="rounded-lg px-2 py-0.5 text-[13px] font-semibold text-white"
                style={{ backgroundColor: "var(--color-rating-4-5)" }}
              >
                {buyBox.seller.performanceLabel}
              </span>
            </div>
          </div>
        </div>
      </Link>

      <div className="flex items-start justify-start gap-3 px-4 py-0.5">
        <div className="rounded-full bg-[var(--color-neutral-100)] p-2">
          <GuaranteeIcon className="size-5 text-[var(--color-icon-high-emphasis)]" />
        </div>
        <div className="flex grow flex-col gap-1 border-b border-[var(--color-neutral-100)] py-3">
          <span className="truncate text-[13px] font-semibold text-[var(--color-neutral-900)]">
            {buyBox.warranty}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-start gap-3 px-4 py-0.5">
        <div className="rounded-full bg-[var(--color-neutral-100)] p-2">
          <ProductAvailableIcon className="size-5 text-[var(--color-icon-high-emphasis)]" />
        </div>
        <div className="flex grow flex-col gap-1 border-b border-[var(--color-neutral-100)] py-3">
          <div className="flex items-center justify-between">
            <span className="truncate text-[13px] font-semibold text-[var(--color-neutral-900)]">
              {buyBox.delivery.title}
            </span>
            <ChevronLeftIcon size={20} />
          </div>
          <ul className="w-full">
            <li className="ml-3 flex w-full items-center">
              <span className="mr-2 flex items-center">
                <span className="shrink-0 text-[13px] text-[var(--color-neutral-500)]">
                  {buyBox.delivery.methodLabel}
                </span>
                <span className="mx-1 text-[var(--color-neutral-500)]">•</span>
                <span className="text-[13px] font-semibold text-[var(--color-neutral-650)]">
                  {buyBox.delivery.costLabel}
                </span>
              </span>
            </li>
          </ul>
        </div>
      </div>

      {buyBox.cheaperByAmount != null && buyBox.cheaperByAmount > 0 ? (
        <div className="mx-4 mt-2">
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-md bg-[#1672DD1F] px-4 py-3"
          >
            <span className="flex items-center justify-start gap-3 text-[13px] font-semibold">
              <InfoFilledIcon className="size-5 text-[rgb(63,105,242)]" />
              <span className="text-[13px] leading-[1.8] text-[var(--color-neutral-850)]">
                این کالا را «
                <span className="inline font-semibold">
                  {formatPrice(buyBox.cheaperByAmount)} تومان
                </span>
                » ارزان‌تر بخرید
              </span>
            </span>
            <ChevronLeftIcon size={20} />
          </button>
        </div>
      ) : null}
    </div>
  );
}

function MobilePlus({ data }: { data: ProductTouchPointsData }) {
  if (!data.plus) return null;
  return (
    <div id="PdpThirdParties" className="pt-2 pb-5">
      <span className="block px-4 py-3 text-sm font-medium leading-[1.8] text-[var(--color-neutral-850)]">
        خدمات پرداخت و ارسال
      </span>
      <div className="hide-scrollbar flex touch-pan-x justify-start gap-3 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <span className="h-1 pr-1" aria-hidden />
        <div className="flex min-w-[245px] grow items-start justify-start gap-3 rounded-md border border-[var(--color-neutral-200)] px-4 py-3">
          <div className="flex size-9 min-h-9 min-w-9 rounded-full bg-[var(--color-app-background)] p-2">
            <PlusBadgeIcon className="size-5 text-[var(--color-plus-500)]" />
          </div>
          <div className="flex h-full w-[calc(100%-36px)] flex-col items-start justify-between gap-2">
            <div className="flex w-full flex-col items-start justify-center gap-1">
              <div className="text-[13px] font-semibold leading-[1.8] text-[var(--color-icon-high-emphasis)]">
                ارسال رایگان سفارش‌ها برای اعضای پلاس
              </div>
              <div className="text-[13px] leading-[1.8] text-[var(--color-neutral-500)]">
                {data.plus.perk}
              </div>
            </div>
            <Link
              href={data.plus.href}
              className="flex items-center justify-center rounded-lg border border-solid border-[var(--color-plus-500)] py-0.5 pr-2 pl-1 text-[13px] font-semibold text-[var(--color-plus-500)]"
            >
              {data.plus.ctaLabel}
              <ChevronLeftIcon size={16} className="text-[var(--color-plus-500)]" />
            </Link>
          </div>
        </div>
        <span className="h-1 pr-1" aria-hidden />
      </div>
    </div>
  );
}

/**
 * Digikala-style mobile content card below the mosaic gallery.
 */
export function ProductMobileContent({
  data,
  selectedOptionValueIds,
  buyBox,
  onSelectOption,
}: ProductMobileContentProps) {
  const router = useRouter();
  const { ready, isAuthenticated } = useAuth();
  const [shareOpen, setShareOpen] = useState(false);
  const [wished, setWished] = useState(false);
  const [wishBusy, setWishBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/product/${data.slug}`
      : `/product/${data.slug}`;

  useEffect(() => {
    if (!ready || !isAuthenticated || !data.slug) return;
    let cancelled = false;
    void isInWishlist(data.slug).then((value) => {
      if (!cancelled) setWished(value);
    });
    return () => {
      cancelled = true;
    };
  }, [ready, isAuthenticated, data.slug]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(t);
  }, [toast]);

  async function toggleWishlist() {
    if (!ready) return;
    if (!isAuthenticated) {
      router.push(
        `/users/login?returnUrl=${encodeURIComponent(`/product/${data.slug}`)}`,
      );
      return;
    }
    if (wishBusy) return;
    setWishBusy(true);
    try {
      if (wished) {
        await removeFromWishlist(data.slug);
        setWished(false);
        setToast("از علاقه‌مندی‌ها حذف شد");
      } else {
        await addToWishlist({
          productSlug: data.slug,
          title: data.title,
          imageUrl: data.gallery.images[0]?.url ?? "",
          priceAmount: buyBox.price,
        });
        setWished(true);
        setToast("به علاقه‌مندی‌ها اضافه شد");
      }
    } catch {
      setToast("خطا در به‌روزرسانی علاقه‌مندی‌ها");
    } finally {
      setWishBusy(false);
    }
  }

  const v = data.variant;

  return (
    <section id="SPEC" className="lg:hidden">
      {data.gallery.sale ? <SaleStrip sale={data.gallery.sale} /> : null}

      <div className="relative z-[3] overflow-hidden bg-white">
        <div className="mt-2 flex w-full items-center justify-center">
          <div className="h-[5px] w-10 rounded-full bg-[var(--color-neutral-100)]" />
        </div>

        <div className="flex justify-between gap-4 px-4 pt-4">
          <div className="flex w-full items-center justify-start overflow-hidden">
            {data.titleNav.map((link, index) => (
              <span key={link.id} className="flex min-w-0 items-center">
                {index > 0 ? (
                  <ChevronLeftIcon
                    size={12}
                    className="mx-[6px] shrink-0 text-[var(--color-icon-high-emphasis)]"
                  />
                ) : null}
                <Link
                  href={link.href}
                  className="shrink overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-medium text-[var(--color-neutral-500)] underline underline-offset-[6px]"
                >
                  {link.title}
                </Link>
              </span>
            ))}
          </div>
          <div className="flex shrink-0 justify-center gap-2">
            <button
              type="button"
              className="flex cursor-pointer p-1.5"
              aria-label="به اشتراک‌گذاری کالا"
              onClick={() => setShareOpen(true)}
            >
              <ShareIcon className="size-5 text-[var(--color-icon-high-emphasis)]" />
            </button>
            <button
              type="button"
              className="flex cursor-pointer p-1.5 select-none disabled:opacity-60"
              aria-label={wished ? "حذف از علاقه‌مندی" : "اضافه به علاقه‌مندی"}
              aria-pressed={wished}
              disabled={wishBusy}
              onClick={() => void toggleWishlist()}
            >
              <WishlistHeartIcon
                className={`size-5 ${wished ? "text-[var(--color-hint-object-error)]" : "text-[var(--color-icon-high-emphasis)]"}`}
                filled={wished}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="my-3 flex w-full flex-col items-start px-4">
        <h1
          className="relative text-sm font-medium leading-[1.8] text-[var(--color-neutral-850)]"
          style={{
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 2,
            overflow: "hidden",
          }}
        >
          {data.title}
        </h1>
      </div>

      <div className="hide-scrollbar flex w-full max-w-full touch-pan-x items-center gap-1.5 overflow-x-auto overscroll-x-contain pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="h-1 pl-2.5" aria-hidden />
        <div className="flex items-center">
          <RatingStarIcon className="size-5 text-[var(--color-icon-rating)]" />
          <p className="mr-1 text-[13px] font-semibold text-[var(--color-icon-high-emphasis)]">
            {formatFa(v.rating)}
          </p>
          <p className="mr-1 text-[13px] text-[var(--color-icon-neutral-hint)]">
            ({formatFa(v.ratingCount, 0)})
          </p>
        </div>
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <Link
            href={`/product/${data.slug}#pdp-comments`}
            className="inline-flex cursor-pointer items-center py-1.5 text-[13px]"
          >
            <span className="flex items-center gap-0.5 rounded-lg bg-[var(--color-gradient-silver)] py-1 pr-2 pl-1 text-[13px] font-semibold text-[var(--color-icon-high-emphasis)]">
              {formatFa(v.commentCount, 0)} دیدگاه
              <ChevronLeftIcon size={16} />
            </span>
          </Link>
          <Link
            href={`/product/${data.slug}#pdp-questions`}
            className="inline-flex cursor-pointer items-center py-1.5 text-[13px]"
          >
            <span className="flex items-center gap-0.5 rounded-lg bg-[var(--color-gradient-silver)] py-1 pr-2 pl-1 text-[13px] font-semibold text-[var(--color-icon-high-emphasis)]">
              {formatFa(v.questionCount, 0)} پرسش و پاسخ
              <ChevronLeftIcon size={16} />
            </span>
          </Link>
        </div>
        <div className="h-1 pl-2.5" aria-hidden />
      </div>

      <Divider />
      <MobileVariants
        data={v}
        selectedOptionValueIds={selectedOptionValueIds}
        onSelectOption={onSelectOption}
      />
      <Divider />
      <MobileSpecsChips features={data.features} />
      <Divider />
      {data.insurance ? <MobileInsurance offer={data.insurance} /> : null}
      <Divider thick />
      <MobileSeller buyBox={buyBox} />
      <Divider thick />
      {data.touchPoints ? <MobilePlus data={data.touchPoints} /> : null}
      {data.returnNotice ? (
        <>
          <Divider thick />
          <div className="flex flex-col items-start justify-start gap-3 px-4 pt-5 pb-2">
            <h4 className="text-sm font-medium leading-[1.8] text-[var(--color-neutral-850)]">
              شرایط و قوانین
            </h4>
            <div className="flex w-full items-start justify-start gap-3">
              <div className="rounded-full bg-[var(--color-neutral-100)] p-2">
                <InfoFilledIcon className="size-5 text-[var(--color-icon-high-emphasis)]" />
              </div>
              <div className="flex grow flex-col gap-1 border-b border-[var(--color-neutral-100)] py-4 text-[var(--color-icon-high-emphasis)]">
                <span className="text-[13px] font-semibold">شرایط بازگشت کالا</span>
                <p
                  className="pl-5 text-[13px] text-[var(--color-icon-neutral-hint)]"
                  style={{
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: 3,
                    overflow: "hidden",
                  }}
                >
                  {data.returnNotice}
                </p>
              </div>
            </div>
          </div>
        </>
      ) : null}

      <ProductShareSheet
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        title={data.title}
        url={shareUrl}
      />

      {toast ? (
        <div className="fixed inset-x-4 bottom-24 z-50 rounded-lg bg-[var(--color-neutral-850)] px-4 py-3 text-center text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}
    </section>
  );
}
