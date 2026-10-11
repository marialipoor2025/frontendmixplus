import { CartPageClient } from "@/components/cart/CartPageClient";
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
        <CartPageClient />
      </div>

      <SiteFooter />
    </>
  );
}
