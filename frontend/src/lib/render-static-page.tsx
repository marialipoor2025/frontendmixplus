import { notFound } from "next/navigation";
import { StaticInfoPage } from "@/components/content/StaticInfoPage";
import { getMainNavData } from "@/lib/api/nav";
import { STATIC_PAGES } from "@/lib/static-pages";

export async function renderStaticPage(key: string) {
  const page = STATIC_PAGES[key];
  if (!page) notFound();
  const nav = await getMainNavData();
  return (
    <StaticInfoPage
      nav={nav}
      title={page.title}
      description={page.description}
    />
  );
}

export function staticPageMetadata(key: string) {
  const page = STATIC_PAGES[key];
  return { title: page?.title ?? "صفحه" };
}
