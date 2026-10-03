"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AmazingIcon,
  B2bIcon,
  BrandsIcon,
  ChevronLeftIcon,
  GiftIcon,
  HamburgerIcon,
  InstallmentIcon,
  NavCategoryIcon,
  ServiceIcon,
  StockIcon,
  TrendIcon,
} from "@/components/layout/icons";
import type { MainNavData, MegaMenuCategory, NavQuickLink } from "@/types/nav";

type MainNavProps = {
  data: MainNavData;
};

function QuickLinkIcon({ name }: { name?: string }) {
  switch (name) {
    case "amazing":
      return <AmazingIcon className="text-[var(--color-icon-low-emphasis)]" />;
    case "brands":
      return <BrandsIcon className="text-[var(--color-icon-low-emphasis)]" />;
    case "trend":
      return <TrendIcon className="text-[var(--color-icon-low-emphasis)]" />;
    case "service":
      return <ServiceIcon className="text-[var(--color-icon-low-emphasis)]" />;
    case "b2b":
      return <B2bIcon className="text-[var(--color-icon-low-emphasis)]" />;
    case "gift":
      return <GiftIcon className="text-[var(--color-icon-low-emphasis)]" />;
    case "stock":
      return <StockIcon className="text-[var(--color-icon-low-emphasis)]" />;
    case "installment":
      return <InstallmentIcon className="text-[var(--color-icon-low-emphasis)]" />;
    default:
      return null;
  }
}

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
        className="flex cursor-pointer items-center whitespace-nowrap text-[13px] font-bold leading-none text-[var(--color-neutral-700)]"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <span className="ms-0 me-1 flex text-[var(--color-neutral-400)]">
          <HamburgerIcon />
        </span>
        {label}
        <span
          className="relative top-2 ms-5 mt-1 min-h-5 min-w-px bg-[var(--color-neutral-200)]"
          aria-hidden
        />
      </button>

      {open && active ? (
        <div
          className="absolute start-0 top-full z-40 flex h-[min(70vh,640px)] w-[min(92vw,960px)] overflow-hidden rounded-b-[var(--medium-radius)] bg-[var(--color-neutral-000)] shadow-[var(--shadow-mega)]"
          role="menu"
        >
          <div className="flex h-full w-full">
            {/* Sidebar — end side in RTL (visually right) */}
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
                      className={`text-[12px] font-bold ${
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

            {/* Columns */}
            <div className="h-full grow overflow-auto border-s border-[var(--color-neutral-100)] px-5 pt-5">
              <Link
                href={active.href}
                data-cro-id="mega-menu-all-cat"
                className="mb-5 flex items-center whitespace-nowrap text-[12px] font-bold text-[var(--color-secondary-700)]"
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
                            ? "relative mb-2 flex items-center py-1 text-[13px] font-bold text-[var(--color-neutral-900)]"
                            : "relative flex items-center py-1 text-[12px] text-[var(--color-neutral-500)] hover:text-[var(--color-primary-700)]"
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
      {links.map((link) => (
        <div
          key={link.id}
          className="flex h-full items-center px-2 md:px-3"
        >
          <Link
            href={link.href}
            target={link.external ? "_blank" : undefined}
            rel={link.external ? "noopener noreferrer" : undefined}
            data-cro-id="header-main-menu"
            className="flex cursor-pointer items-center whitespace-nowrap text-[12px] text-[var(--color-neutral-600)]"
          >
            {link.icon ? (
              <span className="ms-0 me-1 flex text-[var(--color-neutral-400)]">
                <QuickLinkIcon name={link.icon} />
              </span>
            ) : null}
            {link.title}
            {link.badge ? (
              <span className="ms-1 rounded bg-[var(--color-primary-500)] px-1.5 py-px text-[10px] font-bold leading-none text-white">
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
 * Digikala-style category bar under SiteHeader:
 * mega menu + quick links + seller CTA.
 */
export function MainNav({ data }: MainNavProps) {
  return (
    <nav
      className="flex grow flex-col flex-wrap items-center justify-between bg-[var(--color-neutral-000)]"
      aria-label="منوی اصلی"
    >
      <div className="relative mx-auto flex w-full max-w-[var(--header-max-width)] grow px-4 md:px-4">
        <div className="relative flex min-h-9 items-center">
          <div className="flex items-center">
            <CategoryMegaMenu
              label={data.categoryTriggerLabel}
              categories={data.categories}
            />
          </div>

          <div className="ms-1 flex items-center">
            <QuickLinks links={data.quickLinks} />
          </div>

          <div className="ms-1 flex items-center border-s border-[var(--color-neutral-200)] ps-2">
            <Link
              href={data.sellerCta.href}
              className="flex cursor-pointer items-center whitespace-nowrap px-2 py-1 text-[12px] text-[var(--color-neutral-600)] md:px-3"
            >
              {data.sellerCta.title}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
