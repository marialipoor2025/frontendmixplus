import type {
  ProductSkuVariant,
  ProductVariantInfoData,
  ProductVariantOptionGroup,
} from "@/types/product-detail";

/** Normalize legacy color-only mocks into option groups. */
export function resolveOptionGroups(
  data: ProductVariantInfoData,
): ProductVariantOptionGroup[] {
  if (data.optionGroups.length > 0) return data.optionGroups;

  if (data.colors?.length) {
    return [
      {
        id: "color",
        code: "color",
        name: "رنگ",
        ui: "swatch",
        values: data.colors.map((c) => ({
          id: c.id,
          label: c.name,
          swatchHex: c.hex,
          available: true,
        })),
      },
    ];
  }

  return [];
}

export function resolveSelectedOptionValueIds(
  data: ProductVariantInfoData,
  groups: ProductVariantOptionGroup[],
): Record<string, string> {
  if (Object.keys(data.selectedOptionValueIds).length > 0) {
    return { ...data.selectedOptionValueIds };
  }

  const selected: Record<string, string> = {};
  for (const group of groups) {
    const preferred =
      group.code === "color" && data.selectedColorId
        ? data.selectedColorId
        : group.values.find((v) => v.available)?.id ?? group.values[0]?.id;
    if (preferred) selected[group.id] = preferred;
  }
  return selected;
}

export function findSkuForSelection(
  skus: ProductSkuVariant[],
  selected: Record<string, string>,
): ProductSkuVariant | undefined {
  const selectedIds = Object.values(selected);
  if (!selectedIds.length) return skus[0];

  return (
    skus.find((sku) =>
      selectedIds.every((id) => sku.optionValueIds.includes(id)),
    ) ?? skus.find((sku) => sku.inStock) ?? skus[0]
  );
}

/** Whether a value stays choosable given other selected options. */
export function isOptionValueAvailable(
  skus: ProductSkuVariant[],
  groupId: string,
  valueId: string,
  selected: Record<string, string>,
): boolean {
  const next = { ...selected, [groupId]: valueId };
  const required = Object.values(next);
  return skus.some(
    (sku) =>
      sku.inStock && required.every((id) => sku.optionValueIds.includes(id)),
  );
}
