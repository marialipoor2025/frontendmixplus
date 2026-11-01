import { siteConfig } from "@/config/site";
import { mockMainNavData } from "@/lib/mocks/nav";
import type { MainNavData, MegaMenuCategory, MegaMenuColumn, MegaMenuLink } from "@/types/nav";
import { apiClient } from "./client";

type CategoryTreeNode = {
  id: string;
  title: string;
  slug: string;
  href: string;
  children?: CategoryTreeNode[];
};

function collectHrefs(nodes: CategoryTreeNode[], into = new Set<string>()) {
  for (const node of nodes) {
    if (node.href) into.add(normalizeHref(node.href));
    if (node.slug) into.add(normalizeHref(`/categories/${node.slug}`));
    if (node.slug) into.add(normalizeHref(`/category/${node.slug}`));
    if (node.children?.length) collectHrefs(node.children, into);
  }
  return into;
}

function normalizeHref(href: string) {
  return href.trim().replace(/\/+$/, "").toLowerCase();
}

function linkAllowed(link: MegaMenuLink, hrefs: Set<string>) {
  return hrefs.has(normalizeHref(link.href));
}

function filterCategory(
  cat: MegaMenuCategory,
  hrefs: Set<string>,
): MegaMenuCategory | null {
  const columns: MegaMenuColumn[] = cat.columns
    .map((col) => ({
      ...col,
      links: col.links.filter((l) => linkAllowed(l, hrefs)),
    }))
    .filter((col) => col.links.length > 0);

  const selfAllowed = hrefs.has(normalizeHref(cat.href));
  if (!selfAllowed && columns.length === 0) return null;

  return { ...cat, columns };
}

/**
 * Keep mega-menu entries that map to categories with published products.
 */
async function filterNavToProductCategories(
  nav: MainNavData,
): Promise<MainNavData> {
  try {
    const tree = await apiClient<CategoryTreeNode[]>(
      "/api/catalog/categories/tree",
      { query: { withProductsOnly: true } },
    );
    const hrefs = collectHrefs(tree ?? []);
    if (hrefs.size === 0) return nav;

    const categories = nav.categories
      .map((c) => filterCategory(c, hrefs))
      .filter((c): c is MegaMenuCategory => c != null);

    return { ...nav, categories: categories.length > 0 ? categories : nav.categories };
  } catch {
    return nav;
  }
}

export async function getMainNavData(): Promise<MainNavData> {
  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) {
    return mockMainNavData;
  }

  const nav = await apiClient<MainNavData>("/api/nav");
  return filterNavToProductCategories(nav);
}
