"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { HeaderQuickLinks } from "@/components/layout/HeaderQuickLinks";
import {
  BottomNavCategoryIcon,
  NavCategoryIcon,
} from "@/components/layout/icons";
import { NavMenuIcon } from "@/components/layout/NavMenuIcon";
import {
  NAV_ICON_CLASS,
  NAV_LINK_CLASS,
} from "@/components/layout/navMenuShared";
import { getBrandsByCategorySlug } from "@/lib/api/catalog";
import type { Brand } from "@/types/brand";
import type {
  MainNavData,
  MegaMenuCategory,
  MegaMenuLink,
  NavQuickLink,
} from "@/types/nav";

type MainNavProps = {
  data: MainNavData;
};

function flattenCategoryLinks(category: MegaMenuCategory): MegaMenuLink[] {
  return category.columns.flatMap((col) => col.links);
}

function categorySlugFromHref(href: string): string {
  const cleaned = href.trim().replace(/\/+$/, "");
  const match = cleaned.match(/\/(?:categories|category)\/([^/?#]+)/i);
  if (match?.[1]) return decodeURIComponent(match[1]);
  const parts = cleaned.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? "";
}

function MegaDropdown({
  categories,
  activeId,
  onActiveId,
}: {
  categories: MegaMenuCategory[];
  activeId: string;
  onActiveId: (id: string) => void;
}) {
  const active = categories.find((c) => c.id === activeId) ?? categories[0];
  const submenuLinks = active ? flattenCategoryLinks(active) : [];
  const activeSlug = useMemo(
    () => (active ? categorySlugFromHref(active.href) : ""),
    [active],
  );

  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(false);

  useEffect(() => {
    if (!activeSlug) {
      setBrands([]);
      return;
    }

    let cancelled = false;
    setBrandsLoading(true);
    getBrandsByCategorySlug(activeSlug)
      .then((rows) => {
        if (!cancelled) setBrands(rows.slice(0, 16));
      })
      .catch(() => {
        if (!cancelled) setBrands([]);
      })
      .finally(() => {
        if (!cancelled) setBrandsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeSlug]);

  return (
    <ul
      className="absolute inset-x-0 top-full z-20 min-h-[350px] list-none rounded-md bg-white pb-20 pt-4 shadow-md ring-1 ring-black/5"
      role="menu"
      aria-label="دسته‌بندی کالاها"
    >
      {categories.map((cat) => {
        const isActive = cat.id === active?.id;
        return (
          <li
            key={cat.id}
            className="w-56 px-2 py-0.5"
            onMouseEnter={() => onActiveId(cat.id)}
          >
            <Link
              href={cat.href}
              data-cro-id="header-main-menu-categories"
              className={[
                "flex items-center rounded-md p-2 text-sm",
                isActive
                  ? "bg-[#F1F9FF] font-medium text-[var(--color-secondary-500)]"
                  : "text-[var(--color-neutral-700)] hover:bg-[#F1F9FF]/70 hover:text-[var(--color-secondary-500)]",
              ].join(" ")}
            >
              <span className="flex shrink-0 ps-0 pe-2 text-[#2A75BB]">
                <NavCategoryIcon name={cat.icon} active={isActive} />
              </span>
              <span className="truncate">{cat.title}</span>
            </Link>

            {isActive ? (
              <div
                className="absolute bottom-20 top-0 start-56 end-0 flex flex-col flex-wrap gap-2.5 overflow-hidden border-s border-[var(--color-neutral-200)] p-4"
                role="group"
                aria-label={cat.title}
              >
                {submenuLinks.map((link) => (
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
                        ? "mt-2 w-1/4 border-s-2 border-[var(--color-primary)] pe-2 ps-2 text-sm font-bold text-[var(--color-neutral-800)] hover:text-[var(--color-primary)]"
                        : "w-1/4 pe-2 ps-2 text-xs text-[var(--color-neutral-600)] hover:text-[var(--color-primary)]"
                    }
                  >
                    {link.title}
                  </Link>
                ))}
              </div>
            ) : null}
          </li>
        );
      })}

      <li className="pointer-events-auto absolute inset-x-0 bottom-0 list-none border-t border-[var(--color-neutral-200)] bg-white">
        <div
          className="flex items-center gap-3 overflow-x-auto px-4 py-3"
          aria-label={
            active ? `برندهای ${active.title}` : "برندهای این دسته‌بندی"
          }
        >
          <span className="shrink-0 text-xs font-bold text-[var(--color-neutral-700)]">
            برندها
          </span>
          <div
            className="flex min-w-0 flex-1 items-center justify-start gap-2 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            dir="ltr"
          >
            {brandsLoading ? (
              <span className="text-xs text-[var(--color-neutral-400)]" dir="rtl">
                در حال بارگذاری…
              </span>
            ) : brands.length === 0 ? (
              <span className="text-xs text-[var(--color-neutral-400)]" dir="rtl">
                برندی در این دسته نیست
              </span>
            ) : (
            brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/brand/${brand.slug}`}
                data-cro-id="mega-menu-brand"
                className="group flex h-10 shrink-0 origin-bottom items-center justify-center rounded-md px-2.5 py-1 text-[11px] font-medium text-[var(--color-neutral-700)] transition-transform duration-200 ease-out hover:z-10 hover:scale-110 hover:bg-[#F1F9FF] hover:text-[var(--color-secondary-500)]"
                title={brand.name}
              >
                <span className="whitespace-nowrap">{brand.name}</span>
              </Link>
            ))
            )}
          </div>
        </div>
      </li>
    </ul>
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
 * Desktop nav row with Oriya mega-menu:
 * category rail + wrapping submenu + brands for the hovered category.
 */
export function MainNav({ data }: MainNavProps) {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState(data.categories[0]?.id ?? "");

  return (
    <nav
      className="hidden bg-[var(--color-neutral-000)] lg:block"
      aria-label="منوی اصلی"
    >
      <div
        className="site-container relative flex flex-col"
        onMouseLeave={() => setOpen(false)}
      >
        <div className="relative flex items-center justify-between gap-6 py-2.5">
          <div className="relative flex min-w-0 flex-1 items-center">
            <button
              type="button"
              data-cro-id="header-main-menu"
              className={NAV_LINK_CLASS}
              aria-expanded={open}
              aria-haspopup="true"
              onMouseEnter={() => setOpen(true)}
              onFocus={() => setOpen(true)}
            >
              <BottomNavCategoryIcon className={NAV_ICON_CLASS} />
              {data.categoryTriggerLabel}
            </button>
            <QuickLinks links={data.quickLinks} />
          </div>

          <HeaderQuickLinks variant="desktop" />
        </div>

        {open && data.categories.length > 0 ? (
          <MegaDropdown
            categories={data.categories}
            activeId={activeId}
            onActiveId={setActiveId}
          />
        ) : null}
      </div>
    </nav>
  );
}
