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

const BY_LEAF: Record<string, DigiAttrField[]> = {
  هود: HOOD_FIELDS,
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
