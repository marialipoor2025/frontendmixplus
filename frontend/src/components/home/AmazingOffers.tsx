"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProductCard } from "@/components/home/ProductCard";
import { ScrollHorizontalWrapper } from "@/components/home/ScrollHorizontalWrapper";
import { ChevronLeftIcon } from "@/components/layout/icons";
import type { Product } from "@/types/product";

const SEE_ALL_HREF = "/incredible-offers/";
const COUNTDOWN_MS = 4 * 60 * 60 * 1000;

type AmazingOffersProps = {
  products: Product[];
};

function padFa(n: number): string {
  return new Intl.NumberFormat("fa-IR", {
    minimumIntegerDigits: 2,
  }).format(n);
}

function useCountdown(durationMs: number) {
  const [remaining, setRemaining] = useState(durationMs);

  useEffect(() => {
    const started = Date.now();
    const tick = () => {
      const elapsed = Date.now() - started;
      setRemaining(durationMs - (elapsed % durationMs));
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [durationMs]);

  const totalSec = Math.floor(remaining / 1000);
  return {
    hours: Math.floor(totalSec / 3600),
    minutes: Math.floor((totalSec % 3600) / 60),
    seconds: totalSec % 60,
  };
}

function CountdownBoxes() {
  const { hours, minutes, seconds } = useCountdown(COUNTDOWN_MS);
  const parts = [hours, minutes, seconds];

  return (
    <div
      className="flex h-8 shrink-0 items-center gap-0.5 sm:h-10 sm:gap-1.5"
      aria-label="زمان باقی‌مانده"
      dir="ltr"
    >
      {parts.map((value, index) => (
        <div key={index} className="contents">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white shadow-sm sm:h-10 sm:w-10">
            <span className="text-center text-xs font-bold tabular-nums text-[var(--color-neutral-800)] sm:text-base">
              {padFa(value)}
            </span>
          </div>
          {index < parts.length - 1 ? (
            <span className="w-1 text-center text-xs font-bold leading-none text-white sm:w-2 sm:text-base">
              :
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function SeeAllButton({ className = "" }: { className?: string }) {
  return (
    <Link
      href={SEE_ALL_HREF}
      className={`inline-flex h-8 shrink-0 items-center gap-0.5 whitespace-nowrap rounded-lg bg-white px-2.5 text-xs font-medium text-[var(--color-offers-blue)] sm:h-10 sm:gap-1 sm:px-4 sm:text-sm ${className}`}
    >
      مشاهده همه
      <ChevronLeftIcon
        size={14}
        className="fill-[var(--color-offers-blue)] text-[var(--color-offers-blue)] sm:size-[18px]"
      />
    </Link>
  );
}

/** Mobile: evenly spread % bubbles in a slim horizontal band. */
function OfferPercentDecorMobile() {
  const sizes = ["2rem", "1.5rem", "2.35rem", "1.35rem", "1.85rem"] as const;
  const rotates = ["-12deg", "14deg", "-6deg", "18deg", "-16deg"] as const;

  return (
    <div
      className="flex w-full items-center justify-between gap-2 px-1 pb-1 lg:hidden"
      aria-hidden
    >
      {sizes.map((size, index) => (
        <span
          key={index}
          className="flex shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] font-extrabold text-white shadow-sm"
          style={{
            width: size,
            height: size,
            fontSize: `calc(${size} * 0.42)`,
            transform: `rotate(${rotates[index]})`,
          }}
        >
          %
        </span>
      ))}
    </div>
  );
}

/** Desktop: tall side stage of scattered % bubbles. */
function OfferPercentDecorDesktop() {
  const bubbles = [
    { size: "3.25rem", top: "8%", left: "12%", rotate: "-14deg" },
    { size: "2.25rem", top: "28%", left: "55%", rotate: "16deg" },
    { size: "4rem", top: "46%", left: "20%", rotate: "-8deg" },
    { size: "2.5rem", top: "68%", left: "58%", rotate: "22deg" },
    { size: "1.75rem", top: "82%", left: "18%", rotate: "-20deg" },
  ] as const;

  return (
    <div
      className="relative hidden min-h-0 w-[min(220px,24%)] min-w-[180px] shrink-0 self-stretch overflow-hidden lg:block"
      aria-hidden
    >
      {bubbles.map((bubble, index) => (
        <span
          key={index}
          className="absolute flex items-center justify-center rounded-full bg-[var(--color-primary)] font-extrabold text-white shadow-sm"
          style={{
            width: bubble.size,
            height: bubble.size,
            top: bubble.top,
            left: bubble.left,
            fontSize: `calc(${bubble.size} * 0.42)`,
            transform: `rotate(${bubble.rotate})`,
          }}
        >
          %
        </span>
      ))}
    </div>
  );
}

function SeeAllSlide() {
  return (
    <Link
      href={SEE_ALL_HREF}
      aria-label="مشاهده همه"
      className="flex min-w-[100px] shrink-0 flex-col items-center justify-center gap-3 px-3 sm:min-w-[118px]"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white sm:h-[52px] sm:w-[52px]">
        <ChevronLeftIcon
          size={24}
          className="fill-[var(--color-offers-blue)] text-[var(--color-offers-blue)]"
        />
      </span>
      <span className="text-xs font-medium text-white">مشاهده همه</span>
    </Link>
  );
}

/**
 * Offers rail — MixPlus blue→red gradient + red % bubbles.
 */
export function AmazingOffers({ products }: AmazingOffersProps) {
  if (products.length === 0) return null;

  return (
    <section className="w-full" aria-label="پیشنهادهای ویژه">
      <div
        className="relative flex flex-col gap-2.5 overflow-hidden rounded-2xl px-3 py-3 lg:flex-row lg:items-stretch lg:gap-4 lg:rounded-[16px] lg:px-4 lg:py-5 lg:pe-0"
        style={{
          backgroundImage:
            "linear-gradient(135deg, #1672dd 0%, #ed1944 100%)",
        }}
      >
        <OfferPercentDecorMobile />
        <OfferPercentDecorDesktop />

        <div className="relative z-10 flex min-w-0 flex-1 flex-col gap-2.5 lg:gap-4 lg:pe-3">
          {/* Single row: title · countdown · see-all */}
          <div className="flex flex-nowrap items-center gap-1.5 sm:gap-3">
            <p className="min-w-0 shrink truncate text-xs font-bold text-white sm:shrink-0 sm:text-base lg:text-lg">
              پیشنهادهای ویژه
            </p>
            <CountdownBoxes />
            <SeeAllButton className="ms-auto" />
          </div>

          <ScrollHorizontalWrapper>
            <div className="flex w-max flex-row items-stretch gap-2 pe-1 sm:gap-3 lg:pe-2">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  className="w-[148px] min-w-[148px] rounded-xl border-0 shadow-sm sm:w-[172px] sm:min-w-[172px] lg:w-[200px] lg:min-w-[200px]"
                />
              ))}
              <SeeAllSlide />
            </div>
          </ScrollHorizontalWrapper>
        </div>
      </div>
    </section>
  );
}
