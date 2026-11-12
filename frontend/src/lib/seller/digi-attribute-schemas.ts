export type DigiAttrKind = "text" | "select" | "multiselect";

export type DigiAttrField = {
  id: string;
  label: string;
  kind: DigiAttrKind;
  unit?: string;
  helper?: string;
  required?: boolean;
  options?: string[];
};

/** Digikala ProductCreation step 3 attribute schemas by leaf category. */
const HOOD_FIELDS: DigiAttrField[] = [
  {
    id: "_484",
    label: "تعداد لامپ",
    kind: "text",
    unit: "عدد",
    required: true,
  },
  { id: "_4799", label: "حجم مکش", kind: "text", required: true },
  { id: "_4802", label: "عرض هود", kind: "text", required: true },
  {
    id: "_4920",
    label: "اقلام همراه",
    kind: "multiselect",
    required: true,
    options: [
      "دفترچه راهنما",
      "پیچ و رولپلاک",
      "فیلتر آلومینیومی",
      "لوله خرطومی",
      "بدون اقلام همراه",
    ],
  },
  {
    id: "_5070",
    label: "جنس بدنه",
    kind: "select",
    required: true,
    options: ["استیل", "شیشه", "فلز", "ترکیبی"],
  },
  {
    id: "_5282",
    label: "نوع کلید",
    kind: "select",
    required: true,
    options: ["لمسی", "مکانیکی", "الکترونیکی"],
  },
  {
    id: "_5587",
    label: "تعداد موتور",
    kind: "select",
    required: true,
    options: ["۱", "۲", "۳"],
  },
  {
    id: "_5591",
    label: "محدوده سایز",
    kind: "select",
    required: true,
    options: ["۶۰ سانتی‌متر", "۹۰ سانتی‌متر", "۱۲۰ سانتی‌متر", "سایر"],
  },
  {
    id: "_8435",
    label: "نوع هود",
    kind: "multiselect",
    required: true,
    options: ["شومینه‌ای", "مخفی", "جزیره‌ای", "مورب", "تخت"],
  },
  { id: "_9921", label: "طول هود", kind: "text", required: true },
  {
    id: "_11246",
    label: "برند روی بسته‌بندی",
    kind: "text",
    required: true,
    helper:
      "در صورتی که کالای شما برند دارد و اصل است اما در فیلد برند یا نام سازنده کالا ثبت نشده، در این فیلد برند را به صورت فارسی وارد نمایید.",
  },
  {
    id: "_13453",
    label: "نوع خروج هوای هود",
    kind: "select",
    required: true,
    options: ["خروجی از بالا", "خروجی از پشت", "تصفیه بدون خروجی", "دو حالته"],
  },
];

const DEFAULT_FIELDS: DigiAttrField[] = [
  { id: "color", label: "رنگ", kind: "text", required: true },
  {
    id: "material",
    label: "جنس",
    kind: "select",
    required: true,
    options: ["فلز", "پلاستیک", "چوب", "شیشه", "سایر"],
  },
  { id: "weight", label: "وزن", kind: "text", unit: "گرم", required: false },
  { id: "warranty", label: "گارانتی", kind: "text", required: false },
];

/** Reverse-engineered from Digikala create + DKP-22846237 (category 5808 مایکروویو، مایکروفر). */
const MICROWAVE_FIELDS: DigiAttrField[] = [
  {
    id: "mw_type",
    label: "نوع مایکروویو، مایکروفر",
    kind: "multiselect",
    required: true,
    options: [
      "سولاردام",
      "مایکروویو",
      "مایکروویو توکار",
      "همراه با کانوکشن",
      "همراه با گریل",
    ],
  },
  { id: "mw_width", label: "پهنا", kind: "text", unit: "میلی‌متر", required: true },
  { id: "mw_depth", label: "عمق", kind: "text", unit: "میلی‌متر", required: true },
  { id: "mw_height", label: "ارتفاع", kind: "text", unit: "میلی‌متر", required: true },
  { id: "mw_weight", label: "وزن", kind: "text", unit: "کیلوگرم", required: true },
  {
    id: "mw_features",
    label: "امکانات و قابلیت‌های مایکروویو/مایکروفر",
    kind: "multiselect",
    required: true,
    options: ["تنظیم میزان حرارت", "تایمر", "چرخش سینی", "قفل کودک", "یخ‌زدایی"],
  },
  {
    id: "mw_door",
    label: "جهت باز شدن در",
    kind: "select",
    required: true,
    options: ["به سمت پایین", "به سمت چپ", "به سمت راست"],
  },
  { id: "mw_capacity", label: "ظرفیت", kind: "text", unit: "لیتر", required: true },
  {
    id: "mw_cooking",
    label: "امکانات آماده سازی غذا",
    kind: "multiselect",
    required: true,
    options: ["گریل", "برنامه پخت", "پخت ترکیبی", "کانوکشن", "بخار"],
  },
  {
    id: "mw_programs",
    label: "تعداد برنامه مایکروویو",
    kind: "text",
    unit: "عدد",
    required: true,
  },
  {
    id: "mw_power",
    label: "توان مصرفی مایکروویو",
    kind: "text",
    unit: "وات",
    required: true,
  },
  {
    id: "mw_display",
    label: "توضیحات صفحه نمایش",
    kind: "text",
    required: false,
  },
  {
    id: "mw_safety",
    label: "سیستم ایمنی",
    kind: "multiselect",
    required: false,
    options: ["سیستم خاموشی خودکار", "قفل کودک", "هشدار دما"],
  },
  {
    id: "mw_sku",
    label: "شناسه کالا",
    kind: "text",
    required: true,
    helper: "در این گروه کالایی شناسه کالا اجباری است و کالای غیر اصل مجاز نیست.",
  },
  {
    id: "_11246",
    label: "برند روی بسته‌بندی",
    kind: "text",
    required: false,
  },
];

const BY_LEAF: Record<string, DigiAttrField[]> = {
  هود: HOOD_FIELDS,
  "مایکروویو، مایکروفر": MICROWAVE_FIELDS,
  مایکروویو: MICROWAVE_FIELDS,
  مایکروفر: MICROWAVE_FIELDS,
  "گاز صفحه ای": [
    {
      id: "burners",
      label: "تعداد شعله",
      kind: "select",
      required: true,
      options: ["۳", "۴", "۵", "۶"],
    },
    {
      id: "ignition",
      label: "نوع فندک",
      kind: "select",
      required: true,
      options: ["اتوماتیک", "دستی"],
    },
    {
      id: "surface",
      label: "جنس صفحه",
      kind: "select",
      required: true,
      options: ["استیل", "شیشه", "لعاب"],
    },
    { id: "width", label: "عرض", kind: "text", unit: "سانتی‌متر", required: true },
  ],
  فر: [
    {
      id: "fuel",
      label: "نوع سوخت",
      kind: "select",
      required: true,
      options: ["برقی", "گازی", "ترکیبی"],
    },
    { id: "capacity", label: "حجم", kind: "text", unit: "لیتر", required: true },
    {
      id: "functions",
      label: "قابلیت‌ها",
      kind: "multiselect",
      required: true,
      options: ["گریل", "فن", "تایمر", "خودتمیزشونده"],
    },
  ],
};

export function digiAttrFieldsForCategory(leafName: string): DigiAttrField[] {
  return BY_LEAF[leafName.trim()] ?? DEFAULT_FIELDS;
}
