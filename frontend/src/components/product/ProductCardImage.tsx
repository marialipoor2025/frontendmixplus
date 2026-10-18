"use client";

import Image from "next/image";
import { useState } from "react";
import { CategoryProductPlaceholder } from "@/components/product/CategoryProductPlaceholder";
import { isMissingProductImage } from "@/lib/product-image-placeholder";

type ProductCardImageProps = {
  src: string | null | undefined;
  alt: string;
  seed: string;
  sizes?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
};

/**
 * Card image that falls back to the category placeholder when the URL is
 * missing/placeholder or the asset 404s (stale /api/media links).
 */
export function ProductCardImage({
  src,
  alt,
  seed,
  sizes,
  fill = true,
  width,
  height,
  className = "object-contain p-1 sm:p-1.5",
}: ProductCardImageProps) {
  const [failed, setFailed] = useState(false);
  const missing = failed || isMissingProductImage(src);

  if (missing) {
    return <CategoryProductPlaceholder seed={seed} />;
  }

  if (fill) {
    return (
      <Image
        src={src!}
        alt={alt}
        fill
        sizes={sizes}
        className={className}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <Image
      src={src!}
      alt={alt}
      width={width ?? 56}
      height={height ?? 56}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
