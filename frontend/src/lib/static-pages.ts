export type StaticPageDef = {
  title: string;
  description: string;
};

/** Footer and related informational destinations (frontend shells). */
export const STATIC_PAGES: Record<string, StaticPageDef> = {
  about: {
    title: "درباره میکپلاس",
    description:
      "میکپلاس فروشگاه آنلاین لوازم خانگی است؛ این صفحه معرفی برند و مأموریت ماست.",
  },
  faq: {
    title: "پرسش‌های متداول",
    description: "پاسخ سوالات پرتکرار درباره سفارش، ارسال و خدمات پس از فروش.",
  },
  "faq/returns": {
    title: "رویه‌های بازگرداندن کالا",
    description: "شرایط مرجوعی و تعویض کالا را در این صفحه مطالعه کنید.",
  },
  "faq/how-to-order": {
    title: "نحوه ثبت سفارش",
    description: "مراحل خرید از انتخاب کالا تا پرداخت را اینجا ببینید.",
  },
  "faq/shipping": {
    title: "رویه ارسال سفارش",
    description: "شیوه‌ها و زمان‌بندی ارسال سفارش‌های میکپلاس.",
  },
  "faq/payment": {
    title: "شیوه‌های پرداخت",
    description: "روش‌های پرداخت آنلاین و کیف پول در میکپلاس.",
  },
  newsroom: {
    title: "اتاق خبر میکپلاس",
    description: "اخبار و اطلاعیه‌های رسمی میکپلاس.",
  },
  seller: {
    title: "فروش در میکپلاس",
    description: "شرایط همکاری فروشندگان و پیوستن به مارکت‌پلیس.",
  },
  careers: {
    title: "فرصت‌های شغلی",
    description: "موقعیت‌های شغلی و همکاری با تیم میکپلاس.",
  },
  report: {
    title: "گزارش تخلف در میکپلاس",
    description: "گزارش موارد مشکوک یا تخلف را از این مسیر ارسال کنید.",
  },
  "page/contact-us": {
    title: "تماس با میکپلاس",
    description: "راه‌های ارتباط با پشتیبانی و واحدهای مرتبط.",
  },
  "page/terms": {
    title: "شرایط استفاده",
    description: "قوانین و شرایط استفاده از خدمات میکپلاس.",
  },
  "page/privacy": {
    title: "حریم خصوصی",
    description: "نحوه جمع‌آوری و استفاده از اطلاعات کاربران.",
  },
  "page/bug-report": {
    title: "گزارش باگ",
    description: "اشکالات فنی سایت را گزارش دهید تا سریع‌تر رفع شوند.",
  },
  blog: {
    title: "بلاگ میکپلاس",
    description: "راهنمای خرید، مقایسه و مقالات لوازم خانگی.",
  },
};
