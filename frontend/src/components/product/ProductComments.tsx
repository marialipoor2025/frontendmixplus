"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ProductWriteReviewSheet } from "@/components/product/ProductWriteReviewSheet";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  CommunityIcon,
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

function StarRow({ rating }: { rating: number }) {
  const fillPercent = Math.max(0, Math.min(100, (rating / 5) * 100));

  return (
    <div
      className="relative inline-flex h-5 flex-nowrap"
      aria-label={`امتیاز ${formatFa(rating)} از ۵`}
    >
      <div className="flex gap-0.5 text-[var(--color-neutral-300)]">
        {Array.from({ length: 5 }).map((_, i) => (
          <RatingStarIcon key={`empty-${i}`} className="size-5 shrink-0" />
        ))}
      </div>
      <div
        className="absolute inset-0 overflow-hidden"
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

/** Digikala yellow silhouette avatar fallback. */
function AuthorAvatar({
  comment,
  size = 40,
}: {
  comment: ProductComment;
  size?: number;
}) {
  return (
    <div
      className="shrink-0 overflow-hidden rounded-full bg-[#ffe082]"
      style={{ width: size, height: size }}
      aria-hidden
    >
      {comment.authorAvatarUrl ? (
        <Image
          src={comment.authorAvatarUrl}
          alt=""
          width={size}
          height={size}
          className="size-full object-cover"
        />
      ) : (
        <svg
          viewBox="0 0 40 40"
          className="size-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="20" cy="20" r="20" fill="#FFC107" />
          <circle cx="20" cy="15" r="7" fill="#FFF8E1" />
          <path
            d="M8 34c2.5-7 8-10 12-10s9.5 3 12 10"
            fill="#FFF8E1"
          />
        </svg>
      )}
    </div>
  );
}

function ExpertBadge({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-1">
      <svg
        className="size-5 shrink-0"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden
      >
        <circle cx="10" cy="10" r="9" fill="rgb(76 175 80 / 0.15)" />
        <path
          d="M10 4.5 11.4 8h3.6l-2.9 2.2 1.1 3.5L10 11.6 6.8 13.7l1.1-3.5L5 8h3.6L10 4.5Z"
          fill="#2e7b32"
        />
      </svg>
      <span className="truncate text-[11px] font-semibold leading-[1.8] text-[var(--color-hint-text-success,#2e7b32)]">
        {label}
      </span>
    </div>
  );
}

function HelpfulnessButtons({
  comment,
  compact = false,
}: {
  comment: ProductComment;
  compact?: boolean;
}) {
  const iconClass = compact
    ? "mr-1 size-4 text-[var(--color-icon-high-emphasis)]"
    : "mr-1 size-5 text-[var(--color-icon-high-emphasis)]";

  return (
    <div className="mr-auto flex items-center text-[var(--color-neutral-500)]">
      <button
        type="button"
        className="flex items-center rounded-[var(--medium-radius)] px-2 text-[var(--color-neutral-650,#424242)]"
        aria-label="مفید بود"
      >
        <span className="text-[11px]">{formatFa(comment.likes, 0)}</span>
        <ThumbUpIcon className={iconClass} />
      </button>
      <button
        type="button"
        className="flex items-center rounded-[var(--medium-radius)] px-2 text-[var(--color-neutral-650,#424242)]"
        aria-label="مفید نبود"
      >
        <span className="text-[11px]">{formatFa(comment.dislikes, 0)}</span>
        <ThumbDownIcon className={iconClass} />
      </button>
    </div>
  );
}

/** Digikala mobile: fixed 240×240 (xs: 280) horizontal review card. */
function MobileReviewCard({ comment }: { comment: ProductComment }) {
  return (
    <article className="ml-2 flex h-60 w-60 shrink-0 flex-col rounded-[var(--medium-plus-radius)] border border-[var(--color-neutral-200)] bg-white p-3 min-[400px]:w-[280px]">
      <div className="mb-2">
        <div className="flex items-center">
          <AuthorAvatar comment={comment} />
          <div className="mr-2 min-w-0">
            <div className="flex items-center">
              <p className="max-w-32 truncate text-[13px] font-semibold leading-tight text-[var(--color-neutral-650,#424242)]">
                {comment.authorName}
              </p>
              {comment.isBuyer ? (
                <>
                  <span
                    className="mx-0.5 size-1 shrink-0 rounded-full bg-[var(--color-neutral-200)]"
                    aria-hidden
                  />
                  <span className="inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-semibold text-[var(--color-hint-text-success,#2e7b32)] bg-[rgb(76_175_80_/_0.1)]">
                    خریدار
                  </span>
                </>
              ) : null}
            </div>
            {comment.expertLabel ? (
              <div className="mt-0.5">
                <ExpertBadge label={comment.expertLabel} />
              </div>
            ) : null}
          </div>
        </div>
        {comment.rating != null ? (
          <div className="mt-2 flex items-center">
            <StarRow rating={comment.rating} />
          </div>
        ) : null}
      </div>

      <p className="line-clamp-3 text-[13px] leading-[1.8] text-[var(--color-neutral-700,#3f4064)]">
        {comment.body}
      </p>

      <div className="mt-auto flex items-center pt-1">
        <p className="text-[12px] text-[var(--color-neutral-400)]">
          {comment.dateLabel}
        </p>
        <HelpfulnessButtons comment={comment} compact />
      </div>
    </article>
  );
}

function CommentCard({ comment }: { comment: ProductComment }) {
  return (
    <article className="border-b border-[var(--color-neutral-200)] py-3 last:border-b-0">
      <div className="mt-1 flex w-full items-start">
        <div className="flex grow flex-col gap-2">
          <div className="flex items-center justify-between lg:ml-3">
            <div className="flex items-center">
              <AuthorAvatar comment={comment} />
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
        <HelpfulnessButtons comment={comment} />
      </div>
    </article>
  );
}

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
      className={`flex h-10 cursor-pointer items-center justify-center rounded-[var(--medium-radius)] border border-[var(--color-primary-500)] text-xs font-medium text-[var(--color-primary-500)] ${className}`}
    >
      ثبت دیدگاه
    </button>
  );
}

