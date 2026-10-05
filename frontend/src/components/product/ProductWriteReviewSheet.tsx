"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RatingStarIcon } from "@/components/layout/icons";
import { useAuth } from "@/lib/auth/useAuth";
import { submitProductReview } from "@/lib/api/reviews";

type ProductWriteReviewSheetProps = {
  open: boolean;
  onClose: () => void;
  productSlug: string;
  productTitle: string;
  onSubmitted: () => void;
};

/**
 * Full-screen / bottom-sheet form for submitting a product review (#59–#60).
 */
export function ProductWriteReviewSheet({
  open,
  onClose,
  productSlug,
  productTitle,
  onSubmitted,
}: ProductWriteReviewSheetProps) {
  const { user, isAuthenticated, ready } = useAuth();
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setRating(0);
    setBody("");
    setIsAnonymous(false);
    setError(null);
    setSuccess(null);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;

  const displayName =
    user?.displayName || user?.phone || user?.email || "کاربر میکس پلاس";

  const handleSubmit = async () => {
    if (!isAuthenticated) return;
    if (rating < 1) {
      setError("لطفاً امتیاز خود را انتخاب کنید.");
      return;
    }
    if (body.trim().length < 10) {
      setError("متن دیدگاه باید حداقل ۱۰ کاراکتر باشد.");
      return;
    }

    setPending(true);
    setError(null);
    const result = await submitProductReview(productSlug, {
      rating,
      body: body.trim(),
      isAnonymous,
      customerName: displayName,
    });
    setPending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setSuccess(result.message);
    onSubmitted();
    window.setTimeout(() => onClose(), 1400);
  };

  return (
    <div
      className="fixed inset-0 z-[65]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="write-review-title"
    >
      <button
        type="button"
        aria-label="بستن"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div className="absolute inset-x-0 bottom-0 flex max-h-[90dvh] flex-col rounded-t-2xl bg-white shadow-xl lg:inset-auto lg:left-1/2 lg:top-1/2 lg:max-h-[85vh] lg:w-full lg:max-w-md lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-[var(--color-neutral-200)] px-4 py-3">
          <h2
            id="write-review-title"
            className="text-sm font-bold text-[var(--color-neutral-800)]"
          >
            ثبت دیدگاه
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-[var(--color-neutral-500)]"
          >
            بستن
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <p className="mb-4 line-clamp-2 text-xs text-[var(--color-neutral-500)]">
            {productTitle}
          </p>

          {!ready ? (
            <p className="text-sm text-[var(--color-muted)]">در حال بارگذاری…</p>
          ) : !isAuthenticated ? (
            <div className="rounded-xl border border-dashed border-[var(--color-border)] px-4 py-8 text-center">
              <p className="mb-4 text-sm text-[var(--color-neutral-600)]">
                برای ثبت دیدگاه ابتدا وارد حساب کاربری شوید.
              </p>
              <Link
                href={`/users/login?returnUrl=${encodeURIComponent(`/product/${productSlug}#pdp-comments`)}`}
                className="inline-flex rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-bold text-white"
                onClick={onClose}
              >
                ورود | ثبت‌نام
              </Link>
            </div>
          ) : success ? (
            <p className="rounded-lg bg-[rgb(76_175_80_/_0.12)] px-4 py-3 text-sm text-[var(--color-success,#00a049)]">
              {success}
            </p>
          ) : (
            <>
              <div className="mb-4">
                <p className="mb-2 text-sm font-medium text-[var(--color-neutral-800)]">
                  امتیاز شما
                </p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      aria-label={`${value} از ۵`}
                      onClick={() => setRating(value)}
                      className="p-0.5"
                    >
                      <RatingStarIcon
                        className={`size-8 ${
                          value <= rating
                            ? "text-[var(--color-icon-rating)]"
                            : "text-[var(--color-neutral-300)]"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <label className="mb-4 block">
                <span className="mb-2 block text-sm font-medium text-[var(--color-neutral-800)]">
                  متن دیدگاه
                </span>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={5}
                  placeholder="نظر خود را درباره این کالا بنویسید…"
                  className="w-full resize-none rounded-lg border border-[var(--color-neutral-200)] px-3 py-2 text-sm outline-none focus:border-[var(--color-neutral-400)]"
                />
              </label>

              <label className="mb-4 flex cursor-pointer items-center gap-2 text-sm text-[var(--color-neutral-700)]">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="size-4 accent-[var(--color-primary-500)]"
                />
                <span>ارسال به صورت ناشناس</span>
              </label>

              {error ? (
                <p className="mb-3 text-sm text-[var(--color-hint-object-error)]">
                  {error}
                </p>
              ) : null}

              <button
                type="button"
                disabled={pending}
                onClick={handleSubmit}
                className="flex h-11 w-full items-center justify-center rounded-lg bg-[var(--color-primary-500)] text-sm font-bold text-white disabled:opacity-60"
              >
                {pending ? "در حال ارسال…" : "ثبت دیدگاه"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
