"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { siteConfig } from "@/config/site";

type MobileSupportChatProps = {
  open: boolean;
  onClose: () => void;
};

/**
 * Barghchi-style support chat panel.
 * Mobile: full-screen. Desktop: floating card (bottom-right).
 */
export function MobileSupportChat({ open, onClose }: MobileSupportChatProps) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="بستن"
        className="absolute inset-0 bg-black/35 lg:bg-black/20"
        onClick={onClose}
      />

      <div className="absolute inset-x-0 bottom-0 top-0 flex h-full max-h-full w-full flex-col overflow-y-auto bg-white shadow-sm transition-all duration-200 lg:inset-auto lg:bottom-7 lg:right-7 lg:top-auto lg:h-[39.5rem] lg:max-h-[calc(100vh-3.5rem)] lg:w-[360px] lg:rounded-2xl">
        <div className="w-full rounded-b-2xl bg-gradient-to-l from-[#5eb8f0] to-[var(--color-primary)]">
          <div className="flex items-center justify-between p-5">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-full p-1 text-white transition-all duration-200 hover:bg-blue-700"
              aria-label="بستن گفتگو"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="25"
                height="25"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
            <span className="w-1/3">
              <Image
                src="/brand/mixplus-logo.svg"
                alt={siteConfig.nameFa}
                width={107}
                height={34}
                className="brightness-0 invert"
              />
            </span>
          </div>

          <div className="space-y-2 p-7 text-sm font-medium text-white">
            <p>از ساعت ۹ تا ۱۷ در روزهای کاری پاسخگوی شما هستیم</p>
            <p>
              <span>شماره تماس : </span>
              <a href="tel:+982161930000" className="underline-offset-2 hover:underline">
                ۰۲۱-۶۱۹۳۰۰۰۰
              </a>
            </p>
          </div>

          <div className="-mt-8">
            <div className="flex flex-col items-center justify-center gap-3 p-7">
              <div className="flex w-full flex-col items-start justify-start rounded-lg bg-white px-4 py-5 text-sm shadow-sm">
                <h4 className="my-1 font-bold">استعلام قیمت برای شرکت و همکاران</h4>
                <p className="mb-5 font-medium text-[var(--color-muted)]">
                  ارسال لیست کالاها جهت اعلام قیمت
                </p>
                <Link
                  href="/page/enquiry/"
                  className="mr-auto inline-flex items-center justify-center gap-1 self-end rounded-3xl border-2 border-[var(--color-primary)] px-3 py-2 text-xs font-semibold text-[var(--color-primary)] transition hover:bg-[var(--color-primary)] hover:text-white"
                  onClick={onClose}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="none"
                    viewBox="0 0 20 20"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M3.333 3.333 17.5 9.167l-5.833 2.5M3.333 3.333 9.167 17.5l2.5-5.833M3.333 3.333l8.334 8.334"
                    />
                  </svg>
                  <span>درخواست پیش فاکتور</span>
                </Link>
              </div>

              <div className="flex w-full flex-col items-start justify-start rounded-lg bg-white px-4 py-5 text-sm shadow-sm">
                <h4 className="my-1 font-bold">ارتباط با کارشناسان {siteConfig.nameFa}</h4>
                <p className="mb-3 font-medium text-[var(--color-muted)]">
                  پاسخگوی سوالات شما هستیم
                </p>
                <div className="flex gap-2">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8f4fc] text-sm font-bold text-[#1672dd]">
                    م
                  </span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fde8ee] text-sm font-bold text-[var(--color-primary)]">
                    پ
                  </span>
                </div>
                <a
                  href="tel:+982161930000"
                  className="mt-2 inline-flex items-center justify-center gap-2 self-end rounded-3xl bg-[var(--color-primary)] px-3 py-2 text-xs font-semibold text-white"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="56"
                    height="54"
                    fill="none"
                    viewBox="0 0 56 54"
                    className="h-5 w-5"
                  >
                    <path
                      fill="#fff"
                      d="M23.692 0C10.608 0 0 9.67 0 21.6c0 6.127 2.818 11.638 7.316 15.563-.646 2.119-1.991 4.226-4.464 6.105l-.004.004a1.08 1.08 0 0 0-.694 1.008 1.08 1.08 0 0 0 1.077 1.08q.11-.001.219-.025c4.178-.013 7.743-1.803 10.58-4.046a25 25 0 0 0 4.215 1.316 17.7 17.7 0 0 1-1.014-5.885c0-10.72 9.662-19.44 21.538-19.44 2.977 0 5.814.548 8.397 1.54C45.666 8.206 35.74 0 23.692 0M38.77 21.6c-4.57 0-8.952 1.593-12.184 4.429-3.231 2.835-5.047 6.68-5.047 10.691 0 4.01 1.816 7.856 5.047 10.691 3.232 2.836 7.614 4.429 12.184 4.429a19.4 19.4 0 0 0 6.428-1.101c2.642 1.85 5.838 3.223 9.499 3.236A1.072 1.072 0 0 0 56 52.92a1.08 1.08 0 0 0-.707-1.013c-1.97-1.5-3.234-3.152-3.992-4.834 3.011-2.8 4.692-6.503 4.699-10.353 0-4.01-1.815-7.856-5.047-10.691S43.34 21.6 38.77 21.6"
                    />
                  </svg>
                  <span>گفتگو با کارشناسان</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
