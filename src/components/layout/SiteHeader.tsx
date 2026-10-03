import Image from "next/image";
import Link from "next/link";
import { HeaderSearch } from "@/components/layout/HeaderSearch";
import { HeaderUserActions } from "@/components/layout/HeaderUserActions";
import { siteConfig } from "@/config/site";

/**
 * Digikala-style main header (logo + search + user actions).
 * Sticky chrome is owned by the parent that wraps SiteHeader + MainNav.
 */
export function SiteHeader() {
  return (
    <header className="bg-[var(--color-neutral-000)]">
      <div className="relative mx-auto flex w-full max-w-[var(--header-max-width)] grow justify-between px-4 md:px-4">
        <div className="relative z-[2] flex w-full py-3">
          <div className="flex flex-1 grow items-center">
            <Link
              href="/"
              className="ms-0 shrink-0 me-5"
              data-cro-id="header-mixplus-logo"
              aria-label={`لوگوی ${siteConfig.name}`}
            >
              <Image
                src="/brand/mixplus-logo.svg"
                alt={`لوگوی ${siteConfig.name}`}
                width={195}
                height={30}
                priority
                className="inline-block h-[30px] w-[195px] object-contain"
              />
            </Link>

            <div className="ms-auto flex grow">
              <HeaderSearch placeholder={siteConfig.header.searchPlaceholder} />
            </div>
          </div>

          <HeaderUserActions
            loginLabel={siteConfig.header.loginLabel}
            emptyCartTitle={siteConfig.header.emptyCartTitle}
          />
        </div>
      </div>
    </header>
  );
}
