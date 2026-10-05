import { renderStaticPage, staticPageMetadata } from "@/lib/render-static-page";

export const metadata = staticPageMetadata("stock");

export default function StockPage() {
  return renderStaticPage("stock");
}
