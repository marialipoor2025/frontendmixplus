import { notFound } from "next/navigation";
import { ProductPage } from "@/components/product/ProductPage";
import { getMainNavData } from "@/lib/api/nav";
import { getProductDetail } from "@/lib/api/product";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductDetailRoute({ params }: PageProps) {
  const { slug } = await params;
  const [data, nav] = await Promise.all([
    getProductDetail(slug),
    getMainNavData(),
  ]);

  if (!data) notFound();

  return <ProductPage data={data} nav={nav} />;
}
