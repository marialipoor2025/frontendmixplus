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
/** Digikala mosaic: one large square + two half-size stacked (gap keeps heights equal). */
const MOBILE_LARGE = 300;
const MOBILE_SMALL = 144;
const MOBILE_STACK_GAP = 12;
/** Sticky PDP chrome height (search / cart / more). */
const MOBILE_CHROME_H = 48;
/** Ensure Digikala mosaic has enough tiles to scroll horizontally. */
const MOSAIC_TARGET_COUNT = 5;
const MOSAIC_PAD_URLS = [
  "/placeholders/product-appliance.png",
  "/placeholders/cat-appliance.jpg",
  "/placeholders/cat-appliance.png",
  "/placeholders/product-appliance.png",
  "/placeholders/cat-appliance.jpg",
];

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

/** Pad to Digikala mosaic length so [large|2-stack] then [large|…] can scroll. */
function ensureMosaicImages(
  images: ProductGalleryImage[],
  title: string,
): ProductGalleryImage[] {
  if (images.length >= MOSAIC_TARGET_COUNT) {
    return images;
  }
  const out = [...images];
  let pad = 0;
  while (out.length < MOSAIC_TARGET_COUNT) {
    // Prefer repeating real product images so layout matches Digikala without unrelated placeholders.
    const source = out[pad % Math.max(out.length, 1)] ?? out[0];
    const url =
      source?.url ??
      MOSAIC_PAD_URLS[pad % MOSAIC_PAD_URLS.length] ??
      "/placeholders/product-appliance.png";
    out.push({
      id: `mosaic-pad-${out.length + 1}`,
      url,
      alt: `تصویر ${out.length + 1} — ${title}`,
    });
    pad += 1;
  }
  return out;
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
  const safeImages = useMemo(() => {
    const base = images.length
      ? images
      : [
          {
            id: "placeholder",
            url: "/placeholders/product-appliance.png",
            alt: title,
          },
        ];
    return ensureMosaicImages(base, title);
  }, [images, title]);
  const mosaicGroups = useMemo(() => chunkMosaic(safeImages), [safeImages]);
  const mosaicRef = useRef<HTMLDivElement>(null);
  const zoomScrollerRef = useRef<HTMLDivElement>(null);
  const zoomScrollLock = useRef(false);
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
    const go = (delta: number) => {
      setActiveIndex((i) => {
        const next = (i + delta + safeImages.length) % safeImages.length;
        return next;
      });
      setZoomScale(ZOOM_MIN);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setZoomOpen(false);
      if (event.key === "ArrowLeft") go(1);
      if (event.key === "ArrowRight") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [zoomOpen, safeImages.length]);

  /** Keep lightbox scroller aligned with the active image (Digikala swipe pager). */
  useEffect(() => {
    if (!zoomOpen) return;
    const el = zoomScrollerRef.current;
    if (!el) return;

    const sync = () => {
      if (el.clientWidth === 0) return;
      zoomScrollLock.current = true;
      el.scrollTo({
        left: activeIndex * el.clientWidth,
        behavior: "auto",
      });
      window.requestAnimationFrame(() => {
        zoomScrollLock.current = false;
      });
    };

    // Wait a frame so the dialog has a real width after open.
    const id = window.requestAnimationFrame(sync);
    return () => window.cancelAnimationFrame(id);
  }, [zoomOpen, activeIndex]);

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

  const stepZoomImage = (delta: number) => {
    setActiveIndex(
      (i) => (i + delta + safeImages.length) % safeImages.length,
    );
    setZoomScale(ZOOM_MIN);
  };

  const onZoomScrollerScroll = () => {
    if (zoomScrollLock.current) return;
    const el = zoomScrollerRef.current;
    if (!el || el.clientWidth === 0) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    if (idx === activeIndex || idx < 0 || idx >= safeImages.length) return;
    setActiveIndex(idx);
    setZoomScale(ZOOM_MIN);
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
        className="relative flex h-fit w-fit shrink-0 cursor-pointer items-center justify-center rounded bg-[var(--color-neutral-100)]"
        aria-label={image.alt || title}
        onClick={() => openZoomAt(index)}
      >
        <div
          className="relative shrink-0 overflow-hidden rounded"
          style={{
            width: size,
            height: size,
            lineHeight: 0,
          }}
        >
          <Image
            src={image.url}
            alt={image.alt || title}
            width={size}
            height={size}
            draggable={false}
            className="pointer-events-none h-full w-full rounded object-cover select-none"
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
        <div className="pdp-mosaic-scroll hide-scrollbar flex w-full items-stretch overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {mosaicGroups.map((group, groupIndex) => {
            const showCountOverlay =
              groupIndex === mosaicGroups.length - 1 &&
              Boolean(group.smallBottom) &&
              safeImages.length > 3;
            const hasStack = Boolean(group.smallTop || group.smallBottom);
            return (
              <div
                key={`mosaic-${group.large.id}-${groupIndex}`}
                className="mr-3 flex shrink-0 items-center gap-3"
              >
                {renderMosaicTile(
                  group.large,
                  group.largeIndex,
                  MOBILE_LARGE,
                )}
                {hasStack ? (
                  <div
                    className="flex flex-col items-center justify-between"
                    style={{
                      height: MOBILE_LARGE,
                      gap: MOBILE_STACK_GAP,
                    }}
                  >
                    {group.smallTop && group.smallTopIndex != null ? (
                      renderMosaicTile(
                        group.smallTop,
                        group.smallTopIndex,
                        MOBILE_SMALL,
                      )
                    ) : (
                      <div
                        className="rounded bg-[var(--color-neutral-100)]"
                        style={{
                          width: MOBILE_SMALL,
                          height: MOBILE_SMALL,
                        }}
                      />
                    )}
                    {group.smallBottom && group.smallBottomIndex != null ? (
                      renderMosaicTile(
                        group.smallBottom,
                        group.smallBottomIndex,
                        MOBILE_SMALL,
                        showCountOverlay ? safeImages.length : undefined,
                      )
                    ) : group.smallTop ? (
                      <div
                        className="rounded bg-[var(--color-neutral-100)]"
                        style={{
                          width: MOBILE_SMALL,
                          height: MOBILE_SMALL,
                        }}
                      />
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })}

          <button
            type="button"
            className="mr-1 flex h-[300px] w-[min(280px,70vw)] shrink-0 cursor-pointer flex-col items-center justify-center gap-3 self-center bg-white"
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

      {/*
        In-flow spacer must NOT capture touches — it sits over the fixed mosaic.
        Only the breadcrumb stays clickable.
      */}
      <div
        className="pointer-events-none relative z-[2] w-full shrink-0 lg:hidden"
        style={{ height: MOBILE_CHROME_H + mosaicHeight }}
        aria-hidden={!breadcrumb.length}
      >
        <div className="h-12 bg-transparent" aria-hidden />
        {breadcrumb.length ? (
          <div className="pointer-events-auto relative z-[2] bg-white px-4">
            <ProductBreadcrumb items={breadcrumb} />
          </div>
        ) : null}
      </div>

      {/* —— Digikala desktop gallery column (end / right in RTL) —— */}
      <div className="hidden w-full min-w-0 shrink-0 flex-col lg:flex lg:w-[34%] lg:max-w-[420px] xl:max-w-[480px]">
        {sale ? (
          <div className="mb-5 flex items-center justify-between gap-3 bg-[linear-gradient(90deg,rgb(22_114_221_/_0.08),rgb(237_25_68_/_0.08))] px-5 py-2 text-sm">
            <div className="flex items-center justify-center">
              <div className="bg-gradient-to-l from-[#1672dd] to-[#ed1944] bg-clip-text font-semibold text-transparent">
                {sale.label}
              </div>
            </div>
            <div className="flex grow items-center justify-end">
              <div className="flex grow flex-col gap-1 2xl:flex-row 2xl:items-center 2xl:gap-2">
                <div className="flex items-center justify-start gap-0.5 text-[11px] leading-4 text-[var(--color-neutral-500)]">
                  <span className="ml-0.5 bg-gradient-to-l from-[#1672dd] to-[#ed1944] bg-clip-text text-xs font-semibold leading-4 text-transparent">
                    {formatSoldPercent(sale.soldPercent)}%
                  </span>
                  فروش رفته
                </div>
                <div className="block h-1 grow rounded bg-[var(--color-neutral-100)]">
                  <span
                    className="relative block h-1 rounded bg-gradient-to-l from-[#1672dd] to-[#ed1944]"
                    style={{
                      width: `${Math.min(100, Math.max(0, sale.soldPercent))}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="block w-full">
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
              <span className="min-w-[3.5rem] text-center text-xs tabular-nums text-white/80">
                {formatFaCount(activeIndex + 1)} / {formatFaCount(safeImages.length)}
              </span>
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

          <div className="relative min-h-0 flex-1">
            {safeImages.length > 1 ? (
              <>
                <button
                  type="button"
                  className="absolute start-2 top-1/2 z-[2] flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm"
                  aria-label="تصویر قبلی"
                  onClick={() => stepZoomImage(-1)}
                >
                  <ChevronLeftIcon className="size-6 rotate-180" />
                </button>
                <button
                  type="button"
                  className="absolute end-2 top-1/2 z-[2] flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm"
                  aria-label="تصویر بعدی"
                  onClick={() => stepZoomImage(1)}
                >
                  <ChevronLeftIcon className="size-6" />
                </button>
              </>
            ) : null}

            {/*
              Digikala-style pager: swipe / scroll horizontally between images.
              dir=ltr keeps scrollLeft math stable; arrows still work in RTL UI.
            */}
            <div
              ref={zoomScrollerRef}
              dir="ltr"
              className="pdp-zoom-scroll flex h-full w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
              onScroll={onZoomScrollerScroll}
            >
              {safeImages.map((image, index) => (
                <div
                  key={image.id}
                  className="flex h-full w-full shrink-0 snap-center items-center justify-center p-4"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.url}
                    alt={image.alt || title}
                    draggable={false}
                    className="max-h-[85vh] max-w-full select-none object-contain transition-transform duration-150"
                    style={{
                      transform:
                        index === activeIndex
                          ? `scale(${zoomScale})`
                          : "scale(1)",
                    }}
                    onClick={() => {
                      if (index !== activeIndex) return;
                      setZoomScale((z) =>
                        z >= ZOOM_MAX
                          ? ZOOM_MIN
                          : Math.min(ZOOM_MAX, z + ZOOM_STEP),
                      );
                    }}
                  />
                </div>
              ))}
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
