import { notFound } from "next/navigation";
import { BrandPlpPage } from "@/components/brand/BrandPlpPage";
import { getBrandBySlug, getProductsByBrandSlug } from "@/lib/api/catalog";
import { getMainNavData } from "@/lib/api/nav";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);
  return { title: brand ? `برند ${brand.name}` : "برند" };
}

export default async function BrandSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) notFound();

  const [nav, products] = await Promise.all([
    getMainNavData(),
    getProductsByBrandSlug(slug),
  ]);

  return <BrandPlpPage brand={brand} nav={nav} products={products} />;
}
