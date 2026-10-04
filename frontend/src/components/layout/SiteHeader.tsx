import Image from "next/image";
import Link from "next/link";
import { HeaderQuickLinks } from "@/components/layout/HeaderQuickLinks";
import { HeaderSearch } from "@/components/layout/HeaderSearch";
import { HeaderTopBar } from "@/components/layout/HeaderTopBar";
import { HeaderUserActions } from "@/components/layout/HeaderUserActions";
import { SpecialOfferBadgeIcon } from "@/components/layout/icons";
import { siteConfig } from "@/config/site";

const OFFER_HREF = "/incredible-offers";

/**
 * MixPlus header aligned to Barghchi desktop structure.
 * Mobile: logo + offers → search → quick links.
 * Desktop: top bar → logo | search | offers | actions (generous spacing).
 */
export function SiteHeader() {
  return (
    <header>
      {/* Full-bleed gray utility strip (desktop) */}
      <HeaderTopBar />

      {/* White chrome below the top bar */}
      <div className="bg-[var(--color-neutral-000)]">
      {/* —— Mobile chrome —— */}
      <div className="site-container pt-2.5 pb-2 lg:hidden">
        <div className="mb-2 flex w-full items-center justify-between gap-3 py-1">
          <Link
            href="/"
            data-cro-id="header-mixplus-logo-mobile"
            aria-label={`لوگوی ${siteConfig.nameFa}`}
            className="flex shrink-0 items-center justify-end"
          >
            <Image
              src="/brand/mixplus-logo.svg"
              alt={`لوگوی ${siteConfig.nameFa}`}
              width={108}
              height={30}
              priority
              className="h-[30px] w-[108px] object-contain object-right"
            />
          </Link>

          <Link
            href={OFFER_HREF}
            className="group inline-flex shrink-0 items-center gap-1.5"
            aria-label="تخفیفات ویژه"
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-[var(--color-primary-soft)] transition-colors duration-300 group-hover:bg-[var(--color-primary)]">
              <SpecialOfferBadgeIcon className="text-[var(--color-primary)] transition-colors duration-300 group-hover:text-white" />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-[10px] text-[var(--color-neutral-600)]">
                تخفیفات ویژه
              </span>
              <span className="text-xs font-bold text-[var(--color-neutral-900)]">
                از {siteConfig.nameFa} ارزان بخر
              </span>
            </span>
          </Link>
        </div>

        <HeaderSearch brandName={siteConfig.nameFa} />
        <HeaderQuickLinks variant="mobile" />
      </div>

      {/* —— Desktop chrome —— */}
      <div className="site-container hidden lg:block">
        <div className="flex items-center justify-between gap-6 py-4 xl:gap-8">
          {/* Right: logo + search + offers (offers sit next to search) */}
          <div className="flex min-w-0 flex-1 items-center gap-5 xl:gap-6">
            <Link
              href="/"
              className="shrink-0"
              data-cro-id="header-mixplus-logo"
              aria-label={`لوگوی ${siteConfig.nameFa}`}
            >
              <Image
                src="/brand/mixplus-logo.svg"
                alt={`لوگوی ${siteConfig.nameFa}`}
                width={133}
                height={30}
                priority
                className="h-[30px] w-[133px] object-contain"
              />
            </Link>

            <div className="min-w-0 max-w-[640px] flex-1">
              <HeaderSearch brandName={siteConfig.nameFa} variant="barghchi" />
            </div>

            <Link
              href={OFFER_HREF}
              className="group flex shrink-0 items-center gap-2"
              aria-label="تخفیفات ویژه"
            >
              <span className="flex size-9 items-center justify-center rounded-full bg-[var(--color-primary-soft)] transition-colors duration-300 group-hover:bg-[var(--color-primary)]">
                <SpecialOfferBadgeIcon className="text-[var(--color-primary)] transition-colors duration-300 group-hover:text-white" />
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-xs text-[var(--color-neutral-600)]">
                  تخفیفات ویژه
                </span>
                <span className="whitespace-nowrap text-sm font-bold text-[var(--color-neutral-900)]">
                  از {siteConfig.nameFa} ارزان بخر
                </span>
              </span>
            </Link>
          </div>

          {/* Left: account actions only */}
          <HeaderUserActions
            loginLabel={siteConfig.header.loginLabel}
            emptyCartTitle={siteConfig.header.emptyCartTitle}
          />
        </div>
      </div>
      </div>
    </header>
  );
}
