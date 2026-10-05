import { CategoryPlpPage } from "@/components/categories/CategoryPlpPage";
import { getMainNavData } from "@/lib/api/nav";
import { resolveCategoryPath } from "@/lib/category-path";
import { getMockCategoryProducts } from "@/lib/mocks/category-plp";

type PageProps = {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const nav = await getMainNavData();
  const category = resolveCategoryPath(slug, nav);
  return { title: category.title };
}

export default async function CategorySlugPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const nav = await getMainNavData();
  const category = resolveCategoryPath(slug, nav);
  const products = getMockCategoryProducts(slug);

  return (
    <CategoryPlpPage
      category={category}
      nav={nav}
      products={products}
      searchParams={sp}
    />
  );
}
