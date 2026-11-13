"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { MarketplaceLogo } from "@/components/brand/MarketplaceLogo";
import { siteConfig } from "@/config/site";
import {
  getFooterSettings,
  subscribeFooterEmail,
} from "@/lib/api/footer";
import {
  getFooterCategoriesWithProducts,
  type FooterCategoryLink,
} from "@/lib/api/catalog";
import { getSiteSettings } from "@/lib/api/site-settings";

type FooterLink = { label: string; href: string };

const CUSTOMER_SERVICE: FooterLink[] = [
  { label: "درخواست پیش فاکتور", href: "/proforma-invoice" },
  { label: "سوالات متداول", href: "/faq" },
  { label: "گزارش خرابی در سایت", href: "/report" },
  { label: "روش های ارسال سفارش", href: "/page/shipping-methods" },
  { label: "روش های پرداخت", href: "/page/payment-methods" },
  { label: "روند بازگرداندن کالا", href: "/page/warranty-and-return-terms-of-the-goods" },
];

const ABOUT_LINKS: FooterLink[] = [
  { label: `چرا ${siteConfig.nameFa}`, href: "/page/why-us" },
  { label: "حریم خصوصی", href: "/page/privacy" },
  { label: `مجله ${siteConfig.nameFa}`, href: "/blog" },
  { label: "تامین کالا", href: "/sellers/join" },
  { label: "درباره ما", href: "/about" },
  { label: "تماس با ما", href: "/page/contact-us" },
];

const SOCIAL_STROKE = "#707EAE";

function SocialLinkedInIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 22 22" aria-hidden>
      <path stroke={SOCIAL_STROKE} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 9v7M10 12v4m0-4a3 3 0 1 1 6 0v4m-6-4V9" />
      <path stroke={SOCIAL_STROKE} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6.008 6h-.009" />
      <path stroke={SOCIAL_STROKE} strokeLinejoin="round" strokeWidth="1.5" d="M1.5 11c0-4.478 0-6.718 1.391-8.109S6.521 1.5 11 1.5c4.478 0 6.718 0 8.109 1.391S20.5 6.521 20.5 11c0 4.478 0 6.718-1.391 8.109S15.479 20.5 11 20.5c-4.478 0-6.718 0-8.109-1.391S1.5 15.479 1.5 11Z" />
    </svg>
  );
}

function SocialYoutubeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="20" fill="none" viewBox="0 0 22 20" aria-hidden>
      <path stroke={SOCIAL_STROKE} strokeWidth="1.5" d="M11 18.5c1.81 0 3.545-.179 5.153-.507 2.01-.41 3.014-.614 3.93-1.792.917-1.179.917-2.532.917-5.238V9.037c0-2.705 0-4.058-.917-5.237-.916-1.178-1.92-1.383-3.93-1.792A26 26 0 0 0 11 1.5c-1.81 0-3.545.179-5.153.507-2.01.41-3.014.614-3.93 1.792C1 4.978 1 6.331 1 9.036v1.928c0 2.705 0 4.058.917 5.237.916 1.178 1.92 1.383 3.93 1.792 1.608.328 3.343.507 5.153.507Z" />
      <path stroke={SOCIAL_STROKE} strokeLinejoin="round" strokeWidth="1.5" d="M14.962 10.313c-.148.606-.938 1.04-2.517 1.911-1.718.947-2.577 1.42-3.272 1.237a1.7 1.7 0 0 1-.635-.317C8 12.709 8 11.806 8 10s0-2.709.538-3.144c.182-.147.4-.256.635-.317.695-.183 1.554.29 3.272 1.237 1.58.87 2.369 1.305 2.517 1.911.05.206.05.42 0 .626Z" />
    </svg>
  );
}

function SocialAparatIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" aria-hidden>
      <path fill={SOCIAL_STROKE} d="M7.587 1.305a3.496 3.496 0 0 0-3.493 2.712l-.555 2.402a9.49 9.49 0 0 1 7.154-4.47l-2.402-.555a3.5 3.5 0 0 0-.704-.09M12 3.5c-4.686 0-8.5 3.815-8.5 8.5s3.814 8.5 8.5 8.5c4.685 0 8.5-3.814 8.5-8.5 0-4.685-3.815-8.5-8.5-8.5m5.58.04a9.49 9.49 0 0 1 4.472 7.153l.554-2.402a3.497 3.497 0 0 0-2.623-4.197zM12 5c3.875 0 7 3.125 7 7s-3.125 7-7 7-7-3.125-7-7 3.125-7 7-7M10.114 6.85a1.75 1.75 0 1 0 0 3.5 1.75 1.75 0 0 0 0-3.5m5.287 1.515a1.75 1.75 0 1 0 0 3.5 1.75 1.75 0 0 0 0-3.5M12 11.001a1 1 0 0 0-.951 1.389 1 1 0 0 0 .95.61 1.001 1.001 0 0 0 .727-1.717A1 1 0 0 0 12 11m-3.402 1.135a1.75 1.75 0 1 0 0 3.5 1.75 1.75 0 0 0 0-3.5m-6.65 1.172-.555 2.402a3.497 3.497 0 0 0 2.623 4.197l2.403.555a9.49 9.49 0 0 1-4.47-7.154m11.938.344a1.75 1.75 0 1 0 0 3.5 1.75 1.75 0 0 0 0-3.5m6.576 3.93a9.49 9.49 0 0 1-7.155 4.47l2.403.555a3.497 3.497 0 0 0 4.197-2.623z" />
    </svg>
  );
}

function SocialInstagramIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" aria-hidden>
      <path stroke={SOCIAL_STROKE} strokeLinejoin="round" strokeWidth="1.5" d="M2.5 12c0-4.478 0-6.718 1.391-8.109S7.521 2.5 12 2.5c4.478 0 6.718 0 8.109 1.391S21.5 7.521 21.5 12c0 4.478 0 6.718-1.391 8.109S16.479 21.5 12 21.5c-4.478 0-6.718 0-8.109-1.391S2.5 16.479 2.5 12Z" />
      <path stroke={SOCIAL_STROKE} strokeWidth="1.5" d="M16.5 12a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
      <path stroke={SOCIAL_STROKE} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.508 6.5h-.01" />
    </svg>
  );
}

function SocialTelegramIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="20" fill="none" viewBox="0 0 22 20" aria-hidden>
      <path stroke={SOCIAL_STROKE} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m10.985 13.408 3.242 3.686c1.2 1.365 1.801 2.048 2.43 1.881.628-.166.844-1.064 1.275-2.861l2.39-9.968c.665-2.768.997-4.151.259-4.834s-2.017-.175-4.575.84L4.14 6.865c-2.046.813-3.069 1.219-3.134 1.917a1 1 0 0 0 0 .215c.063.698 1.084 1.107 3.128 1.926.925.371 1.388.557 1.72.912q.056.06.108.124c.306.38.436.88.697 1.876l.489 1.867c.253.97.38 1.456.713 1.522s.622-.336 1.201-1.141zm0 0-.317-.33c-.362-.378-.543-.566-.543-.8s.18-.423.543-.8l3.573-3.724" />
    </svg>
  );
}

const SOCIAL = [
  {
    label: "لینکدین",
    href: "https://www.linkedin.com/company/oriya-market",
    Icon: SocialLinkedInIcon,
  },
  {
    label: "یوتیوب",
    href: "https://www.youtube.com/@oriyamarket",
    Icon: SocialYoutubeIcon,
  },
  {
    label: "آپارات",
    href: "https://www.aparat.com/oriyamarket",
    Icon: SocialAparatIcon,
  },
  {
    label: "اینستاگرام",
    href: "https://www.instagram.com/oriyamarket?vrfl=MWF5MWRkcnZ0OG8zdg==",
    Icon: SocialInstagramIcon,
  },
  {
    label: "تلگرام",
    href: "https://t.me/oriyamarket",
    Icon: SocialTelegramIcon,
  },
] as const;

type FooterCertificate = {
  label: string;
  src: string;
  href: string;
  width: number;
  height: number;
};

