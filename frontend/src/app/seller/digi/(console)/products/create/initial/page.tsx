"use client";

import Link from "next/link";

type CreationOption = {
  id: string;
  title: string;
  titleClassName?: string;
  subtitle: string;
  badge?: string;
  bullets: string[];
  cta: string;
  href: string;
  buttonVariant: "ai" | "primary";
  icon: "ai" | "seller" | "digikala" | "servicehub";
};

const OPTIONS: CreationOption[] = [
  {
    id: "ai",
    title: "ثبت کالا توسط هوش مصنوعی",
    titleClassName: "digi-create-option__title--ai",
    subtitle: "تولید سریع و خودکار عنوان، شرح و تصاویر حرفه‌ای",
    badge: "پیشنهادی",
    bullets: [
      "ثبت هوشمند کالا با محتوای کاربردی جهت افزایش فروش",
      "تولید خودکار محتوای متنی",
      "تولید و اصلاح خودکار تصاویر طبق استانداردهای دیجی‌کالا",
      "سرعت بسیار بالا",
      "کاربری آسان",
    ],
    cta: "ثبت هوشمند کالا",
    href: "/seller/digi/products/new?via=ai",
    buttonVariant: "ai",
    icon: "ai",
  },
  {
    id: "seller",
    title: "ثبت کالا توسط فروشنده",
    subtitle: "توسط شما با همراهی هوش مصنوعی",
    bullets: [
      "انعطاف در تغییرات",
      "امکان شخصی‌سازی محتوا",
      "کنترل کامل فروشنده در روند ثبت کالا",
    ],
    cta: "ثبت کالا",
    href: "/seller/digi/products/new",
    buttonVariant: "primary",
    icon: "seller",
  },
  {
    id: "digikala",
    title: "ثبت کالا توسط دیجی‌کالا",
    subtitle: "سپردن تولید محتوا به تیم دیجی‌کالا",
    bullets: [
      "تضمین تأیید محتوا",
      "صرفه‌جویی در زمان",
      "مناسب برای فروشندگان با تنوع بالای محصول",
      "ارائه خروجی استاندارد",
    ],
    cta: "سفارش ثبت کالا",
    href: "/seller/digi/products/create/order",
    buttonVariant: "primary",
    icon: "digikala",
  },
  {
    id: "servicehub",
    title: "ثبت کالا توسط سرویس‌هاب",
    subtitle: "مناسب برای ساخت انبوه و انتقال محصولات",
    bullets: [
      "ساخت انبوه محصولات",
      "انتقال محصولات از سایت‌های دیگر",
      "ایجاد و ویرایش تصویر",
    ],
    cta: "سرویس‌دهنده‌ها",
    href: "/seller/digi/products/create/servicehub",
    buttonVariant: "primary",
    icon: "servicehub",
  },
];

/**
 * Digikala ProductCreationLayout — /pwa/product/create/initial
 */
export default function DigiProductCreateInitialPage() {
  return (
    <div className="digi-create-card" data-testid="card-wrapper">
      <section>
        <div className="digi-create-options">
          {OPTIONS.map((option, index) => (
            <div key={option.id} className="contents">
              {index > 0 ? (
                <span className="digi-create-divider" aria-hidden />
              ) : null}
              <article className="digi-create-option">
                <div className="digi-create-option__body">
                  <div className="digi-create-option__top">
                    <div className="digi-create-option__image">
                      <CreationIcon kind={option.icon} />
                    </div>
                    <div className="digi-create-option__heading">
                      <p
                        className={[
                          "digi-create-option__title",
                          option.titleClassName ?? "",
                        ].join(" ")}
                      >
                        {option.title}
                      </p>
                      {option.badge ? (
                        <span className="digi-create-badge">{option.badge}</span>
                      ) : null}
                    </div>
                    <p className="digi-create-option__subtitle">
                      {option.subtitle}
                    </p>
                    <ul className="digi-create-bullets">
                      {option.bullets.map((bullet) => (
                        <li key={bullet}>
                          <p>{bullet}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="digi-create-option__cta">
                    <Link
                      href={option.href}
                      className={
                        option.buttonVariant === "ai"
                          ? "digi-btn-ai digi-btn-create"
                          : "digi-btn-primary digi-btn-create"
                      }
                    >
                      <span>{option.cta}</span>
                      <ChevronLeftIcon />
                    </Link>
                  </div>
                </div>
              </article>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ChevronLeftIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M14.7 5.3a1 1 0 0 1 0 1.4L9.4 12l5.3 5.3a1 1 0 1 1-1.4 1.4l-6-6a1 1 0 0 1 0-1.4l6-6a1 1 0 0 1 1.4 0z" />
    </svg>
  );
}

function CreationIcon({
  kind,
}: {
  kind: CreationOption["icon"];
}) {
  if (kind === "ai") {
    return (
      <svg viewBox="0 0 100 100" width="100" height="100" aria-hidden>
        <defs>
          <linearGradient id="digiAiGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8f4aec" />
            <stop offset="50%" stopColor="#6860f3" />
            <stop offset="100%" stopColor="#2586ff" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" rx="24" fill="#f8efff" />
        <circle cx="50" cy="42" r="22" fill="url(#digiAiGrad)" />
        <rect x="28" y="62" width="44" height="18" rx="9" fill="url(#digiAiGrad)" />
        <circle cx="42" cy="40" r="3.5" fill="#fff" />
        <circle cx="58" cy="40" r="3.5" fill="#fff" />
        <path
          d="M42 50c2.5 3 13.5 3 16 0"
          stroke="#fff"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (kind === "seller") {
    return (
      <svg viewBox="0 0 100 100" width="100" height="100" aria-hidden>
        <rect width="100" height="100" rx="24" fill="#d0f1f9" />
        <circle cx="50" cy="36" r="16" fill="#1ab1d4" />
        <path
          d="M22 78c4-16 18-24 28-24s24 8 28 24"
          fill="#1ab1d4"
        />
        <rect x="62" y="28" width="18" height="14" rx="4" fill="#1796b4" />
        <path d="M66 35h10M71 30v10" stroke="#fff" strokeWidth="2" />
      </svg>
    );
  }

  if (kind === "digikala") {
    return (
      <svg viewBox="0 0 100 100" width="100" height="100" aria-hidden>
        <rect width="100" height="100" rx="24" fill="#fff0f3" />
        <rect x="22" y="28" width="56" height="44" rx="10" fill="#ef4056" />
        <rect x="30" y="36" width="40" height="8" rx="4" fill="#fff" opacity="0.9" />
        <rect x="30" y="50" width="28" height="8" rx="4" fill="#fff" opacity="0.7" />
        <circle cx="68" cy="66" r="10" fill="#028e71" />
        <path
          d="M63 66l3.5 3.5 7-7"
          stroke="#fff"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 100 100" width="100" height="100" aria-hidden>
      <rect width="100" height="100" rx="24" fill="#eef2ff" />
      <rect x="20" y="30" width="28" height="40" rx="6" fill="#6860f3" />
      <rect x="52" y="22" width="28" height="56" rx="6" fill="#2586ff" />
      <path
        d="M34 50h32M58 42l8 8-8 8"
        stroke="#fff"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
