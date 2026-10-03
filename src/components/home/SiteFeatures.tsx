import Image from "next/image";
import Link from "next/link";

const FEATURES = [
  {
    title: "امکان تحویل اکسپرس",
    href: "/faq/express-delivery",
    icon: "/images/footer/express-delivery.svg",
  },
  {
    title: "امکان پرداخت در محل",
    href: "/faq/cash-on-delivery",
    icon: "/images/footer/cash-on-delivery.svg",
  },
  {
    title: "۷ روز هفته، ۲۴ ساعته",
    href: "/page/contact-us",
    icon: "/images/footer/support.svg",
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
 * Digikala-style service features strip under the hero.
 * Mobile: horizontal scroll. Desktop: evenly spaced row.
 */
export function SiteFeatures() {
  return (
    <div className="my-4 select-none lg:my-8">
      <div className="hide-scrollbar flex items-stretch justify-start gap-3 overflow-x-auto pb-1 lg:justify-between lg:gap-0 lg:overflow-visible lg:pb-0">
        {FEATURES.map((feature) => (
          <Link
            key={feature.title}
            href={feature.href}
            className="flex w-[4.75rem] shrink-0 flex-col items-center justify-between py-2 text-center sm:w-24 lg:w-auto lg:grow lg:py-3"
          >
            <Image
              src={feature.icon}
              alt={feature.title}
              width={56}
              height={56}
              className="inline-block size-10 object-cover lg:size-14"
              unoptimized
            />
            <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-[var(--color-neutral-700)] lg:text-xs">
              {feature.title}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
