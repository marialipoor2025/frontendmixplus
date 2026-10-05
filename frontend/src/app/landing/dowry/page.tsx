import { renderStaticPage, staticPageMetadata } from "@/lib/render-static-page";

export const metadata = staticPageMetadata("landing/dowry");

export default function DowryLandingPage() {
  return renderStaticPage("landing/dowry");
}
