import { siteConfig } from "@/config/site";
import { mockMainNavData } from "@/lib/mocks/nav";
import type {
  MainNavData,
  MegaMenuCategory,
  MegaMenuColumn,
  MegaMenuLink,
} from "@/types/nav";
import { apiClient } from "./client";

type CategoryTreeNode = {
  id: string;
  title: string;
  slug: string;
  href: string;
  children?: CategoryTreeNode[];
};

function normalizeHref(href: string) {
  return href.trim().replace(/\/+$/, "").toLowerCase();
}

function collectHrefs(nodes: CategoryTreeNode[], into = new Set<string>()) {
  for (const node of nodes) {
    if (node.href) into.add(normalizeHref(node.href));
    if (node.slug) into.add(normalizeHref(`/categories/${node.slug}`));
    if (node.slug) into.add(normalizeHref(`/category/${node.slug}`));
    if (node.children?.length) collectHrefs(node.children, into);
  }
  return into;
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

function treeDepth(nodes: CategoryTreeNode[], depth = 1): number {
  let max = depth;
  for (const node of nodes) {
    if (node.children?.length) {
      max = Math.max(max, treeDepth(node.children, depth + 1));
    }
  }
  return max;
}

/** Digikala-style mega menu: L1 → columns of L2 parents + L3 leaves. */
function megaFromTree(tree: CategoryTreeNode[]): MegaMenuCategory[] {
  return tree.map((l1) => {
    const l2 = l1.children ?? [];
    const columns: MegaMenuColumn[] =
      l2.length > 0
        ? l2.map((mid) => {
            const leaves = mid.children ?? [];
            const links: MegaMenuLink[] = [
              {
                id: `parent-${mid.id}`,
                title: mid.title,
                href: mid.href || `/categories/${mid.slug}`,
                kind: "parent",
              },
              ...leaves.map((leaf) => ({
                id: leaf.id,
                title: leaf.title,
                href: leaf.href || `/categories/${leaf.slug}`,
                kind: "leaf" as const,
              })),
            ];
            return {
              id: `col-${mid.id}`,
              links,
            };
          })
        : [
            {
              id: `col-${l1.id}`,
              links: [
                {
                  id: l1.id,
                  title: l1.title,
                  href: l1.href || `/categories/${l1.slug}`,
                  kind: "leaf" as const,
                },
              ],
            },
          ];

    return {
      id: l1.id,
      title: l1.title,
      href: l1.href || `/categories/${l1.slug}`,
      icon: "appliance",
      allProductsLabel: `همه کالاهای ${l1.title}`,
      columns,
    } satisfies MegaMenuCategory;
  });
}

/**
 * Prefer nested catalog tree for Digikala-like menus; otherwise filter seeded nav.
 */
async function resolveNavCategories(nav: MainNavData): Promise<MainNavData> {
  try {
    const tree = await apiClient<CategoryTreeNode[]>(
      "/api/catalog/categories/tree",
      { query: { withProductsOnly: true } },
    );
    if ((tree?.length ?? 0) > 0 && treeDepth(tree) >= 2) {
      return { ...nav, categories: megaFromTree(tree) };
    }

    const hrefs = collectHrefs(tree ?? []);
    if (hrefs.size === 0) return nav;

    const categories = nav.categories
      .map((c) => filterCategory(c, hrefs))
      .filter((c): c is MegaMenuCategory => c != null);

    return {
      ...nav,
      categories: categories.length > 0 ? categories : nav.categories,
    };
  } catch {
    return nav;
  }
}

export async function getMainNavData(): Promise<MainNavData> {
  if (siteConfig.useMocks || !siteConfig.apiBaseUrl) {
    return mockMainNavData;
  }

  const nav = await apiClient<MainNavData>("/api/nav");
  return resolveNavCategories(nav);
}
