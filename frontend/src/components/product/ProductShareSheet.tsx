"use client";

import { useEffect, useState } from "react";
import { ShareIcon } from "@/components/layout/icons";

type ProductShareSheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  url: string;
};

/**
 * PDP share sheet (#56): native share, copy link, WhatsApp / Telegram.
 */
export function ProductShareSheet({
  open,
  onClose,
  title,
  url,
}: ProductShareSheetProps) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCanNativeShare(
      typeof navigator !== "undefined" && typeof navigator.share === "function",
    );
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({ title, text: title, url });
      onClose();
    } catch {
      // user cancelled
    }
  }

  const encoded = encodeURIComponent(url);
  const textEncoded = encodeURIComponent(title);

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="بستن"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="به اشتراک‌گذاری کالا"
        className="relative z-[1] w-full max-w-md rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[var(--color-neutral-900)]">
            <ShareIcon className="size-5" />
            <h2 className="text-base font-bold">به اشتراک‌گذاری کالا</h2>
          </div>
          <button
            type="button"
            className="cursor-pointer text-sm text-[var(--color-neutral-500)]"
            onClick={onClose}
          >
            بستن
          </button>
        </div>

        <p className="mb-4 line-clamp-2 text-sm text-[var(--color-neutral-600)]">
          {title}
        </p>

        <div className="grid gap-2">
          {canNativeShare ? (
            <button
              type="button"
              className="cursor-pointer rounded-[var(--medium-radius)] bg-[var(--color-primary-500)] px-4 py-3 text-sm font-medium text-white"
              onClick={() => void nativeShare()}
            >
              اشتراک‌گذاری…
            </button>
          ) : null}

          <button
            type="button"
            className="cursor-pointer rounded-[var(--medium-radius)] border border-[var(--color-neutral-200)] px-4 py-3 text-sm font-medium text-[var(--color-neutral-800)]"
            onClick={() => void copyLink()}
          >
            {copied ? "لینک کپی شد" : "کپی لینک محصول"}
          </button>

          <a
            href={`https://wa.me/?text=${textEncoded}%20${encoded}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-[var(--medium-radius)] border border-[var(--color-neutral-200)] px-4 py-3 text-center text-sm font-medium text-[var(--color-neutral-800)]"
          >
            واتساپ
          </a>

          <a
            href={`https://t.me/share/url?url=${encoded}&text=${textEncoded}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-[var(--medium-radius)] border border-[var(--color-neutral-200)] px-4 py-3 text-center text-sm font-medium text-[var(--color-neutral-800)]"
          >
            تلگرام
          </a>
        </div>
      </div>
    </div>
  );
}
