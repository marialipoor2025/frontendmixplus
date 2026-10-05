import Link from "next/link";
import { MainNav } from "@/components/layout/MainNav";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { StickyHeaderShell } from "@/components/layout/StickyHeaderShell";
import { getMainNavData } from "@/lib/api/nav";

export const metadata = { title: "سبد خرید" };

export default async function CartPage() {
  const nav = await getMainNavData();

  return (
    <>
      <StickyHeaderShell>
        <SiteHeader />
        <MainNav data={nav} />
      </StickyHeaderShell>

      <div className="site-container flex-1 py-8">
        <h1 className="mb-4 text-lg font-bold text-[var(--color-neutral-900)]">
          سبد خرید
        </h1>
        <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-white px-4 py-12 text-center">
          <p className="mb-4 text-sm text-[var(--color-muted)]">
            سبد خرید شما خالی است.
          </p>
          <Link
            href="/"
            className="inline-flex rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
          >
            بازگشت به صفحه اصلی
          </Link>
        </div>
      </div>

      <SiteFooter />
    </>
  );
}
