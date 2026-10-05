import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import { DesktopSupportChat } from "@/components/layout/DesktopSupportChat";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { MobileNavProvider } from "@/components/layout/MobileNavContext";
import { siteConfig } from "@/config/site";
import { getHomePageData } from "@/lib/api/home";
import { getMainNavData } from "@/lib/api/nav";
import { buildCategoryImageMap } from "@/lib/category-images";
import "./globals.css";

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [nav, home] = await Promise.all([
    getMainNavData(),
    getHomePageData().catch(() => null),
  ]);
  const categoryImages = buildCategoryImageMap(home?.categories);

  return (
    <html
      lang={siteConfig.locale}
      dir={siteConfig.direction}
      className={`${vazirmatn.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-[var(--background)] pb-[calc(3.25rem+env(safe-area-inset-bottom))] text-[var(--foreground)] lg:pb-0">
        <MobileNavProvider data={nav} categoryImages={categoryImages}>
          {children}
          <MobileBottomNav />
          <DesktopSupportChat />
        </MobileNavProvider>
      </body>
    </html>
  );
}
