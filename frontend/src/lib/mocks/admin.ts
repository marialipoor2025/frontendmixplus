import type {
  AdminAuditLog,
  AdminBrand,
  AdminCategory,
  AdminCmsItem,
  AdminCoupon,
  AdminCustomer,
  AdminInventoryRow,
  AdminMedia,
  AdminOffer,
  AdminOrder,
  AdminPromotion,
  AdminReportRow,
  AdminReview,
  AdminSeller,
  AdminSpec,
  AdminStat,
  AdminVariant,
} from "@/types/admin";

export const mockAdminStats: AdminStat[] = [
  { id: "orders", label: "سفارش‌های امروز", value: "۱۲۸", hint: "+۱۲٪ نسبت به دیروز" },
  { id: "gmv", label: "فروش امروز (تومان)", value: "۴۸۶٬۰۰۰٬۰۰۰", hint: "۷ روز اخیر پایدار" },
  { id: "customers", label: "مشتریان فعال", value: "۸٬۴۲۰", hint: "+۳۴ امروز" },
  { id: "pending", label: "در انتظار اقدام", value: "۱۹", hint: "سفارش / بررسی / فروشنده" },
];

export const mockAdminVariants: AdminVariant[] = [
  {
    id: "v1",
    productId: "p-samsung-side",
    productTitle: "یخچال ساید بای ساید سامسونگ",
    sku: "RF-SAM-001-WG-28",
    attributes: "رنگ: سفید براق · ظرفیت: ۲۸ فوت",
    options: [
      { code: "color", name: "رنگ", value: "سفید براق" },
      { code: "capacity", name: "ظرفیت", value: "۲۸ فوت" },
    ],
    price: 68500000,
    originalPrice: 72900000,
    stock: 9,
    inStock: true,
  },
  {
    id: "v2",
    productId: "p-samsung-side",
    productTitle: "یخچال ساید بای ساید سامسونگ",
    sku: "RF-SAM-001-ST-30",
    attributes: "رنگ: استیل · ظرفیت: ۳۰ فوت",
    options: [
      { code: "color", name: "رنگ", value: "استیل" },
      { code: "capacity", name: "ظرفیت", value: "۳۰ فوت" },
    ],
    price: 74300000,
    stock: 0,
    inStock: false,
  },
  {
    id: "v3",
    productId: "p-bosch-washer",
    productTitle: "ماشین لباسشویی بوش ۹ کیلویی",
    sku: "WM-BSH-090-WHT",
    attributes: "رنگ: سفید · ظرفیت: ۹ کیلوگرم",
    options: [
      { code: "color", name: "رنگ", value: "سفید" },
      { code: "capacity", name: "ظرفیت", value: "۹ کیلوگرم" },
    ],
    price: 42900000,
    stock: 8,
    inStock: true,
  },
];

export const mockAdminSpecs: AdminSpec[] = [
  { id: "s1", name: "ظرفیت", group: "عمومی", unit: "لیتر", category: "یخچال" },
  { id: "s2", name: "کلاس انرژی", group: "مصرف", unit: "—", category: "لوازم خانگی" },
  { id: "s3", name: "قدرت موتور", group: "فنی", unit: "وات", category: "جاروبرقی" },
];

export const mockAdminCategories: AdminCategory[] = [
  { id: "c1", name: "لوازم خانگی", parent: "—", slug: "home-appliances", productCount: 420 },
  { id: "c2", name: "یخچال و فریزر", parent: "لوازم خانگی", slug: "fridge", productCount: 86 },
  { id: "c3", name: "صوتی و تصویری", parent: "—", slug: "av", productCount: 210 },
];

export const mockAdminBrands: AdminBrand[] = [
  { id: "b1", name: "سامسونگ", slug: "samsung", productCount: 120, status: "active" },
  { id: "b2", name: "بوش", slug: "bosch", productCount: 64, status: "active" },
  { id: "b3", name: "شیائومی", slug: "xiaomi", productCount: 98, status: "hidden" },
];

export const mockAdminMedia: AdminMedia[] = [
  { id: "m1", name: "fridge-hero.webp", type: "image", usedIn: "محصول RF-SAM-001", sizeKb: 240 },
  { id: "m2", name: "home-banner-1.png", type: "image", usedIn: "بنر صفحه اصلی", sizeKb: 520 },
  { id: "m3", name: "washer-demo.mp4", type: "video", usedIn: "محصول WM-BSH-090", sizeKb: 4200 },
];

export const mockAdminInventory: AdminInventoryRow[] = [
  { id: "i1", sku: "RF-SAM-001-SLV", title: "یخچال سامسونگ نقره‌ای", warehouse: "تهران ۱", onHand: 9, reserved: 2 },
  { id: "i2", sku: "WM-BSH-090-WHT", title: "لباسشویی بوش سفید", warehouse: "تهران ۱", onHand: 8, reserved: 1 },
  { id: "i3", sku: "VC-MI-220", title: "جاروبرقی شیائومی", warehouse: "کرج", onHand: 0, reserved: 0 },
];

export const mockAdminSellers: AdminSeller[] = [
  { id: "sel1", name: "فروشگاه لوازم خانگی آریا", status: "approved", offers: 48, rating: 4.7 },
  { id: "sel2", name: "دیجیتال‌مارکت پارس", status: "pending", offers: 0, rating: 0 },
  { id: "sel3", name: "خانه مدرن", status: "suspended", offers: 12, rating: 3.9 },
];

