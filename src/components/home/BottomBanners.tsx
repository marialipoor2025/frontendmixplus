import Image from "next/image";
import Link from "next/link";
import type { HomeBanner } from "@/types/home";

type BottomBannersProps = {
  banners: HomeBanner[];
};

/**
 * Digikala bottom promo strip: full-width rounded banners.
 */
export function BottomBanners({ banners }: BottomBannersProps) {
  if (banners.length === 0) return null;

  return (
    <section className="w-full" aria-label="بنرهای پایین صفحه">
      <div
        className={
          banners.length === 1
            ? "w-full"
            : "grid w-full grid-cols-1 gap-4 md:grid-cols-2"
        }
      >
        {banners.map((banner) => (
          <Link
            key={banner.id}
            href={banner.href}
            target="_blank"
            rel="noopener noreferrer"
            className="block min-w-0 overflow-hidden rounded-2xl leading-none"
            title={banner.title}
          >
            <Image
              src={banner.imageUrl}
              alt={banner.alt || banner.title}
              width={1336}
              height={300}
              className="inline-block h-auto w-full object-cover"
              sizes="(max-width: 1336px) 100vw, 1336px"
              priority={false}
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
