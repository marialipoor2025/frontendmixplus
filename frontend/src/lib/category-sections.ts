import type { MegaMenuCategory, MegaMenuLink } from "@/types/nav";

export type CategorySection = {
  parent: MegaMenuLink;
  leaves: MegaMenuLink[];
};

/** Group flat parent/leaf mega-menu links into accordion sections. */
export function groupCategorySections(
  category: MegaMenuCategory,
): CategorySection[] {
  const links = category.columns.flatMap((col) => col.links);
  const sections: CategorySection[] = [];
  let current: CategorySection | null = null;

  for (const link of links) {
    if (link.kind === "parent") {
      current = { parent: link, leaves: [] };
      sections.push(current);
    } else if (current) {
      current.leaves.push(link);
    } else {
      // Orphan leaf — treat as its own parent row
      sections.push({ parent: { ...link, kind: "parent" }, leaves: [] });
    }
  }

  return sections;
}
