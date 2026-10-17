import type {
  ProductSkuVariant,
  ProductVariantOptionGroup,
} from "@/types/product-detail";

function uid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export type VariantGroupTemplate = {
  id: string;
  label: string;
  code: string;
  name: string;
  ui: "swatch" | "chip";
  /** Digikala-style starter values (e.g. oven colors). */
  values: { label: string; swatchHex?: string }[];
};

/** Common PDP option patterns — sellers pick what fits the product. */
export const VARIANT_GROUP_TEMPLATES: VariantGroupTemplate[] = [
  {
    id: "color",
    label: "رنگ",
    code: "color",
    name: "رنگ",
    ui: "swatch",
    values: [
      { label: "مشکی", swatchHex: "#111111" },
      { label: "مشکی استیل", swatchHex: "#3a3a3a" },
      { label: "سفید", swatchHex: "#f5f5f5" },
    ],
  },
  {
    id: "capacity",
    label: "ظرفیت",
    code: "capacity",
    name: "ظرفیت",
    ui: "chip",
    values: [
      { label: "۶۰ لیتر" },
      { label: "۶۵ لیتر" },
      { label: "۷۰ لیتر" },
    ],
  },
  {
    id: "size",
    label: "ابعاد / سایز",
    code: "size",
    name: "سایز",
    ui: "chip",
    values: [{ label: "۶۰×۶۰" }, { label: "۹۰ سانتی" }],
  },
  {
    id: "warranty",
    label: "گارانتی",
    code: "warranty",
    name: "گارانتی",
    ui: "chip",
    values: [{ label: "۱۸ ماهه" }, { label: "۲۴ ماهه" }],
  },
  {
    id: "custom",
    label: "گروه سفارشی",
    code: "custom",
    name: "گزینه",
    ui: "chip",
    values: [{ label: "گزینه ۱" }, { label: "گزینه ۲" }],
  },
];

export function createGroupFromTemplate(
  template: VariantGroupTemplate,
): ProductVariantOptionGroup {
  return {
    id: uid(),
    code: template.code,
    name: template.name,
    ui: template.ui,
    values: template.values.map((v) => ({
      id: uid(),
      label: v.label,
      available: true,
      swatchHex: v.swatchHex,
    })),
  };
}

export function createEmptyValue(ui: "swatch" | "chip") {
  return {
    id: uid(),
    label: "گزینه جدید",
    available: true as const,
    swatchHex: ui === "swatch" ? "#cccccc" : undefined,
  };
}

function slugPart(label: string) {
  return label
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u0600-\u06FF-]+/g, "")
    .toLowerCase()
    .slice(0, 40);
}

/** Full cartesian product across all option groups (any count). */
export function cartesianSkus(
  groups: ProductVariantOptionGroup[],
  opts: {
    slugBase: string;
    defaultPrice: number;
    defaultOriginalPrice?: number | null;
    defaultDiscountPercent?: number | null;
    previous?: ProductSkuVariant[];
  },
): ProductSkuVariant[] {
  const activeGroups = groups.filter((g) => g.values.length > 0);
  if (activeGroups.length === 0) return [];

  const prevByKey = new Map<string, ProductSkuVariant>();
  for (const sku of opts.previous ?? []) {
    const key = [...sku.optionValueIds].sort().join("|");
    prevByKey.set(key, sku);
  }

  type Comb = { valueIds: string[]; labels: string[] };
  let combos: Comb[] = [{ valueIds: [], labels: [] }];

  for (const group of activeGroups) {
    const next: Comb[] = [];
    for (const combo of combos) {
      for (const value of group.values) {
        next.push({
          valueIds: [...combo.valueIds, value.id],
          labels: [...combo.labels, value.label],
        });
      }
    }
    combos = next;
  }

  const base = opts.slugBase || "sku";
  return combos.map((combo) => {
    const key = [...combo.valueIds].sort().join("|");
    const prev = prevByKey.get(key);
    const skuCode = `${base}-${combo.labels.map(slugPart).join("-")}`
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    return {
      id: prev?.id ?? uid(),
      sku: prev?.sku || skuCode || uid(),
      optionValueIds: combo.valueIds,
      price: prev?.price ?? opts.defaultPrice ?? 0,
      originalPrice: prev?.originalPrice ?? opts.defaultOriginalPrice ?? undefined,
      discountPercent:
        prev?.discountPercent ?? opts.defaultDiscountPercent ?? undefined,
      inStock: prev?.inStock ?? true,
    };
  });
}

export function skuLabel(
  sku: ProductSkuVariant,
  groups: ProductVariantOptionGroup[],
): string {
  const labels = sku.optionValueIds.map((id) => {
    for (const g of groups) {
      const v = g.values.find((x) => x.id === id);
      if (v) return v.label;
    }
    return "?";
  });
  return labels.join(" × ");
}
