import { ChevronLeftIcon } from "@/components/layout/icons";
import type { ProductFeatureItem } from "@/types/product-detail";

type ProductFeaturesProps = {
  items: ProductFeatureItem[];
  /** Anchor for the full specs section further down the page. */
  viewAllHref?: string;
};

/**
 * Highlighted product attributes under insurance / before buy-box content.
 */
export function ProductFeatures({
  items,
  viewAllHref = "#pdp-specs",
}: ProductFeaturesProps) {
  if (items.length === 0) return null;

  return (
    <div className="w-full pt-2">
      <div className="break-words py-3">
        <div className="flex grow items-center">
          <p className="grow text-sm font-medium leading-[1.8] text-[var(--color-neutral-900)]">
            <span className="relative">ویژگی‌ها</span>
          </p>
        </div>
      </div>

      <div className="hide-scrollbar overflow-auto">
        <ul className="mt-2 flex w-max gap-1 pb-0 lg:mt-0 lg:grid lg:w-auto lg:grid-cols-3 lg:gap-2 lg:overflow-hidden">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-col items-start justify-start rounded-md bg-[var(--color-neutral-100)] p-2"
            >
              <div className="flex max-w-[150px] flex-col gap-2">
                <div>
                  <p
                    className="truncate text-[13px] leading-none text-[var(--color-neutral-500)] lg:overflow-hidden lg:break-all lg:leading-9"
                    title={item.label}
                  >
                    {item.label}
                  </p>
                  <p
                    className="truncate text-[13px] font-semibold leading-none text-[var(--color-neutral-700)] lg:overflow-hidden lg:break-all lg:leading-9"
                    title={item.value}
                  >
                    {item.value}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 flex items-center justify-center gap-4">
        <hr className="h-px grow border-0 bg-[var(--color-neutral-200)]" />
        <a
          href={viewAllHref}
          className="relative flex h-10 select-none items-center justify-center rounded-[var(--medium-radius)] border border-[var(--color-button-black)] px-3 text-xs font-medium text-[var(--color-button-black)] transition hover:bg-[var(--color-neutral-100)]"
        >
          <span className="flex grow items-center justify-center">
            مشاهده همه ویژگی‌ها
            <ChevronLeftIcon
              size={24}
              className="mr-2 text-[var(--color-button-black)]"
            />
          </span>
        </a>
        <hr className="h-px grow border-0 bg-[var(--color-neutral-200)]" />
      </div>
    </div>
  );
}
