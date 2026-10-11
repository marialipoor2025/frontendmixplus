import { PaymentMockClient } from "@/components/cart/PaymentMockClient";
import { MainNav } from "@/components/layout/MainNav";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { StickyHeaderShell } from "@/components/layout/StickyHeaderShell";
import { getMainNavData } from "@/lib/api/nav";

export const metadata = { title: "پرداخت" };

export default async function PaymentPage() {
  const nav = await getMainNavData();

  return (
    <>
      <StickyHeaderShell>
        <SiteHeader />
        <MainNav data={nav} />
      </StickyHeaderShell>

      <div className="site-container flex-1 py-10">
        <PaymentMockClient />
      </div>

      <SiteFooter />
    </>
  );
}
