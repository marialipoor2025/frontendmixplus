import Link from "next/link";
import { ChevronLeftIcon, InfoOutlineIcon } from "@/components/layout/icons";

type ProductPricePolicyLinkProps = {
  href?: string;
  label?: string;
};

/**
 * Pricing process / price supervision row below the buy box.
 */
export function ProductPricePolicyLink({
  href = "/page/price-policy",
  label = "فرآیند قیمت‌گذاری و نظارت بر قیمت",
}: ProductPricePolicyLinkProps) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between border border-[var(--color-neutral-100)] px-5 py-2 lg:rounded-[var(--small-radius)] lg:border-[var(--color-neutral-200)]"
    >
      <div className="flex items-center">
        <InfoOutlineIcon className="ml-2 size-[18px] text-[var(--color-icon-neutral-hint)]" />
        <span className="text-[13px] text-[var(--color-neutral-600)]">
          {label}
        </span>
      </div>
      <ChevronLeftIcon
        size={24}
        className="text-[var(--color-icon-low-emphasis)]"
      />
    </Link>
  );
}
