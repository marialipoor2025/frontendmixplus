import { notFound } from "next/navigation";
import { BrandPlpPage } from "@/components/brand/BrandPlpPage";
import { getBrandBySlug, getProductsByBrandSlug } from "@/lib/api/catalog";
import { getMainNavData } from "@/lib/api/nav";
import { parseListingSearchParams } from "@/lib/product-listing";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);
  return { title: brand ? `برند ${brand.name}` : "برند" };
}

export default async function BrandSlugPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const brand = await getBrandBySlug(slug);
  if (!brand) notFound();

  const listingQuery = parseListingSearchParams(sp);

  const [nav, products] = await Promise.all([
    getMainNavData(),
    getProductsByBrandSlug(slug, listingQuery.q, listingQuery.sort, listingQuery),
  ]);

  return (
    <BrandPlpPage
      brand={brand}
      nav={nav}
      products={products}
      searchParams={sp}
    />
  );
}
