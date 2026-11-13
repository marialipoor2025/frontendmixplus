import { ProformaInvoicePage } from "@/components/proforma/ProformaInvoicePage";
import { MainNav } from "@/components/layout/MainNav";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { StickyHeaderShell } from "@/components/layout/StickyHeaderShell";
import { getMainNavData } from "@/lib/api/nav";

export const metadata = {
  title: "صدور پیش فاکتور",
  description:
    "صدور پیش‌فاکتور خریدهای عمده و شرکتی — افزودن کالا، تکمیل اطلاعات و دریافت پیش‌فاکتور.",
};

export default async function ProformaInvoiceRoute() {
  const nav = await getMainNavData();

  return (
    <>
      <StickyHeaderShell>
        <SiteHeader />
        <MainNav data={nav} />
      </StickyHeaderShell>
      <main className="flex-1 bg-[var(--color-app-background)]">
        <ProformaInvoicePage />
      </main>
      <SiteFooter />
    </>
  );
}
