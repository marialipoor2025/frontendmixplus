import { notFound } from "next/navigation";
import { StaticInfoPage } from "@/components/content/StaticInfoPage";
import { getMainNavData } from "@/lib/api/nav";
import { getCmsPage } from "@/lib/api/pages";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const page = await getCmsPage(`page/${slug}`);
  return { title: page?.title ?? "صفحه" };
}

export default async function CmsPage({ params }: PageProps) {
  const { slug } = await params;
  const page = await getCmsPage(`page/${slug}`);
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
