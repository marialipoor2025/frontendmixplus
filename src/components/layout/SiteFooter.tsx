"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  AparatIcon,
  ChevronLeftIcon,
  ExpandLessIcon,
  InstagramIcon,
  LinkedInIcon,
  TwitterIcon,
} from "@/components/layout/icons";
import { siteConfig } from "@/config/site";

const WITH_MIXPLUS = [
  { label: "اتاق خبر میکپلاس", href: "/newsroom" },
  { label: "فروش در میکپلاس", href: "/seller" },
  { label: "فرصت‌های شغلی", href: "/careers" },
  { label: "گزارش تخلف در میکپلاس", href: "/report" },
  { label: "تماس با میکپلاس", href: "/page/contact-us" },
  { label: "درباره میکپلاس", href: "/about" },
] as const;

const CUSTOMER_SERVICE = [
  { label: "پاسخ به پرسش‌های متداول", href: "/faq" },
  { label: "رویه‌های بازگرداندن کالا", href: "/faq/returns" },
  { label: "شرایط استفاده", href: "/page/terms" },
  { label: "حریم خصوصی", href: "/page/privacy" },
  { label: "گزارش باگ", href: "/page/bug-report" },
] as const;

const BUYING_GUIDE = [
  { label: "نحوه ثبت سفارش", href: "/faq/how-to-order" },
  { label: "رویه ارسال سفارش", href: "/faq/shipping" },
  { label: "شیوه‌های پرداخت", href: "/faq/payment" },
] as const;

const SOCIAL = [
  {
    label: "میکپلاس در اینستاگرام",
    href: "https://www.instagram.com/",
    Icon: InstagramIcon,
  },
  {
    label: "میکپلاس در توییتر",
    href: "https://twitter.com/",
    Icon: TwitterIcon,
  },
  {
    label: "میکپلاس در لینکدین",
    href: "https://www.linkedin.com/",
    Icon: LinkedInIcon,
  },
  {
    label: "میکپلاس در آپارات",
    href: "https://www.aparat.com/",
    Icon: AparatIcon,
  },
] as const;

const TRUST_SEALS = [
  {
    label: "نماد کسب و کارهای مجازی",
    src: "/images/footer/nemads/kasbokar.webp",
  },
  {
    label: "نشان ملی ثبت",
    src: "/images/footer/nemads/rezi.webp",
  },
  {
    label: "سامانه پایش",
    src: "/images/footer/nemads/sapra.webp",
  },
] as const;

/** Digikala-style sister-brand / partner strip (footer bottom). */
const PARTNERS = [
  {
    label: "مجله اینترنتی دیجی‌کالا مگ",
    href: "https://www.digikala.com/mag/",
    icon: "/images/footer/partners/mag.svg",
  },
  {
    label: "بهترین راهکارهای پرداخت آنلاین",
    href: "https://www.mydigipay.com/",
    icon: "/images/footer/partners/digipay.svg",
  },
  {
    label: "دیجی‌استایل",
    href: "https://www.digistyle.com/",
    icon: "/images/footer/partners/digistyle.svg",
  },
  {
    label: "دیجی‌کالا پلاس",
    href: "/plus/landing",
    icon: "/images/footer/partners/digiplus.svg",
  },
  {
    label: "دیجی کلاب",
    href: "/digiclub",
    icon: "/images/footer/partners/digiclub.svg",
  },
  {
    label: "دیجی‌کالا جت",
    href: "https://digikalajet.com/",
    icon: "/images/footer/partners/jet.svg",
  },
  {
    label: "دیجی‌کالا ادز",
    href: "https://www.digikalaads.com/",
    icon: "/images/footer/partners/digikala-ads.svg",
  },
  {
    label: "دیجی‌کالا مهر",
    href: "https://mehr.digikala.com/",
    icon: "/images/footer/partners/digimehr.svg",
  },
  {
    label: "دیجی‌نکست",
    href: "https://diginext.ir/",
    icon: "/images/footer/partners/diginext.svg",
  },
  {
    label: "دیجی‌اکسپرس",
    href: "https://digiexpress.ir/",
    icon: "/images/footer/partners/digiexpress.svg",
  },
  {
    label: "گنجه",
    href: "https://ganje.net/?utm_source=Digikala_web&utm_medium=Footer",
    icon: "/images/footer/partners/ganjeh.svg",
  },
  {
    label: "دیجی‌فای",
    href: "https://digify.shop/",
    icon: "/images/footer/partners/digify.svg",
  },
  {
    label: "اسمارتک",
    href: "https://smartech.ir/",
    icon: "/images/footer/partners/smartech.svg",
  },
  {
    label: "دیجی‌کالا بیزینس",
    href: "https://b2b.digikala.com/?utm_source=DK&utm_medium=FooterBadge&utm_campaign=DKtraffic",
    icon: "/images/footer/partners/digikala-business.svg",
  },
  {
    label: "دیجی‌کالا سرویس",
    href: "https://service.digikala.com/",
    icon: "/images/footer/partners/digikala-service.svg",
  },
  {
    label: "میاره",
    href: "https://www.miare.ir/",
    icon: "/images/footer/partners/miare.svg",
  },
  {
    label: "ویدومارت",
    href: "https://www.vidomart.shop",
    icon: "/images/footer/partners/vidomart.svg",
  },
  {
    label: "طلای دیجیتال",
    href: "https://www.digikala.com/wealth/my-assets/",
    icon: "/images/footer/partners/digital-gold.svg",
  },
] as const;

