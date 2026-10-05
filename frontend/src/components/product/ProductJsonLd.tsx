import { siteConfig } from "@/config/site";
import type { ProductDetailPageData } from "@/types/product-detail";

type ProductJsonLdProps = {
  data: ProductDetailPageData;
};

/** Product JSON-LD for search engines (schema.org Product). */
export function ProductJsonLd({ data }: ProductJsonLdProps) {
  const images = data.gallery.images
    .filter((img) => img.kind !== "video")
    .map((img) => img.url);
  const availability = data.variant.skus.some((s) => s.inStock)
    ? "https://schema.org/InStock"
    : "https://schema.org/OutOfStock";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: data.title,
    sku: data.sku,
    brand: {
      "@type": "Brand",
      name: data.brand.name,
    },
    image: images.length ? images : undefined,
    description: data.content.intro.preview || data.title,
    aggregateRating:
      data.variant.ratingCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: data.variant.rating,
            reviewCount: data.variant.ratingCount,
          }
        : undefined,
    offers: {
      "@type": "Offer",
      url: `/product/${data.slug}`,
      priceCurrency: "IRR",
      price: data.buyBox.price,
      availability,
      seller: {
        "@type": "Organization",
        name: data.buyBox.seller.name || siteConfig.nameFa,
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
