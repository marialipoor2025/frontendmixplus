import { notFound } from "next/navigation";
import { StaticInfoPage } from "@/components/content/StaticInfoPage";
import { getMainNavData } from "@/lib/api/nav";
import { getCmsPage } from "@/lib/api/pages";
import { STATIC_PAGES } from "@/lib/static-pages";

export async function renderStaticPage(key: string) {
  const page = await getCmsPage(key);
  if (!page) notFound();
  const nav = await getMainNavData();
  return (
    <StaticInfoPage
      nav={nav}
      title={page.title}
      description={page.description}
      body={page.body}
    />
  );
}

/** Sync metadata from seeded titles (live CMS title is applied in the page body). */
export function staticPageMetadata(key: string) {
  return { title: STATIC_PAGES[key]?.title ?? "صفحه" };
}
