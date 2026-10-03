import Link from "next/link";
import { siteConfig } from "@/config/site";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center gap-4 px-4 md:px-6">
        <Link
          href="/"
          className="shrink-0 text-xl font-bold tracking-tight text-[var(--color-primary)]"
        >
          {siteConfig.name}
        </Link>

        <div className="hidden flex-1 md:block">
          <label className="sr-only" htmlFor="site-search">
            Search products
          </label>
          <input
            id="site-search"
            type="search"
            placeholder="Search refrigerators, washers, brands..."
            className="h-11 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)]"
          />
        </div>

        <nav className="ml-auto flex items-center gap-3 text-sm font-medium text-[var(--color-text)]">
          <Link
            href="/account"
            className="rounded-lg px-3 py-2 transition hover:bg-[var(--color-surface)]"
          >
            Login
          </Link>
          <Link
            href="/cart"
            className="rounded-lg bg-[var(--color-primary)] px-3 py-2 text-white transition hover:bg-[var(--color-primary-hover)]"
          >
            Cart
          </Link>
        </nav>
      </div>
    </header>
  );
}
