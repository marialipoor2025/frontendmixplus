"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@/components/layout/icons";
import type { HomeBanner } from "@/types/home";

type HeroSliderProps = {
  slides: HomeBanner[];
  /** Auto-advance interval in ms; 0 disables. */
  intervalMs?: number;
};

/**
 * Digikala main homepage slider (below navbar):
 * full-bleed slide image with object-fit: cover.
 */
export function HeroSlider({ slides, intervalMs = 5000 }: HeroSliderProps) {
  const [index, setIndex] = useState(0);
  const count = slides.length;

  const go = useCallback(
    (dir: 1 | -1) => {
      if (count <= 1) return;
      setIndex((i) => (i + dir + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (count <= 1 || intervalMs <= 0) return;
    const id = window.setInterval(() => go(1), intervalMs);
    return () => window.clearInterval(id);
  }, [count, intervalMs, go, index]);

  if (count === 0) return null;

  const slide = slides[index]!;

  return (
    <section className="w-full" aria-label="اسلایدر تبلیغاتی" aria-roledescription="carousel">
      <div className="relative w-full overflow-hidden rounded-lg leading-[0]">
        {/* Digikala-like banner height: short on mobile, ~400px on desktop */}
        <div className="relative h-[160px] w-full sm:h-[240px] lg:h-[400px]">
          <Link
            href={slide.href}
            className="relative block h-full w-full overflow-hidden"
            aria-label={slide.alt || slide.title}
          >
            <Image
              src={slide.imageUrl}
              alt={slide.alt || slide.title}
              title={slide.title}
              fill
              priority
              sizes="(max-width: 1336px) 100vw, 1336px"
              className="inline-block h-full w-full object-cover"
            />
          </Link>
        </div>

        {count > 1 ? (
          <>
            <button
              type="button"
              aria-label="اسلاید بعدی"
              onClick={() => go(1)}
              className="absolute top-1/2 left-2 z-[5] hidden h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-[var(--color-neutral-200)] bg-[var(--color-neutral-000)] lg:flex"
            >
              <ChevronLeftIcon
                size={24}
                className="fill-[var(--color-icon-high-emphasis)] text-[var(--color-icon-high-emphasis)]"
              />
            </button>
            <button
              type="button"
              aria-label="اسلاید قبلی"
              onClick={() => go(-1)}
              className="absolute top-1/2 right-2 z-[5] hidden h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-[var(--color-neutral-200)] bg-[var(--color-neutral-000)] lg:flex"
            >
              <ChevronRightIcon
                size={24}
                className="fill-[var(--color-icon-high-emphasis)] text-[var(--color-icon-high-emphasis)]"
              />
            </button>

            <div className="absolute bottom-3 left-1/2 z-[5] flex -translate-x-1/2 gap-1.5">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  aria-label={`اسلاید ${i + 1}`}
                  aria-current={i === index}
                  onClick={() => setIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index
                      ? "w-4 bg-[var(--color-neutral-000)]"
                      : "w-1.5 bg-[var(--color-neutral-000)]/50"
                  }`}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
