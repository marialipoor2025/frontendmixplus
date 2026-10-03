import Image from "next/image";
import Link from "next/link";
import type { HomeCategory } from "@/types/home";

type CategoriesSectionProps = {
  categories: HomeCategory[];
};

function CategoryItem({ category }: { category: HomeCategory }) {
  return (
    <Link
      href={category.href}
      className="flex w-[88px] select-none flex-col items-center sm:w-[100px] lg:w-[118px]"
    >
      <div
        className="mb-2 rounded-full p-px"
        style={{
          backgroundImage:
            "linear-gradient(135deg, #1672dd 0%, #ed1944 100%)",
        }}
        aria-hidden
      >
        <div className="flex size-[67px] items-center justify-center overflow-hidden rounded-full bg-[#f0f0f1] sm:size-[82px] lg:size-[94px]">
          <Image
            src={category.imageUrl}
            alt=""
            width={100}
            height={100}
            unoptimized
            className="h-[78%] w-[78%] object-contain mix-blend-multiply"
          />
        </div>
      </div>
      <span className="line-clamp-2 min-h-[2.5em] w-full text-center text-[11px] font-normal leading-[1.7] text-[var(--color-neutral-800)] sm:text-xs">
        {category.title}
      </span>
    </Link>
  );
}

/**
 * Digikala «دسته‌بندی‌ها»: centered title + wrapping circle grid.
 */
export function CategoriesSection({ categories }: CategoriesSectionProps) {
  return (
    <section
      className="mx-auto w-full max-w-[1336px]"
      aria-label="دسته‌بندی‌ها"
    >
      <h2 className="mb-5 w-full text-start text-base font-bold text-[var(--color-neutral-800)] sm:mb-6 sm:text-lg lg:mb-8">
        دسته‌بندی‌ها
      </h2>

      <div className="flex w-full flex-wrap justify-center gap-x-3 gap-y-5 sm:gap-x-5 sm:gap-y-6 lg:gap-x-6 lg:gap-y-8">
        {categories.map((category) => (
          <CategoryItem key={category.id} category={category} />
        ))}
      </div>
    </section>
  );
}
