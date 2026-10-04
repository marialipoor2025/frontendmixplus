"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronUpIcon,
  NavCategoryIcon,
} from "@/components/layout/icons";
import { groupCategorySections } from "@/lib/category-sections";
import type { MegaMenuCategory, MegaMenuLink } from "@/types/nav";

type MobileCategoryBrowserProps = {
  categories: MegaMenuCategory[];
  /** Optional image map keyed by leaf/parent href for circular thumbs */
  imageByHref?: Record<string, string>;
  /** Fill parent height (e.g. inside a side drawer) */
  fillHeight?: boolean;
};

function LeafGrid({
  leaves,
  parentHref,
  imageByHref,
}: {
  leaves: MegaMenuLink[];
  parentHref: string;
  imageByHref: Record<string, string>;
}) {
  if (leaves.length === 0) return null;

  return (
    <div className="grid grid-cols-3 gap-1 pb-2">
      {leaves.map((leaf) => {
        const src =
          imageByHref[leaf.href] ??
          imageByHref[parentHref] ??
          "/placeholders/cat-appliance.png";
        return (
          <Link
            key={leaf.id}
            href={leaf.href}
            data-cro-id="mega-menu-leaf"
            className="flex flex-col items-center p-2 text-center text-[11px] text-[var(--color-neutral-900)]"
          >
            <span className="relative mb-2 flex size-[52px] items-center justify-center overflow-hidden rounded-full bg-[var(--color-neutral-100)]">
              <Image
                src={src}
                alt=""
                width={45}
                height={45}
                className="object-contain"
              />
            </span>
            <span className="line-clamp-2 leading-4">{leaf.title}</span>
          </Link>
        );
      })}
      <Link
        href={parentHref}
        data-cro-id="mega-menu-leaf"
        className="flex flex-col items-center p-2 text-[11px] text-[var(--color-neutral-900)]"
      >
        <span className="mb-2 flex size-[52px] items-center justify-center rounded-full bg-[var(--color-neutral-100)] text-[var(--color-icon-high-emphasis)]">
          <svg width={24} height={24} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z" />
          </svg>
        </span>
        همه کالاها
      </Link>
    </div>
  );
}

/**
 * Digikala-style mobile categories browser.
 * MixPlus: left rail is household-appliance top categories only.
 */
export function MobileCategoryBrowser({
  categories,
  imageByHref = {},
  fillHeight = false,
}: MobileCategoryBrowserProps) {
  const [activeId, setActiveId] = useState(categories[0]?.id ?? "");
  const [openSectionId, setOpenSectionId] = useState<string | null>(null);

  const active = useMemo(
    () => categories.find((c) => c.id === activeId) ?? categories[0],
    [activeId, categories],
  );

  const sections = useMemo(
    () => (active ? groupCategorySections(active) : []),
    [active],
  );

  if (!active) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-sm text-[var(--color-neutral-500)]">
        دسته‌بندی‌ای یافت نشد
      </div>
    );
  }

  return (
    <div
      className={`flex min-h-0 overflow-hidden bg-[var(--color-neutral-000)] ${
        fillHeight
          ? "h-full"
          : "h-[calc(100dvh-3.5rem-3.25rem-env(safe-area-inset-bottom))] lg:h-[calc(100dvh-7rem)]"
      }`}
    >
      {/* Rail — first in DOM = end side in RTL (Digikala) */}
      <div className="hide-scrollbar w-[88px] shrink-0 overflow-y-auto bg-[var(--color-neutral-100)] pb-12">
        {categories.map((cat) => {
          const isActive = cat.id === active.id;
          return (
            <button
              key={cat.id}
              type="button"
              data-cro-id="MegaMenu-category"
              onClick={() => {
                setActiveId(cat.id);
                setOpenSectionId(null);
              }}
              className={`flex w-full flex-col items-center border-b border-[var(--color-neutral-200)] px-2 py-3 ${
                isActive
                  ? "border-s-2 border-s-[var(--color-primary)] bg-[var(--color-neutral-000)]"
                  : "border-s-2 border-s-transparent bg-[var(--color-neutral-100)]"
              }`}
            >
              <span className="mb-1 flex">
                <NavCategoryIcon name={cat.icon} active={isActive} />
              </span>
              <span
                className={`text-center text-[11px] leading-4 ${
                  isActive
                    ? "font-medium text-[var(--color-primary-500)]"
                    : "text-[var(--color-neutral-700)]"
                }`}
              >
                {cat.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content pane */}
      <div className="hide-scrollbar min-w-0 grow overflow-y-auto pb-12 pe-1 ps-2">
        <div className="flex flex-col items-stretch px-1">
          <Link
            href={active.href}
            data-cro-id="mega-menu-all-cat"
            className="flex items-center py-3"
          >
            <p className="grow text-sm font-bold text-[var(--color-secondary-700)]">
              {active.allProductsLabel}
            </p>
            <ChevronLeftIcon
              size={18}
              className="shrink-0 text-[var(--color-secondary-700)]"
            />
          </Link>

          {sections.map((section) => {
            const isOpen = openSectionId === section.parent.id;
            const hasLeaves = section.leaves.length > 0;

            if (!hasLeaves) {
              return (
                <Link
                  key={section.parent.id}
                  href={section.parent.href}
                  className="flex items-center border-b border-[var(--color-neutral-200)] py-3"
                >
                  <p className="grow text-sm font-bold text-[var(--color-neutral-900)]">
                    {section.parent.title}
                  </p>
                </Link>
              );
            }

            return (
              <div
                key={section.parent.id}
                className="border-b border-[var(--color-neutral-200)]"
                data-cro-id="mega-menu-parent"
              >
                <button
                  type="button"
                  className="flex w-full items-center py-3 text-start"
                  aria-expanded={isOpen}
                  onClick={() =>
                    setOpenSectionId(isOpen ? null : section.parent.id)
                  }
                >
                  <p className="grow text-sm font-bold text-[var(--color-neutral-900)]">
                    {section.parent.title}
                  </p>
                  <span className="shrink-0 text-[var(--color-icon-high-emphasis)]">
                    {isOpen ? (
                      <ChevronUpIcon />
                    ) : (
                      <ChevronDownIcon />
                    )}
                  </span>
                </button>
                {isOpen ? (
                  <LeafGrid
                    leaves={section.leaves}
                    parentHref={section.parent.href}
                    imageByHref={imageByHref}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
