"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { MobileCategoryBrowser } from "@/components/categories/MobileCategoryBrowser";
import {
  BottomNavCartIcon,
  BottomNavCategoryIcon,
  BottomNavChatIcon,
  BottomNavHomeIcon,
  BottomNavProfileIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@/components/layout/icons";
import { useMobileNav } from "@/components/layout/MobileNavContext";
import { MobileSideDrawer } from "@/components/layout/MobileSideDrawer";
import { MobileSupportChat } from "@/components/layout/MobileSupportChat";
import { NavMenuIcon } from "@/components/layout/NavMenuIcon";
import {
  NAV_ACTION_LINKS,
  NAV_ICON_CLASS,
} from "@/components/layout/navMenuShared";
import { mockHomePageData } from "@/lib/mocks/home";

type NavId = "chat" | "categories" | "cart" | "profile" | "home";

/** Routes that already have a real page — others stay on-page and only switch active. */
const REAL_PAGES: Partial<Record<NavId, string>> = {
  home: "/",
  categories: "/categories",
  profile: "/profile",
};

const MENU_ROW =
  "flex w-full items-center gap-3 px-4 py-3.5 text-start text-[13px] font-medium text-[var(--color-neutral-700)] transition hover:bg-[var(--color-neutral-50)]";

function pathToNavId(pathname: string): NavId | null {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/categories")) return "categories";
  if (pathname.startsWith("/profile")) return "profile";
  return null;
}

function buildCategoryImageMap() {
  const map: Record<string, string> = {};
  for (const cat of mockHomePageData.categories) {
    map[cat.href] = cat.imageUrl;
  }
  return map;
}

export function MobileBottomNav() {
  const pathname = usePathname() || "/";
  const nav = useMobileNav();
  const [chatOpen, setChatOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  /** Explicit selection for stub items (cart/profile) or overrides — never stacks with path. */
  const [selectedId, setSelectedId] = useState<NavId | null>(null);
  const imageByHref = useMemo(() => buildCategoryImageMap(), []);

  // Real route changes reset stub selection so only the current page tab is active.
  useEffect(() => {
    setSelectedId(null);
    setChatOpen(false);
    setMenuOpen(false);
    setCategoriesExpanded(false);
  }, [pathname]);

  // Auth screens are full-bleed Digikala-style cards — hide marketplace chrome.
  if (pathname.startsWith("/users") || pathname.startsWith("/admin")) {
    return null;
  }

  const pathId = pathToNavId(pathname);

  // Exactly one active id — overlays beat stubs, stubs beat path, path defaults to home on `/`.
  const activeId: NavId =
    chatOpen
      ? "chat"
      : menuOpen
        ? "categories"
        : (selectedId ?? pathId ?? "home");

  const closeMenu = () => {
    setMenuOpen(false);
    setCategoriesExpanded(false);
  };

  const closeAllOverlays = () => {
    setChatOpen(false);
    closeMenu();
  };

  const selectTab = (id: NavId) => {
    closeAllOverlays();
    setSelectedId(id);
  };

  const onStubClick =
    (id: NavId) => (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      selectTab(id);
    };

  const iconClass = (id: NavId) =>
    activeId === id
      ? "h-6 w-6 text-[var(--color-primary)]"
      : "h-6 w-6 text-[#2B3674]";

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-border)] bg-white lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label="منوی پایین موبایل"
      >
        <ul className="mx-auto flex max-w-lg items-center justify-between px-4 py-2">
          <li>
            <button
              type="button"
              onClick={() => {
                closeMenu();
                setSelectedId(null);
                setChatOpen(true);
              }}
              className="relative flex h-11 w-11 items-center justify-center"
              aria-label="گفتگو"
              aria-current={activeId === "chat" ? "page" : undefined}
            >
              {activeId === "chat" ? (
                <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[#00BAD1]">
                  <BottomNavChatIcon className="h-5 w-5 text-white" />
                  <span
                    className="animate-slowPing absolute inset-0 rounded-full bg-[#00BAD140]"
                    aria-hidden
                  />
                </span>
              ) : (
                <BottomNavChatIcon className="h-6 w-6 text-[#00BAD1]" />
              )}
            </button>
          </li>

          <li>
            <button
              type="button"
              onClick={() => {
                setChatOpen(false);
                setSelectedId(null);
                setCategoriesExpanded(false);
                setMenuOpen(true);
              }}
              className="relative flex h-11 w-11 items-center justify-center"
              aria-label="دسته‌ها"
              aria-current={activeId === "categories" ? "page" : undefined}
              aria-expanded={menuOpen}
            >
              <BottomNavCategoryIcon className={iconClass("categories")} />
            </button>
          </li>

          <li>
            <Link
              href="/checkout/cart/"
              onClick={onStubClick("cart")}
              className="relative flex h-11 w-11 items-center justify-center"
              aria-label="سبد خرید"
              aria-current={activeId === "cart" ? "page" : undefined}
            >
              <BottomNavCartIcon className={iconClass("cart")} />
            </Link>
          </li>

          <li>
            <Link
              href={REAL_PAGES.profile!}
              onClick={() => {
                closeAllOverlays();
                setSelectedId(null);
              }}
              className="relative flex h-11 w-11 items-center justify-center"
              aria-label="پروفایل"
              aria-current={activeId === "profile" ? "page" : undefined}
            >
              <BottomNavProfileIcon className={iconClass("profile")} />
            </Link>
          </li>

          <li>
            <Link
              href={REAL_PAGES.home!}
              onClick={() => {
                closeAllOverlays();
                setSelectedId(null);
              }}
              className="relative flex h-11 w-11 items-center justify-center"
              aria-label="خانه"
              aria-current={activeId === "home" ? "page" : undefined}
            >
              <BottomNavHomeIcon className={iconClass("home")} />
            </Link>
          </li>
        </ul>
      </nav>

      <MobileSupportChat
        open={chatOpen}
        onClose={() => {
          setChatOpen(false);
        }}
      />

      <MobileSideDrawer
        open={menuOpen}
        onClose={closeMenu}
        title="منوی اصلی"
        wide={categoriesExpanded}
      >
        {!categoriesExpanded ? (
          <nav
            className="flex flex-col overflow-y-auto py-1"
            aria-label="منوی موبایل"
          >
            <button
              type="button"
              onClick={() => setCategoriesExpanded(true)}
              className={`${MENU_ROW} border-b border-[var(--color-neutral-100)]`}
              aria-expanded={false}
            >
              <BottomNavCategoryIcon className={NAV_ICON_CLASS} />
              <span className="grow">{nav.categoryTriggerLabel}</span>
              <ChevronDownIcon
                size={20}
                className="shrink-0 text-[var(--color-neutral-400)]"
              />
            </button>

            {nav.quickLinks.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                onClick={closeMenu}
                className={MENU_ROW}
              >
                {link.icon ? <NavMenuIcon name={link.icon} /> : null}
                <span className="grow">{link.title}</span>
                {link.badge ? (
                  <span className="rounded bg-[var(--color-primary-500)] px-1.5 py-px text-[10px] font-bold leading-none text-white">
                    {link.badge}
                  </span>
                ) : null}
              </Link>
            ))}

            <div className="my-1 border-t border-[var(--color-neutral-100)]" />

            {NAV_ACTION_LINKS.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                onClick={closeMenu}
                className={MENU_ROW}
              >
                <NavMenuIcon name={link.icon} />
                <span className="grow">{link.title}</span>
              </Link>
            ))}
          </nav>
        ) : (
          <div className="flex h-full min-h-0 flex-col">
            <button
              type="button"
              onClick={() => setCategoriesExpanded(false)}
              className={`${MENU_ROW} shrink-0 border-b border-[var(--color-neutral-100)]`}
              aria-expanded
            >
              <BottomNavCategoryIcon className={NAV_ICON_CLASS} />
              <span className="grow">{nav.categoryTriggerLabel}</span>
              <ChevronUpIcon
                size={20}
                className="shrink-0 text-[var(--color-neutral-400)]"
              />
            </button>

            <div
              className="min-h-0 flex-1"
              onClick={(event) => {
                const target = event.target as HTMLElement | null;
                if (target?.closest("a")) closeMenu();
              }}
            >
              <MobileCategoryBrowser
                categories={nav.categories}
                imageByHref={imageByHref}
                fillHeight
              />
            </div>
          </div>
        )}
      </MobileSideDrawer>
    </>
  );
}
