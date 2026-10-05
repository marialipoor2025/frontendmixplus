import Link from "next/link";
import { MainNav } from "@/components/layout/MainNav";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { StickyHeaderShell } from "@/components/layout/StickyHeaderShell";
import { siteConfig } from "@/config/site";
import { getMainNavData } from "@/lib/api/nav";

export default async function NotFound() {
  const nav = await getMainNavData();

  return (
    <>
      <StickyHeaderShell>
        <SiteHeader />
        <MainNav data={nav} />
      </StickyHeaderShell>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <p className="bg-gradient-to-l from-[#1672dd] to-[#ed1944] bg-clip-text text-7xl font-black text-transparent md:text-8xl">
          ۴۰۴
        </p>
        <h1 className="mt-4 text-xl font-bold text-[var(--foreground)] md:text-2xl">
          صفحه موردنظر شما یافت نشد!
        </h1>
        <p className="mt-2 max-w-md text-sm leading-7 text-[var(--color-muted)]">
          آدرس واردشده در {siteConfig.nameFa} وجود ندارد یا منتقل شده است.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center justify-center rounded-xl bg-[var(--color-primary)] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-hover)]"
        >
          بازگشت به صفحه اصلی
        </Link>
      </main>

      <SiteFooter />
    </>
  );
}