function FooterLinkColumn({
  title,
  links,
  className = "",
}: {
  title: string;
  links: readonly { label: string; href: string }[];
  className?: string;
}) {
  return (
    <div className={`block w-6/12 lg:w-auto lg:grow ${className}`}>
      <p className="mb-2 block text-base font-bold text-[var(--color-neutral-700)]">
        {title}
      </p>
      {links.map((link) => (
        <Link
          key={link.href + link.label}
          href={link.href}
          className="mb-2 block text-xs text-[var(--color-neutral-500)] hover:text-[var(--color-neutral-700)]"
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}

/**
 * Digikala-style marketplace footer adapted for MixPlus.
 */
export function SiteFooter() {
  const [email, setEmail] = useState("");
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <footer className="mt-12 w-full border-t border-[var(--color-neutral-200)] bg-[var(--color-neutral-000)] pt-8">
      <div className="site-container">
          {/* First row: logo + back to top — aligned with header logo */}
          <div className="flex select-none items-center justify-between">
            <Link
              href="/"
              className="shrink-0"
              aria-label={siteConfig.name}
            >
              <Image
                src="/brand/mixplus-logo.svg"
                alt={`${siteConfig.name} - میکپلاس`}
                width={133}
                height={30}
                className="inline-block h-[30px] w-[133px] object-contain"
                unoptimized
              />
            </Link>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="relative flex cursor-pointer items-center justify-center rounded-[var(--medium-radius)] border border-[var(--color-neutral-200)] px-3 py-1 sm:px-4"
            >
              <span className="me-2 text-sm text-[var(--color-neutral-400)]">
                بازگشت به بالا
              </span>
              <ExpandLessIcon
                size={24}
                className="text-[var(--color-icon-low-emphasis)]"
              />
            </button>
          </div>

          {/* Support phones */}
          <div className="mt-4 flex flex-wrap items-center text-sm text-[var(--color-neutral-700)] md:mt-3">
            <p className="shrink-0">تلفن پشتیبانی ۶۱۹۳۰۰۰۰ - ۰۲۱</p>
            <div className="hidden px-5 text-[var(--color-neutral-400)] md:block">
              |
            </div>
            <p className="shrink-0">۰۲۱-۹۱۰۰۰۱۰۰</p>
            <div className="hidden px-5 text-[var(--color-neutral-400)] md:block">
              |
            </div>
            <p className="mt-1 w-full md:mt-0 md:w-auto">
              ۷ روز هفته، ۲۴ ساعته پاسخگوی شما هستیم
            </p>
          </div>

          {/* App download — directly below first footer row */}
          <div className="mb-8 mt-6 flex flex-col items-center justify-between rounded-[var(--medium-radius)] bg-[var(--color-brand-primary)] px-4 py-3 text-white select-none lg:flex-row lg:px-5">
            <div className="mb-4 flex items-center text-white lg:mb-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[#3c4b6e] text-sm font-extrabold text-white">
                M+
              </div>
              <div className="me-0 ms-4 shrink-0 text-lg font-bold">
                دانلود اپلیکیشن میکپلاس
              </div>
            </div>
            <div className="flex grow items-center justify-end">
              <div className="flex flex-wrap items-center justify-center lg:grow lg:justify-end">
                {[
                  {
                    label: "کافه‌بازار",
                    src: "/images/footer/app/coffe-bazzar.svg",
                  },
                  { label: "مایکت", src: "/images/footer/app/myket.svg" },
                  { label: "سیب‌اپ", src: "/images/footer/app/sib-app.svg" },
                ].map((store) => (
                  <a
                    key={store.label}
                    href="/landings/app"
                    className="m-2 inline-flex h-11 items-center overflow-hidden rounded"
                    title={`دریافت از ${store.label}`}
                  >
                    <Image
                      src={store.src}
                      alt={`دریافت از ${store.label}`}
                      width={135}
                      height={40}
                      className="h-11 w-auto object-contain"
                      unoptimized
                    />
                  </a>
                ))}
              </div>
              <Link
                href="/landings/app"
                className="me-0 ms-4 hidden h-11 w-11 items-center justify-center rounded border border-[var(--color-neutral-200)] bg-white text-xl font-bold text-[var(--color-neutral-700)] lg:flex"
                aria-label="اطلاعات بیشتر درباره اپلیکیشن میکپلاس"
              >
                …
              </Link>
            </div>
            <Link
              href="/landings/app"
              className="mt-1 inline-flex items-center text-sm text-white lg:hidden"
            >
              <span>اطلاعات بیشتر درباره اپلیکیشن میکپلاس</span>
              <ChevronLeftIcon size={18} className="text-white" />
            </Link>
          </div>

          {/* Link columns + social / newsletter */}
          <div className="mb-8 flex w-full flex-wrap justify-between">
            <FooterLinkColumn title="با میکپلاس" links={WITH_MIXPLUS} />
            <FooterLinkColumn title="خدمات مشتریان" links={CUSTOMER_SERVICE} />
            <FooterLinkColumn
              title="راهنمای خرید از میکپلاس"
              links={BUYING_GUIDE}
              className="hidden md:block"
            />

            <div className="w-full shrink-0 lg:w-auto">
              <div className="mt-8 flex w-full items-start justify-between sm:mt-0 lg:block">
                <h4 className="mb-3 text-base font-bold text-[var(--color-neutral-700)]">
                  همراه ما باشید!
                </h4>
                <div className="flex items-center">
                  {SOCIAL.map(({ label, href, Icon }, i) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className={
                        i === SOCIAL.length - 1
                          ? ""
                          : "me-6 lg:me-8"
                      }
                    >
                      <Icon
                        size={40}
                        className="text-[var(--color-icon-low-emphasis)]"
                      />
                    </a>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex w-full flex-col items-start sm:mt-8">
                <h4 className="mb-3 hidden text-base font-bold text-[var(--color-neutral-700)] md:block">
                  با ثبت ایمیل، از جدید‌ترین تخفیف‌ها با‌خبر شوید
                </h4>
                <form
                  className="flex w-full items-center"
                  onSubmit={(e) => {
                    e.preventDefault();
                  }}
                >
                  <label className="grow">
                    <span className="sr-only">ایمیل شما</span>
                    <div className="flex items-center rounded-[var(--medium-radius)] bg-[var(--color-neutral-100)] px-2">
                      <input
                        type="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ایمیل شما"
                        className="w-full bg-transparent px-2 py-3 text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-neutral-400)]"
                      />
                    </div>
                  </label>
                  <button
                    type="submit"
                    disabled={!email.trim()}
                    className="me-0 ms-2 rounded-[var(--medium-radius)] bg-[var(--color-primary)] px-5 py-3 text-sm font-medium text-white disabled:pointer-events-none disabled:bg-[var(--color-neutral-200)] disabled:text-[var(--color-neutral-000)]"
                  >
                    ثبت
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* About + trust seals */}
          <div className="flex flex-wrap items-start justify-between border-t border-[var(--color-neutral-200)] py-8 lg:flex-nowrap">
            <div className="grow">
              <div
                className={`relative overflow-hidden text-sm leading-[180%] text-[var(--color-neutral-500)] lg:me-10 ${
                  aboutOpen ? "" : "max-h-[120px]"
                }`}
              >
                <h2 className="mb-2 text-base font-bold text-[var(--color-neutral-700)]">
                  میکپلاس؛ مارکت‌پلیس لوازم خانگی
                </h2>
                <p>
                  میکپلاس مقصد خرید آنلاین لوازم خانگی است؛ از یخچال و ماشین
                  لباسشویی تا جاروبرقی، تلویزیون و لوازم آشپزخانه. با همکاری
                  فروشندگان معتبر، امکان مقایسه برندها، ارسال سریع، ضمانت اصل
                  بودن کالا و پشتیبانی حرفه‌ای را در یک فروشگاه چندفروشنده
                  تجربه کنید.
                </p>
                <p className="mt-3">
                  تنوع کالا، قیمت‌های رقابتی و خدمات پس از فروش، خرید لوازم
                  خانگی را در میکپلاس ساده و مطمئن کرده است. می‌توانید بر اساس
                  برند، ویژگی و بودجه، بهترین گزینه را انتخاب کنید.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAboutOpen((v) => !v)}
                className="mt-2 inline-flex cursor-pointer items-center text-sm font-medium text-[var(--color-icon-secondary)]"
              >
                <span>{aboutOpen ? "بستن" : "مشاهده بیشتر"}</span>
                <ChevronLeftIcon
                  size={18}
                  className={`text-[var(--color-icon-secondary)] transition-transform ${
                    aboutOpen ? "-rotate-90" : ""
                  }`}
                />
              </button>
            </div>

            <div className="mt-4 flex w-full flex-wrap items-center justify-center lg:mt-0 lg:w-auto lg:justify-end">
              {TRUST_SEALS.map((seal) => (
                <div
                  key={seal.src}
                  className="me-2 flex cursor-default items-center justify-center rounded border border-[var(--color-neutral-200)] p-2 lg:p-4"
                  title={seal.label}
                >
                  <Image
                    src={seal.src}
                    alt={seal.label}
                    width={75}
                    height={75}
                    className="h-[75px] w-[75px] object-contain"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Copyright */}
          <div className="flex flex-col items-center justify-between border-t border-[var(--color-neutral-200)] py-8 text-center text-xs text-[var(--color-neutral-500)]">
            برای استفاده از مطالب میکپلاس، داشتن «هدف غیرتجاری» و ذکر «منبع»
            کافیست. تمام حقوق این وب‌سایت نیز برای {siteConfig.name} است.
          </div>
      </div>

      {/* Partners / sister brands strip */}
      <div className="relative z-[3] w-full bg-[var(--color-neutral-100)]">
        <div className="site-container flex flex-wrap items-stretch justify-end">
          {PARTNERS.map((partner) => (
            <a
              key={partner.icon}
              href={partner.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={partner.label}
              className="flex min-h-20 grow basis-1/3 flex-col items-center justify-center border-b border-e border-[var(--color-neutral-200)] px-5 sm:basis-1/6 lg:basis-[11.11%]"
            >
              <Image
                src={partner.icon}
                alt={partner.label}
                width={120}
                height={20}
                className="inline-block h-5 w-auto max-w-full object-contain"
                unoptimized
              />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
