import { siteConfig } from "@/config/site";
import type { MainNavData, MegaMenuLink } from "@/types/nav";
import type { BreadcrumbItem } from "@/types/product-detail";

export type ResolvedCategory = {
  href: string;
  title: string;
  breadcrumb: BreadcrumbItem[];
  /** Mega-menu parent that owns this path (if any). */
  megaTitle?: string;
};

function flattenLinks(nav: MainNavData): MegaMenuLink[] {
  return nav.categories.flatMap((cat) =>
    cat.columns.flatMap((col) => col.links),
  );
}

function titleFromSlug(segment: string) {
  return segment.replace(/-/g, " ");
}

/**
 * Resolve a `/categories/...` path against mega-menu links for title + breadcrumb.
 */
export function resolveCategoryPath(
  slugParts: string[],
  nav: MainNavData,
): ResolvedCategory {
  const href = `/categories/${slugParts.join("/")}`;
  const links = flattenLinks(nav);
  const byHref = new Map(links.map((l) => [l.href.replace(/\/$/, ""), l]));

  const matched = byHref.get(href);
  const mega = nav.categories.find((cat) =>
    cat.columns.some((col) =>
      col.links.some((l) => l.href.replace(/\/$/, "") === href || href.startsWith(`${l.href.replace(/\/$/, "")}/`)),
    ),
  );

  const breadcrumb: BreadcrumbItem[] = [
    { id: "home", title: siteConfig.nameFa, href: "/" },
  ];

  if (mega) {
    breadcrumb.push({
      id: mega.id,
      title: mega.title,
      href: mega.href,
    });
  }

  // Progressive crumbs for each path segment that maps to a known nav link.
  let built = "/categories";
  slugParts.forEach((part, index) => {
    built += `/${part}`;
    const link = byHref.get(built);
    const isLast = index === slugParts.length - 1;
    breadcrumb.push({
      id: `seg-${part}`,
      title: link?.title ?? (isLast && matched ? matched.title : titleFromSlug(part)),
      href: built,
    });
  });

  // Deduplicate consecutive same hrefs (e.g. mega href equals first segment).
  const deduped: BreadcrumbItem[] = [];
  for (const item of breadcrumb) {
    const prev = deduped[deduped.length - 1];
    if (prev && prev.href.replace(/\/$/, "") === item.href.replace(/\/$/, "")) {
      deduped[deduped.length - 1] = item;
      continue;
    }
    deduped.push(item);
  }

  return {
    href,
    title: matched?.title ?? deduped[deduped.length - 1]?.title ?? titleFromSlug(slugParts.at(-1) ?? "category"),
    breadcrumb: deduped,
    megaTitle: mega?.title,
  };
}
