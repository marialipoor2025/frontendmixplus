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
 * Digikala-style service features strip (desktop).
 * Shown under homepage categories.
 */
export function SiteFeatures() {
  return (
    <div className="my-8 hidden select-none items-center justify-between lg:flex">
      {FEATURES.map((feature) => (
        <Link
          key={feature.title}
          href={feature.href}
          className="flex grow flex-col items-center justify-between py-3 text-center"
        >
          <Image
            src={feature.icon}
            alt={feature.title}
            width={56}
            height={56}
            className="inline-block object-cover"
            unoptimized
          />
          <p className="mt-1 text-xs text-[var(--color-neutral-700)]">
            {feature.title}
          </p>
        </Link>
      ))}
    </div>
  );
}
