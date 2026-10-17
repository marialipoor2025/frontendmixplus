import type { Metadata } from "next";
import Link from "next/link";
import { MainNav } from "@/components/layout/MainNav";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { StickyHeaderShell } from "@/components/layout/StickyHeaderShell";
import { getMainNavData } from "@/lib/api/nav";

export const metadata: Metadata = {
  title: "فروشنده شو",
  description: "با موبایل یا ایمیل ثبت‌نام کنید و محصولات خود را در میکس‌پلاس بفروشید.",
};

export default async function SellersJoinPage() {
  const nav = await getMainNavData();

  return (
    <>
      <StickyHeaderShell>
        <SiteHeader />
        <MainNav data={nav} />
      </StickyHeaderShell>

      <main className="site-container flex-1 py-12">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="text-2xl font-black text-[var(--color-neutral-900)]">
            فروشنده شو
          </h1>
          <p className="mt-3 text-sm leading-8 text-[var(--color-muted)]">
            هر فروشنده‌ای می‌تواند با شماره موبایل یا ایمیل وارد شود، فروشگاه
            بسازد و محصولات خود را مدیریت کند — بدون نیاز به شماره از پیش تعریف‌شده.
          </p>
          <ol className="mt-8 space-y-3 text-start text-sm text-[var(--color-neutral-700)]">
            <li className="rounded-xl border border-[var(--color-neutral-200)] bg-white px-4 py-3">
              ۱. ورود با موبایل یا ایمیل و کد یک‌بارمصرف
            </li>
            <li className="rounded-xl border border-[var(--color-neutral-200)] bg-white px-4 py-3">
              ۲. ثبت نام فروشگاه (یک‌بار برای حساب شما)
            </li>
            <li className="rounded-xl border border-[var(--color-neutral-200)] bg-white px-4 py-3">
              ۳. افزودن و انتشار محصولات در پنل فروشنده
            </li>
          </ol>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/seller/login?returnUrl=/seller/dashboard"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-[var(--color-primary)] px-6 text-sm font-bold text-white"
            >
              ورود / ثبت‌نام فروشنده
            </Link>
            <Link
              href="/seller/dashboard"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-[var(--color-neutral-200)] px-6 text-sm font-medium"
            >
              رفتن به پنل
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
