"use client";

import Image from "next/image";
import { useState } from "react";
import {
  ChevronLeftIcon,
  EditIcon,
  SortIcon,
  ThumbDownIcon,
  ThumbUpIcon,
} from "@/components/layout/icons";
import { ProductSectionTitle } from "@/components/product/ProductSectionTitle";
import type {
  ProductQuestion,
  ProductQuestionAnswer,
  ProductQuestionsContent,
} from "@/types/product-detail";

type ProductQuestionsProps = {
  data: ProductQuestionsContent;
};

const SORT_OPTIONS = [
  { id: "newest", label: "جدیدترین" },
  { id: "most-answers", label: "بیشترین پاسخ" },
] as const;

function formatFa(n: number): string {
  return new Intl.NumberFormat("fa-IR").format(n);
}

function AskIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 17.2a1.2 1.2 0 1 1 1.2-1.2A1.2 1.2 0 0 1 12 19.2Zm1.5-5.7-.3.2a1 1 0 0 0-.4.8v.5h-1.6v-.6a2.5 2.5 0 0 1 1-2l.5-.4a1.6 1.6 0 1 0-2.7-1.1H8.4a3.2 3.2 0 1 1 5.1 2.6Z" />
    </svg>
  );
}

function AnswerAvatar({
  answer,
  size = 40,
}: {
  answer: ProductQuestionAnswer;
  size?: number;
}) {
  if (!answer.authorAvatarUrl && answer.role === "seller") {
    return null;
  }

  return (
    <div
      className="shrink-0 overflow-hidden rounded-full bg-[#FFC107]"
      style={{ width: size, height: size }}
      aria-hidden
    >
      {answer.authorAvatarUrl ? (
        <Image
          src={answer.authorAvatarUrl}
          alt=""
          width={size}
          height={size}
          className="size-full object-cover"
        />
      ) : (
        <svg viewBox="0 0 40 40" className="size-full" fill="none">
          <circle cx="20" cy="20" r="20" fill="#FFC107" />
          <circle cx="20" cy="15" r="7" fill="#FFF8E1" />
          <path d="M8 34c2.5-7 8-10 12-10s9.5 3 12 10" fill="#FFF8E1" />
        </svg>
      )}
    </div>
  );
}

function RoleBadge({ role }: { role?: "seller" | "buyer" }) {
  if (role === "seller") {
    return (
      <span className="inline-flex shrink-0 items-center rounded-full bg-[#fff2eb] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-hint-text-caution,#f57f17)]">
        فروشنده
      </span>
    );
  }
  if (role === "buyer") {
    return (
      <span className="inline-flex shrink-0 items-center rounded-full bg-[rgb(76_175_80_/_0.1)] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-hint-text-success,#2e7b32)]">
        خریدار
      </span>
    );
  }
  return null;
}

function AnswerCardInner({
  answer,
  className = "",
}: {
  answer: ProductQuestionAnswer;
  className?: string;
}) {
  return (
    <div
      className={`flex h-[152px] w-[216px] min-w-[216px] flex-col justify-between rounded-md border border-[var(--color-neutral-200)] bg-[#fafafa] px-3 py-2 min-[400px]:w-64 min-[400px]:min-w-64 ${className}`}
    >
      <div>
        <div className="flex items-center gap-2">
          <AnswerAvatar answer={answer} />
          <div className="min-w-0">
            <div className="flex flex-nowrap items-center overflow-hidden">
              <span className="max-w-[135px] truncate whitespace-nowrap text-[12px] font-medium text-[var(--color-neutral-650,#424242)]">
                {answer.authorName}
              </span>
              {answer.role ? (
                <>
                  <span
                    className="mx-0.5 size-1 shrink-0 rounded-full bg-[var(--color-neutral-200)]"
                    aria-hidden
                  />
                  <RoleBadge role={answer.role} />
                </>
              ) : null}
            </div>
            {answer.expertLabel ? (
              <p className="truncate text-[11px] font-semibold leading-[1.8] text-[var(--color-hint-text-success,#2e7b32)]">
                {answer.expertLabel}
              </p>
            ) : null}
          </div>
        </div>
        <p className="mt-2 mb-2 ml-2 line-clamp-2 text-[13px] leading-[1.8] text-[var(--color-neutral-650,#424242)]">
          {answer.body}
        </p>
      </div>
      <div className="flex items-center">
        <span className="truncate whitespace-nowrap text-[13px] leading-[1.8] text-[#94969c]">
          {answer.dateLabel}
        </span>
        <div className="mr-auto flex items-center text-[var(--color-neutral-500)]">
          <button
            type="button"
            className="flex items-center rounded-[var(--medium-radius)] px-2 text-[var(--color-neutral-650,#424242)]"
            aria-label="مفید بود"
          >
            <span className="text-[11px]">{formatFa(answer.likes)}</span>
            <ThumbUpIcon className="mr-1 size-4 text-[var(--color-icon-high-emphasis)]" />
          </button>
          <button
            type="button"
            className="flex items-center rounded-[var(--medium-radius)] px-2 text-[var(--color-neutral-650,#424242)]"
            aria-label="مفید نبود"
          >
            <span className="text-[11px]">{formatFa(answer.dislikes)}</span>
            <ThumbDownIcon className="mr-1 size-4 text-[var(--color-icon-high-emphasis)]" />
          </button>
        </div>
      </div>
    </div>
  );
}

