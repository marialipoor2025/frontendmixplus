export type SellerNavItem = {
  id: string;
  title: string;
  href: string;
  badge?: string;
  external?: boolean;
};

export type SellerNavGroup = {
  id: string;
  title: string;
  href?: string;
  /** Red update dot on the menu label (Digikala Menu__updateBadge) */
  updateBadge?: boolean;
  items: SellerNavItem[];
};

/** Original MixPlus seller sidebar (classic portal). */
export const CLASSIC_SELLER_NAV: SellerNavItem[] = [
  { id: "products", title: "مدیریت محصولات", href: "/seller/products" },
  { id: "new-product", title: "افزودن محصول", href: "/seller/products/new" },
  { id: "orders", title: "سفارش‌ها", href: "/seller/orders" },
  { id: "settings", title: "تنظیمات فروشگاه", href: "/seller/settings" },
  { id: "digi", title: "پیش‌نمایش پنل دیجی", href: "/seller/digi/dashboard" },
];

/**
 * Digikala AuthenticatedHeaderDesktop IA — exact labels from live HTML.
 * Used only by `/seller/digi/*`.
 *
 * Items that share a page use `?nav=<item.id>` so only one submenu row is
 * active and clicks always change the URL (Next.js same-href is a no-op).
 */
export const DIGI_SELLER_NAV: SellerNavGroup[] = [
  {
    id: "catalog",
    title: "کالا",
    items: [
      {
        id: "products-search",
        title: "جستجو و ثبت کالا",
        href: "/seller/digi/products/create/initial",
      },
      {
        id: "products",
        title: "مدیریت کالا و افزودن تنوع",
        href: "/seller/digi/products",
      },
      {
        id: "pricing",
        title: "مدیریت تنوع و قیمت‌گذاری",
        href: "/seller/digi/inventory",
      },
      {
        id: "video",
        title: "مدیریت ویدیو",
        href: "/seller/digi/products?nav=video",
      },
      {
        id: "inventory-report",
        title: "گزارش موجودی کالا",
        href: "/seller/digi/inventory?nav=inventory-report",
      },
    ],
  },
  {
    id: "orders",
    title: "سفارش‌ها",
    items: [
      {
        id: "orders-list",
        title: "سفارش‌ها و تعهدات ارسال",
        href: "/seller/digi/orders",
      },
      {
        id: "orders-history",
        title: "تاریخچه سفارش‌ها",
        href: "/seller/digi/orders?nav=orders-history",
      },
      {
        id: "orders-tracking",
        title: "رهگیری ارسال با میاره",
        href: "/seller/digi/orders?nav=orders-tracking",
      },
    ],
  },
  {
    id: "shipping",
    title: "ارسال و انبار",
    items: [
      {
        id: "shipping-sbs",
        title: "تنظیمات ارسال فروشنده",
        href: "/seller/digi/shipping",
      },
      {
        id: "shipping-consignment",
        title: "ایجاد محموله برای انبارش",
        href: "/seller/digi/shipping?nav=shipping-consignment",
      },
      {
        id: "shipping-packages",
        title: "لیست محموله‌ها",
        href: "/seller/digi/shipping?nav=shipping-packages",
      },
      {
        id: "shipping-returns",
        title: "پس گرفتن کالا از انبار",
        href: "/seller/digi/shipping?nav=shipping-returns",
      },
      {
        id: "shipping-claims",
        title: "پیگیری درخواست‌های خسارت",
        href: "/seller/digi/shipping?nav=shipping-claims",
      },
    ],
  },
  {
    id: "finance",
    title: "مالی",
    updateBadge: true,
    items: [
      {
        id: "finance-transactions",
        title: "تراکنش‌های مالی و تسویه زودهنگام",
        href: "/seller/digi/finance",
        badge: "جدید",
      },
      {
        id: "finance-invoice",
        title: "صورت‌حساب‌ها",
        href: "/seller/digi/finance?nav=finance-invoice",
      },
      {
        id: "finance-commission",
        title: "کمیسیون، هزینه‌ها و جریمه‌ها",
        href: "/seller/digi/finance?nav=finance-commission",
      },
    ],
  },
  {
    id: "marketing",
    title: "بازاریابی",
    updateBadge: true,
    items: [
      {
        id: "marketing-campaign",
        title: "شرکت در پروموشن جدید",
        href: "/seller/digi/marketing",
      },
      {
        id: "marketing-manage",
        title: "مدیریت پروموشن‌ها",
        href: "/seller/digi/marketing?nav=marketing-manage",
      },
      {
        id: "marketing-shop",
        title: "فروشگاه شما در اوریا مارکت",
        href: "/seller/digi/settings?nav=marketing-shop",
        badge: "جدید",
      },
      {
        id: "marketing-smart",
        title: "تخفیف هوشمند",
        href: "/seller/digi/marketing?nav=marketing-smart",
      },
      {
        id: "marketing-list",
        title: "ایجاد لیست اختصاصی",
        href: "/seller/digi/marketing?nav=marketing-list",
      },
      {
        id: "marketing-voucher",
        title: "کد تخفیف",
        href: "/seller/digi/marketing?nav=marketing-voucher",
      },
    ],
  },
  {
    id: "ads",
    title: "تبلیغات",
    href: "/seller/digi/marketing?nav=ads",
    items: [],
  },
  {
    id: "analytics",
    title: "تحلیل عملکرد",
    items: [
      {
        id: "analytics-sales",
        title: "فروش و درآمد",
        href: "/seller/digi/analytics",
      },
      {
        id: "analytics-returns",
        title: "مرجوعی",
        href: "/seller/digi/analytics?nav=analytics-returns",
      },
      {
        id: "analytics-promo",
        title: "گزارش پروموشن‌ها",
        href: "/seller/digi/analytics?nav=analytics-promo",
      },
      {
        id: "analytics-smart",
        title: "گزارش تخفیف‌های هوشمند",
        href: "/seller/digi/analytics?nav=analytics-smart",
      },
      {
        id: "analytics-commitment",
        title: "گزارش تعهد ارسال",
        href: "/seller/digi/orders?nav=analytics-commitment",
      },
    ],
  },
  {
    id: "services",
    title: "سرویس‌هاب",
    items: [
      {
        id: "services-digital",
        title: "سرویس‌های دیجیتال",
        href: "/seller/digi/settings?nav=services-digital",
      },
      {
        id: "services-ops",
        title: "سرویس‌های عملیاتی",
        href: "/seller/digi/settings?nav=services-ops",
      },
      {
        id: "services-token",
        title: "توکن اختصاصی",
        href: "/seller/digi/settings?nav=services-token",
      },
    ],
  },
  {
    id: "help",
    title: "راهنما",
    items: [
      {
        id: "help-academy",
        title: "مرکز آموزش فروشندگان",
        href: "/seller/digi/settings?nav=help-academy",
      },
      {
        id: "help-forbidden",
        title: "کالاهای غیرمجاز",
        href: "/seller/digi/settings?nav=help-forbidden",
      },
      {
        id: "help-faq",
        title: "سوالات متداول",
        href: "/seller/digi/settings?nav=help-faq",
      },
    ],
  },
  {
    id: "support",
    title: "پشتیبانی",
    href: "/seller/digi/settings?nav=support",
    items: [],
  },
];

