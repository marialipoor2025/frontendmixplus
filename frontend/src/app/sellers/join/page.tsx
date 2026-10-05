import { renderStaticPage, staticPageMetadata } from "@/lib/render-static-page";

export const metadata = staticPageMetadata("sellers/join");

export default function SellersJoinPage() {
  return renderStaticPage("sellers/join");
}
