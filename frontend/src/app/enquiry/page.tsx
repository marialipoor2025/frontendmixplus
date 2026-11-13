import { EnquiryPage } from "@/components/enquiry/EnquiryPage";
import { MainNav } from "@/components/layout/MainNav";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { StickyHeaderShell } from "@/components/layout/StickyHeaderShell";
import { siteConfig } from "@/config/site";
import { getMainNavData } from "@/lib/api/nav";

export const metadata = {
  title: "استعلام قیمت همکار",
  description: `فروش همکاری و سازمانی در ${siteConfig.nameFa} — ثبت درخواست استعلام قیمت لوازم خانگی.`,
};

export default async function EnquiryRoute() {
  const nav = await getMainNavData();

  return (
    <>
      <StickyHeaderShell>
        <SiteHeader />
        <MainNav data={nav} />
      </StickyHeaderShell>
      <main className="flex-1 bg-white">
        <EnquiryPage />
      </main>
      <SiteFooter />
    </>
  );
}
