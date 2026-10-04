"use client";

import { useState } from "react";
import {
  ChevronLeftIcon,
  EditIcon,
  SortIcon,
} from "@/components/layout/icons";
import { ProductSectionTitle } from "@/components/product/ProductSectionTitle";
import type { ProductQuestionsContent } from "@/types/product-detail";

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

/**
 * «پرسش‌ها» panel — CTA, sort, question list.
 */
export function ProductQuestions({ data }: ProductQuestionsProps) {
  const [sortId, setSortId] = useState<(typeof SORT_OPTIONS)[number]["id"]>(
    "newest",
  );
  const [showAll, setShowAll] = useState(false);
  const previewCount = 5;
  const visible = showAll
    ? data.questions
    : data.questions.slice(0, previewCount);
  const remaining = Math.max(0, data.totalCount - visible.length);

  return (
    <section
      id="pdp-questions"
      className="scroll-mt-40 w-screen border-b border-[var(--color-neutral-200)] pb-3 lg:mt-4 lg:w-auto"
    >
      <div className="px-5 lg:px-0">
        <ProductSectionTitle title="پرسش‌ها" as="p" />
      </div>

      <div className="mt-5 flex items-start justify-start px-5 lg:px-0">
        <div className="sticky top-[12.5rem] hidden shrink-0 px-2 pb-3 lg:block lg:w-48">
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
                <p className="w-full py-2 text-sm leading-[1.8] text-[var(--color-neutral-850,#212121)] whitespace-pre-line">
                  {question.text}
                </p>
              </div>
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
    </section>
  );
}
