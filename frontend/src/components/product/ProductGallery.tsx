"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
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
import { ProductShareSheet } from "@/components/product/ProductShareSheet";
import {
  addToWishlist,
  isInWishlist,
  removeFromWishlist,
} from "@/lib/api/wishlist";
import { useAuth } from "@/lib/auth/useAuth";
import type {
  ProductGalleryImage,
  ProductGallerySale,
} from "@/types/product-detail";

const VISIBLE_THUMBS = 5;
const ZOOM_MIN = 1;
const ZOOM_MAX = 3;
const ZOOM_STEP = 0.5;

type ProductGalleryProps = {
  title: string;
  slug: string;
  sku: string;
  images: ProductGalleryImage[];
  sale?: ProductGallerySale;
  priceAmount?: number;
};

type GalleryAction = {
  id: string;
  label: string;
  icon: ReactNode;
  onClick?: () => void;
  active?: boolean;
};

function formatSoldPercent(percent: number): string {
  return new Intl.NumberFormat("fa-IR").format(percent);
}

/**
 * PDP image column: special-sale strip, action icons, main image, thumbs, SKU.
 * Clicking the main image opens a zoom lightbox (#30).
 * Heart = wishlist (#54), share sheet (#56).
 */
export function ProductGallery({
  title,
  slug,
  sku,
  images,
  sale,
  priceAmount = 0,
}: ProductGalleryProps) {
  const router = useRouter();
  const { ready, isAuthenticated } = useAuth();
  const safeImages = images.length
    ? images
    : [
        {
          id: "placeholder",
          url: "/placeholders/product-appliance.png",
          alt: title,
        },
      ];
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(ZOOM_MIN);
  const [shareOpen, setShareOpen] = useState(false);
  const [wished, setWished] = useState(false);
  const [wishBusy, setWishBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const active = safeImages[Math.min(activeIndex, safeImages.length - 1)]!;
  const visibleThumbs = safeImages.slice(0, VISIBLE_THUMBS);
  const hasMore = safeImages.length > VISIBLE_THUMBS;
  const moreThumb = safeImages[VISIBLE_THUMBS] ?? safeImages[0]!;
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/product/${slug}`
      : `/product/${slug}`;

  useEffect(() => {
    if (!ready || !isAuthenticated || !slug) return;
    let cancelled = false;
    void isInWishlist(slug).then((value) => {
      if (!cancelled) setWished(value);
    });
    return () => {
      cancelled = true;
    };
  }, [ready, isAuthenticated, slug]);

  useEffect(() => {
    if (!zoomOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setZoomOpen(false);
      if (event.key === "ArrowLeft") {
        setActiveIndex((i) => (i + 1) % safeImages.length);
        setZoomScale(ZOOM_MIN);
      }
      if (event.key === "ArrowRight") {
        setActiveIndex((i) => (i - 1 + safeImages.length) % safeImages.length);
        setZoomScale(ZOOM_MIN);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [zoomOpen, safeImages.length]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(t);
  }, [toast]);

  const openZoom = () => {
    if (active.kind === "video") return;
    setZoomScale(ZOOM_MIN);
    setZoomOpen(true);
  };

  async function toggleWishlist() {
    if (!ready) return;
    if (!isAuthenticated) {
      const returnUrl = `/product/${slug}`;
      router.push(
        `/users/login?returnUrl=${encodeURIComponent(returnUrl)}`,
      );
      return;
    }
    if (wishBusy) return;
    setWishBusy(true);
    try {
      if (wished) {
        await removeFromWishlist(slug);
        setWished(false);
        setToast("از علاقه‌مندی‌ها حذف شد");
      } else {
        await addToWishlist({
          productSlug: slug,
          title,
          imageUrl: safeImages[0]?.url ?? "",
          priceAmount,
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

  const actions: GalleryAction[] = [
    {
      id: "favorite",
      label: wished ? "حذف از علاقه‌مندی" : "اضافه به علاقه‌مندی",
      icon: (
        <WishlistHeartIcon
          className={`size-6 ${wished ? "text-[var(--color-hint-object-error)]" : ""}`}
          filled={wished}
        />
      ),
      onClick: () => void toggleWishlist(),
      active: wished,
    },
    {
      id: "share",
      label: "به اشتراک‌گذاری کالا",
      icon: <ShareIcon className="size-6" />,
      onClick: () => setShareOpen(true),
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
                  className="flex cursor-pointer text-[var(--color-icon-high-emphasis)] transition hover:text-[var(--color-neutral-900)] disabled:opacity-60"
                  aria-label={action.label}
                  title={action.label}
                  aria-pressed={action.active}
                  disabled={action.id === "favorite" && wishBusy}
                  onClick={action.onClick}
                >
                  {action.icon}
                </button>
              </div>
            ))}
          </div>

          <div className="relative flex flex-1 items-center">
            {active.kind === "video" ? (
              <video
                src={active.url}
                className="aspect-square w-full overflow-hidden rounded-[var(--large-radius)] bg-[var(--color-neutral-50)] object-contain"
                controls
                playsInline
                preload="metadata"
              />
            ) : (
              <button
                type="button"
                className="w-full cursor-zoom-in leading-none"
                aria-label={`بزرگ‌نمایی تصویر ${active.alt || title}`}
                onClick={openZoom}
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
            )}
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

      {toast ? (
        <div className="fixed bottom-24 left-1/2 z-[90] -translate-x-1/2 rounded-full bg-[var(--color-neutral-900)] px-4 py-2 text-sm text-white shadow-lg lg:bottom-8">
          {toast}
        </div>
      ) : null}

      <ProductShareSheet
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        title={title}
        url={shareUrl}
      />

      {zoomOpen ? (
        <div
          className="fixed inset-0 z-[70] flex flex-col bg-black/90"
          role="dialog"
          aria-modal="true"
          aria-label="بزرگ‌نمایی تصویر محصول"
        >
          <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-3 text-white">
            <p className="truncate text-sm font-medium">{title}</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="cursor-pointer rounded-lg border border-white/30 px-3 py-1.5 text-sm disabled:opacity-40"
                disabled={zoomScale <= ZOOM_MIN}
                onClick={() =>
                  setZoomScale((z) => Math.max(ZOOM_MIN, z - ZOOM_STEP))
                }
                aria-label="کوچک‌نمایی"
              >
                −
              </button>
              <span className="min-w-[3rem] text-center text-xs tabular-nums">
                {Math.round(zoomScale * 100)}%
              </span>
              <button
                type="button"
                className="cursor-pointer rounded-lg border border-white/30 px-3 py-1.5 text-sm disabled:opacity-40"
                disabled={zoomScale >= ZOOM_MAX}
                onClick={() =>
                  setZoomScale((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP))
                }
                aria-label="بزرگ‌نمایی"
              >
                +
              </button>
              <button
                type="button"
                className="ms-2 cursor-pointer rounded-lg bg-white/15 px-3 py-1.5 text-sm"
                onClick={() => setZoomOpen(false)}
                aria-label="بستن"
              >
                بستن
              </button>
            </div>
          </div>

          <div className="relative min-h-0 flex-1 overflow-auto">
            <button
              type="button"
              className="absolute inset-0 cursor-zoom-out"
              aria-label="بستن بزرگ‌نمایی"
              onClick={() => setZoomOpen(false)}
            />
            <div className="pointer-events-none relative z-[1] flex min-h-full items-center justify-center p-4">
              {/* Native img so scale() works without next/image layout constraints */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={active.url}
                alt={active.alt || title}
                className="pointer-events-auto max-h-[85vh] max-w-full object-contain transition-transform duration-150"
                style={{ transform: `scale(${zoomScale})` }}
                onClick={(event) => {
                  event.stopPropagation();
                  setZoomScale((z) =>
                    z >= ZOOM_MAX ? ZOOM_MIN : Math.min(ZOOM_MAX, z + ZOOM_STEP),
                  );
                }}
              />
            </div>
          </div>

          {safeImages.length > 1 ? (
            <div className="flex shrink-0 justify-center gap-2 overflow-x-auto px-4 py-3">
              {safeImages.map((image, index) =>
                image.kind === "video" ? null : (
                  <button
                    key={image.id}
                    type="button"
                    className={`shrink-0 cursor-pointer rounded border p-0.5 ${
                      index === activeIndex
                        ? "border-white"
                        : "border-white/30"
                    }`}
                    onClick={() => {
                      setActiveIndex(index);
                      setZoomScale(ZOOM_MIN);
                    }}
                  >
                    <Image
                      src={image.url}
                      alt=""
                      width={56}
                      height={56}
                      className="size-14 object-contain"
                    />
                  </button>
                ),
              )}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