/** Digikala mobile Q&A card — question + stacked answer peek. */
function MobileQuestionCard({ question }: { question: ProductQuestion }) {
  return (
    <article className="ml-2 flex h-[242px] w-60 shrink-0 flex-col justify-between rounded-[var(--medium-radius)] border border-[var(--color-neutral-200)] bg-white p-3 min-[400px]:w-[280px]">
      <p className="line-clamp-2 pt-1 text-[14px] leading-[1.8] text-[var(--color-neutral-850,#212121)]">
        {question.text}
      </p>

      {question.answer ? (
        <div className="relative z-[4]">
          {question.extraAnswer ? (
            <div
              className="pointer-events-none absolute top-2 left-2 z-[1] max-w-64 opacity-90"
              aria-hidden
            >
              <AnswerCardInner answer={question.extraAnswer} />
            </div>
          ) : null}
          <AnswerCardInner
            answer={question.answer}
            className="relative z-[2]"
          />
        </div>
      ) : (
        <div className="flex h-[152px] items-center justify-center rounded-md border border-dashed border-[var(--color-neutral-200)] bg-[#fafafa] text-[12px] text-[var(--color-neutral-400)]">
          هنوز پاسخی ثبت نشده
        </div>
      )}
    </article>
  );
}

/**
 * «پرسش و پاسخ» — Digikala-style mobile carousel + desktop list.
 */
