import { StaticInfoPage } from "@/components/content/StaticInfoPage";
import { getMainNavData } from "@/lib/api/nav";
import { STATIC_PAGES } from "@/lib/static-pages";

const page = STATIC_PAGES.about;

export const metadata = { title: page.title };

export default async function AboutPage() {
  const nav = await getMainNavData();
  return (
    <StaticInfoPage
      nav={nav}
      title={page.title}
      description={page.description}
    />
  );
}