/**
 * Digikala mobile «دیدگاه کاربرها» carousel + desktop list.
 * @see https://www.digikala.com/product/dkp-16679133/
 */
export function ProductComments({
  data,
  productSlug,
  productTitle,
}: ProductCommentsProps) {
  const searchParams = useSearchParams();
  const [sortId, setSortId] = useState<(typeof SORT_OPTIONS)[number]["id"]>(
    "helpful",
  );
  const [showAll, setShowAll] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [localPending, setLocalPending] = useState<ProductComment[]>([]);

  useEffect(() => {
    if (searchParams.get("writeReview") === "1") {
      setSheetOpen(true);
    }
  }, [searchParams]);

  const merged = useMemo(() => {
    const comments = [...localPending, ...data.comments];
    return {
      ...data,
      comments,
      totalCount: Math.max(data.totalCount, comments.length),
    };
  }, [data, localPending]);

  const previewCount = 4;
  const sortedComments = [...merged.comments].sort((a, b) => {
    if (sortId === "newest") return 0;
    if (sortId === "buyers") {
      return Number(b.isBuyer) - Number(a.isBuyer);
    }
    return b.likes - a.likes;
  });
  const carouselComments = sortedComments.slice(0, 8);
  const visible = showAll
    ? sortedComments
    : sortedComments.slice(0, previewCount);
  const remaining = Math.max(0, merged.totalCount - visible.length);

  return (
    <section
      id="pdp-comments"
      className="scroll-mt-40 w-full lg:mt-4"
    >
      {/* Digikala thick section divider (mobile) */}
      <div
        className="h-2 w-full bg-[var(--color-neutral-100)] lg:hidden"
        aria-hidden
      />

      {/* —— Mobile (Digikala) —— */}
      <div className="bg-white lg:hidden">
        <div className="flex flex-col px-4">
          <div className="flex items-center">
            <h2 className="grow py-3 text-[16px] font-bold leading-[1.8] text-[#222732]">
              دیدگاه کاربرها
            </h2>
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="my-auto mr-auto inline-flex cursor-pointer items-center text-[12px] font-medium text-[var(--color-neutral-650,#424242)]"
            >
              <span>مشاهده {formatFa(merged.totalCount, 0)} دیدگاه</span>
              <ChevronLeftIcon
                size={18}
                className="text-[var(--color-icon-high-emphasis)]"
              />
            </button>
          </div>

          <div className="flex items-center pb-3">
            <span className="ml-1.5 text-[22px] font-bold leading-none text-[#222732]">
              {formatFa(merged.averageRating)}
            </span>
            <RatingStarIcon className="size-5 shrink-0 text-[var(--color-icon-rating)]" />
            <span className="mr-1.5 text-[12px] leading-[1.8] text-[#767981]">
              ( بر اساس نظر {formatFa(merged.ratingCount, 0)} خریدار )
            </span>
          </div>
        </div>

        {merged.photos.length > 0 ? (
          <div className="mb-4 flex gap-x-2 overflow-x-auto overflow-y-hidden pr-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {merged.photos.map((photo) => (
              <button
                key={photo.id}
                type="button"
                className="relative size-20 shrink-0 overflow-hidden rounded-lg border border-[var(--color-neutral-200)]"
              >
                <Image
                  src={photo.url}
                  alt=""
                  width={80}
                  height={80}
                  className="size-full object-cover"
                />
              </button>
            ))}
          </div>
        ) : null}

        <div className="mb-4 flex touch-pan-x overflow-x-auto overflow-y-hidden overscroll-x-contain pr-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {carouselComments.map((comment) => (
            <MobileReviewCard key={comment.id} comment={comment} />
          ))}
          <div className="flex shrink-0 flex-col items-center justify-center px-10">
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="flex size-10 items-center justify-center rounded-full border border-[#0c0c0c] text-[#0c0c0c]"
              aria-label="مشاهده همه دیدگاه‌ها"
            >
              <ChevronLeftIcon size={24} />
            </button>
            <span className="mt-2 whitespace-nowrap text-[11px] font-semibold text-[#0c0c0c]">
              مشاهده همه
            </span>
          </div>
        </div>

        {showAll ? (
          <div className="border-t border-[var(--color-neutral-200)] px-4">
            {sortedComments.map((comment) => (
              <CommentCard key={`full-${comment.id}`} comment={comment} />
            ))}
          </div>
        ) : null}

        <button
          type="button"
          data-cro-id="pdp-add-comment"
          onClick={() => setSheetOpen(true)}
          className="flex w-full items-center border-t border-[var(--color-neutral-200)] px-4 py-4 text-start"
        >
          <span className="ml-3 rounded-full bg-[var(--color-neutral-100)] p-2">
            <CommunityIcon className="size-5 text-[var(--color-icon-high-emphasis)]" />
          </span>
          <span className="grow text-[13px] font-semibold text-[var(--color-neutral-650,#424242)]">
            دیدگاه خود را درباره این کالا بنویسید
          </span>
          <ChevronLeftIcon
            size={24}
            className="text-[var(--color-icon-high-emphasis)]"
          />
        </button>
      </div>

      {/* —— Desktop —— */}
      <div className="hidden border-b border-[var(--color-neutral-200)] pb-3 lg:block">
        <div className="flex items-center justify-between gap-3 px-5 lg:px-0">
          <ProductSectionTitle title="امتیاز و دیدگاه کاربران" as="p" />
        </div>

        <div className="mt-3 flex items-start justify-start px-5 lg:px-0">
          <div className="sticky top-[12.5rem] ml-12 shrink-0 lg:w-48">
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
      </div>

      <ProductWriteReviewSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        productSlug={productSlug}
        productTitle={productTitle}
        onSubmitted={(pendingComment) => {
          setLocalPending((list) => [pendingComment, ...list]);
        }}
      />
    </section>
  );
}
