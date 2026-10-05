"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CartIcon,
  MoreHorizIcon,
  SearchIcon,
} from "@/components/layout/icons";
import { ProductMobileMoreSheet } from "@/components/product/ProductMobileMoreSheet";
import { ProductMobileSearchSheet } from "@/components/product/ProductMobileSearchSheet";
import { ProductShareSheet } from "@/components/product/ProductShareSheet";
import {
  addToWishlist,
  isInWishlist,
  removeFromWishlist,
} from "@/lib/api/wishlist";
import { useAuth } from "@/lib/auth/useAuth";

const TABS = [
  { id: "specs", label: "مشخصات", href: "#pdp-specs" },
  { id: "review", label: "بررسی تخصصی", href: "#pdp-review" },
  { id: "comments", label: "دیدگاه و پرسش", href: "#pdp-comments" },
  { id: "suggestions", label: "پیشنهاد ما", href: "#pdp-suggestions" },
] as const;

type ProductMobileStickyHeaderProps = {
  title: string;
  slug: string;
  imageUrl?: string;
  priceAmount?: number;
};

function CloseIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M6.4 6.4 17.6 17.6M17.6 6.4 6.4 17.6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Digikala-style mobile PDP chrome:
 * - Always sticky at top: close / search / cart / more
 * - Over gallery: frosted icon pills
 * - After content covers gallery: solid white + section tabs
 */
export function ProductMobileStickyHeader({
  title,
  slug,
  imageUrl = "",
  priceAmount = 0,
}: ProductMobileStickyHeaderProps) {
  const router = useRouter();
  const { ready, isAuthenticated } = useAuth();
  const [covered, setCovered] = useState(false);
  const [activeId, setActiveId] = useState<(typeof TABS)[number]["id"]>("specs");
  const [searchOpen, setSearchOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [wished, setWished] = useState(false);
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/product/${slug}`
      : `/product/${slug}`;

  useEffect(() => {
    const sentinel = document.getElementById("pdp-mobile-sticky-sentinel");
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        setCovered(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "-48px 0px 0px 0px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const sectionIds = TABS.map((t) => t.href.slice(1));
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const top = visibleEntries[0];
        if (!top?.target.id) return;
        const match = TABS.find((t) => t.href === `#${top.target.id}`);
        if (match) setActiveId(match.id);
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0.01 },
    );
    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!ready || !isAuthenticated || !slug) return;
    let cancelled = false;
    void isInWishlist(slug).then((value) => {
      if (!cancelled) setWished(value);
    });
    return () => {
      cancelled = true;
    };
  }, [ready, isAuthenticated, slug]);

  function goTab(id: (typeof TABS)[number]["id"], href: string) {
    setActiveId(id);
    const target = document.getElementById(href.slice(1));
    if (target) {
      const offset = 96;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }

  async function toggleWishlist() {
    if (!ready) return;
    if (!isAuthenticated) {
      router.push(
        `/users/login?returnUrl=${encodeURIComponent(`/product/${slug}`)}`,
      );
      return;
    }
    try {
      if (wished) {
        await removeFromWishlist(slug);
        setWished(false);
      } else {
        await addToWishlist({
          productSlug: slug,
          title,
          imageUrl,
          priceAmount,
        });
        setWished(true);
      }
    } catch {
      /* ignore */
    }
  }

  const iconBtn =
    "flex size-10 items-center justify-center text-[var(--color-icon-high-emphasis)]";

  return (
    <>
      <div
        className={[
          "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow] duration-200 lg:hidden",
          covered
            ? "bg-white shadow-[0_4px_12px_-6px_rgb(0_0_0_/_0.14)]"
            : "bg-gradient-to-b from-white via-white/90 to-transparent",
        ].join(" ")}
      >
        <div className="flex h-12 items-center justify-between px-2">
          <button
            type="button"
            className={`${iconBtn} ${covered ? "" : "rounded-full bg-white/95 shadow-sm"}`}
            aria-label="بستن"
            onClick={() => router.back()}
          >
            <CloseIcon className="size-6" />
          </button>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              className={`${iconBtn} ${covered ? "" : "rounded-full bg-white/95 shadow-sm"}`}
              aria-label="جستجو"
              onClick={() => setSearchOpen(true)}
            >
              <SearchIcon className="size-6" />
            </button>
            <Link
              href="/checkout/cart"
              className={`${iconBtn} ${covered ? "" : "rounded-full bg-white/95 shadow-sm"}`}
              aria-label="سبد خرید"
            >
              <CartIcon className="size-6" />
            </Link>
            <button
              type="button"
              className={`${iconBtn} ${covered ? "" : "rounded-full bg-white/95 shadow-sm"}`}
              aria-label="بیشتر"
              onClick={() => setMoreOpen(true)}
            >
              <MoreHorizIcon className="size-6" />
            </button>
          </div>
        </div>

        <ul
          className={[
            "hide-scrollbar flex w-full overflow-x-auto border-b border-[var(--color-neutral-100)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            covered
              ? "opacity-100"
              : "pointer-events-none h-0 overflow-hidden opacity-0 border-transparent",
          ].join(" ")}
          aria-hidden={!covered}
        >
          {TABS.map((tab) => {
            const active = tab.id === activeId;
            return (
              <li key={tab.id} className="min-w-0 grow">
                <button
                  type="button"
                  onClick={() => goTab(tab.id, tab.href)}
                  className={[
                    "relative flex w-full items-center justify-center whitespace-nowrap px-3 py-2.5 text-[13px] font-semibold",
                    active
                      ? "text-[var(--color-neutral-900)]"
                      : "text-[var(--color-neutral-500)]",
                  ].join(" ")}
                >
                  {tab.label}
                  {active ? (
                    <span className="absolute inset-x-3 bottom-0 h-[3px] rounded-t-sm bg-[var(--color-neutral-900)]" />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <ProductMobileSearchSheet
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
      <ProductMobileMoreSheet
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        onShare={() => setShareOpen(true)}
        onWishlist={() => void toggleWishlist()}
        wished={wished}
      />
      <ProductShareSheet
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        title={title}
        url={shareUrl}
      />
    </>
  );
}
