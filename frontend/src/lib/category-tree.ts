import type { CatalogCategoryOption } from "@/lib/api/catalog-lookups";

export type CategoryTreeNode = CatalogCategoryOption & {
  children: CategoryTreeNode[];
};

/** Build unlimited-depth tree from flat parentId links (external keys). */
export function buildCategoryTree(
  rows: CatalogCategoryOption[],
): CategoryTreeNode[] {
  const map = new Map<string, CategoryTreeNode>();
  for (const r of rows) {
    map.set(r.id, { ...r, children: [] });
  }

  const roots: CategoryTreeNode[] = [];
  for (const node of map.values()) {
    const parentId = node.parentId;
    if (parentId && map.has(parentId)) {
      map.get(parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortRec = (nodes: CategoryTreeNode[]) => {
    nodes.sort((a, b) => a.name.localeCompare(b.name, "fa"));
    for (const n of nodes) sortRec(n.children);
  };
  sortRec(roots);
  return roots;
}

/** Ancestors from root → node (inclusive), walking parent links. */
export function pathToCategory(
  rows: CatalogCategoryOption[],
  categoryId: string,
): CatalogCategoryOption[] {
  const byId = new Map(rows.map((r) => [r.id, r]));
  const path: CatalogCategoryOption[] = [];
  let current: CatalogCategoryOption | undefined = byId.get(categoryId);
  const guard = new Set<string>();
  while (current && !guard.has(current.id)) {
    guard.add(current.id);
    path.unshift(current);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }
  return path;
}

/** Children of parentId (null/undefined = roots). */
export function childrenOf(
  rows: CatalogCategoryOption[],
  parentId: string | null | undefined,
): CatalogCategoryOption[] {
  return rows
    .filter((r) =>
      parentId
        ? r.parentId === parentId
        : !r.parentId || r.parentId === "",
    )
    .sort((a, b) => a.name.localeCompare(b.name, "fa"));
}

/** Indented labels for admin parent &lt;select&gt; (unlimited depth). */
export function flatCategoryOptionsWithDepth(
  rows: CatalogCategoryOption[],
): { id: string; label: string; depth: number }[] {
  const tree = buildCategoryTree(rows);
  const out: { id: string; label: string; depth: number }[] = [];
  const walk = (nodes: CategoryTreeNode[], depth: number) => {
    for (const n of nodes) {
      const pad = "— ".repeat(depth);
      out.push({ id: n.id, label: `${pad}${n.name}`, depth });
      walk(n.children, depth + 1);
    }
  };
  walk(tree, 0);
  return out;
}
