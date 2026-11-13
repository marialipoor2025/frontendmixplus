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

export type CategoryTitleLookup = {
  /** slug → Persian (or display) title */
  bySlug: Map<string, string>;
  /** normalized href → title */
  byHref: Map<string, string>;
};

type NavTitleEntry = {
  id: string;
  title: string;
  href: string;
};

function normalizeHref(href: string) {
  return href.trim().replace(/\/+$/, "") || "/";
}

function flattenLinks(nav: MainNavData): MegaMenuLink[] {
  return nav.categories.flatMap((cat) =>
    cat.columns.flatMap((col) => col.links),
  );
}

function buildNavTitleIndex(nav: MainNavData): Map<string, NavTitleEntry> {
  const byHref = new Map<string, NavTitleEntry>();

  for (const cat of nav.categories) {
    byHref.set(normalizeHref(cat.href), {
      id: cat.id,
      title: cat.title,
      href: cat.href,
    });
  }

  for (const link of flattenLinks(nav)) {
    byHref.set(normalizeHref(link.href), {
      id: link.id,
      title: link.title,
      href: link.href,
    });
  }

  return byHref;
}

function resolveSegmentTitle(
  part: string,
  builtHref: string,
  navByHref: Map<string, NavTitleEntry>,
  titles?: CategoryTitleLookup,
): string | undefined {
  const fromNav = navByHref.get(builtHref)?.title?.trim();
  if (fromNav) return fromNav;

  const fromHref = titles?.byHref.get(builtHref)?.trim();
  if (fromHref) return fromHref;

  const fromSlug = titles?.bySlug.get(part.toLowerCase())?.trim();
  if (fromSlug) return fromSlug;

  return undefined;
}

/**
 * Resolve a `/categories/...` path against mega-menu + catalog titles for breadcrumb.
 * Prefers Persian titles from nav / catalog; never falls back to English slug text.
 */
export function resolveCategoryPath(
  slugParts: string[],
  nav: MainNavData,
  titles?: CategoryTitleLookup,
): ResolvedCategory {
  const href = `/categories/${slugParts.join("/")}`;
  const navByHref = buildNavTitleIndex(nav);
  const matched = navByHref.get(normalizeHref(href));

  const mega = nav.categories.find((cat) => {
    const catHref = normalizeHref(cat.href);
    if (catHref === normalizeHref(href) || href.startsWith(`${catHref}/`)) {
      return true;
    }
    return cat.columns.some((col) =>
      col.links.some((l) => {
        const linkHref = normalizeHref(l.href);
        return linkHref === normalizeHref(href) || href.startsWith(`${linkHref}/`);
      }),
    );
  });

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

  let built = "/categories";
  slugParts.forEach((part, index) => {
    built += `/${part}`;
    const title =
      resolveSegmentTitle(part, built, navByHref, titles) ??
      (index === slugParts.length - 1 ? matched?.title : undefined) ??
      part;

    breadcrumb.push({
      id: `seg-${part}`,
      title,
      href: built,
    });
  });

  // Deduplicate consecutive same hrefs (e.g. mega href equals first segment).
  const deduped: BreadcrumbItem[] = [];
  for (const item of breadcrumb) {
    const prev = deduped[deduped.length - 1];
    if (prev && normalizeHref(prev.href) === normalizeHref(item.href)) {
      // Prefer the entry that has a non-slug-looking title when replacing.
      deduped[deduped.length - 1] = item;
      continue;
    }
    deduped.push(item);
  }

  const lastTitle = deduped[deduped.length - 1]?.title;
  const pageTitle =
    matched?.title ??
    resolveSegmentTitle(
      slugParts.at(-1) ?? "",
      href,
      navByHref,
      titles,
    ) ??
    lastTitle ??
    slugParts.at(-1) ??
    "دسته‌بندی";

  return {
    href,
    title: pageTitle,
    breadcrumb: deduped,
    megaTitle: mega?.title,
  };
}
