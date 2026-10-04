import Image from "next/image";
import Link from "next/link";
import { ScrollHorizontalWrapper } from "@/components/home/ScrollHorizontalWrapper";
import type { Brand } from "@/types/brand";

type BrandShowcaseProps = {
  brands: Brand[];
};

function BrandCard({ brand }: { brand: Brand }) {
  return (
    <Link
      href={`/brand/${brand.slug}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-[124px] w-[90px] shrink-0 flex-col items-center gap-1.5 overflow-hidden rounded-md border border-[var(--color-neutral-200)] bg-white lg:border-[var(--color-neutral-100)]"
    >
      <div className="bg-[var(--color-neutral-100)] p-1.5 lg:bg-white">
        <div
          role="img"
          aria-label={brand.name}
          className="leading-none [mix-blend-mode:multiply]"
          style={{ width: 78, height: 78 }}
        >
          <Image
            src={brand.logoUrl}
            alt={brand.name}
            width={78}
            height={78}
            className="inline-block h-full w-full object-contain"
            unoptimized
          />
        </div>
      </div>
      <h4 className="w-full truncate px-2 text-center text-xs font-bold leading-[180%] text-[var(--color-icon-high-emphasis)]">
        {brand.name}
      </h4>
    </Link>
  );
}

/**
 * Digikala «محبوب‌ترین برندها»: bordered card + title + horizontal brand rail.
 */
export function BrandShowcase({ brands }: BrandShowcaseProps) {
  if (brands.length === 0) return null;

  return (
    <section
      className="w-full overflow-hidden rounded-2xl border border-[var(--color-neutral-200)] bg-white pb-6 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04),0_1px_2px_-1px_rgba(0,0,0,0.04)]"
      aria-label="محبوب‌ترین برندها"
    >
      <div className="flex items-center gap-2 px-4 pb-4 pt-5 lg:px-5">
        <span className="leading-none" aria-hidden>
          <Image
            src="/images/brands/star.svg"
            alt=""
            width={24}
            height={24}
            className="inline-block h-6 w-6 object-contain"
            unoptimized
          />
        </span>
        <h2 className="text-base font-bold leading-[150%] text-[var(--color-text)]">
          محبوب‌ترین برندها
        </h2>
      </div>

      <div className="px-2 lg:px-3">
        <ScrollHorizontalWrapper>
          <div className="flex w-max flex-row items-stretch gap-3 px-2 pb-1">
            {brands.map((brand) => (
              <BrandCard key={brand.id} brand={brand} />
            ))}
          </div>
        </ScrollHorizontalWrapper>
      </div>
    </section>
  );
}