/** @deprecated use DIGI_SELLER_NAV or CLASSIC_SELLER_NAV explicitly */
export const SELLER_NAV = DIGI_SELLER_NAV;

function normalizePath(path: string): string {
  if (!path) return "/";
  const trimmed = path.replace(/\/+$/, "");
  return trimmed.length > 0 ? trimmed : "/";
}

function parseHref(href: string): { pathname: string; nav: string | null } {
  const url = new URL(href, "https://seller.local");
  return {
    pathname: normalizePath(url.pathname),
    nav: url.searchParams.get("nav"),
  };
}

/**
 * Classic / simple active check (pathname only). Prefer
 * {@link isSellerNavItemActive} for Digi sidebar rows.
 */
export function isSellerNavActive(pathname: string, href: string): boolean {
  const digi = href.startsWith("/seller/digi");
  const productsHref = digi ? "/seller/digi/products" : "/seller/products";
  const productsNewHref = digi
    ? "/seller/digi/products/new"
    : "/seller/products/new";
  const productsCreateHref = digi
    ? "/seller/digi/products/create"
    : "/seller/products/create";
  const dashboardHref = digi ? "/seller/digi/dashboard" : "/seller/dashboard";
  const path = normalizePath(pathname);
  const { pathname: hrefPath } = parseHref(href);

  if (hrefPath === normalizePath(dashboardHref)) {
    return path === normalizePath(dashboardHref);
  }
  if (hrefPath === normalizePath(productsHref)) {
    if (path.startsWith(normalizePath(productsCreateHref))) return true;
    return (
      path === normalizePath(productsHref) ||
      (path.startsWith(`${normalizePath(productsHref)}/`) &&
        !path.startsWith(normalizePath(productsNewHref)))
    );
  }
  if (hrefPath === normalizePath(productsNewHref)) {
    return path.startsWith(normalizePath(productsNewHref));
  }
  return path === hrefPath || path.startsWith(`${hrefPath}/`);
}

/** Digi sidebar: exactly one row active; honors `?nav=` disambiguation. */
export function isSellerNavItemActive(
  pathname: string,
  search: string,
  item: SellerNavItem,
): boolean {
  const path = normalizePath(pathname);
  const qs = new URLSearchParams(
    search.startsWith("?") ? search.slice(1) : search,
  );
  const currentNav = qs.get("nav");
  const { pathname: hrefPath, nav: itemNav } = parseHref(item.href);

  if (currentNav) {
    return item.id === currentNav || itemNav === currentNav;
  }

  // No ?nav= in URL — only the default (no-nav) item for this path wins.
  if (itemNav) return false;

  if (item.id === "products-search") {
    return (
      path.startsWith("/seller/digi/products/create") ||
      path.startsWith("/seller/digi/products/new")
    );
  }

  if (item.id === "products") {
    if (path.startsWith("/seller/digi/products/create")) return false;
    if (path.startsWith("/seller/digi/products/new")) return false;
    return (
      path === "/seller/digi/products" ||
      path.startsWith("/seller/digi/products/")
    );
  }

  return path === hrefPath;
}

export function isSellerGroupActive(
  pathname: string,
  search: string,
  group: SellerNavGroup,
): boolean {
  if (
    group.href &&
    isSellerNavItemActive(pathname, search, {
      id: group.id,
      title: group.title,
      href: group.href,
    })
  ) {
    return true;
  }
  return group.items.some((item) =>
    isSellerNavItemActive(pathname, search, item),
  );
}
