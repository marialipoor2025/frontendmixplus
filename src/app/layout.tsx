import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import { DesktopSupportChat } from "@/components/layout/DesktopSupportChat";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { MobileNavProvider } from "@/components/layout/MobileNavContext";
import { siteConfig } from "@/config/site";
import { getMainNavData } from "@/lib/api/nav";
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

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const nav = await getMainNavData();

  return (
    <html
      lang={siteConfig.locale}
      dir={siteConfig.direction}
      className={`${vazirmatn.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-[var(--background)] pb-[calc(3.25rem+env(safe-area-inset-bottom))] text-[var(--foreground)] lg:pb-0">
        <MobileNavProvider data={nav}>
          {children}
          <MobileBottomNav />
          <DesktopSupportChat />
        </MobileNavProvider>
      </body>
    </html>
  );
}
