"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Brand } from "@/types/brand";

type BrandShowcaseProps = {
  brands: Brand[];
};

const AUTO_MS = 5000;
const SPEED_MS = 2000;
const GAP_PX = 20;

/** barghchi.com brand-rail chevron (rounded square + arrow). */
function SeeAllIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="none"
      viewBox="0 0 16 16"
      aria-hidden
    >
      <path
        stroke="currentColor"
        strokeWidth="1.5"
        d="M1.667 8c0-2.986 0-4.478.927-5.406.928-.927 2.42-.927 5.406-.927s4.478 0 5.406.927c.927.928.927 2.42.927 5.406s0 4.478-.927 5.406c-.928.927-2.42.927-5.406.927s-4.478 0-5.406-.927c-.927-.928-.927-2.42-.927-5.406Z"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M9.333 11.333 6.915 8.416c-.166-.2-.248-.3-.248-.416 0-.117.082-.217.248-.417l2.418-2.916"
      />
    </svg>
  );
}

function NavArrow({ flipped = false }: { flipped?: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="20"
      fill="none"
      viewBox="0 0 12 20"
      className={flipped ? "rotate-180" : undefined}
      aria-hidden
    >
      <path
        fill="#111"
        fillRule="evenodd"
        d="M10.891 1.317a1.437 1.437 0 0 1 0 2.033L4.241 10l6.65 6.65a1.438 1.438 0 0 1-2.033 2.033l-7.666-7.666a1.44 1.44 0 0 1 0-2.033l7.666-7.667a1.437 1.437 0 0 1 2.033 0"
        clipRule="evenodd"
      />
    </svg>
  );
}

function BrandSlide({ brand }: { brand: Brand }) {
  const logo = brand.logoUrl?.trim();
  return (
    <Link
      href={`/brand/${brand.slug}`}
      data-brand-slide
      className="flex h-[110px] w-[160px] shrink-0 items-center justify-center rounded-md border border-[var(--color-neutral-100)] bg-white px-3 py-3 transition duration-300 ease-in-out hover:border-[var(--color-neutral-300)] hover:shadow-sm sm:w-[180px] md:w-[200px]"
      title={brand.name}
    >
      {logo ? (
        // Local brand assets include svg/avif/webp/png/jpg — use native img.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logo}
          alt={brand.name}
          className="max-h-[70px] max-w-full object-contain object-center md:max-h-[78px]"
          loading="lazy"
        />
      ) : (
        <span className="line-clamp-2 px-3 text-center text-base font-bold leading-relaxed text-[var(--color-neutral-400)] transition duration-300 ease-in-out hover:text-[var(--color-neutral-800)] md:text-lg">
          {brand.name}
        </span>
      )}
    </Link>
  );
}

/**
 * Homepage brand rail matching barghchi.com «برندهای محبوب ما»:
 * looping autoplay in one direction + always-visible side arrows.
 */
export function BrandShowcase({ brands }: BrandShowcaseProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [slideStep, setSlideStep] = useState(220);
  const [paused, setPaused] = useState(false);
  const [animate, setAnimate] = useState(true);

  // Duplicate so the track always overflows and loop feels continuous.
  const loopBrands =
    brands.length === 0
      ? []
      : brands.length >= 8
        ? [...brands, ...brands]
        : [...brands, ...brands, ...brands];

  const measure = useCallback(() => {
    const el = viewportRef.current?.querySelector<HTMLElement>("[data-brand-slide]");
    if (!el) return;
    setSlideStep(el.offsetWidth + GAP_PX);
  }, []);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (viewportRef.current) ro.observe(viewportRef.current);
    return () => ro.disconnect();
  }, [measure, brands]);

  const goNext = useCallback(() => {
    if (brands.length === 0) return;
    setAnimate(true);
    setIndex((i) => i + 1);
  }, [brands.length]);

  const goPrev = useCallback(() => {
    if (brands.length === 0) return;
    setIndex((i) => {
      if (i > 0) {
        setAnimate(true);
        return i - 1;
      }
      // Jump to end of first loop set, then step back with animation.
      setAnimate(false);
      window.requestAnimationFrame(() => {
        setIndex(brands.length);
        window.requestAnimationFrame(() => {
          setAnimate(true);
          setIndex(brands.length - 1);
        });
      });
      return i;
    });
  }, [brands.length]);

  // Seamless loop: when we pass one full set, snap back without animation.
  useEffect(() => {
    if (brands.length === 0) return;
    if (index < brands.length) return;
    const id = window.setTimeout(() => {
      setAnimate(false);
      setIndex((i) => i - brands.length);
    }, SPEED_MS);
    return () => window.clearTimeout(id);
  }, [index, brands.length]);

  // barghchi: autoplay delay 5s, one direction, does not stop on interaction.
  useEffect(() => {
    if (paused || brands.length === 0) return;
    const id = window.setInterval(goNext, AUTO_MS);
    return () => window.clearInterval(id);
  }, [paused, brands.length, goNext]);

  if (brands.length === 0) return null;

  // RTL: positive translateX moves content toward the visual “next”.
  const offsetPx = index * slideStep;

  return (
    <section
      className="relative mx-auto w-full max-w-[1320px] px-0"
      aria-label="برندهای محبوب ما"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative mb-8 flex items-center justify-between">
        <span
          className="pointer-events-none absolute inset-x-0 top-1/2 z-0 h-px -translate-y-1/2 bg-[#e0e5f2]"
          aria-hidden
        />
        <h3 className="relative z-10 inline-block bg-[var(--color-neutral-000)] pe-2 text-base font-bold text-[#2a75bb] md:text-lg">
          برندهای محبوب ما
        </h3>
        <Link
          href="/brand"
          className="relative z-10 flex items-center gap-2 bg-[var(--color-neutral-000)] ps-2 text-sm text-[#707eae] transition hover:text-[#2a75bb]"
        >
          مشاهده همه
          <SeeAllIcon />
        </Link>
      </div>

      <div className="relative">
        <div ref={viewportRef} className="w-full overflow-hidden">
          <div
            className="flex w-max flex-row items-stretch"
            style={{
              gap: GAP_PX,
              transform: `translate3d(${offsetPx}px, 0, 0)`,
              transition: animate
                ? `transform ${SPEED_MS}ms ease`
                : "none",
            }}
          >
            {loopBrands.map((brand, i) => (
              <BrandSlide key={`${brand.id}-${i}`} brand={brand} />
            ))}
          </div>
        </div>

        {/*
          dir=ltr keeps physical sides stable (left / right).
          Left « < » advances (same as autoplay); right « > » goes back.
        */}
        <div
          dir="ltr"
          className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-between px-0"
        >
          <button
            type="button"
            aria-label="بعدی"
            onClick={goNext}
            className="pointer-events-auto z-10 cursor-pointer rounded-md bg-white px-3 py-2 shadow-[0_0_8px_0_rgba(0,0,0,0.1)]"
          >
            <NavArrow />
          </button>
          <button
            type="button"
            aria-label="قبلی"
            onClick={goPrev}
            className="pointer-events-auto z-10 cursor-pointer rounded-md bg-white px-3 py-2 shadow-[0_0_8px_0_rgba(0,0,0,0.1)]"
          >
            <NavArrow flipped />
          </button>
        </div>
      </div>
    </section>
  );
}