export const mockAdminOffers: AdminOffer[] = [
  { id: "o1", seller: "آریا", product: "یخچال سامسونگ", price: 67900000, stock: 6, status: "active" },
  { id: "o2", seller: "خانه مدرن", product: "لباسشویی بوش", price: 42100000, stock: 3, status: "paused" },
  { id: "o3", seller: "آریا", product: "جاروبرقی شیائومی", price: 11900000, stock: 10, status: "active" },
];

export const mockAdminOrders: AdminOrder[] = [
  { id: "MP-10421", customer: "سارا محمدی", total: 68500000, status: "new", createdAt: "۱۴۰۴/۰۷/۱۲ ۱۲:۲۰" },
  { id: "MP-10418", customer: "علی رضایی", total: 12500000, status: "processing", createdAt: "۱۴۰۴/۰۷/۱۲ ۱۰:۰۵" },
  { id: "MP-10402", customer: "مریم احمدی", total: 42900000, status: "shipped", createdAt: "۱۴۰۴/۰۷/۱۱ ۱۸:۴۰" },
];

export const mockAdminCustomers: AdminCustomer[] = [
  { id: "cu1", name: "سارا محمدی", phone: "0912•••••••", orders: 6, status: "active" },
  { id: "cu2", name: "علی رضایی", phone: "0935•••••••", orders: 2, status: "active" },
  { id: "cu3", name: "کاربر مسدود", phone: "0901•••••••", orders: 1, status: "blocked" },
];

export const mockAdminPromotions: AdminPromotion[] = [
  { id: "pr1", title: "شگفت‌انگیز لوازم خانگی", type: "campaign", status: "active", endsAt: "۱۴۰۴/۰۷/۲۰" },
  { id: "pr2", title: "۱۰٪ خرید اول", type: "percent", status: "scheduled", endsAt: "۱۴۰۴/۰۸/۰۱" },
  { id: "pr3", title: "حراج تلویزیون", type: "fixed", status: "ended", endsAt: "۱۴۰۴/۰۶/۳۰" },
];

export const mockAdminCoupons: AdminCoupon[] = [
  { id: "cp1", code: "MIXPLUS10", discount: "۱۰٪", usage: 240, limit: 1000, status: "active" },
  { id: "cp2", code: "WELCOME50", discount: "۵۰٬۰۰۰ تومان", usage: 88, limit: 200, status: "active" },
  { id: "cp3", code: "OLDNOW", discount: "۱۵٪", usage: 500, limit: 500, status: "expired" },
];

export const mockAdminCms: AdminCmsItem[] = [
  { id: "cms1", title: "بنر اسلایدر اصلی ۱", kind: "banner", status: "published", updatedAt: "۱۴۰۴/۰۷/۱۰" },
  { id: "cms2", title: "راهنمای خرید یخچال", kind: "blog", status: "draft", updatedAt: "۱۴۰۴/۰۷/۰۹" },
  { id: "cms3", title: "صفحه درباره ما", kind: "page", status: "published", updatedAt: "۱۴۰۴/۰۶/۲۰" },
];

export const mockAdminReviews: AdminReview[] = [
  {
    id: "r1",
    product: "یخچال سامسونگ",
    customer: "سارا م.",
    rating: 5,
    status: "pending",
    excerpt: "خنک‌کنندگی عالی و صدای کم…",
  },
  {
    id: "r2",
    product: "لباسشویی بوش",
    customer: "علی ر.",
    rating: 4,
    status: "approved",
    excerpt: "شستشوی تمیز، نصب سریع بود.",
  },
  {
    id: "r3",
    product: "جاروبرقی شیائومی",
    customer: "ناشناس",
    rating: 2,
    status: "rejected",
    excerpt: "متن نامناسب (حذف شد).",
  },
];

export const mockAdminReports: AdminReportRow[] = [
  { id: "rp1", metric: "فروش ناخالص", period: "۷ روز", value: "۳٫۲ میلیارد", change: "+۸٪" },
  { id: "rp2", metric: "نرخ تبدیل", period: "۷ روز", value: "۲٫۴٪", change: "+۰٫۳" },
  { id: "rp3", metric: "میانگین ارزش سفارش", period: "۳۰ روز", value: "۱۸٫۶ میلیون", change: "-۲٪" },
  { id: "rp4", metric: "مشتریان جدید", period: "۳۰ روز", value: "۱٬۲۴۰", change: "+ ۱۱٪" },
];

export const mockAdminAuditLogs: AdminAuditLog[] = [
  { id: "a1", actor: "مدیر MixPlus", action: "ویرایش قیمت", entity: "محصول RF-SAM-001", at: "۱۴۰۴/۰۷/۱۲ ۱۴:۱۰" },
  { id: "a2", actor: "مدیر کاتالوگ", action: "انتشار", entity: "بنر اسلایدر ۱", at: "۱۴۰۴/۰۷/۱۲ ۱۱:۰۰" },
  { id: "a3", actor: "مدیر عملیات", action: "تأیید فروشنده", entity: "فروشگاه آریا", at: "۱۴۰۴/۰۷/۱۱ ۱۹:۲۵" },
];
