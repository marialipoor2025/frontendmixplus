import { notFound } from "next/navigation";
import { StaticInfoPage } from "@/components/content/StaticInfoPage";
import { getMainNavData } from "@/lib/api/nav";
import { STATIC_PAGES } from "@/lib/static-pages";

type PageProps = {
  params: Promise<{ topic: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { topic } = await params;
  const page = STATIC_PAGES[`faq/${topic}`];
  return { title: page?.title ?? "راهنما" };
}

export default async function FaqTopicPage({ params }: PageProps) {
  const { topic } = await params;
  const page = STATIC_PAGES[`faq/${topic}`];
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
