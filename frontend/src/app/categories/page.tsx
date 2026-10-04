import { MobileCategoryBrowser } from "@/components/categories/MobileCategoryBrowser";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { StickyHeaderShell } from "@/components/layout/StickyHeaderShell";
import { getMainNavData } from "@/lib/api/nav";
import { mockHomePageData } from "@/lib/mocks/home";

export const metadata = {
  title: "دسته‌بندی کالاها",
};

function buildImageMap() {
  const map: Record<string, string> = {};
  for (const cat of mockHomePageData.categories) {
    map[cat.href] = cat.imageUrl;
  }
  return map;
}

/**
 * Mobile categories screen (Digikala-style two-pane).
 * Scoped to MixPlus household appliances only.
 */
export default async function CategoriesPage() {
  const nav = await getMainNavData();
  const imageByHref = buildImageMap();

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
