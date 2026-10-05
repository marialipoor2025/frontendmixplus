"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ProductWriteReviewSheet } from "@/components/product/ProductWriteReviewSheet";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  MoreHorizIcon,
  RatingStarIcon,
  SellerShopIcon,
  SortIcon,
  ThumbDownIcon,
  ThumbUpIcon,
} from "@/components/layout/icons";
import { ProductSectionTitle } from "@/components/product/ProductSectionTitle";
import type {
  ProductComment,
  ProductCommentsContent,
} from "@/types/product-detail";

type ProductCommentsProps = {
  data: ProductCommentsContent;
  productSlug: string;
  productTitle: string;
};

const SORT_OPTIONS = [
  { id: "newest", label: "جدیدترین" },
  { id: "buyers", label: "دیدگاه خریداران" },
  { id: "helpful", label: "مفیدترین" },
] as const;

function formatFa(n: number, digits = 1): string {
  return new Intl.NumberFormat("fa-IR", {
    maximumFractionDigits: digits,
    minimumFractionDigits: Number.isInteger(n) ? 0 : Math.min(digits, 1),
  }).format(n);
}

function StarRow({ rating, size = 20 }: { rating: number; size?: number }) {
  const fillPercent = Math.max(0, Math.min(100, (rating / 5) * 100));

  return (
    <div
      className="relative inline-flex flex-nowrap"
      style={{ height: size }}
      aria-label={`امتیاز ${formatFa(rating)} از ۵`}
    >
      <div className="flex gap-0.5 text-[var(--color-neutral-300)]">
        {Array.from({ length: 5 }).map((_, i) => (
          <RatingStarIcon key={`empty-${i}`} className="size-5 shrink-0" />
        ))}
      </div>
      <div
        className="absolute top-0 right-0 h-full overflow-hidden"
        style={{ width: `${fillPercent}%` }}
      >
        <div className="absolute top-0 right-0 flex flex-nowrap gap-0.5 text-[var(--color-icon-rating)]">
          {Array.from({ length: 5 }).map((_, i) => (
            <RatingStarIcon key={`fill-${i}`} className="size-5 shrink-0" />
          ))}
        </div>
      </div>
    </div>
  );
}

