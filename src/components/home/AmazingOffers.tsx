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
      className="flex items-center gap-1 sm:gap-1.5"
      aria-label="زمان باقی‌مانده"
      dir="ltr"
    >
      {parts.map((value, index) => (
        <div key={index} className="contents">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white shadow-sm sm:h-10 sm:w-10">
            <span className="text-center text-sm font-bold text-[var(--color-neutral-800)] sm:text-base">
              {padFa(value)}
            </span>
          </div>
          {index < parts.length - 1 ? (
            <span className="w-1.5 text-center text-sm font-bold text-white sm:w-2 sm:text-base">
              :
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

/** Coolblue-style orange % promo column. */
function OfferPercentDecor() {
  const bubbles = [
    { size: "clamp(1.75rem, 4vw, 3.25rem)", top: "8%", left: "12%", rotate: "-14deg" },
    { size: "clamp(1.25rem, 3vw, 2.25rem)", top: "28%", left: "55%", rotate: "16deg" },
    { size: "clamp(2rem, 5vw, 4rem)", top: "46%", left: "20%", rotate: "-8deg" },
    { size: "clamp(1.5rem, 3.5vw, 2.5rem)", top: "68%", left: "58%", rotate: "22deg" },
    { size: "clamp(1.1rem, 2.5vw, 1.75rem)", top: "82%", left: "18%", rotate: "-20deg" },
  ] as const;

  return (
    <div
      className="relative min-h-[88px] w-full shrink-0 overflow-hidden sm:min-h-[110px] lg:min-h-0 lg:w-[min(220px,24%)] lg:min-w-[180px] lg:self-stretch"
      aria-hidden
    >
      {bubbles.map((bubble, index) => (
        <span
          key={index}
          className="absolute flex items-center justify-center rounded-full bg-[var(--color-offers-accent)] font-extrabold text-white shadow-sm"
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
 * Offers rail — orange % stage + counter row above product cards.
 */
export function AmazingOffers({ products }: AmazingOffersProps) {
  if (products.length === 0) return null;

  return (
    <section className="w-full" aria-label="پیشنهادهای ویژه">
      <div className="relative flex flex-col gap-3 overflow-hidden rounded-2xl bg-[var(--color-offers-blue)] py-3 pe-0 ps-3 lg:flex-row lg:items-stretch lg:gap-4 lg:rounded-[16px] lg:py-5 lg:ps-4">
        {/* Orange percent promo section (kept) */}
        <OfferPercentDecor />

        <div className="relative z-10 flex min-w-0 flex-1 flex-col gap-3 lg:gap-4 lg:pe-3">
          {/* Counter row above cards */}
          <div className="flex flex-row flex-wrap items-center justify-between gap-3 pe-3 lg:pe-0">
            <div className="flex flex-row flex-wrap items-center gap-3 sm:gap-4">
              <p className="text-sm font-bold text-white sm:text-base lg:text-lg">
                پیشنهادهای ویژه
              </p>
              <CountdownBoxes />
            </div>

            <Link
              href={SEE_ALL_HREF}
              className="inline-flex h-9 shrink-0 items-center gap-1 rounded-lg bg-white px-4 text-sm font-medium text-[var(--color-offers-blue)]"
            >
              مشاهده همه
              <ChevronLeftIcon
                size={18}
                className="fill-[var(--color-offers-blue)] text-[var(--color-offers-blue)]"
              />
            </Link>
          </div>

          <ScrollHorizontalWrapper>
            <div className="flex w-max flex-row items-stretch gap-2 pe-2 sm:gap-3">
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
