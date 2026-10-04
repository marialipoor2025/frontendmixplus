import Image from "next/image";
import Link from "next/link";

const ITEMS = [
  {
    title: "امکان تحویل اکسپرس",
    href: "/faq/express-delivery",
    icon: "/images/footer/express-delivery.svg",
  },
  {
    title: "۲۴ ساعته، ۷ روز هفته",
    href: "/faq/support",
    icon: "/images/footer/support.svg",
  },
  {
    title: "امکان پرداخت در محل",
    href: "/faq/cash-on-delivery",
    icon: "/images/footer/cash-on-delivery.svg",
  },
  {
    title: "هفت روز ضمانت بازگشت کالا",
    href: "/faq/returns",
    icon: "/images/footer/days-return.svg",
  },
  {
    title: "ضمانت اصل بودن کالا",
    href: "/faq/original-products",
    icon: "/images/footer/original-products.svg",
  },
] as const;

/**
 * PDP trust strip under the main product columns.
 */
export function ProductInfoFooter() {
  return (
    <div className="mt-3 flex items-center justify-between border-t border-b-4 border-[var(--color-neutral-100)] px-3 pt-3 pb-7">
      <div className="mx-auto flex w-full justify-between gap-y-4 lg:gap-y-2">
        <div className="hide-scrollbar flex w-full gap-x-6 overflow-x-auto lg:justify-between lg:gap-x-0 lg:overflow-visible">
          {ITEMS.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="flex shrink-0 flex-col items-center justify-center px-1 lg:flex-row"
            >
              <div className="size-[42px] shrink-0 lg:ml-2 lg:inline-block">
                <Image
                  src={item.icon}
                  alt={item.title}
                  width={42}
                  height={42}
                  className="inline-block size-[42px] object-contain"
                  unoptimized
                />
              </div>
              <p className="text-center text-[11px] font-semibold text-[var(--color-neutral-400)]">
                {item.title}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
