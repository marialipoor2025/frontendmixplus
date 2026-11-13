import Image from "next/image";
import { siteConfig } from "@/config/site";

type MarketplaceLogoProps = {
  className?: string;
  /** `fa` (default) uses the Persian Oriya mark; `en` uses the English mark. */
  locale?: "fa" | "en";
  priority?: boolean;
  width?: number;
  height?: number;
};

/**
 * Marketplace (Oriya) mark for header/footer/auth chrome.
 * Seller/brand marks (e.g. MixPlus) stay on `/brand/mixplus-logo.svg`.
 */
export function MarketplaceLogo({
  className,
  locale = "fa",
  priority = false,
  width = 168,
  height = 58,
}: MarketplaceLogoProps) {
  const src = locale === "en" ? siteConfig.logoSrcEn : siteConfig.logoSrc;

  return (
    <Image
      src={src}
      alt={`لوگوی ${siteConfig.nameFa}`}
      width={width}
      height={height}
      priority={priority}
      unoptimized
      className={["object-contain object-center", className]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
