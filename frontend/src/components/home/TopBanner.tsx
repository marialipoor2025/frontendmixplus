import Image from "next/image";
import Link from "next/link";
import type { HomeBanner } from "@/types/home";

type TopBannerProps = {
  banner?: HomeBanner | null;
};

/**
 * Full-width marketing strip above the hero (CMS HomeBanner slot = Top).
 */
export function TopBanner({ banner }: TopBannerProps) {
  if (!banner?.imageUrl) return null;

  return (
    <section aria-label="بنر تبلیغاتی بالای صفحه" className="w-full">
      <Link
        href={banner.href || "/"}
        className="relative block w-full overflow-hidden rounded-2xl"
        title={banner.title}
      >
        <div className="relative aspect-[6/1] min-h-[56px] w-full sm:min-h-[72px]">
          <Image
            src={banner.imageUrl}
            alt={banner.alt || banner.title}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        </div>
      </Link>
    </section>
  );
}
