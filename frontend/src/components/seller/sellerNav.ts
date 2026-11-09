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
 */
export const DIGI_SELLER_NAV: SellerNavGroup[] = [
  {
    id: "catalog",
    title: "کالا",
    items: [
      {
        // Digikala: /pwa/product/list
        id: "products-search",
        title: "جستجو و ثبت کالا",
        href: "/seller/digi/products",
      },
      {
        // Digikala: /pwa/product-management
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
        href: "/seller/digi/products",
      },
      {
        id: "inventory-report",
        title: "گزارش موجودی کالا",
        href: "/seller/digi/inventory",
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
        href: "/seller/digi/orders",
      },
      {
        id: "orders-tracking",
        title: "رهگیری ارسال با میاره",
        href: "/seller/digi/orders",
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
        href: "/seller/digi/shipping",
      },
      {
        id: "shipping-packages",
        title: "لیست محموله‌ها",
        href: "/seller/digi/shipping",
      },
      {
        id: "shipping-returns",
        title: "پس گرفتن کالا از انبار",
        href: "/seller/digi/shipping",
      },
      {
        id: "shipping-claims",
        title: "پیگیری درخواست‌های خسارت",
        href: "/seller/digi/shipping",
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
        href: "/seller/digi/finance",
      },
      {
        id: "finance-commission",
        title: "کمیسیون، هزینه‌ها و جریمه‌ها",
        href: "/seller/digi/finance",
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
        href: "/seller/digi/marketing",
      },
      {
        id: "marketing-shop",
        title: "فروشگاه شما در MixPlus",
        href: "/seller/digi/settings",
        badge: "جدید",
      },
      {
        id: "marketing-smart",
        title: "تخفیف هوشمند",
        href: "/seller/digi/marketing",
      },
      {
        id: "marketing-list",
        title: "ایجاد لیست اختصاصی",
        href: "/seller/digi/marketing",
      },
      {
        id: "marketing-voucher",
        title: "کد تخفیف",
        href: "/seller/digi/marketing",
      },
    ],
  },
  {
    id: "ads",
    title: "تبلیغات",
    href: "/seller/digi/marketing",
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
        href: "/seller/digi/analytics",
      },
      {
        id: "analytics-promo",
        title: "گزارش پروموشن‌ها",
        href: "/seller/digi/analytics",
      },
      {
        id: "analytics-smart",
        title: "گزارش تخفیف‌های هوشمند",
        href: "/seller/digi/analytics",
      },
      {
        id: "analytics-commitment",
        title: "گزارش تعهد ارسال",
        href: "/seller/digi/orders",
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
        href: "/seller/digi/settings",
      },
      {
        id: "services-ops",
        title: "سرویس‌های عملیاتی",
        href: "/seller/digi/settings",
      },
      {
        id: "services-token",
        title: "توکن اختصاصی",
        href: "/seller/digi/settings",
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
        href: "/seller/digi/settings",
      },
      {
        id: "help-forbidden",
        title: "کالاهای غیرمجاز",
        href: "/seller/digi/settings",
      },
      {
        id: "help-faq",
        title: "سوالات متداول",
        href: "/seller/digi/settings",
      },
    ],
  },
  {
    id: "support",
    title: "پشتیبانی",
    href: "/seller/digi/settings",
    items: [],
  },
];

/** @deprecated use DIGI_SELLER_NAV or CLASSIC_SELLER_NAV explicitly */
export const SELLER_NAV = DIGI_SELLER_NAV;

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

  if (href === dashboardHref) {
    return pathname === dashboardHref || pathname === `${dashboardHref}/`;
  }
  if (href === productsHref) {
    // Product list + Digikala create/initial chooser (جستجو و ثبت کالا)
    if (pathname.startsWith(productsCreateHref)) return true;
    return (
      pathname === productsHref ||
      pathname === `${productsHref}/` ||
      (pathname.startsWith(`${productsHref}/`) &&
        !pathname.startsWith(productsNewHref))
    );
  }
  if (href === productsNewHref) {
    return pathname.startsWith(productsNewHref);
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function isSellerGroupActive(
  pathname: string,
  group: SellerNavGroup,
): boolean {
  if (group.href && isSellerNavActive(pathname, group.href)) return true;
  return group.items.some((item) => isSellerNavActive(pathname, item.href));
}