const CERTIFICATES: FooterCertificate[] = [
  {
    label: "نماد اعتماد الکترونیکی",
    src: "/images/crt/enamad.png",
    href: "https://enamad.ir/",
    width: 75,
    height: 75,
  },
  {
    label: "rayane",
    src: "/images/crt/rayane.png",
    href: "https://irannsr.org/",
    width: 55,
    height: 60,
  },
  {
    label: "fanavaran",
    src: "/images/crt/fanavaran-logo.png",
    href: "https://itunion.ir/",
    width: 45,
    height: 50,
  },
  {
    label: "karfarmayan",
    src: "/images/crt/karfarmayan.png",
    href: "https://eanjoman.ir/",
    width: 55,
    height: 60,
  },
  {
    label: "ecunion",
    src: "/images/crt/ecunion.svg",
    href: "https://ecunion.ir/",
    width: 40,
    height: 82,
  },
  {
    label: "samandehi",
    src: "/images/crt/samandehi.png",
    href: "https://samandehi.ir/Pages/HomePage.aspx",
    width: 130,
    height: 130,
  },
];

const STORE_ADDRESS = "تهران، تهرانپارس";
const OFFICE_ADDRESS = "تهران، تهرانپارس";

function digitsOnly(value: string): string {
  return value.replace(/[^\d۰-۹]/g, "").replace(/[۰-۹]/g, (d) =>
    String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)),
  );
}

