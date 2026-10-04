import Link from "next/link";
import { SellerShopIcon } from "@/components/layout/icons";
import { siteConfig } from "@/config/site";
import type { BreadcrumbItem } from "@/types/product-detail";

type ProductBreadcrumbProps = {
  items: BreadcrumbItem[];
  /** Desktop-only CTA on the opposite side of the trail. */
  sellerCtaHref?: string;
  sellerCtaLabel?: string;
};

/**
 * PDP breadcrumb row under the main nav: trail + optional «فروش در …» CTA.
 */
export function ProductBreadcrumb({
  items,
  sellerCtaHref = "/sellers/join",
  sellerCtaLabel = `فروش در ${siteConfig.nameFa}`,
}: ProductBreadcrumbProps) {
  if (!items.length) return null;

  return (
    <div className="flex flex-wrap items-center lg:mb-5">
      <nav
        aria-label="مسیر صفحه"
        className="min-w-0 grow px-5 py-2 lg:px-0"
      >
        <ol className="flex min-w-0 items-center overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={item.id} className="shrink-0">
                <Link
                  href={item.href}
                  className={[
                    "inline-flex items-center text-xs leading-[1.8] lg:text-[13px]",
                    isLast
                      ? "font-semibold text-[var(--color-neutral-650)]"
                      : "text-[var(--color-neutral-500)]",
                  ].join(" ")}
                  aria-current={isLast ? "page" : undefined}
                >
                  <span>{item.title}</span>
                  {!isLast ? (
                    <span className="mx-3 text-[var(--color-neutral-500)]" aria-hidden>
                      /
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="mr-auto hidden items-center py-2 lg:flex">
        <Link
          href={sellerCtaHref}
          className="flex items-center text-xs leading-[1.8] text-[var(--color-neutral-400)] transition hover:text-[var(--color-neutral-600)] lg:text-[13px]"
        >
          <span>{sellerCtaLabel}</span>
          <SellerShopIcon className="mr-2 size-[18px] text-[var(--color-neutral-400)]" />
        </Link>
      </div>
    </div>
  );
}
