import { CheckoutShippingClient } from "@/components/cart/CheckoutShippingClient";
import { MainNav } from "@/components/layout/MainNav";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { StickyHeaderShell } from "@/components/layout/StickyHeaderShell";
import { getMainNavData } from "@/lib/api/nav";

export const metadata = { title: "انتخاب ارسال" };

export default async function CheckoutShippingPage() {
  const nav = await getMainNavData();

  return (
    <>
      <StickyHeaderShell>
        <SiteHeader />
        <MainNav data={nav} />
      </StickyHeaderShell>

      <div className="site-container flex-1 py-8">
        <h1 className="mb-4 text-lg font-bold text-[var(--color-neutral-900)]">
          آدرس و ارسال
        </h1>
        <CheckoutShippingClient />
      </div>

      <SiteFooter />
    </>
  );
}
