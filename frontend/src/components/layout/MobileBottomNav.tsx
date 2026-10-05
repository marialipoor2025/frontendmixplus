"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
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
import {
  useCategoryImages,
  useMobileNav,
} from "@/components/layout/MobileNavContext";
import { MobileSideDrawer } from "@/components/layout/MobileSideDrawer";
import { MobileSupportChat } from "@/components/layout/MobileSupportChat";
import { NavMenuIcon } from "@/components/layout/NavMenuIcon";
import {
  NAV_ACTION_LINKS,
  NAV_ICON_CLASS,
} from "@/components/layout/navMenuShared";

type NavId = "chat" | "categories" | "cart" | "profile" | "home";

/** Routes that already have a real page — others stay on-page and only switch active. */
const REAL_PAGES: Partial<Record<NavId, string>> = {
  home: "/",
  categories: "/categories",
  cart: "/checkout/cart",
  profile: "/profile",
};

const MENU_ROW =
  "flex w-full items-center gap-3 px-4 py-3.5 text-start text-[13px] font-medium text-[var(--color-neutral-700)] transition hover:bg-[var(--color-neutral-50)]";

function pathToNavId(pathname: string): NavId | null {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/categories")) return "categories";
  if (pathname.startsWith("/checkout/cart")) return "cart";
  if (pathname.startsWith("/profile")) return "profile";
  return null;
}

export function MobileBottomNav() {
  const pathname = usePathname() || "/";
  const nav = useMobileNav();
  const imageByHref = useCategoryImages();
  const [chatOpen, setChatOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const [selectedId, setSelectedId] = useState<NavId | null>(null);
  const [mounted, setMounted] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setSelectedId(null);
    setChatOpen(false);
    setMenuOpen(false);
    setCategoriesExpanded(false);
  }, [pathname]);

  /** Digikala PDP has no bottom nav — free the viewport for the sticky buy bar. */
  const hideBottomNav =
    pathname.startsWith("/users") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/product");

  useEffect(() => {
    const cls = "no-mobile-bottom-nav";
    if (hideBottomNav) {
      document.body.classList.add(cls);
    } else {
      document.body.classList.remove(cls);
    }
    return () => document.body.classList.remove(cls);
  }, [hideBottomNav]);

  useEffect(() => {
    if (!mounted || hideBottomNav) return;
    const el = shellRef.current;
    if (!el) return;

    const sync = () => {
      const vv = window.visualViewport;
      el.style.top = `${vv?.offsetTop ?? 0}px`;
      el.style.height = `${vv?.height ?? window.innerHeight}px`;
    };

    sync();
    const vv = window.visualViewport;
    vv?.addEventListener("resize", sync);
    vv?.addEventListener("scroll", sync);
    window.addEventListener("resize", sync);
    return () => {
      vv?.removeEventListener("resize", sync);
      vv?.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [mounted, hideBottomNav]);

  if (hideBottomNav) {
    return null;
  }

  const pathId = pathToNavId(pathname);
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

  const onStubClick =
    (id: NavId) => (event: MouseEvent<HTMLAnchorElement>) => {
      if (id === "cart") {
        closeAllOverlays();
        setSelectedId(null);
        return;
      }
      event.preventDefault();
      closeAllOverlays();
      setSelectedId(id);
    };

  const iconClass = (id: NavId) =>
    activeId === id
      ? "h-6 w-6 text-[var(--color-primary)]"
      : "h-6 w-6 text-[#2B3674]";

  if (!mounted) return null;

  return createPortal(
    <>
      <div
        ref={shellRef}
        className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[100dvh] lg:hidden"
      >
        <nav
          className="pointer-events-auto absolute inset-x-0 bottom-0 border-t border-[var(--color-border)] bg-white"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
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
              href="/checkout/cart"
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
      </div>

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
    </>,
    document.body,
  );
}
