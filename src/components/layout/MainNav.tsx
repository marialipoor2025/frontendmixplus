"use client";

import Link from "next/link";
import { useState } from "react";
import { HeaderQuickLinks } from "@/components/layout/HeaderQuickLinks";
import {
  BottomNavCategoryIcon,
  ChevronLeftIcon,
  NavCategoryIcon,
} from "@/components/layout/icons";
import { NavMenuIcon } from "@/components/layout/NavMenuIcon";
import {
  NAV_ICON_CLASS,
  NAV_LINK_CLASS,
} from "@/components/layout/navMenuShared";
import type { MainNavData, MegaMenuCategory, NavQuickLink } from "@/types/nav";

type MainNavProps = {
  data: MainNavData;
};

function CategoryMegaMenu({
  label,
  categories,
}: {
  label: string;
  categories: MegaMenuCategory[];
}) {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState(categories[0]?.id ?? "");
  const active = categories.find((c) => c.id === activeId) ?? categories[0];

  return (
    <div
      className="relative flex h-full items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        data-cro-id="header-main-menu"
        className={NAV_LINK_CLASS}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <BottomNavCategoryIcon className={NAV_ICON_CLASS} />
        {label}
      </button>

      {open && active ? (
        <div
          className="absolute start-0 top-full z-40 flex h-[min(70vh,640px)] w-[min(92vw,960px)] overflow-hidden rounded-b-[var(--medium-radius)] bg-[var(--color-neutral-000)] shadow-[var(--shadow-mega)]"
          role="menu"
        >
          <div className="flex h-full w-full">
            <div className="flex w-[220px] shrink-0 flex-col overflow-auto border-e border-[var(--color-neutral-100)] bg-[var(--color-neutral-000)]">
              {categories.map((cat) => {
                const isActive = cat.id === active.id;
                return (
                  <Link
                    key={cat.id}
                    href={cat.href}
                    data-cro-id="header-main-menu-categories"
                    className={`flex w-full items-center px-2 py-3 ${
                      isActive
                        ? "border-y border-[var(--color-neutral-100)] bg-[var(--color-neutral-000)]"
                        : "hover:bg-[var(--color-neutral-100)]"
                    }`}
                    onMouseEnter={() => setActiveId(cat.id)}
                  >
                    <span className="ms-0 me-2 flex">
                      <NavCategoryIcon name={cat.icon} active={isActive} />
                    </span>
                    <span
                      className={`text-[13px] font-medium ${
                        isActive
                          ? "text-[var(--color-primary-700)]"
                          : "text-[var(--color-neutral-700)]"
                      }`}
                    >
                      {cat.title}
                    </span>
                  </Link>
                );
              })}
            </div>

            <div className="h-full grow overflow-auto border-s border-[var(--color-neutral-100)] px-5 pt-5">
              <Link
                href={active.href}
                data-cro-id="mega-menu-all-cat"
                className="mb-5 flex items-center whitespace-nowrap text-[13px] font-medium text-[var(--color-secondary-700)]"
              >
                {active.allProductsLabel}
                <span className="ms-1 me-0 flex">
                  <ChevronLeftIcon className="text-[var(--color-icon-secondary)]" />
                </span>
              </Link>

              <div className="flex gap-8">
                {active.columns.map((col) => (
                  <div
                    key={col.id}
                    className="flex min-w-[160px] flex-col whitespace-nowrap"
                  >
                    {col.links.map((link) => (
                      <Link
                        key={link.id}
                        href={link.href}
                        data-cro-id={
                          link.kind === "parent"
                            ? "mega-menu-parent"
                            : "mega-menu-leaf"
                        }
                        className={
                          link.kind === "parent"
                            ? "relative mb-2 flex items-center py-1 text-[13px] font-medium text-[var(--color-neutral-900)]"
                            : "relative flex items-center py-1 text-[13px] font-medium text-[var(--color-neutral-500)] hover:text-[var(--color-primary-700)]"
                        }
                      >
                        <span className="truncate">{link.title}</span>
                        {link.kind === "parent" ? (
                          <span className="relative ms-0.5 flex">
                            <ChevronLeftIcon />
                          </span>
                        ) : null}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function QuickLinks({ links }: { links: NavQuickLink[] }) {
  return (
    <div className="flex items-center">
      {links.map((link, index) => (
        <div key={link.id} className="flex items-center">
          <span
            className={`h-4 w-px shrink-0 bg-[var(--color-neutral-200)] ${
              index === 0 ? "mx-3" : "mx-2"
            }`}
            aria-hidden
          />
          <Link
            href={link.href}
            target={link.external ? "_blank" : undefined}
            rel={link.external ? "noopener noreferrer" : undefined}
            data-cro-id="header-main-menu"
            className={`${NAV_LINK_CLASS} px-1`}
          >
            {link.icon ? <NavMenuIcon name={link.icon} /> : null}
            {link.title}
            {link.badge ? (
              <span className="rounded bg-[var(--color-primary-500)] px-1.5 py-px text-[10px] font-bold leading-none text-white">
                {link.badge}
              </span>
            ) : null}
          </Link>
        </div>
      ))}
    </div>
  );
}

/**
 * Barghchi-style nav row:
 * categories + links (start/right) · gradient action buttons (end/left).
 */
export function MainNav({ data }: MainNavProps) {
  return (
    <nav
      className="hidden bg-[var(--color-neutral-000)] lg:block"
      aria-label="منوی اصلی"
    >
      <div className="site-container relative flex items-center justify-between gap-6 py-2.5">
        <div className="relative flex min-w-0 items-center">
          <CategoryMegaMenu
            label={data.categoryTriggerLabel}
            categories={data.categories}
          />
          <QuickLinks links={data.quickLinks} />
        </div>

        <HeaderQuickLinks variant="desktop" />
      </div>
    </nav>
  );
}
