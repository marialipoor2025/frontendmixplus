"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ChevronLeftIcon,
  CompareIcon,
  InfoOutlineIcon,
  ListIcon,
  MoreHorizIcon,
  NotificationOutlineIcon,
  PriceChartIcon,
  ShareIcon,
  WishlistHeartIcon,
} from "@/components/layout/icons";
import { ProductBreadcrumb } from "@/components/product/ProductBreadcrumb";
import { ProductShareSheet } from "@/components/product/ProductShareSheet";
import {
  addToWishlist,
  isInWishlist,
  removeFromWishlist,
} from "@/lib/api/wishlist";
import { useAuth } from "@/lib/auth/useAuth";
import type {
  BreadcrumbItem,
  ProductGalleryImage,
  ProductGallerySale,
} from "@/types/product-detail";

const VISIBLE_THUMBS = 5;
const ZOOM_MIN = 1;
const ZOOM_MAX = 3;
const ZOOM_STEP = 0.5;
const MOBILE_LARGE = 300;
const MOBILE_SMALL = 144;
/** Sticky PDP chrome height (search / cart / more). */
const MOBILE_CHROME_H = 48;

type ProductGalleryProps = {
  title: string;
  slug: string;
  sku: string;
  images: ProductGalleryImage[];
  sale?: ProductGallerySale;
  priceAmount?: number;
  /** Mobile: rendered under sticky chrome, above the mosaic. */
  breadcrumb?: BreadcrumbItem[];
};

type GalleryAction = {
  id: string;
  label: string;
  icon: ReactNode;
  onClick?: () => void;
  active?: boolean;
};

type MosaicGroup = {
  large: ProductGalleryImage;
  smallTop?: ProductGalleryImage;
  smallBottom?: ProductGalleryImage;
  largeIndex: number;
  smallTopIndex?: number;
  smallBottomIndex?: number;
};

function formatSoldPercent(percent: number): string {
  return new Intl.NumberFormat("fa-IR").format(percent);
}

function formatFaCount(n: number): string {
  return new Intl.NumberFormat("fa-IR").format(n);
}

function GalleryImageIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={28}
      height={28}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Zm0 16H5v-2.17l2.59-2.58a1 1 0 0 1 1.41 0L11 16l3.59-3.58a1 1 0 0 1 1.41 0L19 15.17V19Zm0-6.83-2.29-2.3a3 3 0 0 0-4.24 0L11 11.34 8.71 9.05a3 3 0 0 0-4.24 0L5 8.52V5h14v7.17ZM8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
    </svg>
  );
}

function chunkMosaic(images: ProductGalleryImage[]): MosaicGroup[] {
  const groups: MosaicGroup[] = [];
  for (let i = 0; i < images.length; i += 3) {
    groups.push({
      large: images[i]!,
      largeIndex: i,
      smallTop: images[i + 1],
      smallTopIndex: images[i + 1] ? i + 1 : undefined,
      smallBottom: images[i + 2],
      smallBottomIndex: images[i + 2] ? i + 2 : undefined,
    });
  }
  return groups;
}

/**
 * PDP image column: Digikala-style mobile mosaic + desktop action column.
 * Heart = wishlist (#54), share sheet (#56), zoom lightbox (#30).
 */