export function ProductQuestions({ data }: ProductQuestionsProps) {
  const [sortId, setSortId] = useState<(typeof SORT_OPTIONS)[number]["id"]>(
    "newest",
  );
  const [showAll, setShowAll] = useState(false);
  const previewCount = 5;
  const carouselQuestions = data.questions.slice(0, 8);
  const visible = showAll
    ? data.questions
    : data.questions.slice(0, previewCount);
  const remaining = Math.max(0, data.totalCount - visible.length);

  return (
    <section id="pdp-questions" className="scroll-mt-40 w-full lg:mt-4">
      {/* Digikala thick section divider (mobile) */}
      <div
        className="h-2 w-full bg-[var(--color-neutral-100)] lg:hidden"
        aria-hidden
      />

      {/* —— Mobile (Digikala) —— */}
      <div className="bg-white lg:hidden">
        <div id="questionSection" className="px-4">
          <div className="flex grow items-center py-3">
            <h2 className="grow text-[16px] font-bold leading-[1.8] text-[#222732]">
              پرسش و پاسخ
            </h2>
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="inline-flex cursor-pointer items-center text-[12px] font-medium text-[var(--color-neutral-650,#424242)]"
            >
              <span>مشاهده {formatFa(data.totalCount)} پرسش</span>
              <ChevronLeftIcon
                size={18}
                className="text-[var(--color-icon-high-emphasis)]"
              />
            </button>
          </div>
        </div>

        <div className="flex touch-pan-x overflow-x-auto overflow-y-hidden overscroll-x-contain border-b border-[var(--color-neutral-200)] pr-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {carouselQuestions.map((question) => (
            <MobileQuestionCard key={question.id} question={question} />
          ))}
          <div className="flex shrink-0 flex-col items-center justify-center px-10">
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="flex size-10 items-center justify-center rounded-full border border-[#0c0c0c] text-[#0c0c0c]"
              aria-label="مشاهده همه پرسش‌ها"
            >
              <ChevronLeftIcon size={24} />
            </button>
            <span className="mt-2 whitespace-nowrap text-[11px] font-semibold text-[#0c0c0c]">
              مشاهده همه
            </span>
          </div>
        </div>

        {showAll ? (
          <div className="border-b border-[var(--color-neutral-200)] px-4">
            {data.questions.map((question) => (
              <article
                key={`full-${question.id}`}
                className="border-b border-[var(--color-neutral-200)] py-3 last:border-b-0"
              >
                <p className="text-sm leading-[1.8] whitespace-pre-line text-[var(--color-neutral-850,#212121)]">
                  {question.text}
                </p>
                {question.answer ? (
                  <div className="mt-2 rounded-md bg-[#fafafa] p-3 text-[13px] leading-[1.8] text-[var(--color-neutral-650,#424242)]">
                    <div className="mb-1 flex items-center gap-1">
                      <span className="font-semibold">{question.answer.authorName}</span>
                      <RoleBadge role={question.answer.role} />
                    </div>
                    {question.answer.body}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        ) : null}

        <button
          type="button"
          data-cro-id="pdp-question-cta"
          className="flex w-full cursor-pointer items-center px-4 py-4 text-start"
        >
          <span className="ml-3 rounded-full bg-[var(--color-neutral-100)] p-2">
            <AskIcon className="text-[var(--color-icon-high-emphasis)]" />
          </span>
          <p className="grow text-[13px] font-semibold text-[var(--color-neutral-650,#424242)]">
            شما هم درباره این کالا سوال بپرسید
          </p>
          <ChevronLeftIcon
            size={24}
            className="text-[var(--color-icon-high-emphasis)]"
          />
        </button>
      </div>

      {/* —— Desktop —— */}
      <div className="hidden border-b border-[var(--color-neutral-200)] pb-3 lg:block">
        <div className="px-5 lg:px-0">
          <ProductSectionTitle title="پرسش‌ها" as="p" />
        </div>

        <div className="mt-5 flex items-start justify-start px-5 lg:px-0">
          <div className="sticky top-[12.5rem] shrink-0 px-2 pb-3 lg:w-48">
            <p className="mt-7 mb-5 text-[13px] text-[var(--color-neutral-700)]">
              شما هم درباره این کالا پرسش ثبت کنید
            </p>
            <button
              type="button"
              className="mt-2 flex h-10 w-full items-center justify-center rounded-[var(--medium-radius)] border border-[var(--color-primary-500)] text-xs font-medium text-[var(--color-primary-500)]"
            >
              ثبت پرسش
            </button>
          </div>

          <div className="w-full lg:mr-10">
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
                {formatFa(data.totalCount)} پرسش
              </span>
            </div>

            {visible.map((question) => (
              <article
                key={question.id}
                className="w-full border-b border-[var(--color-neutral-200)] px-3 py-2 last:border-b-0"
              >
                <div className="flex items-start">
                  <p className="w-full py-2 text-sm leading-[1.8] whitespace-pre-line text-[var(--color-neutral-850,#212121)]">
                    {question.text}
                  </p>
                </div>
                {question.answer ? (
                  <div className="mb-2 rounded-md bg-[#fafafa] px-3 py-2 text-[13px] leading-[1.8] text-[var(--color-neutral-650,#424242)]">
                    <div className="mb-1 flex items-center gap-1">
                      <span className="font-semibold">
                        {question.answer.authorName}
                      </span>
                      <RoleBadge role={question.answer.role} />
                    </div>
                    {question.answer.body}
                  </div>
                ) : null}
                <button
                  type="button"
                  className="inline-flex items-center rounded-[var(--medium-radius)] py-1 text-xs font-medium text-[var(--color-secondary-500)]"
                >
                  <EditIcon className="ml-2 size-4 text-[var(--color-secondary-500)]" />
                  ثبت پاسخ‌
                </button>
              </article>
            ))}

            {remaining > 0 && !showAll ? (
              <div className="border-t border-[var(--color-neutral-200)] py-3">
                <button
                  type="button"
                  onClick={() => setShowAll(true)}
                  className="inline-flex cursor-pointer items-center text-xs font-medium text-[var(--color-secondary-500)]"
                >
                  <span>{formatFa(remaining)} پرسش دیگر</span>
                  <ChevronLeftIcon
                    size={18}
                    className="text-[var(--color-secondary-500)]"
                  />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
