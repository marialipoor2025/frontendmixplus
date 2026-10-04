"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import {
  CompareIcon,
  InfoOutlineIcon,
  ListIcon,
  MoreHorizIcon,
  NotificationOutlineIcon,
  PriceChartIcon,
  ShareIcon,
  WishlistHeartIcon,
} from "@/components/layout/icons";
import type {
  ProductGalleryImage,
  ProductGallerySale,
} from "@/types/product-detail";

const VISIBLE_THUMBS = 5;

type ProductGalleryProps = {
  title: string;
  sku: string;
  images: ProductGalleryImage[];
  sale?: ProductGallerySale;
};

type GalleryAction = {
  id: string;
  label: string;
  icon: ReactNode;
};

function formatSoldPercent(percent: number): string {
  return new Intl.NumberFormat("fa-IR").format(percent);
}

/**
 * PDP image column: special-sale strip, action icons, main image, thumbs, SKU.
 */
export function ProductGallery({
  title,
  sku,
  images,
  sale,
}: ProductGalleryProps) {
  const safeImages = images.length
    ? images
    : [{ id: "placeholder", url: "/placeholders/product-appliance.png", alt: title }];
  const [activeIndex, setActiveIndex] = useState(0);
  const active = safeImages[Math.min(activeIndex, safeImages.length - 1)]!;
  const visibleThumbs = safeImages.slice(0, VISIBLE_THUMBS);
  const hasMore = safeImages.length > VISIBLE_THUMBS;
  const moreThumb = safeImages[VISIBLE_THUMBS] ?? safeImages[0]!;

  const actions: GalleryAction[] = [
    {
      id: "favorite",
      label: "اضافه به علاقه‌مندی",
      icon: <WishlistHeartIcon className="size-6" />,
    },
    {
      id: "share",
      label: "به اشتراک‌گذاری کالا",
      icon: <ShareIcon className="size-6" />,
    },
    {
      id: "amazing-notif",
      label: "اطلاع‌رسانی شگفت‌انگیز",
      icon: <NotificationOutlineIcon className="size-6" />,
    },
    {
      id: "price-chart",
      label: "نمودار قیمت",
      icon: <PriceChartIcon className="size-6" />,
    },
    {
      id: "compare",
      label: "مقایسه کالا",
      icon: <CompareIcon className="size-6" />,
    },
    {
      id: "wishlist",
      label: "افزودن به لیست",
      icon: <ListIcon className="size-6" />,
    },
  ];

  return (
    <div className="flex w-full shrink-0 flex-col-reverse lg:ml-4 lg:w-[36%] lg:max-w-[580px] lg:flex-col">
      {sale ? (
        <div
          className="mb-0 flex items-center justify-between gap-3 px-5 py-2 text-sm lg:mb-5"
          style={{ backgroundColor: "rgb(230 18 61 / 0.08)" }}
        >
          <div className="flex items-center justify-center">
            <div className="font-semibold" style={{ color: "rgb(230, 18, 61)" }}>
              {sale.label}
            </div>
          </div>
          <div className="flex grow items-center justify-end">
            <div className="flex grow flex-col gap-1 2xl:flex-row 2xl:items-center 2xl:gap-2">
              <div className="flex items-center justify-start gap-0.5 text-[11px] leading-4 text-[var(--color-neutral-500)]">
                <span
                  className="ml-0.5 text-xs font-semibold leading-4"
                  style={{ color: "rgb(230, 18, 61)" }}
                >
                  {formatSoldPercent(sale.soldPercent)}%
                </span>
                فروش رفته
              </div>
              <div
                className="block h-1 grow rounded"
                style={{ backgroundColor: "rgb(230 18 61 / 0.08)" }}
              >
                <span
                  className="relative block h-1 rounded"
                  style={{
                    backgroundColor: "rgb(230, 18, 61)",
                    width: `${Math.min(100, Math.max(0, sale.soldPercent))}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col items-center lg:block lg:max-w-[368px] xl:max-w-[580px]">
        <div className="relative flex w-full">
          <div className="flex self-end text-[var(--color-neutral-700)] lg:flex-col lg:gap-y-4 lg:self-start lg:text-[var(--color-neutral-900)]">
            {actions.map((action) => (
              <div key={action.id} className="z-[1] whitespace-nowrap lg:ml-4">
                <button
                  type="button"
                  className="flex cursor-pointer text-[var(--color-icon-high-emphasis)] transition hover:text-[var(--color-neutral-900)]"
                  aria-label={action.label}
                  title={action.label}
                >
                  {action.icon}
                </button>
              </div>
            ))}
          </div>

          <div className="relative flex flex-1 items-center">
            <button
              type="button"
              className="w-full cursor-pointer leading-none"
              aria-label={active.alt || title}
              onClick={() =>
                setActiveIndex((i) => (i + 1) % safeImages.length)
              }
            >
              <Image
                src={active.url}
                alt={active.alt || title}
                title={title}
                width={800}
                height={800}
                className="aspect-square w-full overflow-hidden rounded-[var(--large-radius)] object-contain"
                sizes="(min-width: 1280px) 580px, (min-width: 1024px) 368px, 100vw"
                priority
              />
            </button>
          </div>
        </div>

        <div className="mt-5 mb-3 flex w-full items-center overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {visibleThumbs.map((image, index) => {
            const selected = index === activeIndex;
            return (
              <button
                key={image.id}
                type="button"
                className={[
                  "ml-2 cursor-pointer rounded border p-1 transition",
                  selected
                    ? "border-[var(--color-neutral-400)]"
                    : "border-[var(--color-neutral-200)] hover:border-[var(--color-neutral-300)]",
                ].join(" ")}
                aria-label={image.alt || title}
                aria-current={selected ? "true" : undefined}
                onClick={() => setActiveIndex(index)}
              >
                <Image
                  src={image.url}
                  alt={image.alt || title}
                  width={72}
                  height={72}
                  className="size-[72px] object-contain"
                />
              </button>
            );
          })}

          {hasMore ? (
            <button
              type="button"
              className="relative flex cursor-pointer items-center justify-center rounded border border-[var(--color-neutral-200)] p-1"
              aria-label="مشاهده تصاویر بیشتر"
              onClick={() => setActiveIndex(VISIBLE_THUMBS)}
            >
              <Image
                src={moreThumb.url}
                alt=""
                width={72}
                height={72}
                className="size-[72px] object-contain blur-[1.5px] brightness-90"
              />
              <span className="absolute flex text-[var(--color-icon-high-emphasis)]">
                <MoreHorizIcon className="size-6" />
              </span>
            </button>
          ) : null}
        </div>

        <div className="mt-1 hidden items-center lg:flex">
          <button
            type="button"
            className="ml-9 cursor-pointer rounded"
            aria-label="گزارش مشخصات کالا یا موارد قانونی"
          >
            <span className="flex items-center">
              <InfoOutlineIcon className="mt-0.5 size-[18px] text-[var(--color-neutral-500)]" />
              <span className="mr-2 text-[13px] text-[var(--color-neutral-500)]">
                گزارش مشخصات کالا یا موارد قانونی
              </span>
            </span>
          </button>
          <span className="text-[11px] text-[var(--color-neutral-400)]">
            {sku}
          </span>
        </div>
      </div>
    </div>
  );
}
