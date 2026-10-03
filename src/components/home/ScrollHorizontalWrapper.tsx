"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@/components/layout/icons";

type ScrollHorizontalWrapperProps = {
  children: ReactNode;
  className?: string;
  /** Distance scrolled per click as a fraction of the viewport width. */
  scrollRatio?: number;
};

function scrollMetrics(el: HTMLElement) {
  const max = el.scrollWidth - el.clientWidth;
  if (max <= 2) {
    return { canPrev: false, canNext: false };
  }

  const sl = el.scrollLeft;
  const rtl = getComputedStyle(el).direction === "rtl";

  // Distance from the start edge across LTR / Chromium-RTL / positive-RTL.
  let fromStart: number;
  if (sl <= 0) {
    fromStart = Math.abs(sl);
  } else {
    fromStart = rtl ? max - sl : sl;
  }

  return {
    canPrev: fromStart > 2,
    canNext: fromStart < max - 2,
  };
}

/**
 * Horizontal scroller with prev/next controls for product rails.
 */
export function ScrollHorizontalWrapper({
  children,
  className = "",
  scrollRatio = 0.75,
}: ScrollHorizontalWrapperProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateButtons = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const { canPrev: prev, canNext: next } = scrollMetrics(el);
    setCanPrev(prev);
    setCanNext(next);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    updateButtons();
    el.addEventListener("scroll", updateButtons, { passive: true });
    const ro = new ResizeObserver(updateButtons);
    ro.observe(el);

    return () => {
      el.removeEventListener("scroll", updateButtons);
      ro.disconnect();
    };
  }, [updateButtons, children]);

  const scrollByDir = (dir: "next" | "prev") => {
    const el = scrollerRef.current;
    if (!el) return;

    // Prefer stepping by one card (~172px) like Digikala rails; fallback to viewport ratio.
    const firstCard = el.querySelector<HTMLElement>("a, [data-rail-item]");
    const cardStep = firstCard
      ? firstCard.offsetWidth + 12
      : el.clientWidth * scrollRatio;
    const rtl = getComputedStyle(el).direction === "rtl";
    const nextDelta = rtl ? -cardStep : cardStep;
    el.scrollBy({
      left: dir === "next" ? nextDelta : -nextDelta,
      behavior: "smooth",
    });
  };

  return (
    <div className={`relative w-full ${className}`}>
      <div
        ref={scrollerRef}
        className="w-full touch-pan-x overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>

      <button
        type="button"
        aria-label="بعدی"
        disabled={!canNext}
        onClick={() => scrollByDir("next")}
        className="absolute top-1/2 left-1 z-[5] flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-[var(--color-neutral-200)] bg-[var(--color-neutral-000)] shadow-sm disabled:pointer-events-none disabled:opacity-0 sm:left-2 sm:h-10 sm:w-10"
      >
        <span className="flex" aria-hidden>
          <ChevronLeftIcon
            size={22}
            className="fill-[var(--color-icon-high-emphasis)] text-[var(--color-icon-high-emphasis)]"
          />
        </span>
      </button>

      <button
        type="button"
        aria-label="قبلی"
        disabled={!canPrev}
        onClick={() => scrollByDir("prev")}
        className="absolute top-1/2 right-1 z-[5] flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-[var(--color-neutral-200)] bg-[var(--color-neutral-000)] shadow-sm disabled:pointer-events-none disabled:opacity-0 sm:right-2 sm:h-10 sm:w-10"
      >
        <span className="flex" aria-hidden>
          <ChevronRightIcon
            size={22}
            className="fill-[var(--color-icon-high-emphasis)] text-[var(--color-icon-high-emphasis)]"
          />
        </span>
      </button>
    </div>
  );
}