export function ProductGallery({
  title,
  slug,
  sku,
  images,
  sale,
  priceAmount = 0,
  breadcrumb = [],
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
  const mosaicGroups = useMemo(() => chunkMosaic(safeImages), [safeImages]);
  const mosaicRef = useRef<HTMLDivElement>(null);
  const [mosaicHeight, setMosaicHeight] = useState(360);
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

  /** Keep in-flow spacer matched to the fixed mosaic so the card can slide over it. */
  useEffect(() => {
    const el = mosaicRef.current;
    if (!el) return;
    const sync = () => setMosaicHeight(el.offsetHeight);
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, [mosaicGroups.length]);

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

  const openZoomAt = (index: number) => {
    const image = safeImages[index];
    if (!image || image.kind === "video") return;
    setActiveIndex(index);
    setZoomScale(ZOOM_MIN);
    setZoomOpen(true);
  };

  async function toggleWishlist() {
    if (!ready) return;
    if (!isAuthenticated) {
      const returnUrl = `/product/${slug}`;
      router.push(`/users/login?returnUrl=${encodeURIComponent(returnUrl)}`);
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

  function renderMosaicTile(
    image: ProductGalleryImage,
    index: number,
    size: number,
    overlayCount?: number,
  ) {
    return (
      <button
        type="button"
        className="relative flex h-fit w-fit cursor-pointer items-center justify-center rounded bg-[var(--color-neutral-100)]"
        aria-label={image.alt || title}
        onClick={() => openZoomAt(index)}
      >
        <div
          className="relative shrink-0 overflow-hidden rounded"
          style={{
            width: size,
            height: size,
            mixBlendMode: "multiply",
            lineHeight: 0,
          }}
        >
          <Image
            src={image.url}
            alt={image.alt || title}
            width={size}
            height={size}
            className="h-full w-full rounded object-cover"
            sizes={`${size}px`}
            priority={index === 0}
          />
          {overlayCount != null && overlayCount > 0 ? (
            <span className="absolute inset-x-2 bottom-2 mx-auto flex w-fit items-center gap-1 rounded-full bg-[rgb(66_71_80_/_0.72)] px-2.5 py-1 text-xs font-medium text-white">
              <GalleryImageIcon className="size-3.5 text-white" />
              {formatFaCount(overlayCount)}
            </span>
          ) : null}
        </div>
      </button>
    );
  }

  return (
    <>
      {/*
        Digikala mobile: mosaic fixed under sticky chrome; one in-flow block
        reserves chrome + mosaic height. Breadcrumb sits under chrome (scrolls away).
      */}
      <div
        ref={mosaicRef}
        className="fixed inset-x-0 top-12 z-[1] w-full min-w-0 bg-white lg:hidden"
      >
        <div className="hide-scrollbar flex w-full touch-pan-x items-center overflow-x-auto overscroll-x-contain px-1">
          {mosaicGroups.map((group, groupIndex) => {
            const showCountOverlay =
              groupIndex === 0 &&
              group.smallBottom &&
              safeImages.length > 3;
            return (
              <div
                key={`mosaic-${group.large.id}-${groupIndex}`}
                className="mr-3 flex gap-3 self-center"
              >
                {renderMosaicTile(
                  group.large,
                  group.largeIndex,
                  MOBILE_LARGE,
                )}
                {(group.smallTop || group.smallBottom) && (
                  <div className="flex flex-col items-center gap-3">
                    {group.smallTop && group.smallTopIndex != null
                      ? renderMosaicTile(
                          group.smallTop,
                          group.smallTopIndex,
                          MOBILE_SMALL,
                        )
                      : (
                        <div
                          className="rounded bg-[var(--color-neutral-100)]"
                          style={{
                            width: MOBILE_SMALL,
                            height: MOBILE_SMALL,
                          }}
                        />
                      )}
                    {group.smallBottom && group.smallBottomIndex != null
                      ? renderMosaicTile(
                          group.smallBottom,
                          group.smallBottomIndex,
                          MOBILE_SMALL,
                          showCountOverlay ? safeImages.length : undefined,
                        )
                      : group.smallTop ? (
                        <div
                          className="rounded bg-[var(--color-neutral-100)]"
                          style={{
                            width: MOBILE_SMALL,
                            height: MOBILE_SMALL,
                          }}
                        />
                      ) : null}
                  </div>
                )}
              </div>
            );
          })}

          <button
            type="button"
            className="mr-1 flex h-[320px] w-[min(367px,78vw)] shrink-0 cursor-pointer flex-col items-center justify-center gap-3 self-center bg-white"
            onClick={() => openZoomAt(0)}
            aria-label="همه تصویرها"
          >
            <GalleryImageIcon className="size-7 text-[var(--color-icon-high-emphasis)]" />
            <span className="inline-flex h-8 items-center gap-2 rounded-lg bg-[var(--color-primary-tonal,#ffe6eb)] px-2 text-sm font-medium text-[var(--color-primary-700,#ef394e)]">
              <GalleryImageIcon className="size-4" />
              همه تصویرها
              <ChevronLeftIcon className="size-4" />
            </span>
          </button>
        </div>
      </div>

      {/* In-flow: chrome clearance + mosaic height; breadcrumb under chrome */}
      <div
        className="relative z-[2] w-full shrink-0 lg:hidden"
        style={{ height: MOBILE_CHROME_H + mosaicHeight }}
      >
        <div className="h-12 bg-transparent" aria-hidden />
        {breadcrumb.length ? (
          <div className="relative z-[2] bg-white px-4">
            <ProductBreadcrumb items={breadcrumb} />
          </div>
        ) : null}
      </div>

      {/* —— Desktop column —— */}
      <div className="hidden w-full min-w-0 shrink-0 flex-col lg:ml-4 lg:flex lg:w-[36%] lg:max-w-[580px]">
        {sale ? (
          <div
            className="mb-5 flex items-center justify-between gap-3 px-5 py-2 text-sm"
            style={{ backgroundColor: "rgb(230 18 61 / 0.08)" }}
          >
            <div className="flex items-center justify-center">
              <div
                className="font-semibold"
                style={{ color: "rgb(230, 18, 61)" }}
              >
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

        <div className="block max-w-[368px] xl:max-w-[580px]">
          <div className="relative flex w-full">
            <div className="flex flex-col gap-y-4 self-start text-[var(--color-neutral-900)]">
              {actions.map((action) => (
                <div key={action.id} className="z-[1] ml-4 whitespace-nowrap">
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
                  onClick={() => openZoomAt(activeIndex)}
                >
                  <Image
                    src={active.url}
                    alt={active.alt || title}
                    title={title}
                    width={800}
                    height={800}
                    className="aspect-square w-full overflow-hidden rounded-[var(--large-radius)] object-contain"
                    sizes="(min-width: 1280px) 580px, 368px"
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

          <div className="mt-1 flex items-center">
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
    </>
  );
}
