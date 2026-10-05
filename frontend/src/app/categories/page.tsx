import { MobileCategoryBrowser } from "@/components/categories/MobileCategoryBrowser";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { StickyHeaderShell } from "@/components/layout/StickyHeaderShell";
import { getHomePageData } from "@/lib/api/home";
import { getMainNavData } from "@/lib/api/nav";
import { buildCategoryImageMap } from "@/lib/category-images";

export const metadata = {
  title: "دسته‌بندی کالاها",
};

/**
 * Mobile categories screen (Digikala-style two-pane).
 * Scoped to MixPlus household appliances only.
 */
export default async function CategoriesPage() {
  const [nav, home] = await Promise.all([
    getMainNavData(),
    getHomePageData().catch(() => null),
  ]);
  const imageByHref = buildCategoryImageMap(home?.categories);

  return (
    <>
      <StickyHeaderShell>
        <SiteHeader />
      </StickyHeaderShell>
      <main className="flex min-h-0 flex-1 flex-col bg-[var(--color-neutral-000)]">
        <MobileCategoryBrowser
          categories={nav.categories}
          imageByHref={imageByHref}
        />
      </main>
    </>
  );
}
