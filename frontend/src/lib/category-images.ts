import type { HomeCategory } from "@/types/home";

/** Map category href → image for mobile category browser. */
export function buildCategoryImageMap(
  categories: readonly HomeCategory[] | undefined,
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const cat of categories ?? []) {
    if (cat.href && cat.imageUrl) {
      map[cat.href] = cat.imageUrl;
    }
  }
  return map;
}
