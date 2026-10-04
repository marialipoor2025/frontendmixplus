/** Shared desktop / mobile menu action links (gradient buttons on desktop). */
export const NAV_ACTION_LINKS = [
  {
    id: "seller",
    href: "/sellers/join",
    title: "فروشنده شو",
    icon: "seller",
  },
  {
    id: "b2b",
    href: "/b2b",
    title: "خرید سازمانی",
    icon: "b2b",
  },
  {
    id: "invoice",
    href: "/enquiry",
    title: "صدور پیش فاکتور",
    icon: "invoice",
  },
] as const;

/** Unified navbar link text style (desktop menu row). */
export const NAV_LINK_CLASS =
  "flex items-center gap-1.5 whitespace-nowrap text-[13px] font-medium leading-none text-[var(--color-neutral-700)] transition hover:text-[var(--color-neutral-900)]";

export const NAV_ICON_CLASS = "h-[18px] w-[18px] shrink-0 text-[var(--color-neutral-500)]";
