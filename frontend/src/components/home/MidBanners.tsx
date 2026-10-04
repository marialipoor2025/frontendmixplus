import Image from "next/image";
import Link from "next/link";
import type { HomeBanner } from "@/types/home";

type MidBannersProps = {
  banners: HomeBanner[];
};

/**
 * Digikala home top promo strip: 4 equal banners, 4/3 ratio, radius 16.
 */
export function MidBanners({ banners }: MidBannersProps) {
  if (banners.length === 0) return null;

  return (
    <section
      className="w-full min-h-[180px] 2xl:min-h-[240px]"
      aria-label="بنرهای تبلیغاتی"
    >
      <div className="grid w-full grid-cols-2 gap-4 lg:grid-cols-4">
        {banners.map((banner) => (
          <Link
            key={banner.id}
            href={banner.href}
            target="_blank"
            rel="noopener noreferrer"
            className="block min-w-0"
            title={banner.title}
          >
            <div
              className="w-full overflow-hidden rounded-2xl leading-none"
              style={{ aspectRatio: "4 / 3" }}
            >
              <Image
                src={banner.imageUrl}
                alt={banner.alt || banner.title}
                width={640}
                height={480}
                className="inline-block min-h-[180px] w-full object-cover 2xl:min-h-[240px]"
                sizes="(max-width: 1024px) 50vw, 25vw"
              />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
