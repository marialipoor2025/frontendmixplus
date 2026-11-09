import type { CatalogCategoryOption } from "@/lib/api/catalog-lookups";

type Node = { name: string; slug: string; children?: Node[] };

/**
 * Digikala-like category tree for create modal when catalog API is empty/thin.
 * Includes the live path: لوازم خانگی برقی → لوازم توکار → هود|گاز|فر|کشوی گرمکن
 */
const TREE: Node[] = [
  { name: "مادر و کودک", slug: "mother-child", children: [{ name: "لوازم شخصی", slug: "personal" }] },
  { name: "سلامت و پزشکی", slug: "health", children: [{ name: "تجهیزات پزشکی", slug: "med-eq" }] },
  { name: "آرایشی و بهداشتی", slug: "beauty", children: [{ name: "آرایش صورت", slug: "makeup" }] },
  { name: "ورزش و سفر", slug: "sport", children: [{ name: "لوازم ورزشی", slug: "sport-gear" }] },
  { name: "ابزار آلات و تجهیزات", slug: "tools", children: [{ name: "ابزار برقی", slug: "power-tools" }] },
  { name: "عمومی", slug: "general", children: [{ name: "متفرقه", slug: "misc" }] },
  { name: "خودرو و موتورسیکلت", slug: "auto", children: [{ name: "لوازم جانبی خودرو", slug: "auto-acc" }] },
  { name: "محصولات بومی و محلی", slug: "local", children: [{ name: "صنایع دستی", slug: "craft" }] },
  {
    name: "موبایل",
    slug: "mobile",
    children: [
      { name: "گوشی موبایل", slug: "phone" },
      { name: "قطعات جانبی موبایل و تبلت و هدفون", slug: "mobile-acc" },
      { name: "شارژر تبلت و موبایل", slug: "charger" },
    ],
  },
  { name: "اسباب بازی", slug: "toys", children: [{ name: "فکری و آموزشی", slug: "edu-toys" }] },
  {
    name: "کالای دیجیتال",
    slug: "digital",
    children: [
      { name: "لپ تاپ", slug: "laptop" },
      { name: "کامپیوتر و تجهیزات جانبی", slug: "pc" },
    ],
  },
  { name: "طلا و نقره", slug: "gold", children: [{ name: "زیورآلات طلا", slug: "gold-jewelry" }] },
  { name: "مد و پوشاک", slug: "fashion", children: [{ name: "لباس مردانه", slug: "men-wear" }] },
  {
    name: "خانه و آشپزخانه",
    slug: "home",
    children: [
      { name: "آشپزخانه", slug: "kitchen" },
      { name: "دکوراسیون", slug: "decor" },
    ],
  },
  { name: "کالاهای سوپرمارکتی", slug: "supermarket", children: [{ name: "نوشیدنی", slug: "drink" }] },
  {
    name: "کتاب، لوازم تحریر و هنر",
    slug: "book",
    children: [{ name: "کتاب چاپی", slug: "print-book" }],
  },
  { name: "پت شاپ", slug: "pet", children: [{ name: "غذای حیوانات", slug: "pet-food" }] },
  {
    name: "لوازم خانگی برقی",
    slug: "appliance",
    children: [
      {
        name: "لوازم توکار",
        slug: "built-in",
        children: [
          { name: "هود", slug: "hood" },
          { name: "گاز صفحه ای", slug: "cooktop" },
          { name: "فر", slug: "oven" },
          { name: "کشوی گرمکن", slug: "warming-drawer" },
        ],
      },
      {
        name: "یخچال و فریزر",
        slug: "fridge",
        children: [
          { name: "یخچال و فریزر", slug: "fridge-freezer" },
          { name: "فریزر", slug: "freezer" },
        ],
      },
      {
        name: "ماشین لباسشویی و خشک‌کن",
        slug: "washer",
        children: [
          { name: "ماشین لباسشویی", slug: "washing-machine" },
          { name: "خشک‌کن", slug: "dryer" },
        ],
      },
    ],
  },
];

function flatten(
  nodes: Node[],
  parentId: string | null,
  prefix: string,
  out: CatalogCategoryOption[],
) {
  for (const n of nodes) {
    const id = parentId ? `${parentId}__${n.slug}` : `dk-${n.slug}`;
    out.push({
      id,
      name: n.name,
      slug: `${prefix}${n.slug}`,
      parentId,
    });
    if (n.children?.length) {
      flatten(n.children, id, `${prefix}${n.slug}-`, out);
    }
  }
}

export function digiFallbackCategories(): CatalogCategoryOption[] {
  const out: CatalogCategoryOption[] = [];
  flatten(TREE, null, "", out);
  return out;
}

/** Sample «نوع کالا» options keyed by leaf category name. */
export function digiProductTypesForCategory(leafName: string): string[] {
  const map: Record<string, string[]> = {
    هود: ["هود شومینه‌ای", "هود مخفی", "هود جزیره‌ای", "هود مورب"],
    "گاز صفحه ای": ["گاز رومیزی ۴ شعله", "گاز رومیزی ۵ شعله", "گاز شیشه‌ای"],
    فر: ["فر برقی", "فر گازی", "فر توکار"],
    "کشوی گرمکن": ["کشوی گرمکن توکار"],
    "گوشی موبایل": ["گوشی هوشمند", "گوشی دکمه‌ای"],
  };
  return map[leafName] ?? ["استاندارد", "حرفه‌ای", "اقتصادی"];
}

export function digiDivisionOptions(): string[] {
  return ["خانگی", "تجاری", "صنعتی"];
}

export function digiMefaOptions(): string[] {
  return [
    "شناسه عمومی پیش‌فرض",
    "لوازم خانگی برقی — عمومی",
    "کالای دیجیتال — عمومی",
  ];
}