function FooterMenuColumn({
  title,
  links,
  open,
  onToggle,
}: {
  title: string;
  links: FooterLink[];
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="w-full lg:w-1/3">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 border-none py-4 lg:pointer-events-none lg:cursor-default lg:px-0 lg:py-0"
        aria-expanded={open}
      >
        <h3 className="spNavTitle whitespace-nowrap text-sm font-bold text-[var(--color-primary)] md:text-base">
          {title}
        </h3>
        <div className="my-2 h-px w-full grow border-t border-[var(--color-neutral-300)] lg:hidden" />
        <span
          className={`shrink-0 lg:hidden transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="none"
            viewBox="0 0 16 16"
          >
            <path
              fill="#7A7DA1"
              d="M10.803 9.864a.75.75 0 1 0 1.06-1.061zM8 6l.53-.53a.75.75 0 0 0-1.06 0zM4.136 8.803a.75.75 0 1 0 1.06 1.06zm7.728 0L8.53 5.47 7.47 6.53l3.333 3.334zM7.47 5.47 4.136 8.803l1.06 1.06L8.53 6.53z"
            />
          </svg>
        </span>
      </button>
      <ul className={`p-2 lg:p-0 ${open ? "block" : "max-lg:hidden"}`}>
        {links.map((link) => (
          <li
            key={link.href + link.label}
            className="py-1 text-xs text-[var(--color-neutral-700)] hover:text-[var(--color-primary)] md:py-1.5 md:text-sm"
          >
            <Link href={link.href}>{link.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      fill="none"
      viewBox="0 0 18 18"
      className={className}
      aria-hidden
    >
      <g stroke="currentColor" strokeWidth="1.5" clipPath="url(#footer-phone)">
        <path
          strokeLinejoin="round"
          d="M2.833 8.957c-.71-1.24-1.054-2.252-1.261-3.279-.306-1.517.394-3 1.555-3.946.49-.4 1.053-.263 1.343.257l.655 1.175c.519.931.779 1.397.727 1.89-.051.494-.401.896-1.102 1.7zm0 0c1.44 2.51 3.698 4.769 6.21 6.21m0 0c1.24.71 2.252 1.054 3.279 1.261 1.517.306 3-.394 3.946-1.555.4-.49.263-1.053-.257-1.343l-1.175-.655c-.931-.519-1.397-.778-1.89-.727-.494.052-.896.402-1.7 1.101z"
        />
        <path
          strokeLinecap="round"
          d="M10.5 5.124A4.5 4.5 0 0 1 12.876 7.5m-1.885-6A8.08 8.08 0 0 1 16.5 7.01"
        />
      </g>
      <defs>
        <clipPath id="footer-phone">
          <path fill="currentColor" d="M0 0h18v18H0z" />
        </clipPath>
      </defs>
    </svg>
  );
}

function BaleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="120"
      height="120"
      fill="none"
      viewBox="0 0 120 120"
      className={className}
      aria-hidden
    >
      <path
        fill="#00B894"
        d="M104.945 99.22c.293-.293.585-.732.877-1.025.293-.438.585-.731.877-1.17.292-.44.585-.733.877-1.171.292-.44.584-.879.877-1.171.292-.44.584-.732.878-1.171l.876-1.317c.293-.438.438-.731.731-1.17.292-.44.439-.879.731-1.318.292-.438.438-.731.731-1.17.292-.44.438-.879.731-1.318.146-.438.438-.877.584-1.17.292-.44.438-.878.584-1.464.146-.439.439-.877.585-1.316.147-.44.438-1.026.585-1.464l.439-1.317c.145-.439.292-1.025.584-1.463l.439-1.318.438-1.61.439-1.316.438-1.61c.146-.44.146-.879.293-1.317.146-.585.145-1.171.292-1.61.146-.439.146-.878.292-1.317.147-.586.147-1.17.293-1.756 0-.44.146-.879.146-1.171 0-.731.145-1.317.145-2.048 0-.294.001-.733.147-1.026 0-1.023 0-1.901.146-2.926v-.146C120 29.561 97.491 4.537 68.405.439h-.147c-.876-.146-1.754-.293-2.777-.293h-.877c-.73 0-1.315-.146-2.047-.146h-5.553c-.439 0-.877 0-1.316.146-.439 0-.73 0-1.169.147-.438 0-.877.146-1.17.146-.438 0-.73.146-1.168.146-.439 0-.877.147-1.17.147-.439 0-.731.146-1.17.146a2.75 2.75 0 0 0-1.169.293c-.292 0-.73.146-1.023.146-.438.146-.73.146-1.17.293-.291.146-.73.146-1.022.292-.439.147-.73.147-1.17.293-.292.146-.73.146-1.023.293-.438.146-.73.292-1.169.292-.292.147-.73.147-1.023.293-.439.147-.73.293-1.17.44-.292.146-.73.292-1.023.292-.438.146-.73.293-1.169.439-.292.146-.584.293-1.023.439s-.73.293-1.17.439l-.876.439c-.439.146-.731.439-1.17.585l-.877.44c-.438.146-.73.438-1.169.585l-.877.439c-.438.146-.73.439-1.17.731l-.876.44c-.439.292-.877.585-1.17.731s-2.484 1.756-2.484 1.756S13.886 2.927 9.5.732 0 1.61 0 6.585v53.561C0 91.903 24.702 117.951 55.98 120h6.87c.585 0 1.023 0 1.608-.146.439 0 1.023 0 1.462-.147.584 0 1.023-.146 1.608-.146.438 0 1.022-.146 1.461-.146.438-.146 1.023-.146 1.462-.293.438-.146 1.023-.146 1.461-.293.438-.146 1.023-.293 1.462-.293.439-.145.877-.145 1.462-.293l1.462-.438 1.314-.439 1.463-.44 1.314-.438c.439-.147.877-.293 1.463-.586.438-.145.876-.292 1.315-.585.439-.146.876-.439 1.315-.585s.877-.439 1.316-.586.876-.439 1.315-.732c.439-.146.877-.438 1.316-.585.439-.293.876-.438 1.315-.731s.877-.44 1.17-.732c.438-.293.876-.585 1.315-.732.439-.293.73-.439 1.169-.732s.877-.585 1.17-.878c.438-.293.73-.585 1.169-.878.439-.292.73-.585 1.169-.878s.731-.585 1.17-.878.73-.585 1.169-1.024c.292-.292.73-.585 1.023-.878.439-.293.731-.731 1.023-1.024s.731-.586 1.023-1.025l1.023-1.025c.293-.292.585-.731 1.024-1.023-.146-.44.146-.733.584-1.172"
      />
      <path
        fill="#fff"
        d="M51.601 90.595c-2.923 0-5.993-1.17-8.331-3.365L24.707 68.498c-4.531-4.537-4.531-12 0-16.537s11.985-4.536 16.516 0l10.378 10.39 26.456-26.488c4.53-4.536 11.985-4.536 16.516 0 4.531 4.537 4.531 12 0 16.537L59.786 87.083c-2.193 2.341-5.262 3.512-8.185 3.512"
      />
    </svg>
  );
}

type OtherChannel = {
  label: string;
  href: string;
  iconClassName: string;
  Icon?: (props: { className?: string }) => ReactNode;
  src?: string;
  imgSize?: number;
};

const OTHER_CHANNELS: OtherChannel[] = [
  {
    label: "کانال واتساپ",
    href: "https://whatsapp.com/channel/0029VbEBrNeAjPXEu80khB1k",
    src: "/images/social-icons/whatsapp1.png",
    imgSize: 32,
    iconClassName: "h-8 w-8",
  },
  {
    label: "کانال تلگرام",
    href: "https://t.me/oriyamarket",
    src: "/images/social-icons/telegram1.png",
    imgSize: 28,
    iconClassName: "h-7 w-7",
  },
  {
    label: "کانال بله",
    href: "https://ble.ir/oriyamarket",
    Icon: BaleIcon,
    iconClassName: "h-7 w-7",
  },
  {
    label: "کانال ایتا",
    href: "https://eitaa.com/oriyamarket",
    src: "/images/social-icons/eitaa.png",
    imgSize: 28,
    iconClassName: "h-7 w-7",
  },
  {
    label: "کانال روبیکا",
    href: "https://rubika.ir/oriyamarket",
    src: "/images/social-icons/rubika.png",
    imgSize: 28,
    iconClassName: "h-7 w-7",
  },
];

/**
 * Barghchi-style marketplace footer adapted for Oriya Market.
 */
export function SiteFooter() {
  const [email, setEmail] = useState("");
  const [subscribeMsg, setSubscribeMsg] = useState<string | null>(null);
  const [subscribing, setSubscribing] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const [showTrust, setShowTrust] = useState(true);
  const [phonePrimary, setPhonePrimary] = useState("۰۲۱-۶۱۹۳۰۰۰۰");
  const [phoneSecondary, setPhoneSecondary] = useState("۰۲۱-۹۱۰۰۰۱۰۰");
  const [hoursLine, setHoursLine] = useState(
    "از ۹ صبح تا ۱۷ عصر به‌جز روزهای تعطیل",
  );
  const [blogUrl, setBlogUrl] = useState("https://mixplusshop.ir");
  const [productCategories, setProductCategories] = useState<FooterCategoryLink[]>(
    [],
  );

  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      getFooterSettings(),
      getSiteSettings(),
      getFooterCategoriesWithProducts(8),
    ]).then(([settings, site, categories]) => {
      if (cancelled) return;
      setShowTrust(settings.showTrustSeals);
      if (settings.headerPhone) setPhonePrimary(settings.headerPhone);
      else if (settings.phonePrimary) setPhonePrimary(settings.phonePrimary);
      if (settings.phoneSecondary) setPhoneSecondary(settings.phoneSecondary);
      if (settings.hoursLine) setHoursLine(settings.hoursLine);
      if (site.blogUrl) setBlogUrl(site.blogUrl);
      setProductCategories(categories);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const aboutLinks = ABOUT_LINKS.map((link) =>
    link.label.startsWith("مجله") ? { ...link, href: blogUrl || link.href } : link,
  );
  const telPrimary = digitsOnly(phonePrimary);
  const telSecondary = digitsOnly(phoneSecondary);

  const toggleMenu = (key: string) => {
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <footer
      id="footer"
      className="mt-12 w-full bg-[var(--color-neutral-100)] pt-4 md:pt-9"
    >
      <div className="site-container">
        <div className="mb-6">
          <div className="lg:grid lg:grid-cols-12">
            {/* Link columns */}
            <div className="col-span-7">
              <div className="footer-top flex flex-wrap pt-2 lg:pt-0">
                <div className="w-full">
                  <div className="footer-menus-wrap flex-wrap lg:flex">
                    {productCategories.length > 0 ? (
                      <FooterMenuColumn
                        title="دسته‌بندی محصولات"
                        links={productCategories}
                        open={!!openMenus.categories}
                        onToggle={() => toggleMenu("categories")}
                      />
                    ) : null}
                    <FooterMenuColumn
                      title="خدمات مشتریان"
                      links={CUSTOMER_SERVICE}
                      open={!!openMenus.service}
                      onToggle={() => toggleMenu("service")}
                    />
                    <FooterMenuColumn
                      title={siteConfig.nameFa}
                      links={aboutLinks}
                      open={!!openMenus.about}
                      onToggle={() => toggleMenu("about")}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Social + certificates */}
            <div className="col-span-5 text-left">
              <div className="text-center text-sm font-bold text-[var(--color-neutral-900)]">
                ما در شبکه‌های اجتماعی
              </div>
              <div className="social-media mx-auto flex w-80 max-w-full flex-wrap items-center justify-between p-2.5 md:mr-auto">
                {SOCIAL.map(({ label, href, Icon }) => (
                  <div key={label} className="md:basis-1/6">
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-transparent hover:border-[var(--color-neutral-300)] hover:bg-white"
                    >
                      <Icon />
                    </a>
                  </div>
                ))}
              </div>

              <div className="py-2">
                <div className="w-full border-t border-[var(--color-neutral-200)]" />
              </div>

              {showTrust ? (
                <div className="certificates-wrap mr-auto flex flex-wrap">
                  {CERTIFICATES.map((cert) => (
                    <div
                      key={cert.src}
                      className="footer-certificate m-2 mb-0 flex flex-1 justify-center p-1"
                    >
                      <a
                        href={cert.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        referrerPolicy="origin"
                        className="flex h-full items-center justify-center"
                        title={cert.label}
                      >
                        {/* next/image can fail on local SVGs; use native img for badges */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={cert.src}
                          alt={cert.label}
                          width={cert.width}
                          height={cert.height}
                          loading="lazy"
                          className="h-auto max-h-[82px] w-auto object-contain"
                        />
                      </a>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className="pb-4 pt-2">
            <div className="w-full border-t border-[var(--color-neutral-200)]" />
          </div>

          {/* Contact + address */}
          <div className="lg:grid lg:grid-cols-12">
            <div className="col-span-5 mx-auto max-w-[400px] leading-7 md:mx-0">
              <div className="mb-3 text-center md:mb-4 md:text-right">
                <p className="text-xs font-bold text-[var(--color-primary)]">
                  پاسخ‌گوی شما هستیم
                </p>
              </div>
              <div className="ml-2.5 text-xs md:text-sm">
                <div className="flex items-start justify-between">
                  <div className="hidden md:block">
                    <div className="flex items-center text-[var(--color-neutral-900)]">
                      <PhoneIcon />
                      <div className="pr-2 font-bold">تلفن تماس:</div>
                    </div>
                    <p className="whitespace-nowrap text-xs text-[var(--color-neutral-700)]">
                      {hoursLine}
                    </p>
                  </div>
                  <div className="flex w-full items-center justify-between pr-2 font-bold text-[var(--color-neutral-900)]">
                    <div className="flex p-1 text-[var(--color-neutral-900)] md:hidden">
                      <PhoneIcon />
                      <div className="pr-2 font-bold">تلفن تماس:</div>
                    </div>
                    <a href={`tel:${telPrimary || phonePrimary}`}>
                      {phonePrimary}
                    </a>
                    <a
                      href={`tel:${telSecondary || phoneSecondary}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      {phoneSecondary}
                    </a>
                  </div>
                </div>
                <p className="text-center text-xs text-[var(--color-neutral-700)] md:hidden">
                  {hoursLine}
                </p>
                <div className="mt-2 items-center justify-between md:flex">
                  <div className="text-center text-xs text-[var(--color-neutral-700)]">
                    سایر راه‌های ارتباطی
                  </div>
                  <div className="mt-2 flex items-center justify-center gap-2 md:mt-0">
                    {OTHER_CHANNELS.map((channel) => (
                      <a
                        key={channel.label}
                        href={channel.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={channel.label}
                        title={channel.label}
                        className="transition-all duration-200 hover:scale-110"
                      >
                        {channel.src ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={channel.src}
                            alt={channel.label}
                            width={channel.imgSize ?? 28}
                            height={channel.imgSize ?? 28}
                            loading="lazy"
                            className={channel.iconClassName}
                          />
                        ) : channel.Icon ? (
                          <channel.Icon className={channel.iconClassName} />
                        ) : null}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-7 w-full justify-between border-t border-[var(--color-neutral-100)] pt-2 leading-7 md:border-none md:pt-0">
              <div className="mb-3 text-xs font-bold text-[var(--color-primary)] md:mb-4">
                آدرس ما
              </div>
              <div className="space-y-2 text-xs">
                <div className="md:flex">
                  <div className="pl-1 font-bold text-[var(--color-neutral-900)]">
                    آدرس فروشگاه:{" "}
                  </div>
                  <div>{STORE_ADDRESS}</div>
                </div>
                <div className="md:flex">
                  <div className="pl-1 font-bold text-[var(--color-neutral-900)]">
                    دفتر مرکزی:{" "}
                  </div>
                  <div>{OFFICE_ADDRESS}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pb-4 pt-2">
          <div className="w-full border-t border-[var(--color-neutral-200)]" />
        </div>

        {/* About + newsletter */}
        <div className="flex flex-wrap pb-7 md:flex">
          <div className="my-4 flex-1 px-4 md:flex">
            <div className="mb-2 pl-5 text-center md:mb-0">
              <Link href="/" aria-label={siteConfig.name}>
                <MarketplaceLogo
                  width={145}
                  height={46}
                  className="relative z-10 mx-auto max-w-[100px] md:max-w-[200px]"
                />
              </Link>
            </div>
            <div>
              <p className="text-center text-sm font-bold text-[var(--color-primary)] md:text-right md:text-base">
                {`${siteConfig.nameFa}؛ مقصد خرید آنلاین لوازم خانگی`}
              </p>
              <p className="mb-2.5 text-justify text-xs leading-8 text-[var(--color-neutral-700)] md:text-sm">
                {`${siteConfig.nameFa} در زمینه تخصصی لوازم خانگی برقی، یخچال و فریزر، ماشین لباسشویی، جاروبرقی، تلویزیون و ملزومات مرتبط فعالیت می‌کند. تلاش تیم ${siteConfig.nameFa} همواره برای ایجاد بستری متفاوت و کارآمد در حوزه تجارت الکترونیک برای خریداران و فروشندگان بوده است.`}
              </p>
            </div>
          </div>

          <div className="my-4 px-4">
            <p className="mb-2.5 text-center text-xs font-bold text-[var(--color-neutral-900)] md:text-sm">
              از جدیدترین تخفیف‌ها با خبر شوید:
            </p>
            <form
              className="flex max-w-full justify-between rounded-md p-1 md:w-80"
              onSubmit={(e) => {
                e.preventDefault();
                void (async () => {
                  setSubscribing(true);
                  setSubscribeMsg(null);
                  try {
                    await subscribeFooterEmail(email);
                    setSubscribeMsg("ایمیل شما ثبت شد");
                    setEmail("");
                  } catch (err) {
                    setSubscribeMsg(
                      err instanceof Error
                        ? err.message
                        : "ثبت ایمیل ناموفق بود",
                    );
                  } finally {
                    setSubscribing(false);
                  }
                })();
              }}
            >
              <input
                className="w-full max-w-full rounded-xl border border-[var(--color-neutral-300)] bg-white px-3 py-2 text-xs md:w-[350px] md:text-sm"
                type="email"
                id="footer-email"
                placeholder="آدرس ایمیل خود را وارد کنید"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                className="mr-1.5 rounded-xl bg-[var(--color-primary)] px-4 text-xs font-bold text-white disabled:opacity-60 md:text-sm"
                type="submit"
                disabled={!email.trim() || subscribing}
              >
                {subscribing ? "…" : "ثبت"}
              </button>
            </form>
            {subscribeMsg ? (
              <p className="mt-2 block text-xs text-[var(--color-success)]">
                {subscribeMsg}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="bg-[var(--color-primary)] p-4 text-center text-sm text-white">
        {`تمامی حقوق این وبسایت محفوظ و متعلق به ${siteConfig.name} می‌باشد. هرگونه کپی‌برداری از آن موجب پیگرد قانونی خواهد بود. | © ${siteConfig.nameFa}`}
      </div>
    </footer>
  );
}