function CommentCard({ comment }: { comment: ProductComment }) {
  return (
    <article className="border-b border-[var(--color-neutral-200)] py-3 last:border-b-0">
      <div className="mt-1 flex w-full items-start">
        <div className="flex grow flex-col gap-2">
          <div className="flex items-center justify-between lg:ml-3">
            <div className="flex items-center">
              <div className="mt-1 size-10 shrink-0 overflow-hidden rounded-full bg-[var(--color-neutral-100)]">
                {comment.authorAvatarUrl ? (
                  <Image
                    src={comment.authorAvatarUrl}
                    alt=""
                    width={40}
                    height={40}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-sm font-bold text-[var(--color-neutral-500)]">
                    {comment.authorName.charAt(0)}
                  </div>
                )}
              </div>
              <div className="mr-2">
                <div className="flex items-center gap-1">
                  <p className="truncate text-[13px] font-semibold text-[var(--color-neutral-650,#424242)]">
                    {comment.authorName}
                  </p>
                  {comment.isBuyer ? (
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold text-[var(--color-hint-text-success,#2e7b32)] bg-[rgb(76_175_80_/_0.1)]">
                      خریدار
                    </span>
                  ) : null}
                </div>
                {comment.expertLabel ? (
                  <p className="cursor-default text-[11px] font-semibold text-[var(--color-hint-text-success,#2e7b32)]">
                    {comment.expertLabel}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="whitespace-nowrap text-[11px] text-[var(--color-neutral-500)]">
                {comment.dateLabel}
              </span>
              <button
                type="button"
                className="text-[var(--color-icon-low-emphasis)]"
                aria-label="گزینه‌های بیشتر"
              >
                <MoreHorizIcon className="size-6" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            {comment.rating != null ? (
              <div className="flex items-center">
                <StarRow rating={comment.rating} />
              </div>
            ) : null}
            <p className="mb-1 whitespace-pre-line break-words text-[13px] leading-[2.15] text-[var(--color-neutral-900)]">
              {comment.body}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-2 flex w-full flex-row items-center justify-between">
        <div className="flex items-center">
          {comment.sellerName ? (
            <Link
              href={comment.sellerHref ?? "#"}
              className="flex items-center text-[var(--color-neutral-850,#212121)]"
            >
              <SellerShopIcon className="ml-2 size-[18px] text-[var(--color-icon-high-emphasis)]" />
              <p className="inline text-[11px]">{comment.sellerName}</p>
            </Link>
          ) : null}
          {comment.colorName ? (
            <>
              <span className="mx-1 text-[var(--color-neutral-300)]">·</span>
              <span
                className="ml-2 inline-block size-3 rounded-full border border-[var(--color-neutral-200)]"
                style={{ backgroundColor: comment.colorHex }}
              />
              <p className="ml-1 inline text-[11px] text-[var(--color-neutral-600)]">
                {comment.colorName}
              </p>
            </>
          ) : null}
        </div>
        <div className="mr-auto flex items-center text-[var(--color-neutral-500)] lg:mr-0">
          <button
            type="button"
            className="flex items-center rounded-[var(--medium-radius)] px-2 text-[var(--color-neutral-650,#424242)]"
            aria-label="مفید بود"
          >
            <span className="text-[11px]">{formatFa(comment.likes, 0)}</span>
            <ThumbUpIcon className="mr-1 size-5 text-[var(--color-icon-high-emphasis)]" />
          </button>
          <button
            type="button"
            className="flex items-center rounded-[var(--medium-radius)] px-2 text-[var(--color-neutral-650,#424242)]"
            aria-label="مفید نبود"
          >
            <span className="text-[11px]">{formatFa(comment.dislikes, 0)}</span>
            <ThumbDownIcon className="mr-1 size-5 text-[var(--color-icon-high-emphasis)]" />
          </button>
        </div>
      </div>
    </article>
  );
}

/**
 * «امتیاز و دیدگاه کاربران» — summary, photos, sort, filters, list.
 */
function WriteReviewButton({
  onClick,
  className = "",
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-10 items-center justify-center rounded-[var(--medium-radius)] border border-[var(--color-primary-500)] text-xs font-medium text-[var(--color-primary-500)] ${className}`}
    >
      ثبت دیدگاه
    </button>
  );
}

export function ProductComments({
  data,
  productSlug,
  productTitle,
}: ProductCommentsProps) {
  const [sortId, setSortId] = useState<(typeof SORT_OPTIONS)[number]["id"]>(
    "helpful",
  );
  const [showAll, setShowAll] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const merged = useMemo(() => {
    void refreshKey;
    return data;
  }, [data, refreshKey]);

  const previewCount = 4;
  const sortedComments = [...merged.comments].sort((a, b) => {
    if (sortId === "newest") return 0;
    if (sortId === "buyers") {
      return Number(b.isBuyer) - Number(a.isBuyer);
    }
    return b.likes - a.likes;
  });
  const visible = showAll
    ? sortedComments
    : sortedComments.slice(0, previewCount);
  const remaining = Math.max(0, merged.totalCount - visible.length);

  return (
    <section
      id="pdp-comments"
      className="scroll-mt-40 w-screen border-b border-[var(--color-neutral-200)] pb-3 lg:mt-4 lg:w-auto"
    >
      <div className="flex items-center justify-between gap-3 px-5 lg:px-0">
        <ProductSectionTitle title="امتیاز و دیدگاه کاربران" as="p" />
        <WriteReviewButton
          onClick={() => setSheetOpen(true)}
          className="shrink-0 px-4 lg:hidden"
        />
      </div>

      <div className="mt-3 flex items-start justify-start px-5 lg:px-0">
        <div className="sticky top-[12.5rem] ml-12 hidden shrink-0 lg:block lg:w-48">
          <div className="flex items-center">
            <p className="ml-1 text-3xl font-bold leading-none text-[var(--color-neutral-900)]">
              {formatFa(merged.averageRating)}
            </p>
            <p className="text-sm text-[var(--color-neutral-700)]">از ۵</p>
          </div>
          <div className="mt-1 flex items-center">
            <StarRow rating={merged.averageRating} />
            <p className="mr-2 text-[13px] text-[var(--color-neutral-400)]">
              از مجموع {formatFa(merged.ratingCount, 0)} امتیاز
            </p>
          </div>
          <p className="mt-4 mb-3 text-[11px] text-[var(--color-neutral-700)]">
            شما هم درباره این کالا دیدگاه ثبت کنید
          </p>
          <WriteReviewButton
            onClick={() => setSheetOpen(true)}
            className="mt-2 w-full"
          />
        </div>

        <div className="min-w-0 grow">
          {merged.photos.length > 0 ? (
            <div className="mt-5 border-b border-[var(--color-neutral-200)]">
              <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {merged.photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="my-2 ml-2 size-[57px] shrink-0 cursor-pointer overflow-hidden rounded-lg border border-[var(--color-neutral-200)]"
                  >
                    <Image
                      src={photo.url}
                      alt=""
                      width={57}
                      height={57}
                      className="size-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="mt-3 mb-5 inline-flex cursor-pointer items-center text-xs font-medium text-[var(--color-secondary-500)]"
              >
                <span>مشاهده همه</span>
                <ChevronLeftIcon
                  size={18}
                  className="text-[var(--color-secondary-500)]"
                />
              </button>
            </div>
          ) : null}

          <div className="flex flex-row items-center gap-x-4">
            <div className="flex shrink-0 items-center py-3">
              <SortIcon className="ml-2 size-6 text-[var(--color-icon-high-emphasis)]" />
              <p className="whitespace-nowrap text-[13px] font-semibold text-[var(--color-neutral-700)]">
                مرتب سازی:
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSortId(opt.id)}
                  className={[
                    "cursor-pointer whitespace-nowrap text-[13px]",
                    sortId === opt.id
                      ? "font-semibold text-[var(--color-primary-700)]"
                      : "text-[var(--color-neutral-500)]",
                  ].join(" ")}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <span className="mr-auto hidden whitespace-nowrap text-[13px] text-[var(--color-neutral-500)] xl:block">
              {formatFa(merged.totalCount, 0)} دیدگاه
            </span>
          </div>

          {merged.topicFilters.length > 0 ? (
            <div className="border-b border-[var(--color-neutral-200)] py-4">
              <p className="mb-2 text-sm font-medium text-[var(--color-neutral-900)]">
                فیلتر بر اساس موضوع
              </p>
              <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {merged.topicFilters.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    className="cursor-pointer whitespace-nowrap rounded-[var(--medium-radius)] border border-[var(--color-neutral-200)] px-4 py-2 text-[13px] font-semibold text-[var(--color-neutral-800)]"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div>
            {visible.map((comment) => (
              <CommentCard key={comment.id} comment={comment} />
            ))}
            {remaining > 0 && !showAll ? (
              <div className="border-t border-[var(--color-neutral-200)] py-3">
                <button
                  type="button"
                  onClick={() => setShowAll(true)}
                  className="flex items-center text-xs font-medium text-[var(--color-secondary-500)]"
                >
                  <p>{formatFa(remaining, 0)} دیدگاه دیگر</p>
                  <ChevronDownIcon
                    size={16}
                    className="mr-1 text-[var(--color-secondary-500)]"
                  />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <ProductWriteReviewSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        productSlug={productSlug}
        productTitle={productTitle}
        onSubmitted={() => setRefreshKey((k) => k + 1)}
      />
    </section>
  );
}
