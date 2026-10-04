import Link from "next/link";
import type { ProductTitleNavLink } from "@/types/product-detail";

type ProductTitleProps = {
  title: string;
  links: ProductTitleNavLink[];
};

/**
 * PDP center column header: brand/category links + product title.
 */
export function ProductTitle({ title, links }: ProductTitleProps) {
  return (
    <div>
      {links.length > 0 ? (
        <div className="flex items-center">
          <nav className="flex items-center" aria-label="برند و دسته‌بندی">
            {links.map((link, index) => (
              <Link
                key={link.id}
                href={link.href}
                className="text-[13px] font-semibold leading-[2.15] text-[var(--color-secondary-500)] transition hover:text-[var(--color-secondary-700)] lg:text-sm"
              >
                {index > 0 ? (
                  <span className="flex items-center">
                    <span
                      className="mx-2 text-[var(--color-neutral-300)]"
                      aria-hidden
                    >
                      /
                    </span>
                    <span>{link.title}</span>
                  </span>
                ) : (
                  <span>{link.title}</span>
                )}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}

      {/* Slot for future PDP labels / chips */}
      <div className="mt-2 flex items-center gap-2" />

      <h1 className="pointer-events-none mb-2 text-base font-bold leading-[1.8] text-[var(--color-neutral-900)] lg:text-lg">
        {title}
      </h1>
    </div>
  );
}
