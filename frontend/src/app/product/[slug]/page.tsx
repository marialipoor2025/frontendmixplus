import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductPage } from "@/components/product/ProductPage";
import { ProductJsonLd } from "@/components/product/ProductJsonLd";
import { siteConfig } from "@/config/site";
import { getMainNavData } from "@/lib/api/nav";
import { getProductDetail } from "@/lib/api/product";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProductDetail(slug);
  if (!data) {
    return { title: "محصول یافت نشد" };
  }

  const primaryImage = data.gallery.images[0]?.url;
  const description =
    data.content.intro.preview ||
    `${data.title} — خرید از ${siteConfig.nameFa}`;

  return {
    title: data.title,
    description,
    openGraph: {
      title: data.title,
      description,
      type: "website",
      locale: "fa_IR",
      images: primaryImage ? [{ url: primaryImage, alt: data.title }] : undefined,
    },
  };
}

export default async function ProductDetailRoute({ params }: PageProps) {
  const { slug } = await params;
  const [data, nav] = await Promise.all([
    getProductDetail(slug),
    getMainNavData(),
  ]);

  if (!data) notFound();

  return (
    <>
      <ProductJsonLd data={data} />
      <ProductPage data={data} nav={nav} />
    </>
  );
}
