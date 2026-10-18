"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const FEATURES = [
  {
    title: "امکان تحویل اکسپرس",
    href: "/faq/express-delivery",
    icon: "/images/footer/express-delivery.svg",
  },
  {
    title: "امکان پرداخت در محل",
    href: "/faq/cash-on-delivery",
    icon: "/images/footer/cash-on-delivery.svg",
  },
  {
    title: "۷ روز هفته، ۲۴ ساعته",
    href: "/page/contact-us",
    icon: "/images/footer/support.svg",
  },
  {
    title: "هفت روز ضمانت بازگشت کالا",
    href: "/faq/returns",
    icon: "/images/footer/days-return.svg",
  },
  {
    title: "ضمانت اصل بودن کالا",
    href: "/faq/original-products",
    icon: "/images/footer/original-products.svg",
  },
] as const;

const AUTO_MS = 2800;

/**
 * Digikala-style service features strip under the hero.
 * Mobile: horizontal scroll with auto-advance. Desktop: evenly spaced row.
 */
export function SiteFeatures() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      const el = scrollerRef.current;
      if (!el) return;
      // Desktop shows all items — skip auto-scroll when nothing overflows.
      if (el.scrollWidth <= el.clientWidth + 4) return;

      const first = el.querySelector<HTMLElement>("a");
      const step = first ? first.offsetWidth + 12 : el.clientWidth * 0.4;
      const rtl = getComputedStyle(el).direction === "rtl";
      const max = el.scrollWidth - el.clientWidth;
      const sl = el.scrollLeft;
      let fromStart = sl <= 0 ? Math.abs(sl) : rtl ? max - sl : sl;

      if (fromStart >= max - 4) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: rtl ? -step : step, behavior: "smooth" });
      }
    }, AUTO_MS);
    return () => window.clearInterval(id);
  }, [paused]);

  return (
    <div
      className="my-4 select-none lg:my-8"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      <div
        ref={scrollerRef}
        className="hide-scrollbar flex items-stretch justify-start gap-3 overflow-x-auto scroll-smooth pb-1 lg:justify-between lg:gap-0 lg:overflow-visible lg:pb-0"
      >
        {FEATURES.map((feature) => (
          <Link
            key={feature.title}
            href={feature.href}
            className="flex w-[4.75rem] shrink-0 flex-col items-center justify-between py-2 text-center sm:w-24 lg:w-auto lg:grow lg:py-3"
          >
            <Image
              src={feature.icon}
              alt={feature.title}
              width={56}
              height={56}
              className="inline-block size-10 object-cover lg:size-14"
              unoptimized
            />
            <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-[var(--color-neutral-700)] lg:text-xs">
              {feature.title}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
